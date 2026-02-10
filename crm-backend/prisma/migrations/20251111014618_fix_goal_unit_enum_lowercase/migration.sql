/*
  Warnings:

  - The values [Cantidad,Porcentaje] on the enum `GoalUnit` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "GoalUnit_new" AS ENUM ('cantidad', 'porcentaje');
ALTER TABLE "Goal" ALTER COLUMN "unit" TYPE "GoalUnit_new" USING ("unit"::text::"GoalUnit_new");
ALTER TYPE "GoalUnit" RENAME TO "GoalUnit_old";
ALTER TYPE "GoalUnit_new" RENAME TO "GoalUnit";
DROP TYPE "public"."GoalUnit_old";
COMMIT;
