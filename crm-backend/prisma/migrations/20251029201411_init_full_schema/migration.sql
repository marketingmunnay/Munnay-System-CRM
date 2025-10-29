/*
  Warnings:

  - You are about to drop the `addresses` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `alergias` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `campaigns` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `comprobantes_electronicos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `emergency_contacts` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `leads` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `memberships` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `procedimientos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `reconocimientos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `registros_llamada` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `seguimientos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `tratamientos` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `users` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "LeadStatus" AS ENUM ('Nuevo', 'Seguimiento', 'PorPagar', 'Agendado', 'Perdido');

-- CreateEnum
CREATE TYPE "ReceptionStatus" AS ENUM ('Agendado', 'PorAtender', 'Atendido', 'Reprogramado', 'Cancelado', 'NoAsistio');

-- CreateEnum
CREATE TYPE "AtencionStatus" AS ENUM ('PorAtender', 'EnSeguimiento', 'SeguimientoHecho');

-- CreateEnum
CREATE TYPE "Seller" AS ENUM ('Vanesa', 'Liz', 'Elvira');

-- CreateEnum
CREATE TYPE "MetodoPago" AS ENUM ('Efectivo', 'Tarjeta', 'Transferencia', 'Yape', 'Plin');

-- CreateEnum
CREATE TYPE "EstadoLlamada" AS ENUM ('Contesto', 'NoContesto', 'NumeroEquivocado', 'Ocupado');

-- CreateEnum
CREATE TYPE "TipoPost" AS ENUM ('Reel', 'Historia', 'Carrusel', 'Post');

-- CreateEnum
CREATE TYPE "RedSocialPost" AS ENUM ('Facebook', 'Instagram', 'Tiktok', 'YouTube');

-- CreateEnum
CREATE TYPE "TipoComprobanteElectronico" AS ENUM ('Boleta', 'Factura');

-- CreateEnum
CREATE TYPE "SunatStatus" AS ENUM ('Aceptado', 'Pendiente', 'Rechazado', 'ConObservaciones', 'Anulado');

-- CreateEnum
CREATE TYPE "TipoComprobante" AS ENUM ('Factura', 'Boleta', 'ReciboHonorarios', 'SinComprobante');

-- CreateEnum
CREATE TYPE "ModoPagoEgreso" AS ENUM ('Efectivo', 'Transferencia', 'Tarjeta', 'Yape');

-- CreateEnum
CREATE TYPE "DocumentType" AS ENUM ('DNI', 'RUC', 'Pasaporte', 'CarnetExtranjeria');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('complicacion_paciente', 'pago_por_vencer', 'nuevo_lead', 'cita_proxima');

-- CreateEnum
CREATE TYPE "GoalUnit" AS ENUM ('Cantidad', 'Porcentaje');

-- CreateEnum
CREATE TYPE "GoalArea" AS ENUM ('Comercial', 'Administracion', 'Recepcion', 'Procedimientos');

-- CreateEnum
CREATE TYPE "GoalObjective" AS ENUM ('Leads', 'Agendados', 'Asistidos', 'CostoPorResultado', 'VentasServicios', 'VentasProductos', 'Recuperados', 'ConversionLeads', 'ROI', 'Seguidores', 'Visualizaciones', 'Alcance', 'Engagement', 'CierreEvaluaciones', 'AceptacionTratamientos', 'EfectividadTratamientos', 'SeguimientosCompletados', 'RotacionPersonal', 'NivelStock');

-- DropForeignKey
ALTER TABLE "public"."addresses" DROP CONSTRAINT "addresses_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."alergias" DROP CONSTRAINT "alergias_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."comprobantes_electronicos" DROP CONSTRAINT "comprobantes_electronicos_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."emergency_contacts" DROP CONSTRAINT "emergency_contacts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."memberships" DROP CONSTRAINT "memberships_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."procedimientos" DROP CONSTRAINT "procedimientos_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reconocimientos" DROP CONSTRAINT "reconocimientos_otorgado_por_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."reconocimientos" DROP CONSTRAINT "reconocimientos_recibido_por_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."registros_llamada" DROP CONSTRAINT "registros_llamada_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."seguimientos" DROP CONSTRAINT "seguimientos_lead_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."seguimientos" DROP CONSTRAINT "seguimientos_procedimiento_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."tratamientos" DROP CONSTRAINT "tratamientos_leadId_fkey";

-- DropForeignKey
ALTER TABLE "public"."users" DROP CONSTRAINT "users_rol_id_fkey";

-- DropTable
DROP TABLE "public"."addresses";

-- DropTable
DROP TABLE "public"."alergias";

-- DropTable
DROP TABLE "public"."campaigns";

-- DropTable
DROP TABLE "public"."comprobantes_electronicos";

-- DropTable
DROP TABLE "public"."emergency_contacts";

-- DropTable
DROP TABLE "public"."leads";

-- DropTable
DROP TABLE "public"."memberships";

-- DropTable
DROP TABLE "public"."procedimientos";

-- DropTable
DROP TABLE "public"."reconocimientos";

-- DropTable
DROP TABLE "public"."registros_llamada";

-- DropTable
DROP TABLE "public"."roles";

-- DropTable
DROP TABLE "public"."seguimientos";

-- DropTable
DROP TABLE "public"."tratamientos";

-- DropTable
DROP TABLE "public"."users";

-- DropEnum
DROP TYPE "public"."acepto_tratamiento";

-- DropEnum
DROP TYPE "public"."contract_type";

-- DropEnum
DROP TYPE "public"."document_type";

-- DropEnum
DROP TYPE "public"."estado_llamada";

-- DropEnum
DROP TYPE "public"."lead_status";

-- DropEnum
DROP TYPE "public"."marital_status";

-- DropEnum
DROP TYPE "public"."metodo_pago";

-- DropEnum
DROP TYPE "public"."reception_status";

-- DropEnum
DROP TYPE "public"."sex";

-- CreateTable
CREATE TABLE "Lead" (
    "id" SERIAL NOT NULL,
    "fechaLead" TIMESTAMP(3) NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "sexo" TEXT NOT NULL,
    "redSocial" TEXT NOT NULL,
    "anuncio" TEXT NOT NULL,
    "vendedor" "Seller" NOT NULL,
    "estado" "LeadStatus" NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metodoPago" "MetodoPago",
    "fechaHoraAgenda" TIMESTAMP(3),
    "servicios" TEXT[],
    "categoria" TEXT NOT NULL,
    "fechaVolverLlamar" TIMESTAMP(3),
    "horaVolverLlamar" TEXT,
    "notas" TEXT,
    "nHistoria" TEXT,
    "aceptoTratamiento" TEXT,
    "motivoNoCierre" TEXT,
    "estadoRecepcion" "ReceptionStatus",
    "recursoId" TEXT,
    "birthDate" TIMESTAMP(3),
    "precioCita" DOUBLE PRECISION,
    "deudaCita" DOUBLE PRECISION,
    "metodoPagoDeuda" "MetodoPago",
    "documentType" "DocumentType",
    "documentNumber" TEXT,
    "razonSocial" TEXT,
    "direccionFiscal" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Lead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RegistroLlamada" (
    "id" SERIAL NOT NULL,
    "numeroLlamada" INTEGER NOT NULL,
    "duracionLlamada" TEXT NOT NULL,
    "estadoLlamada" "EstadoLlamada" NOT NULL,
    "observacion" TEXT,
    "leadId" INTEGER NOT NULL,

    CONSTRAINT "RegistroLlamada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Treatment" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidadSesiones" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL,
    "metodoPago" "MetodoPago",
    "deuda" DOUBLE PRECISION NOT NULL,
    "leadId" INTEGER NOT NULL,

    CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Procedure" (
    "id" SERIAL NOT NULL,
    "fechaAtencion" TIMESTAMP(3) NOT NULL,
    "personal" TEXT NOT NULL,
    "horaInicio" TEXT NOT NULL,
    "horaFin" TEXT NOT NULL,
    "tratamientoId" INTEGER NOT NULL,
    "nombreTratamiento" TEXT NOT NULL,
    "sesionNumero" INTEGER NOT NULL,
    "asistenciaMedica" BOOLEAN NOT NULL,
    "medico" TEXT,
    "observacion" TEXT,
    "leadId" INTEGER NOT NULL,

    CONSTRAINT "Procedure_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seguimiento" (
    "id" SERIAL NOT NULL,
    "procedimientoId" INTEGER NOT NULL,
    "nombreProcedimiento" TEXT NOT NULL,
    "fechaSeguimiento" TIMESTAMP(3) NOT NULL,
    "personal" TEXT NOT NULL,
    "inflamacion" BOOLEAN NOT NULL,
    "ampollas" BOOLEAN NOT NULL,
    "alergias" BOOLEAN NOT NULL,
    "malestarGeneral" BOOLEAN NOT NULL,
    "brote" BOOLEAN NOT NULL,
    "dolorDeCabeza" BOOLEAN NOT NULL,
    "moretones" BOOLEAN NOT NULL,
    "observacion" TEXT,
    "leadId" INTEGER NOT NULL,

    CONSTRAINT "Seguimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Alergia" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "gravedad" INTEGER NOT NULL,
    "leadId" INTEGER NOT NULL,

    CONSTRAINT "Alergia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" SERIAL NOT NULL,
    "nombreAnuncio" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "alcance" INTEGER NOT NULL,
    "resultados" INTEGER NOT NULL,
    "costoPorResultado" DOUBLE PRECISION NOT NULL,
    "importeGastado" DOUBLE PRECISION NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MetaCampaign" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "fechaInicio" TIMESTAMP(3) NOT NULL,
    "fechaFin" TIMESTAMP(3) NOT NULL,
    "categoria" TEXT NOT NULL,

    CONSTRAINT "MetaCampaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Publicacion" (
    "id" SERIAL NOT NULL,
    "fechaPost" TIMESTAMP(3) NOT NULL,
    "horaPost" TEXT,
    "temaVideo" TEXT NOT NULL,
    "tipoPost" "TipoPost" NOT NULL,
    "redSocial" "RedSocialPost" NOT NULL,
    "publicacionUrl" TEXT NOT NULL,
    "imageUrl" TEXT,
    "vistas" INTEGER NOT NULL,
    "comentarios" INTEGER NOT NULL,
    "reacciones" INTEGER NOT NULL,
    "conversacionesIniciadas" INTEGER NOT NULL,
    "convertidos" INTEGER NOT NULL,

    CONSTRAINT "Publicacion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Seguidor" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "cuenta" TEXT NOT NULL,
    "redSocial" "RedSocialPost" NOT NULL,
    "seguidores" INTEGER NOT NULL,
    "dejaronDeSeguir" INTEGER NOT NULL,

    CONSTRAINT "Seguidor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaExtra" (
    "id" SERIAL NOT NULL,
    "codigoVenta" TEXT NOT NULL,
    "fechaVenta" TIMESTAMP(3) NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "nHistoria" TEXT NOT NULL,
    "nombrePaciente" TEXT NOT NULL,
    "servicio" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL,
    "metodoPago" "MetodoPago" NOT NULL,
    "deuda" DOUBLE PRECISION NOT NULL,
    "fechaPagoDeuda" TIMESTAMP(3),

    CONSTRAINT "VentaExtra_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Incidencia" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "hora" TEXT NOT NULL,
    "pacienteId" INTEGER NOT NULL,
    "nHistoria" TEXT NOT NULL,
    "nombrePaciente" TEXT NOT NULL,
    "tipoIncidencia" TEXT NOT NULL,
    "detalleIncidencia" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "solucionado" BOOLEAN NOT NULL,

    CONSTRAINT "Incidencia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComprobanteElectronico" (
    "id" SERIAL NOT NULL,
    "tipoDocumento" "TipoComprobanteElectronico" NOT NULL,
    "serie" TEXT NOT NULL,
    "correlativo" INTEGER NOT NULL,
    "fechaEmision" TIMESTAMP(3) NOT NULL,
    "clienteTipoDocumento" "DocumentType" NOT NULL,
    "clienteNumeroDocumento" TEXT NOT NULL,
    "clienteDenominacion" TEXT NOT NULL,
    "clienteDireccion" TEXT,
    "opGravadas" DOUBLE PRECISION NOT NULL,
    "igv" DOUBLE PRECISION NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "sunatStatus" "SunatStatus" NOT NULL,
    "originalVentaId" INTEGER NOT NULL,
    "originalVentaType" TEXT NOT NULL,
    "leadId" INTEGER,
    "ventaExtraId" INTEGER,

    CONSTRAINT "ComprobanteElectronico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComprobanteItem" (
    "id" SERIAL NOT NULL,
    "descripcion" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "valorUnitario" DOUBLE PRECISION NOT NULL,
    "precioUnitario" DOUBLE PRECISION NOT NULL,
    "igv" DOUBLE PRECISION NOT NULL,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "comprobanteId" INTEGER NOT NULL,

    CONSTRAINT "ComprobanteItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Egreso" (
    "id" SERIAL NOT NULL,
    "fechaRegistro" TIMESTAMP(3) NOT NULL,
    "fechaPago" TIMESTAMP(3) NOT NULL,
    "proveedor" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "descripcion" TEXT NOT NULL,
    "tipoComprobante" "TipoComprobante" NOT NULL,
    "serieComprobante" TEXT,
    "nComprobante" TEXT,
    "montoTotal" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL,
    "deuda" DOUBLE PRECISION NOT NULL,
    "modoPago" "ModoPagoEgreso",
    "fotoUrl" TEXT,
    "tipoMoneda" TEXT NOT NULL,
    "observaciones" TEXT,

    CONSTRAINT "Egreso_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Proveedor" (
    "id" SERIAL NOT NULL,
    "razonSocial" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "numeroContacto" TEXT NOT NULL,

    CONSTRAINT "Proveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TipoProveedor" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "TipoProveedor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "rolId" INTEGER NOT NULL,
    "avatarUrl" TEXT NOT NULL,
    "position" TEXT,
    "documentType" "DocumentType",
    "documentNumber" TEXT,
    "phone" TEXT,
    "birthDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "salary" DOUBLE PRECISION,
    "contractType" TEXT,
    "maritalStatus" TEXT,
    "sex" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Address" (
    "id" SERIAL NOT NULL,
    "direccion" TEXT NOT NULL,
    "distrito" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "referencia" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "Address_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmergencyContact" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "parentesco" TEXT NOT NULL,
    "numero" TEXT NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "EmergencyContact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Reconocimiento" (
    "id" SERIAL NOT NULL,
    "mensaje" TEXT NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL,
    "otorgadoPorId" INTEGER NOT NULL,
    "recibidoPorId" INTEGER NOT NULL,

    CONSTRAINT "Reconocimiento_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Role" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "permissions" TEXT[],
    "dashboardMetrics" TEXT[],

    CONSTRAINT "Role_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BusinessInfo" (
    "id" INTEGER NOT NULL DEFAULT 1,
    "nombre" TEXT NOT NULL,
    "ruc" TEXT NOT NULL,
    "direccion" TEXT NOT NULL,
    "telefono" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "logoUrl" TEXT NOT NULL,
    "loginImageUrl" TEXT,

    CONSTRAINT "BusinessInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Goal" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "area" "GoalArea" NOT NULL,
    "objective" "GoalObjective" NOT NULL,
    "value" DOUBLE PRECISION NOT NULL,
    "unit" "GoalUnit" NOT NULL,
    "personal" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Goal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ClientSource" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "ClientSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ServiceCategory" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "ServiceCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EgresoCategory" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "EgresoCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductCategory" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "ProductCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobPosition" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,

    CONSTRAINT "JobPosition_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Service" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Service_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Membership" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "numeroSesiones" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,

    CONSTRAINT "Membership_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_LeadToMembership" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,

    CONSTRAINT "_LeadToMembership_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Lead_nHistoria_key" ON "Lead"("nHistoria");

-- CreateIndex
CREATE UNIQUE INDEX "MetaCampaign_nombre_key" ON "MetaCampaign"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "VentaExtra_codigoVenta_key" ON "VentaExtra"("codigoVenta");

-- CreateIndex
CREATE UNIQUE INDEX "ComprobanteElectronico_ventaExtraId_key" ON "ComprobanteElectronico"("ventaExtraId");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_razonSocial_key" ON "Proveedor"("razonSocial");

-- CreateIndex
CREATE UNIQUE INDEX "Proveedor_ruc_key" ON "Proveedor"("ruc");

-- CreateIndex
CREATE UNIQUE INDEX "TipoProveedor_nombre_key" ON "TipoProveedor"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "User_usuario_key" ON "User"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "Role_nombre_key" ON "Role"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ClientSource_nombre_key" ON "ClientSource"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ServiceCategory_nombre_key" ON "ServiceCategory"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "EgresoCategory_nombre_key" ON "EgresoCategory"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "ProductCategory_nombre_key" ON "ProductCategory"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "JobPosition_nombre_key" ON "JobPosition"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Service_nombre_key" ON "Service"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Product_nombre_key" ON "Product"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "Membership_nombre_key" ON "Membership"("nombre");

-- CreateIndex
CREATE INDEX "_LeadToMembership_B_index" ON "_LeadToMembership"("B");

-- AddForeignKey
ALTER TABLE "RegistroLlamada" ADD CONSTRAINT "RegistroLlamada_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Treatment" ADD CONSTRAINT "Treatment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Procedure" ADD CONSTRAINT "Procedure_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Seguimiento" ADD CONSTRAINT "Seguimiento_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Alergia" ADD CONSTRAINT "Alergia_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaExtra" ADD CONSTRAINT "VentaExtra_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Incidencia" ADD CONSTRAINT "Incidencia_pacienteId_fkey" FOREIGN KEY ("pacienteId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobanteElectronico" ADD CONSTRAINT "ComprobanteElectronico_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobanteElectronico" ADD CONSTRAINT "ComprobanteElectronico_ventaExtraId_fkey" FOREIGN KEY ("ventaExtraId") REFERENCES "VentaExtra"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComprobanteItem" ADD CONSTRAINT "ComprobanteItem_comprobanteId_fkey" FOREIGN KEY ("comprobanteId") REFERENCES "ComprobanteElectronico"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_rolId_fkey" FOREIGN KEY ("rolId") REFERENCES "Role"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Address" ADD CONSTRAINT "Address_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmergencyContact" ADD CONSTRAINT "EmergencyContact_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reconocimiento" ADD CONSTRAINT "Reconocimiento_otorgadoPorId_fkey" FOREIGN KEY ("otorgadoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Reconocimiento" ADD CONSTRAINT "Reconocimiento_recibidoPorId_fkey" FOREIGN KEY ("recibidoPorId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeadToMembership" ADD CONSTRAINT "_LeadToMembership_A_fkey" FOREIGN KEY ("A") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_LeadToMembership" ADD CONSTRAINT "_LeadToMembership_B_fkey" FOREIGN KEY ("B") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
