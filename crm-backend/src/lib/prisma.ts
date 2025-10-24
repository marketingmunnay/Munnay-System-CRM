// FIX: Use named import for PrismaClient for correct type resolution
import { PrismaClient } from '@prisma/client';

// Ensure `npx prisma generate` has been run.
const prisma = new PrismaClient();

export default prisma;