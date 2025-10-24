
// FIX: Changed import style to potentially resolve module resolution issues with Prisma Client.
import pkg from '@prisma/client';
const { PrismaClient } = pkg;

// Ensure `npx prisma generate` has been run.
const prisma = new PrismaClient();

export default prisma;