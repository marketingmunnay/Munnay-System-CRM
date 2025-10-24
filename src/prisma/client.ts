import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient({
  // Optionally set log flags during development:
  // log: ['query','info','warn','error']
});

export default prisma;