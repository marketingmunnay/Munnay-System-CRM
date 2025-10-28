import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
// FIX: Changed import path to be relative to the backend root.
import { LeadStatus, ReceptionStatus, MetodoPago, Seller, EstadoLlamada, DocumentType, TipoComprobanteElectronico, SunatStatus, TipoComprobante, ModoPagoEgreso, GoalArea, GoalObjective, GoalUnit, Personal, Medico } from '../src/types/frontend-types'; // Import frontend types

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // --- 1. Business Info ---
  console.log('Seeding BusinessInfo...');
  await prisma.businessInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1, // Explicitly set ID if it's not autoincrement
      nombre: 'Munnay System',
      ruc: '20512345678',
      direccion: 'Av. Las Palmeras 456, Surco, Lima',
      telefono: '987654321',
      email: 'info@munnay.com',
      logoUrl: 'https://i.imgur.com/JmZt2eU.png', // Replace with an actual logo URL if available
      loginImageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2070', // Example login image
    },
  });

  // --- 2. Roles ---
  console.log('Seeding Roles...');
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Administrador',
      permissions: [
        'dashboard', 'calendario', 'marketing-campanas', 'marketing-leads',
        'redes-sociales-publicaciones', 'redes-sociales-seguidores',
        'recepcion-agendados', 'recepcion-ventas-extra', 'recepcion-incidencias',
        'procedimientos-atenciones', 'procedimientos-seguimiento',
        'procedimientos-ventas-extra', 'procedimientos-incidencias',
        'pacientes-historia', 'finanzas-egresos', 'finanzas-facturacion',
        'rrhh-perfiles', 'informes', 'configuracion'
      ],
      dashboardMetrics: ['general', 'marketing', 'recepcion', 'procedimientos', 'finanzas', 'rrhh'],
    },
  });

  const marketingRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      nombre: 'Marketing',
      permissions: [
        'dashboard', 'marketing-campanas', 'marketing-leads',
        'redes-sociales-publicaciones', 'redes-sociales-seguidores', 'informes'
      ],
      dashboardMetrics: ['general', 'marketing'],
    },
  });

  const recepcionRole = await prisma.role.upsert({
    where: { id: 3 },
    update: {},
    create: {
      id: 3,
      nombre: 'Recepción',
      permissions: [
        'dashboard', 'calendario', 'recepcion-agendados', 'recepcion-ventas-extra',
        'recepcion-incidencias', 'pacientes-historia', 'informes'
      ],
      dashboardMetrics: ['general', 'recepcion'],
    },
  });

  const procedimientosRole = await prisma.role.upsert({
    where: { id: 4 },
    update: {},
    create: {
      id: 4,
      nombre: 'Procedimientos',
      permissions: [
        'dashboard', 'calendario', 'procedimientos-atenciones', 'procedimientos-seguimiento',
        'procedimientos-incidencias', 'pacientes-historia', 'informes'
      ],
      dashboardMetrics: ['general', 'procedimientos'],
    },
  });
  
  const rrhhRole = await prisma.role.upsert({
    where: { id: 5 },
    update: {},
    create: {
      id: 5,
      nombre: 'Recursos Humanos',
      permissions: [
        'dashboard', 'rrhh-perfiles', 'configuracion'
      ],
      dashboardMetrics: ['general', 'rrhh'],
    },
  });


  // --- 3. Job Positions ---
  console.log('Seeding JobPositions...');
  const jobPositionsData = [
    { id: 1, nombre: 'Gerente General' },
    { id: 2, nombre: 'Coordinador de Marketing' },
    { id: 3, nombre: 'Vendedor' },
    { id: 4, nombre: 'Recepcionista Principal' },
    { id: 5, nombre: 'Asistente de Recepción' },
    { id: 6, nombre: 'Enfermera Principal' },
    { id: 7, nombre: 'Enfermera Asistente' },
    { id: 8, nombre: 'Dermatólogo' },
    { id: 9, nombre: 'Esteticista' },
    { id: 10, nombre: 'Contador' },
  ];
  for (const pos of jobPositionsData) {
    await prisma.jobPosition.upsert({
      where: { id: pos.id },
      update: {},
      create: pos,
    });
  }

  // --- 4. Users ---
  console.log('Seeding Users...');
  const hashedPassword = await bcrypt.hash('password123', 10);
  const usersData = [
    {
      id: 1,
      nombres: 'Admin',
      apellidos: 'Munnay',
      usuario: 'admin',
      password: hashedPassword,
      rolId: adminRole.id,
      avatarUrl: 'https://cdn-icons-png.flaticon.com/512/149/149071.png',
      position: 'Gerente General',
      documentType: DocumentType.DNI,
      documentNumber: '12345678',
      phone: '999888777',
      birthDate: new Date('1985-05-10'),
      startDate: new Date('2020-01-15'),
      maritalStatus: 'Casado(a)',
      sex: 'M',
      salary: 5000,
      contractType: 'Indefinido',
    },
    {
      id: 2,
      nombres: 'Vanesa',
      apellidos: 'Lopez',
      usuario: 'vanesa',
      password: hashedPassword,
      rolId: marketingRole.id,
      avatarUrl: 'https://randomuser.me/api/portraits/women/1.jpg',
      position: 'Vendedor',
      documentType: DocumentType.DNI,
      documentNumber: '87654321',
      phone: '999111222',
      birthDate: new Date('1990-11-20'),
      startDate: new Date('2021-03-01'),
      maritalStatus: 'Soltero(a)',
      sex: 'F',
      salary: 2500,
      contractType: 'Plazo Fijo',
    },
    {
      id: 3,
      nombres: 'Elvira',
      apellidos: 'Garcia',
      usuario: 'elvira',
      password: hashedPassword,
      rolId: recepcionRole.id,
      avatarUrl: 'https://randomuser.me/api/portraits/women/2.jpg',
      position: 'Recepcionista Principal',
      documentType: DocumentType.DNI,
      documentNumber: '12121212',
      phone: '987123456',
      birthDate: new Date('1988-07-01'),
      startDate: new Date('2020-08-10'),
      maritalStatus: 'Casado(a)',
      sex: 'F',
      salary: 2200,
      contractType: 'Indefinido',
    },
    {
      id: 4,
      nombres: 'Dra. Marilia',
      apellidos: 'Vargas',
      usuario: 'marilia',
      password: hashedPassword,
      rolId: procedimientosRole.id,
      avatarUrl: 'https://randomuser.me/api/portraits/women/3.jpg',
      position: 'Dermatólogo',
      documentType: DocumentType.DNI,
      documentNumber: '34343434',
      phone: '999333444',
      birthDate: new Date('1980-03-15'),
      startDate: new Date('2019-06-01'),
      maritalStatus: 'Casado(a)',
      sex: 'F',
      salary: 7000,
      contractType: 'Indefinido',
    },
    {
      id: 5,
      nombres: 'Janela',
      apellidos: 'Torres',
      usuario: 'janela',
      password: hashedPassword,
      rolId: rrhhRole.id,
      avatarUrl: 'https://randomuser.me/api/portraits/women/4.jpg',
      position: 'Jefa de RRHH',
      documentType: DocumentType.DNI,
      documentNumber: '45454545',
      phone: '987654321',
      birthDate: new Date('1992-02-28'),
      startDate: new Date('2022-01-20'),
      maritalStatus: 'Soltero(a)',
      sex: 'F',
      salary: 3500,
      contractType: 'Indefinido',
    }
  ];

  for (const userData of usersData) {
    await prisma.user.upsert({
      where: { id: userData.id },
      update: {},
      create: userData,
    });
  }
  
  // FIX: Add more seed data to ensure the application is well-populated for testing.

  // --- 5. Catalogs ---
  console.log('Seeding Catalogs...');
  const catalogs = [
    { model: prisma.clientSource, data: [{ id: 1, nombre: 'Facebook' }, { id: 2, nombre: 'Instagram' }, { id: 3, nombre: 'Recomendación' }] },
    { model: prisma.serviceCategory, data: [{ id: 1, nombre: 'Faciales' }, { id: 2, nombre: 'Corporales' }, { id: 3, nombre: 'Depilación' }] },
    { model: prisma.productCategory, data: [{ id: 1, nombre: 'Cuidado Facial' }, { id: 2, nombre: 'Cuidado Corporal' }] },
    { model: prisma.egresoCategory, data: [{ id: 1, nombre: 'Marketing' }, { id: 2, nombre: 'Insumos Médicos' }, { id: 3, nombre: 'Alquiler' }, { id: 4, nombre: 'Planilla' }] },
    { model: prisma.tipoProveedor, data: [{ id: 1, nombre: 'Insumos' }, { id: 2, nombre: 'Servicios' }, { id: 3, nombre: 'Marketing Digital' }] },
  ];

  for (const catalog of catalogs) {
    for (const item of catalog.data) {
      await (catalog.model as any).upsert({
        where: { id: item.id },
        update: {},
        create: item,
      });
    }
  }

  const servicesData = [
    { id: 1, nombre: 'Limpieza Facial Profunda', categoria: 'Faciales', precio: 150 },
    { id: 2, nombre: 'Hydrafacial', categoria: 'Faciales', precio: 300 },
    { id: 3, nombre: 'Masaje Reductor', categoria: 'Corporales', precio: 120 },
    { id: 4, nombre: 'Depilación Láser Piernas', categoria: 'Depilación', precio: 400 },
  ];
  for (const service of servicesData) {
    await prisma.service.upsert({ where: { id: service.id }, update: {}, create: service });
  }
  
  const productsData = [
    { id: 1, nombre: 'Bloqueador Solar SPF 50', categoria: 'Cuidado Facial', precio: 80 },
    { id: 2, nombre: 'Crema Hidratante', categoria: 'Cuidado Facial', precio: 120 },
  ];
  for (const product of productsData) {
    await prisma.product.upsert({ where: { id: product.id }, update: {}, create: product });
  }

  // --- 6. MetaCampaigns ---
  console.log('Seeding MetaCampaigns...');
  await prisma.metaCampaign.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Campaña Verano 2023',
      fechaInicio: new Date('2023-01-01'),
      fechaFin: new Date('2023-03-31'),
      categoria: 'Corporales'
    }
  });
  
  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });