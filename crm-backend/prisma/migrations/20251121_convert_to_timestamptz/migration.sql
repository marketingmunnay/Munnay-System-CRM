-- Migration: Convert selected timestamp columns to timestamptz
-- Date: 2025-11-21
-- WARNING: Review these statements before running in production. They assume existing
-- timestamp columns contain values in UTC or already normalized. If your data uses
-- local timestamps, adapt the USING clause accordingly.

BEGIN;

-- Lead
ALTER TABLE "Lead" ALTER COLUMN "fechaLead" TYPE timestamptz USING ("fechaLead" AT TIME ZONE 'UTC');
ALTER TABLE "Lead" ALTER COLUMN "fechaHoraAgenda" TYPE timestamptz USING ("fechaHoraAgenda" AT TIME ZONE 'UTC');
ALTER TABLE "Lead" ALTER COLUMN "fechaVolverLlamar" TYPE timestamptz USING ("fechaVolverLlamar" AT TIME ZONE 'UTC');
ALTER TABLE "Lead" ALTER COLUMN "birthDate" TYPE timestamptz USING ("birthDate" AT TIME ZONE 'UTC');

-- PagoRecepcion
ALTER TABLE "PagoRecepcion" ALTER COLUMN "fechaPago" TYPE timestamptz USING ("fechaPago" AT TIME ZONE 'UTC');

-- Procedure
ALTER TABLE "Procedure" ALTER COLUMN "fechaAtencion" TYPE timestamptz USING ("fechaAtencion" AT TIME ZONE 'UTC');

-- Seguimiento
ALTER TABLE "Seguimiento" ALTER COLUMN "fechaSeguimiento" TYPE timestamptz USING ("fechaSeguimiento" AT TIME ZONE 'UTC');

-- Campaign / MetaCampaign
ALTER TABLE "Campaign" ALTER COLUMN "fecha" TYPE timestamptz USING ("fecha" AT TIME ZONE 'UTC');
ALTER TABLE "MetaCampaign" ALTER COLUMN "fechaInicio" TYPE timestamptz USING ("fechaInicio" AT TIME ZONE 'UTC');
ALTER TABLE "MetaCampaign" ALTER COLUMN "fechaFin" TYPE timestamptz USING ("fechaFin" AT TIME ZONE 'UTC');

-- Publicacion / Seguidor
ALTER TABLE "Publicacion" ALTER COLUMN "fechaPost" TYPE timestamptz USING ("fechaPost" AT TIME ZONE 'UTC');
ALTER TABLE "Seguidor" ALTER COLUMN "fecha" TYPE timestamptz USING ("fecha" AT TIME ZONE 'UTC');

-- VentaExtra
ALTER TABLE "VentaExtra" ALTER COLUMN "fechaVenta" TYPE timestamptz USING ("fechaVenta" AT TIME ZONE 'UTC');
ALTER TABLE "VentaExtra" ALTER COLUMN "fechaPagoDeuda" TYPE timestamptz USING ("fechaPagoDeuda" AT TIME ZONE 'UTC');

-- Incidencia
ALTER TABLE "Incidencia" ALTER COLUMN "fecha" TYPE timestamptz USING ("fecha" AT TIME ZONE 'UTC');

-- ComprobanteElectronico
ALTER TABLE "ComprobanteElectronico" ALTER COLUMN "fechaEmision" TYPE timestamptz USING ("fechaEmision" AT TIME ZONE 'UTC');

-- Egreso
ALTER TABLE "Egreso" ALTER COLUMN "fechaRegistro" TYPE timestamptz USING ("fechaRegistro" AT TIME ZONE 'UTC');
ALTER TABLE "Egreso" ALTER COLUMN "fechaPago" TYPE timestamptz USING ("fechaPago" AT TIME ZONE 'UTC');

-- User dates
ALTER TABLE "User" ALTER COLUMN "birthDate" TYPE timestamptz USING ("birthDate" AT TIME ZONE 'UTC');
ALTER TABLE "User" ALTER COLUMN "startDate" TYPE timestamptz USING ("startDate" AT TIME ZONE 'UTC');
ALTER TABLE "User" ALTER COLUMN "endDate" TYPE timestamptz USING ("endDate" AT TIME ZONE 'UTC');

-- Reconocimiento
ALTER TABLE "Reconocimiento" ALTER COLUMN "fecha" TYPE timestamptz USING ("fecha" AT TIME ZONE 'UTC');

-- Goal
ALTER TABLE "Goal" ALTER COLUMN "startDate" TYPE timestamptz USING ("startDate" AT TIME ZONE 'UTC');
ALTER TABLE "Goal" ALTER COLUMN "endDate" TYPE timestamptz USING ("endDate" AT TIME ZONE 'UTC');

COMMIT;

-- End of migration
