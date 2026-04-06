const { PrismaClient } = require('@prisma/client');

// Single shared instance across all routes — prevents connection pool exhaustion
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

module.exports = prisma;
