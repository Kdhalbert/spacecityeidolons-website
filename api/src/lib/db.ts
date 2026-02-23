import { PrismaClient } from '@prisma/client';

// Create a single instance of PrismaClient to be reused across the application
const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['info', 'warn', 'error'] : ['error'],
});

// Ensure Prisma disconnects on process exit
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

export default prisma;
