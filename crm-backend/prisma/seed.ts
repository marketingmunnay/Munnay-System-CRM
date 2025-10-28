import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { LeadStatus, ReceptionStatus, MetodoPago, Seller, EstadoLlamada, DocumentType, TipoComprobanteElectronico, SunatStatus, TipoComprobante, ModoPagoEgreso, GoalArea, GoalObjective, GoalUnit, Personal, Medico } from '../../types'; // Import frontend types

// FIX: Added PrismaClient import
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