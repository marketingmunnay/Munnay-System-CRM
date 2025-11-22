-- Manual migration: convert Treatment.id and referencing columns to bigint
-- Drops referencing FK if exists, alters column types, recreates FK.
BEGIN;

-- Drop foreign key constraint on Procedure.tratamientoId if it exists
DO $$
DECLARE
  fkname text;
BEGIN
  SELECT conname INTO fkname
  FROM pg_constraint c
  JOIN pg_class t ON c.conrelid = t.oid
  JOIN pg_attribute a ON a.attrelid = t.oid AND a.attnum = ANY(c.conkey)
  WHERE c.contype = 'f' AND t.relname = 'Procedure' AND a.attname = 'tratamientoId'
  LIMIT 1;
  IF fkname IS NOT NULL THEN
    EXECUTE format('ALTER TABLE "Procedure" DROP CONSTRAINT %I', fkname);
  END IF;
END$$;

-- Alter referencing column to bigint
ALTER TABLE IF EXISTS "Procedure" ALTER COLUMN "tratamientoId" TYPE bigint USING ("tratamientoId"::bigint);

-- Alter primary id column to bigint
ALTER TABLE IF EXISTS "Treatment" ALTER COLUMN "id" TYPE bigint USING ("id"::bigint);

-- Recreate FK constraint
ALTER TABLE IF EXISTS "Procedure" ADD CONSTRAINT "Procedure_tratamientoId_fkey" FOREIGN KEY ("tratamientoId") REFERENCES "Treatment"("id") ON DELETE CASCADE;

COMMIT;
