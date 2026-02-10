/*
  Warnings:

  - You are about to drop the column `descripcion` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the column `nombre` on the `Membership` table. All the data in the column will be lost.
  - You are about to drop the `_LeadToMembership` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `leadId` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `servicioNombre` to the `Membership` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Membership` table without a default value. This is not possible if the table is not empty.

*/

-- Primero eliminar los registros existentes de membresías
DELETE FROM "Membership";

-- DropForeignKey
ALTER TABLE "_LeadToMembership" DROP CONSTRAINT "_LeadToMembership_A_fkey";

-- DropForeignKey
ALTER TABLE "_LeadToMembership" DROP CONSTRAINT "_LeadToMembership_B_fkey";

-- DropIndex
DROP INDEX "Membership_nombre_key";

-- AlterTable
ALTER TABLE "Membership" DROP COLUMN "descripcion",
DROP COLUMN "nombre",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "leadId" INTEGER NOT NULL,
ADD COLUMN     "servicioNombre" TEXT NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "_LeadToMembership";

-- AddForeignKey
ALTER TABLE "Membership" ADD CONSTRAINT "Membership_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead"("id") ON DELETE CASCADE ON UPDATE CASCADE;
