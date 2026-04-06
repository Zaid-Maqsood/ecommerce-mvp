const express = require('express');
const { PrismaClient } = require('@prisma/client');
const auth = require('../middleware/auth');
const admin = require('../middleware/admin');

const router = express.Router();
const prisma = new PrismaClient();

// GET /api/products — public, list all products
router.get('/', async (req, res) => {
  try {
    const products = await prisma.product.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/products/:id — public, single product
router.get('/:id', async (req, res) => {
  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(req.params.id) },
    });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// POST /api/products — admin only
router.post('/', auth, admin, async (req, res) => {
  const { name, description, price, stock, image } = req.body;
  if (!name || !description || price == null || stock == null) {
    return res.status(400).json({ message: 'name, description, price, and stock are required' });
  }
  try {
    const product = await prisma.product.create({
      data: { name, description, price: parseFloat(price), stock: parseInt(stock), image },
    });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// PUT /api/products/:id — admin only
router.put('/:id', auth, admin, async (req, res) => {
  const { name, description, price, stock, image } = req.body;
  try {
    const product = await prisma.product.update({
      where: { id: parseInt(req.params.id) },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price != null && { price: parseFloat(price) }),
        ...(stock != null && { stock: parseInt(stock) }),
        ...(image !== undefined && { image }),
      },
    });
    res.json(product);
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Product not found' });
    res.status(500).json({ message: 'Server error' });
  }
});

// DELETE /api/products/:id — admin only
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    await prisma.product.delete({ where: { id: parseInt(req.params.id) } });
    res.json({ message: 'Product deleted' });
  } catch (err) {
    if (err.code === 'P2025') return res.status(404).json({ message: 'Product not found' });
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
