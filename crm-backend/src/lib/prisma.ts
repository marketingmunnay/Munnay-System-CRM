// FIX: Use named import for PrismaClient for correct type resolution
import * as Prisma from '@prisma/client';

// Ensure `npx prisma generate` has been run.
const prisma = new Prisma.PrismaClient();

export default prisma;