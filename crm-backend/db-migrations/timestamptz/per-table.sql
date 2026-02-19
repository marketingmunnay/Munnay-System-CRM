-- TIMESTAMPTZ per-table scripts (STAGING FIRST)
--
-- This file includes blocks you can run per table.
-- All conversions assume existing TIMESTAMP values represent business-local time (America/Lima).
--
-- IMPORTANT: run a backup/snapshot before applying.

-- =====================================================
-- CORE (agenda/calendario/pagos recepción)
-- =====================================================

-- Lead
ALTER TABLE "Lead" ALTER COLUMN "fechaLead" TYPE timestamptz(3) USING "fechaLead" AT TIME ZONE 'America/Lima';
ALTER TABLE "Lead" ALTER COLUMN "fechaHoraAgenda" TYPE timestamptz(3) USING "fechaHoraAgenda" AT TIME ZONE 'America/Lima';
ALTER TABLE "Lead" ALTER COLUMN "fechaVolverLlamar" TYPE timestamptz(3) USING "fechaVolverLlamar" AT TIME ZONE 'America/Lima';
ALTER TABLE "Lead" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "Lead" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- Appointment
ALTER TABLE "Appointment" ALTER COLUMN "startTime" TYPE timestamptz(3) USING "startTime" AT TIME ZONE 'America/Lima';
ALTER TABLE "Appointment" ALTER COLUMN "endTime" TYPE timestamptz(3) USING "endTime" AT TIME ZONE 'America/Lima';
ALTER TABLE "Appointment" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "Appointment" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- PagoRecepcion
ALTER TABLE "PagoRecepcion" ALTER COLUMN "fechaPago" TYPE timestamptz(3) USING "fechaPago" AT TIME ZONE 'America/Lima';
ALTER TABLE "PagoRecepcion" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "PagoRecepcion" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- Shift (keep date as DATE)
ALTER TABLE "Shift" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "Shift" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- Resource / ResourceUser
ALTER TABLE "Resource" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "Resource" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "ResourceUser" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "ResourceUser" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- =====================================================
-- LATER WAVE (run AFTER UI is migrated to useDate)
-- =====================================================

-- Procedure
ALTER TABLE "Procedure" ALTER COLUMN "fechaAtencion" TYPE timestamptz(3) USING "fechaAtencion" AT TIME ZONE 'America/Lima';

-- Seguimiento
ALTER TABLE "Seguimiento" ALTER COLUMN "fechaSeguimiento" TYPE timestamptz(3) USING "fechaSeguimiento" AT TIME ZONE 'America/Lima';

-- Campaign
ALTER TABLE "Campaign" ALTER COLUMN "fecha" TYPE timestamptz(3) USING "fecha" AT TIME ZONE 'America/Lima';

-- MetaCampaign
ALTER TABLE "MetaCampaign" ALTER COLUMN "fechaInicio" TYPE timestamptz(3) USING "fechaInicio" AT TIME ZONE 'America/Lima';
ALTER TABLE "MetaCampaign" ALTER COLUMN "fechaFin" TYPE timestamptz(3) USING "fechaFin" AT TIME ZONE 'America/Lima';

-- Publicacion
ALTER TABLE "Publicacion" ALTER COLUMN "fechaPost" TYPE timestamptz(3) USING "fechaPost" AT TIME ZONE 'America/Lima';

-- Seguidor
ALTER TABLE "Seguidor" ALTER COLUMN "fecha" TYPE timestamptz(3) USING "fecha" AT TIME ZONE 'America/Lima';

-- VentaExtra
ALTER TABLE "VentaExtra" ALTER COLUMN "fechaVenta" TYPE timestamptz(3) USING "fechaVenta" AT TIME ZONE 'America/Lima';
ALTER TABLE "VentaExtra" ALTER COLUMN "fechaPagoDeuda" TYPE timestamptz(3) USING "fechaPagoDeuda" AT TIME ZONE 'America/Lima';
ALTER TABLE "VentaExtra" ALTER COLUMN "fechaEntrega" TYPE timestamptz(3) USING "fechaEntrega" AT TIME ZONE 'America/Lima';

-- Incidencia
ALTER TABLE "Incidencia" ALTER COLUMN "fecha" TYPE timestamptz(3) USING "fecha" AT TIME ZONE 'America/Lima';

-- ComprobanteElectronico
ALTER TABLE "ComprobanteElectronico" ALTER COLUMN "fechaEmision" TYPE timestamptz(3) USING "fechaEmision" AT TIME ZONE 'America/Lima';

-- Egreso
ALTER TABLE "Egreso" ALTER COLUMN "fechaRegistro" TYPE timestamptz(3) USING "fechaRegistro" AT TIME ZONE 'America/Lima';
ALTER TABLE "Egreso" ALTER COLUMN "fechaPago" TYPE timestamptz(3) USING "fechaPago" AT TIME ZONE 'America/Lima';

-- Reconocimiento
ALTER TABLE "Reconocimiento" ALTER COLUMN "fecha" TYPE timestamptz(3) USING "fecha" AT TIME ZONE 'America/Lima';

-- Goal
ALTER TABLE "Goal" ALTER COLUMN "startDate" TYPE timestamptz(3) USING "startDate" AT TIME ZONE 'America/Lima';
ALTER TABLE "Goal" ALTER COLUMN "endDate" TYPE timestamptz(3) USING "endDate" AT TIME ZONE 'America/Lima';
ALTER TABLE "Goal" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "Goal" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- Product
ALTER TABLE "Product" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "Product" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- Membership
ALTER TABLE "Membership" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "Membership" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- MembershipService
ALTER TABLE "MembershipService" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "MembershipService" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- LeadMembership
ALTER TABLE "LeadMembership" ALTER COLUMN "fechaCompra" TYPE timestamptz(3) USING "fechaCompra" AT TIME ZONE 'America/Lima';
ALTER TABLE "LeadMembership" ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima';
ALTER TABLE "LeadMembership" ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- Inventario (mapped tables/columns)
ALTER TABLE "configuracionproducto" ALTER COLUMN "createdat" TYPE timestamptz(3) USING "createdat" AT TIME ZONE 'America/Lima';
ALTER TABLE "configuracionproducto" ALTER COLUMN "updatedat" TYPE timestamptz(3) USING "updatedat" AT TIME ZONE 'America/Lima';

ALTER TABLE "movimientoinventario" ALTER COLUMN "createdat" TYPE timestamptz(3) USING "createdat" AT TIME ZONE 'America/Lima';

ALTER TABLE "pagoproducto" ALTER COLUMN "fechapago" TYPE timestamptz(3) USING "fechapago" AT TIME ZONE 'America/Lima';
ALTER TABLE "pagoproducto" ALTER COLUMN "fechaentrega" TYPE timestamptz(3) USING "fechaentrega" AT TIME ZONE 'America/Lima';
ALTER TABLE "pagoproducto" ALTER COLUMN "createdat" TYPE timestamptz(3) USING "createdat" AT TIME ZONE 'America/Lima';
ALTER TABLE "pagoproducto" ALTER COLUMN "updatedat" TYPE timestamptz(3) USING "updatedat" AT TIME ZONE 'America/Lima';

ALTER TABLE "historialpagoproducto" ALTER COLUMN "fechapago" TYPE timestamptz(3) USING "fechapago" AT TIME ZONE 'America/Lima';
ALTER TABLE "historialpagoproducto" ALTER COLUMN "createdat" TYPE timestamptz(3) USING "createdat" AT TIME ZONE 'America/Lima';

ALTER TABLE "alertastock" ALTER COLUMN "createdat" TYPE timestamptz(3) USING "createdat" AT TIME ZONE 'America/Lima';
ALTER TABLE "alertastock" ALTER COLUMN "resolvidoat" TYPE timestamptz(3) USING "resolvidoat" AT TIME ZONE 'America/Lima';

-- NOTE: User.birthDate / Lead.birthDate are semantically DATE-only.
-- If you decide to migrate them, strongly consider converting to DATE instead of TIMESTAMPTZ.
