-- DropIndex
DROP INDEX "Proveedor_ruc_key";

-- AlterTable
ALTER TABLE "Proveedor" ALTER COLUMN "ruc" DROP NOT NULL,
ALTER COLUMN "numeroContacto" DROP NOT NULL;
