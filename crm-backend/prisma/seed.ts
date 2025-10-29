import { PrismaClient, DocumentType, MetodoPago, Seller, LeadStatus } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed...')

  // --- 1. Business Info ---
  await prisma.businessInfo.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Munnay System',
      ruc: '20512345678',
      direccion: 'Av. Las Palmeras 456, Surco, Lima',
      telefono: '987654321',
      email: 'info@munnay.com',
      logoUrl: 'https://i.imgur.com/JmZt2eU.png',
      loginImageUrl: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=2070',
    },
  })

  // --- 2. Roles ---
  const adminRole = await prisma.role.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Administrador',
      permissions: ['dashboard', 'configuracion', 'informes'],
      dashboardMetrics: ['general', 'marketing', 'finanzas'],
    },
  })

  const marketingRole = await prisma.role.upsert({
    where: { id: 2 },
    update: {},
    create: {
      id: 2,
      nombre: 'Marketing',
      permissions: ['dashboard', 'marketing-campanas', 'marketing-leads'],
      dashboardMetrics: ['general', 'marketing'],
    },
  })

  // --- 3. Job Positions ---
  const jobPositions = [
    { id: 1, nombre: 'Gerente General' },
    { id: 2, nombre: 'Coordinador de Marketing' },
    { id: 3, nombre: 'Recepcionista' },
  ]
  for (const pos of jobPositions) {
    await prisma.jobPosition.upsert({
      where: { id: pos.id },
      update: {},
      create: pos,
    })
  }

  // --- 4. Users ---
  const hashedPassword = await bcrypt.hash('123456m', 10)

  await prisma.user.upsert({
    where: { id: 1 },
    update: {},
    create: {
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
  })

  await prisma.user.upsert({
    where: { id: 2 },
    update: {},
    create: {
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
  })

  // --- 5. Catálogos ---
  const catalogs = [
    { model: prisma.clientSource, data: [{ id: 1, nombre: 'Facebook' }, { id: 2, nombre: 'Instagram' }] },
    { model: prisma.serviceCategory, data: [{ id: 1, nombre: 'Faciales' }, { id: 2, nombre: 'Corporales' }] },
    { model: prisma.productCategory, data: [{ id: 1, nombre: 'Cuidado Facial' }, { id: 2, nombre: 'Cuidado Corporal' }] },
    { model: prisma.egresoCategory, data: [{ id: 1, nombre: 'Marketing' }, { id: 2, nombre: 'Insumos Médicos' }] },
    { model: prisma.tipoProveedor, data: [{ id: 1, nombre: 'Insumos' }, { id: 2, nombre: 'Servicios' }] },
  ]
  for (const catalog of catalogs) {
    for (const item of catalog.data) {
      await (catalog.model as any).upsert({
        where: { id: item.id },
        update: {},
        create: item,
      })
    }
  }

  // --- 6. Services & Products ---
  await prisma.service.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nombre: 'Limpieza Facial Profunda', categoria: 'Faciales', precio: 150 },
  })

  await prisma.product.upsert({
    where: { id: 1 },
    update: {},
    create: { id: 1, nombre: 'Bloqueador Solar SPF 50', categoria: 'Cuidado Facial', precio: 80 },
  })

  // --- 7. MetaCampaign ---
  await prisma.metaCampaign.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      nombre: 'Campaña Verano 2023',
      fechaInicio: new Date('2023-01-01'),
      fechaFin: new Date('2023-03-31'),
      categoria: 'Corporales',
    },
  })

  // --- 8. Lead de ejemplo con tratamiento ---
  const lead = await prisma.lead.create({
    data: {
      fechaLead: new Date(),
      nombres: 'Juan',
      apellidos: 'Pérez',
      numero: '999888777',
      sexo: 'M',
      redSocial: 'Facebook',
      anuncio: 'Campaña Verano',
      vendedor: Seller.Vanesa,
      estado: LeadStatus.Nuevo,
      categoria: 'Faciales',
      tratamientos: {
        create: [
          {
            nombre: 'Limpieza Facial Profunda',
            cantidadSesiones: 5,
            precio: 150,
            montoPagado: 100,
            deuda: 50,
            metodoPago: MetodoPago.Efectivo,
          },
        ],
      },
    },
  })
  console.log('Lead creado con tratamiento:', lead)

  console.log('✅ Seed finalizado.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
