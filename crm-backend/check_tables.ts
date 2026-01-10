import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const tables = await prisma.$queryRaw`
      SELECT tablename 
      FROM pg_catalog.pg_tables 
      WHERE schemaname != 'pg_catalog' 
      AND schemaname != 'information_schema'
      ORDER BY tablename;
    `;
    
    console.log('Tablas en la base de datos:');
    console.table(tables);
  } catch (error) {
    console.error('Error al listar tablas:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();