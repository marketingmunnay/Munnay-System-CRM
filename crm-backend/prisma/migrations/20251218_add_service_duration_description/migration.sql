-- AlterTable: Add duracionMinutos and descripcion to Service
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "duracionMinutos" INTEGER NOT NULL DEFAULT 60;
ALTER TABLE "Service" ADD COLUMN IF NOT EXISTS "descripcion" TEXT;
