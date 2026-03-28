import { PrismaClient } from '@prisma/client';

// Simple, clean, stable.
export const prisma = new PrismaClient({
  log: ['info', 'warn', 'error'],
});
