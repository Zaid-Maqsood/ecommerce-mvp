const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');

const router = express.Router();
const prisma = new PrismaClient();

// Helper: get or create cart for user
async function getOrCreateCart(userId) {
  let cart = await prisma.cart.findUnique({
    where: { userId },
    include: { items: { include: { product: true } } },
  });
  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId },
      include: { items: { include: { product: true } } },
    });
  }
  return cart;
}

// GET /api/cart — get current user's cart
router.get('/', auth, async (req, res) => {
  try {
    const cart = await getOrCreateCart(req.user.id);
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/cart — add item (or increment qty if exists)
router.post('/', auth, async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  if (!productId) return res.status(400).json({ message: 'productId is required' });

  try {
    // Check product exists and has stock
    const product = await prisma.product.findUnique({ where: { id: parseInt(productId) } });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (product.stock < 1) return res.status(400).json({ message: 'Product is out of stock' });

    const cart = await getOrCreateCart(req.user.id);

    const existing = cart.items.find((i) => i.productId === parseInt(productId));
    if (existing) {
      // Update quantity
      await prisma.cartItem.update({
        where: { id: existing.id },
        data: { quantity: existing.quantity + parseInt(quantity) },
      });
    } else {
      await prisma.cartItem.create({
        data: { cartId: cart.id, productId: parseInt(productId), quantity: parseInt(quantity) },
      });
    }

    const updated = await getOrCreateCart(req.user.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/cart/:itemId — update cart item quantity
router.put('/:itemId', auth, async (req, res) => {
  const { quantity } = req.body;
  if (!quantity || quantity < 1) return res.status(400).json({ message: 'quantity must be >= 1' });

  try {
    // Verify item belongs to user's cart
    const item = await prisma.cartItem.findUnique({
      where: { id: parseInt(req.params.itemId) },
      include: { cart: true },
    });
    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.update({
      where: { id: item.id },
      data: { quantity: parseInt(quantity) },
    });

    const updated = await getOrCreateCart(req.user.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/cart/:itemId — remove item from cart
router.delete('/:itemId', auth, async (req, res) => {
  try {
    const item = await prisma.cartItem.findUnique({
      where: { id: parseInt(req.params.itemId) },
      include: { cart: true },
    });
    if (!item || item.cart.userId !== req.user.id) {
      return res.status(404).json({ message: 'Cart item not found' });
    }

    await prisma.cartItem.delete({ where: { id: item.id } });
    const updated = await getOrCreateCart(req.user.id);
    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
