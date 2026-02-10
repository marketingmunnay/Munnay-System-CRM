// Script para actualizar leads sin fechaLead
// Ejecutar con: npx ts-node prisma-fix-leads-fechaLead.ts

import prisma from './src/lib/prisma';

async function main() {
  // Actualiza todos los leads con fechaLead nula usando raw SQL
  const result = await prisma.$executeRaw`UPDATE "Lead" SET "fechaLead" = NOW() WHERE "fechaLead" IS NULL`;
  console.log(`Leads actualizados: ${result}`);
  console.log('Actualización completa.');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
