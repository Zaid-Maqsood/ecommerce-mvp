const express = require('express');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();
const prisma = require('../lib/prisma');

// All admin routes require auth + admin role
router.use(auth, admin);

// GET /api/admin/dashboard — stats overview
router.get('/dashboard', async (req, res) => {
  try {
    const [totalUsers, totalOrders, totalProducts, orders] = await Promise.all([
      prisma.user.count({ where: { role: 'user' } }),
      prisma.order.count(),
      prisma.product.count(),
      prisma.order.findMany({ select: { totalAmount: true } }),
    ]);

    const totalRevenue = orders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Top 5 selling products by total units sold
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId'],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 5,
    });

    const topProductIds = topProducts.map((p) => p.productId);
    const products = await prisma.product.findMany({
      where: { id: { in: topProductIds } },
    });

    const topProductsWithDetails = topProducts.map((tp) => ({
      ...products.find((p) => p.id === tp.productId),
      totalSold: tp._sum.quantity,
    }));

    res.json({ totalUsers, totalOrders, totalProducts, totalRevenue, topProducts: topProductsWithDetails });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/orders — all orders with user info
router.get('/orders', async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      include: {
        user: { select: { id: true, email: true } },
        items: { include: { product: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/admin/orders/:id — update order status
router.put('/orders/:id', async (req, res) => {
  const { status } = req.body;
  const allowed = ['pending', 'shipped', 'delivered'];
  if (!allowed.includes(status)) {
    return res.status(400).json({ message: 'Status must be pending, shipped, or delivered' });
  }
  try {
    const order = await prisma.order.update({
      where: { id: parseInt(req.params.id) },
      data: { status },
    });
    res.json(order);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Order not found' });
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/admin/users — list all users
router.get('/users', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, email: true, role: true, loyaltyPoints: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
