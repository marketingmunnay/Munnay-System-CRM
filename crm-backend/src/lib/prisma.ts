
import { PrismaClient } from '@prisma/client';

// Ensure `npx prisma generate` has been run.
// FIX: Ensure PrismaClient is correctly imported as a named export.
const prisma = new PrismaClient();

export default prisma;