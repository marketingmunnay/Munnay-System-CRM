-- Migration: Add vendedorId and apoyoPorId to VentaExtra
-- Date: 2025-11-22

BEGIN;

ALTER TABLE "VentaExtra"
  ADD COLUMN IF NOT EXISTS "vendedorId" INTEGER;

ALTER TABLE "VentaExtra"
  ADD COLUMN IF NOT EXISTS "apoyoPorId" INTEGER;

-- Add FK constraints to User
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ventaextra_vendedorid_fkey'
  ) THEN
    ALTER TABLE "VentaExtra" ADD CONSTRAINT ventaextra_vendedorid_fkey FOREIGN KEY ("vendedorId") REFERENCES "User"(id) ON DELETE SET NULL;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'ventaextra_apoyoporid_fkey'
  ) THEN
    ALTER TABLE "VentaExtra" ADD CONSTRAINT ventaextra_apoyoporid_fkey FOREIGN KEY ("apoyoPorId") REFERENCES "User"(id) ON DELETE SET NULL;
  END IF;
END$$;

COMMIT;

-- End of migration
