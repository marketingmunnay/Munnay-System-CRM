const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main(){
  const count = await prisma.lead.count();
  console.log('leads count:', count);
  const some = await prisma.lead.findMany({ take: 10, orderBy: { id: 'asc' } });
  console.log('sample leads:', some);
}

main().catch(e=>{ console.error(e); process.exit(1); }).finally(()=> prisma.$disconnect());
