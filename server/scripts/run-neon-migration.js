/**
 * Run Neon migration: set default role to 'worker'.
 * Usage: from server folder: node scripts/run-neon-migration.js
 * Requires: DATABASE_URL in server/.env
 */
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  if (!process.env.DATABASE_URL) {
    console.error('DATABASE_URL not set. Create server/.env with your Neon connection string.');
    process.exit(1);
  }
  try {
    await prisma.$executeRawUnsafe(
      "ALTER TABLE users ALTER COLUMN role SET DEFAULT 'worker'"
    );
    console.log('Migration applied: users.role default set to "worker".');
  } catch (err) {
    console.error('Migration failed:', err.message);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}
main();
