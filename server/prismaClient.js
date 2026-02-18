/**
 * Shared Prisma client for database access.
 * In development we reuse one instance (global.prisma) to avoid too many connections during hot reload.
 */
const { PrismaClient } = require('@prisma/client');

let prisma;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

module.exports = prisma;


