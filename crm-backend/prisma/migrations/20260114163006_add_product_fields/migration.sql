/*
  Warnings:

  - You are about to drop the column `apoyoPorId` on the `VentaExtra` table. All the data in the column will be lost.
  - You are about to drop the column `vendedorId` on the `VentaExtra` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Procedure" DROP CONSTRAINT "Procedure_tratamientoId_fkey";

-- DropForeignKey
ALTER TABLE "VentaExtra" DROP CONSTRAINT "ventaextra_apoyoporid_fkey";

-- DropForeignKey
ALTER TABLE "VentaExtra" DROP CONSTRAINT "ventaextra_vendedorid_fkey";

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "descripcion" TEXT,
ADD COLUMN     "marca" TEXT,
ADD COLUMN     "precioCoste" DOUBLE PRECISION,
ADD COLUMN     "precioTotal" DOUBLE PRECISION,
ADD COLUMN     "proveedorId" INTEGER,
ADD COLUMN     "unidadMedida" TEXT,
ADD COLUMN     "valorMedida" DOUBLE PRECISION;

-- AlterTable
ALTER TABLE "VentaExtra" DROP COLUMN "apoyoPorId",
DROP COLUMN "vendedorId";

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" SERIAL NOT NULL,
    "fecha" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "usuario" TEXT NOT NULL,
    "usuarioId" INTEGER NOT NULL,
    "accion" TEXT NOT NULL,
    "modulo" TEXT NOT NULL,
    "detalles" TEXT NOT NULL,
    "metadata" JSONB,
    "ip" TEXT,
    "userAgent" TEXT,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "configuracionproducto" (
    "id" SERIAL NOT NULL,
    "productoid" INTEGER NOT NULL,
    "stockactual" INTEGER NOT NULL DEFAULT 0,
    "stockminimo" INTEGER NOT NULL DEFAULT 5,
    "unidadmedida" TEXT NOT NULL DEFAULT 'unidades',
    "equivalenciabase" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "costounitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "aplicaigv" BOOLEAN NOT NULL DEFAULT true,
    "igvporcentaje" DOUBLE PRECISION NOT NULL DEFAULT 18,
    "alertasactivas" BOOLEAN NOT NULL DEFAULT true,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "configuracionproducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "movimientoinventario" (
    "id" SERIAL NOT NULL,
    "configuracionproductoid" INTEGER NOT NULL,
    "tipomovimiento" TEXT NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "stockanterior" INTEGER NOT NULL,
    "stocknuevo" INTEGER NOT NULL,
    "costounitario" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "precioventa" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "motivo" TEXT NOT NULL,
    "referencia" TEXT,
    "creadopor" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "movimientoinventario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pagoproducto" (
    "id" SERIAL NOT NULL,
    "productoid" INTEGER NOT NULL,
    "nhistoria" TEXT NOT NULL,
    "montototal" DOUBLE PRECISION NOT NULL,
    "montopagado" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "saldopendiente" DOUBLE PRECISION NOT NULL,
    "estadopago" TEXT NOT NULL,
    "estadoproducto" TEXT NOT NULL,
    "esprepago" BOOLEAN NOT NULL DEFAULT false,
    "fechapago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fechaentrega" TIMESTAMP(3),
    "observaciones" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedat" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pagoproducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "historialpagoproducto" (
    "id" SERIAL NOT NULL,
    "pagoproductoid" INTEGER NOT NULL,
    "montoabonado" DOUBLE PRECISION NOT NULL,
    "metodopago" TEXT NOT NULL,
    "fechapago" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "registradopor" TEXT,
    "observaciones" TEXT,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "historialpagoproducto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "alertastock" (
    "id" SERIAL NOT NULL,
    "configuracionproductoid" INTEGER NOT NULL,
    "tipoalerta" TEXT NOT NULL,
    "mensaje" TEXT NOT NULL,
    "stockactual" INTEGER NOT NULL,
    "stockminimo" INTEGER NOT NULL,
    "visto" BOOLEAN NOT NULL DEFAULT false,
    "resuelto" BOOLEAN NOT NULL DEFAULT false,
    "createdat" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "resolvidoat" TIMESTAMP(3),

    CONSTRAINT "alertastock_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "configuracionproducto_productoid_key" ON "configuracionproducto"("productoid");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_usuarioId_fkey" FOREIGN KEY ("usuarioId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "movimientoinventario" ADD CONSTRAINT "movimientoinventario_configuracionproductoid_fkey" FOREIGN KEY ("configuracionproductoid") REFERENCES "configuracionproducto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "historialpagoproducto" ADD CONSTRAINT "historialpagoproducto_pagoproductoid_fkey" FOREIGN KEY ("pagoproductoid") REFERENCES "pagoproducto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "alertastock" ADD CONSTRAINT "alertastock_configuracionproductoid_fkey" FOREIGN KEY ("configuracionproductoid") REFERENCES "configuracionproducto"("id") ON DELETE CASCADE ON UPDATE CASCADE;
