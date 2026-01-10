import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    // Check 'User' table (Prisma default usually)
    console.log('\n--- Data from table "User" ---');
    try {
        const usersPascal = await prisma.$queryRaw`SELECT * FROM "User" LIMIT 5;`;
        console.table(usersPascal);
    } catch (e: any) {
        console.log('Could not query "User":', e.message.split('\n')[0]);
    }

    // Check 'users' table (legacy/lowercase)
    console.log('\n--- Data from table "users" ---');
    try {
        const usersLower = await prisma.$queryRaw`SELECT * FROM "users" LIMIT 5;`;
        console.table(usersLower);
    } catch (e: any) {
        console.log('Could not query "users":', e.message.split('\n')[0]);
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();