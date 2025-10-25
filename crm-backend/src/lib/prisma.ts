
// FIX: Changed import style to potentially resolve module resolution issues with Prisma Client.
import { PrismaClient } from '@prisma/client'; // FIX: Direct import for PrismaClient

// Ensure `npx prisma generate` has been run.
const prisma = new PrismaClient();

export default prisma;