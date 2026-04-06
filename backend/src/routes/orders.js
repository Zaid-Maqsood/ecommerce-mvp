const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = require('../lib/prisma');

const SHIPPING_COST = parseFloat(process.env.SHIPPING_COST || 5);
const LOYALTY_POINTS_PER_ORDER = parseInt(process.env.LOYALTY_POINTS_PER_ORDER || 10);

// POST /api/orders — place an order (COD)
router.post('/', auth, async (req, res) => {
  const { address } = req.body;
  if (!address) return res.status(400).json({ message: 'Shipping address is required' });

  try {
    // Get user's cart with items
    const cart = await prisma.cart.findUnique({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }

    // Validate stock for all items
    for (const item of cart.items) {
      if (item.product.stock < item.quantity) {
        return res.status(400).json({
          message: `Insufficient stock for "${item.product.name}". Available: ${item.product.stock}`,
        });
      }
    }

    // Calculate total (items + shipping)
    const subtotal = cart.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
    const totalAmount = subtotal + SHIPPING_COST;

    // Create order + items, decrement stock, clear cart, award loyalty points — all in one transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId: req.user.id,
          totalAmount,
          address,
          items: {
            create: cart.items.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Decrement stock for each product
      for (const item of cart.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      // Clear cart items
      await tx.cartItem.deleteMany({ where: { cartId: cart.id } });

      // Award loyalty points
      await tx.user.update({
        where: { id: req.user.id },
        data: { loyaltyPoints: { increment: LOYALTY_POINTS_PER_ORDER } },
      });

      return newOrder;
    });

    res.status(201).json({
      message: `Order placed successfully! You earned ${LOYALTY_POINTS_PER_ORDER} loyalty points.`,
      order,
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/orders — get current user's order history
router.get('/', auth, async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      include: { items: { include: { product: true } } },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
