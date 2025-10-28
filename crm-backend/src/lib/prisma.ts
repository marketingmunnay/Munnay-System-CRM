// FIX: Re-added PrismaClient import to ensure it's available.
import { PrismaClient } from '@prisma/client';

// Ensure `npx prisma generate` has been run.
const prisma = new PrismaClient();

export default prisma;