// FIX: Changed to namespace import to handle potential module resolution issues.
import * as Prisma from '@prisma/client';


// Ensure `npx prisma generate` has been run.
const { PrismaClient } = Prisma;
const prisma = new PrismaClient();

export default prisma;