-- CreateEnum
CREATE TYPE "document_type" AS ENUM ('DNI', 'RUC', 'PASAPORTE', 'CE');

-- CreateEnum
CREATE TYPE "contract_type" AS ENUM ('TIEMPO_COMPLETO', 'MEDIO_TIEMPO', 'FREELANCE');

-- CreateEnum
CREATE TYPE "marital_status" AS ENUM ('SOLTERO', 'CASADO', 'DIVORCIADO', 'VIUDO');

-- CreateEnum
CREATE TYPE "sex" AS ENUM ('MASCULINO', 'FEMENINO', 'OTRO');

-- CreateEnum
CREATE TYPE "lead_status" AS ENUM ('NUEVO', 'CONTACTADO', 'CITA_AGENDADA', 'CERRADO_VENTA', 'CERRADO_PERDIDO');

-- CreateEnum
CREATE TYPE "metodo_pago" AS ENUM ('EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'YAPE_PLIN');

-- CreateEnum
CREATE TYPE "acepto_tratamiento" AS ENUM ('SI', 'NO');

-- CreateEnum
CREATE TYPE "reception_status" AS ENUM ('PENDIENTE', 'CONFIRMADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "estado_llamada" AS ENUM ('CONTESTO', 'NO_CONTESTO', 'BUZON_VOZ', 'NUMERO_EQUIVOCADO');

-- CreateTable
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "usuario" TEXT NOT NULL,
    "password" TEXT,
    "rol_id" INTEGER NOT NULL,
    "avatar_url" TEXT,
    "position" TEXT,
    "document_type" "document_type",
    "document_number" TEXT,
    "phone" TEXT,
    "birth_date" DATE,
    "start_date" DATE,
    "salary" DOUBLE PRECISION,
    "contract_type" "contract_type",
    "marital_status" "marital_status",
    "sex" "sex",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "permissions" TEXT[],
    "dashboard_metrics" TEXT[],
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "addresses" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "street" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "addresses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emergency_contacts" (
    "id" SERIAL NOT NULL,
    "user_id" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "relation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "emergency_contacts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reconocimientos" (
    "id" SERIAL NOT NULL,
    "otorgado_por_id" INTEGER NOT NULL,
    "recibido_por_id" INTEGER NOT NULL,
    "motivo" TEXT NOT NULL,
    "fecha" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reconocimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "leads" (
    "id" SERIAL NOT NULL,
    "fecha_lead" DATE NOT NULL,
    "nombres" TEXT NOT NULL,
    "apellidos" TEXT NOT NULL,
    "numero" TEXT,
    "sexo" "sex" NOT NULL,
    "red_social" TEXT NOT NULL,
    "anuncio" TEXT NOT NULL,
    "vendedor" TEXT NOT NULL,
    "estado" "lead_status" NOT NULL,
    "monto_pagado" DOUBLE PRECISION NOT NULL,
    "metodo_pago" "metodo_pago",
    "fecha_hora_agenda" TIMESTAMP(3),
    "servicios" TEXT[],
    "categoria" TEXT NOT NULL,
    "fecha_volver_llamar" DATE,
    "hora_volver_llamar" TEXT,
    "notas" TEXT,
    "n_historia" TEXT,
    "acepto_tratamiento" "acepto_tratamiento",
    "motivo_no_cierre" TEXT,
    "estado_recepcion" "reception_status",
    "recurso_id" TEXT,
    "document_type" "document_type",
    "document_number" TEXT,
    "razon_social" TEXT,
    "direccion_fiscal" TEXT,
    "precio_cita" DOUBLE PRECISION,
    "deuda_cita" DOUBLE PRECISION,
    "metodo_pago_deuda" "metodo_pago",
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "leads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "registros_llamada" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "numero_llamada" INTEGER NOT NULL,
    "duracion_llamada" TEXT NOT NULL,
    "estado_llamada" "estado_llamada" NOT NULL,
    "observacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "registros_llamada_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tratamientos" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "cantidadSesiones" INTEGER NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "montoPagado" DOUBLE PRECISION NOT NULL,
    "metodoPago" TEXT NOT NULL,
    "deuda" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tratamientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "procedimientos" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "fecha_atencion" DATE NOT NULL,
    "personal" TEXT NOT NULL,
    "hora_inicio" TEXT NOT NULL,
    "hora_fin" TEXT NOT NULL,
    "tratamiento_id" INTEGER NOT NULL,
    "nombre_tratamiento" TEXT NOT NULL,
    "sesion_numero" INTEGER NOT NULL,
    "asistencia_medica" BOOLEAN NOT NULL,
    "medico" TEXT,
    "observacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "procedimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "seguimientos" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "procedimiento_id" INTEGER NOT NULL,
    "nombre_procedimiento" TEXT NOT NULL,
    "fecha_seguimiento" DATE NOT NULL,
    "personal" TEXT NOT NULL,
    "inflamacion" BOOLEAN NOT NULL,
    "ampollas" BOOLEAN NOT NULL,
    "alergias" BOOLEAN NOT NULL,
    "malestar_general" BOOLEAN NOT NULL,
    "brote" BOOLEAN NOT NULL,
    "dolor_de_cabeza" BOOLEAN NOT NULL,
    "moretones" BOOLEAN NOT NULL,
    "observacion" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "seguimientos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alergias" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "gravedad" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "alergias_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "memberships" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "nombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "fecha_inicio" DATE NOT NULL,
    "fecha_fin" DATE NOT NULL,
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "memberships_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "comprobantes_electronicos" (
    "id" SERIAL NOT NULL,
    "lead_id" INTEGER NOT NULL,
    "tipo_comprobante" TEXT NOT NULL,
    "serie" TEXT NOT NULL,
    "correlativo" INTEGER NOT NULL,
    "monto_total" DOUBLE PRECISION NOT NULL,
    "igv" DOUBLE PRECISION NOT NULL,
    "moneda" TEXT NOT NULL DEFAULT 'PEN',
    "estado_emision" TEXT NOT NULL,
    "url_pdf" TEXT,
    "fecha_emision" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "comprobantes_electronicos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "campaigns" (
    "id" SERIAL NOT NULL,
    "nombre_anuncio" TEXT NOT NULL,
    "categoria" TEXT NOT NULL,
    "alcance" INTEGER NOT NULL,
    "resultados" INTEGER NOT NULL,
    "costo_por_resultado" DOUBLE PRECISION NOT NULL,
    "importe_gastado" DOUBLE PRECISION NOT NULL,
    "fecha" DATE NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_usuario_key" ON "users"("usuario");

-- CreateIndex
CREATE UNIQUE INDEX "roles_nombre_key" ON "roles"("nombre");

-- CreateIndex
CREATE UNIQUE INDEX "leads_n_historia_key" ON "leads"("n_historia");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_rol_id_fkey" FOREIGN KEY ("rol_id") REFERENCES "roles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "addresses" ADD CONSTRAINT "addresses_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emergency_contacts" ADD CONSTRAINT "emergency_contacts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconocimientos" ADD CONSTRAINT "reconocimientos_otorgado_por_id_fkey" FOREIGN KEY ("otorgado_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reconocimientos" ADD CONSTRAINT "reconocimientos_recibido_por_id_fkey" FOREIGN KEY ("recibido_por_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "registros_llamada" ADD CONSTRAINT "registros_llamada_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tratamientos" ADD CONSTRAINT "tratamientos_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "procedimientos" ADD CONSTRAINT "procedimientos_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos" ADD CONSTRAINT "seguimientos_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "seguimientos" ADD CONSTRAINT "seguimientos_procedimiento_id_fkey" FOREIGN KEY ("procedimiento_id") REFERENCES "procedimientos"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alergias" ADD CONSTRAINT "alergias_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "comprobantes_electronicos" ADD CONSTRAINT "comprobantes_electronicos_lead_id_fkey" FOREIGN KEY ("lead_id") REFERENCES "leads"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
