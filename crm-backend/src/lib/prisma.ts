
import * as Prisma from '@prisma/client';

// Using namespace import as a workaround for potential module resolution issues.
// Ensure `npx prisma generate` has been run.
const prisma = new Prisma.PrismaClient();

export default prisma;