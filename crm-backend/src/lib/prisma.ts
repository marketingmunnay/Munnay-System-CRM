import { PrismaClient } from '@prisma/client';

// Ensure `npx prisma generate` has been run.
// FIX: Removed erroneous comment related to PrismaClient import.
const prisma = new PrismaClient();

export default prisma;