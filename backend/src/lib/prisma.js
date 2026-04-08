const { PrismaClient } = require('@prisma/client');

// Cap connections to 1 — DO managed PostgreSQL has a very low connection limit
// Always use the ecommerce schema (multiple schemas share one DB)
const url = new URL(process.env.DATABASE_URL || '');
url.searchParams.set('schema', 'ecommerce');
url.searchParams.set('connection_limit', '1');

const prisma = new PrismaClient({
  datasources: {
    db: { url: url.toString() },
  },
});

module.exports = prisma;
