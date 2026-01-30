
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    // Check if user exists
    const existing = await prisma.user.findUnique({
      where: { usuario: 'jlazo' }
    });

    if (existing) {
      console.log('User jlazo already exists:', existing);
      return;
    }

    const user = await prisma.user.create({
      data: {
        usuario: 'jlazo',
        password: '123456', 
        nombres: 'Elvira Aleksandra', // Guessing from context of shifts screenshot showing "Elvira Aleksandra Juarez Chavez"
        apellidos: 'Juarez Chavez', 
        rolId: 1, 
        position: 'Doctor'
      }
    });
    console.log('User restored successfully:', user);
  } catch (e) {
    console.error('Error restoring user:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
