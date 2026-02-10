
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const businessInfo = await prisma.businessInfo.findFirst();
    console.log('Business Info:', businessInfo);
  } catch (error) {
    console.error('Error fetching business info:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
