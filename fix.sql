ALTER TABLE "Lead" ALTER COLUMN "vendedor" TYPE TEXT USING "vendedor"::text;
DROP TYPE IF EXISTS "Seller";
