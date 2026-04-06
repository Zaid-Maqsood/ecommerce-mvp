const { PrismaClient } = require('@prisma/client');

// Ensure the ecommerce schema is always used, even when DO injects DATABASE_URL without it
let dbUrl = process.env.DATABASE_URL || '';
if (!dbUrl.includes('schema=')) {
  dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'schema=ecommerce';
}

// Single shared instance across all routes — prevents connection pool exhaustion
const prisma = new PrismaClient({
  datasources: {
    db: { url: dbUrl },
  },
});

module.exports = prisma;
