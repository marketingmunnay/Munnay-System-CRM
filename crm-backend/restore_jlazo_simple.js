const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const existing = await prisma.user.findUnique({
      where: { usuario: 'jlazo' }
    });

    if (existing) {
      console.log('User jlazo already exists.');
      return;
    }

    const user = await prisma.user.create({
      data: {
        usuario: 'jlazo',
        password: '123456',
        nombres: 'Jonathan',
        apellidos: 'Lazo',
        rolId: 1, 
        position: 'Admin',
        avatarUrl: 'https://ui-avatars.com/api/?name=Jonathan+Lazo'
      }
    });
    console.log('User restored successfully:', user);
  } catch (e) {
    console.error('Error restoring user:', e);
  } finally {
    try { await prisma.$disconnect(); } catch (e) {}
  }
}

main();
