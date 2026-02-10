/*
  Safe migration to change Treatment.id from integer to bigint.
  Steps:
  - Drop primary key constraint
  - Alter column type to bigint
  - Recreate primary key
  Note: If there are foreign key constraints referencing this column, you may need to
  alter those referencing columns as well in the same migration (Prisma did not include them).
*/
BEGIN;
ALTER TABLE IF EXISTS "Treatment" DROP CONSTRAINT IF EXISTS "Treatment_pkey";
ALTER TABLE IF EXISTS "Treatment" ALTER COLUMN "id" TYPE bigint USING ("id"::bigint);
ALTER TABLE IF EXISTS "Treatment" ADD CONSTRAINT "Treatment_pkey" PRIMARY KEY ("id");
COMMIT;
