-- Core scheduling TIMESTAMPTZ migration (STAGING FIRST)
--
-- Goal: Convert the most timezone-sensitive columns (appointments + lead scheduling + reception payments)
-- from TIMESTAMP (without timezone) to TIMESTAMPTZ, interpreting existing stored values
-- as business-local time in America/Lima.
--
-- IMPORTANT:
-- - Run this on STAGING first.
-- - Take a DB backup/snapshot before applying.
-- - This script assumes existing values represent LOCAL business time (America/Lima).
-- - This uses a semi-open day filtering strategy in the app ([start, nextDayStart)).
--
-- If you discover existing timestamps are actually UTC instants already, the USING clause must change to AT TIME ZONE 'UTC'.

-- ========== Lead ==========
ALTER TABLE "Lead"
  ALTER COLUMN "fechaLead" TYPE timestamptz(3) USING "fechaLead" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "fechaHoraAgenda" TYPE timestamptz(3) USING "fechaHoraAgenda" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "fechaVolverLlamar" TYPE timestamptz(3) USING "fechaVolverLlamar" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- ========== Appointment ==========
ALTER TABLE "Appointment"
  ALTER COLUMN "startTime" TYPE timestamptz(3) USING "startTime" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "endTime" TYPE timestamptz(3) USING "endTime" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- ========== PagoRecepcion ==========
ALTER TABLE "PagoRecepcion"
  ALTER COLUMN "fechaPago" TYPE timestamptz(3) USING "fechaPago" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- ========== Shift (keep date as DATE) ==========
ALTER TABLE "Shift"
  ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

-- ========== Resource / ResourceUser ==========
ALTER TABLE "Resource"
  ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';

ALTER TABLE "ResourceUser"
  ALTER COLUMN "createdAt" TYPE timestamptz(3) USING "createdAt" AT TIME ZONE 'America/Lima',
  ALTER COLUMN "updatedAt" TYPE timestamptz(3) USING "updatedAt" AT TIME ZONE 'America/Lima';
