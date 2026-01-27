import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding Resources and Staff...');

  // 1. Seed Staff (Users)
  // We need a valid Role ID. Let's find or create a 'Professional' role.
  let role = await prisma.role.findFirst({ where: { nombre: 'Profesional' } });
  if (!role) {
      role = await prisma.role.create({
          data: { 
              nombre: 'Profesional',
              permissions: [],
              dashboardMetrics: []
          }
      });
  }

  const staffList = [
      { nombres: 'Marilia', apellidos: 'Doctora', usuario: 'marilia' },
      { nombres: 'Sofía', apellidos: 'Doctora', usuario: 'sofia' },
      { nombres: 'Carlos', apellidos: 'Doctor', usuario: 'carlos' },
      { nombres: 'Vanesa', apellidos: 'Vendedora', usuario: 'vanesa' },
  ];

  for (const s of staffList) {
      const exists = await prisma.user.findUnique({ where: { usuario: s.usuario } });
      if (!exists) {
          await prisma.user.create({
              data: {
                  ...s,
                  password: 'password123', // Default
                  rolId: role.id
              }
          });
          console.log(`Created User: ${s.nombres}`);
      } else {
          console.log(`User ${s.nombres} already exists`);
      }
  }

  // 2. Seed Resources (Rooms)
  const resourceList = [
      { name: 'Consultorio 1', type: 'ROOM' },
      { name: 'Consultorio 2', type: 'ROOM' },
      { name: 'Sala de Procedimientos', type: 'ROOM' },
  ];

  for (const r of resourceList) {
      // Check by name manually (since name is not unique in schema?) 
      // Schema says: name String. Not unique. But good to check.
      const exists = await prisma.resource.findFirst({ where: { name: r.name } });
      if (!exists) {
          await prisma.resource.create({
              data: {
                  name: r.name,
                  type: r.type as any 
              }
          });
           console.log(`Created Resource: ${r.name}`);
      } else {
           console.log(`Resource ${r.name} already exists`);
      }
  }

  console.log('Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
