require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding production database...');

  // ── Users ──────────────────────────────────────────────────
  const adminPassword = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@shop.com' },
    update: {},
    create: { email: 'admin@shop.com', password: adminPassword, role: 'admin', loyaltyPoints: 0 },
  });

  const jamesPassword = await bcrypt.hash('james123', 10);
  await prisma.user.upsert({
    where: { email: 'james.carter@gmail.com' },
    update: {},
    create: { email: 'james.carter@gmail.com', password: jamesPassword, role: 'user', loyaltyPoints: 40 },
  });

  const zaidPassword = await bcrypt.hash('zaid123', 10);
  await prisma.user.upsert({
    where: { email: 'zaid@gmail.com' },
    update: {},
    create: { email: 'zaid@gmail.com', password: zaidPassword, role: 'user', loyaltyPoints: 0 },
  });

  // ── Products ───────────────────────────────────────────────
  const products = [
    { name: 'Wireless Headphones',  description: 'Premium over-ear headphones with noise cancellation and 30h battery life.',               price: 79.99,  stock: 25, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400' },
    { name: 'Mechanical Keyboard',  description: 'Compact TKL mechanical keyboard with RGB backlight and blue switches.',                   price: 59.99,  stock: 40, image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400' },
    { name: 'USB-C Hub',            description: '7-in-1 USB-C hub with HDMI, USB 3.0, SD card, and PD charging.',                          price: 34.99,  stock: 60, image: 'https://images.unsplash.com/photo-1625842268584-8f3296236761?w=400' },
    { name: 'Webcam HD 1080p',      description: 'Full HD webcam with built-in microphone, autofocus, and plug-and-play setup.',            price: 49.99,  stock: 30, image: 'https://images.unsplash.com/photo-1611532736597-de2d4265fba3?w=400' },
    { name: 'LED Desk Lamp',        description: 'Smart LED lamp with adjustable color temperature, USB charging port, and touch control.', price: 29.99,  stock: 50, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=400' },
    { name: 'Laptop Stand',         description: 'Adjustable aluminum laptop stand, compatible with 10–17 inch laptops.',                   price: 24.99,  stock: 45, image: 'https://images.unsplash.com/photo-1593642632559-0c6d3fc62b89?w=400' },
    { name: 'Portable SSD 1TB',     description: 'Ultra-fast 1TB portable SSD with USB 3.2 Gen 2, up to 1050MB/s read speed.',              price: 89.99,  stock: 20, image: 'https://images.unsplash.com/photo-1597872200969-2b65d56bd16b?w=400' },
    { name: 'Wireless Mouse',       description: 'Ergonomic wireless mouse with 3-year battery life and silent click buttons.',             price: 22.99,  stock: 70, image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400' },
    { name: 'Phone Stand',          description: 'Adjustable foldable phone stand for desk, compatible with all smartphones.',              price: 12.99,  stock: 99, image: 'https://images.unsplash.com/photo-1586953208448-b95a79798f07?w=400' },
    { name: 'Cable Management Kit', description: 'Complete cable management kit with velcro ties, clips, and cable sleeves.',               price: 9.99,   stock: 0,  image: 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=400' },
    { name: 'iPhone 17 Pro Max',    description: 'iPhone 17 Pro Max 512 GB',                                                               price: 1200,   stock: 4,  image: 'https://images.unsplash.com/photo-1695048133142-1a20484429be?w=400' },
  ];

  for (const product of products) {
    const existing = await prisma.product.findFirst({ where: { name: product.name } });
    await prisma.product.upsert({
      where: { id: existing?.id || 0 },
      update: product,
      create: product,
    });
  }

  // ── Orders ────────────────────────────────────────────────
  const james = await prisma.user.findUnique({ where: { email: 'james.carter@gmail.com' } });
  const zaid  = await prisma.user.findUnique({ where: { email: 'zaid@gmail.com' } });

  const allProducts = await prisma.product.findMany();
  const byName = (name) => allProducts.find((p) => p.name === name);

  const ordersData = [
    {
      userId: james.id, status: 'delivered', address: '12 Elm Street, New York, NY 10001',
      items: [
        { product: byName('Wireless Headphones'), quantity: 1 },
        { product: byName('USB-C Hub'),           quantity: 2 },
      ],
    },
    {
      userId: james.id, status: 'shipped', address: '12 Elm Street, New York, NY 10001',
      items: [
        { product: byName('Mechanical Keyboard'), quantity: 1 },
        { product: byName('Wireless Mouse'),      quantity: 1 },
      ],
    },
    {
      userId: zaid.id, status: 'pending', address: '88 King Road, London, UK W1A 1AA',
      items: [
        { product: byName('Portable SSD 1TB'), quantity: 1 },
        { product: byName('Laptop Stand'),     quantity: 1 },
        { product: byName('LED Desk Lamp'),    quantity: 2 },
      ],
    },
    {
      userId: james.id, status: 'delivered', address: '12 Elm Street, New York, NY 10001',
      items: [
        { product: byName('iPhone 17 Pro Max'), quantity: 1 },
      ],
    },
    {
      userId: zaid.id, status: 'shipped', address: '88 King Road, London, UK W1A 1AA',
      items: [
        { product: byName('Webcam HD 1080p'), quantity: 1 },
        { product: byName('Phone Stand'),     quantity: 2 },
      ],
    },
  ];

  // Clear existing orders first to avoid duplicates
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();

  for (const o of ordersData) {
    const totalAmount = o.items.reduce((sum, i) => sum + i.product.price * i.quantity, 0);
    await prisma.order.create({
      data: {
        userId: o.userId,
        status: o.status,
        address: o.address,
        totalAmount,
        items: {
          create: o.items.map((i) => ({
            productId: i.product.id,
            quantity:  i.quantity,
            price:     i.product.price,
          })),
        },
      },
    });
  }

  console.log('Production seed complete: 3 users, 11 products, 5 orders.');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
