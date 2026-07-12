// ============================================================================
// config/prisma.js — Prisma Client Singleton
// Import this everywhere instead of creating a new PrismaClient each time.
// ============================================================================

const { PrismaClient } = require('@prisma/client');

// Reuse the existing client in development to avoid connection exhaustion
// during hot-reloads. In production, a single instance is created.
const globalForPrisma = global;

const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log:
      process.env.NODE_ENV === 'development'
        ? ['query', 'warn', 'error']
        : ['warn', 'error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

module.exports = prisma;
