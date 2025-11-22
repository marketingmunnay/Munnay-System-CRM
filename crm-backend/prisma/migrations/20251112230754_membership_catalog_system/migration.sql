/*
  Warnings:

  - You are about to drop the column `leadId` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `numeroSesiones` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `precio` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `servicioNombre` on the `Membership` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nombre]` on the table `Membership` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `descripcion` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nombre` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/

-- Limpiar datos existentes de membresías
DELETE FROM "Membership";

-- DropForeignKey
ALTER TABLE "Membership" DROP CONSTRAINT "Membership_leadId_fkey";

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "leadId",
DROP COLUMN "numeroSesiones",
DROP COLUMN "precio",
DROP COLUMN "servicioNombre",
ADD COLUMN     "descripcion" TEXT NOT NULL,
ADD COLUMN     "nombre" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "MembershipService" (
    "id" SERIAL NOT NULL,
    "membershipId" INTEGER NOT NULL,
    "servicioNombre" TEXT NOT NULL,
    "precio" DOUBLE PRECISION NOT NULL,
    "numeroSesiones" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MembershipService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadMembership" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "membershipId" INTEGER NOT NULL,
    "fechaCompra" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "precioTotal" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeadMembership_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Membership_nombre_key" ON "Membership"("nombre");

-- AddForeignKey
ALTER TABLE "MembershipService" ADD CONSTRAINT "MembershipService_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadMembership" ADD CONSTRAINT "LeadMembership_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeadMembership" ADD CONSTRAINT "LeadMembership_membershipId_fkey" FOREIGN KEY ("membershipId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;
