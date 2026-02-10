import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    console.log('\n--- Data from table "Role" ---');
    const roles = await prisma.$queryRaw`SELECT * FROM "Role" ORDER BY id;`;
    console.table(roles);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();