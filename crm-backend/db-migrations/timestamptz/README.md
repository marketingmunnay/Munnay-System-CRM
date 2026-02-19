# TIMESTAMPTZ migration scripts (manual)

These scripts are intended for **STAGING** validation first.

## Why these exist

- Prisma migrations do not automatically generate the exact `USING ... AT TIME ZONE 'America/Lima'` conversions we need.
- So we keep explicit SQL scripts that safely reinterpret existing `timestamp without time zone` values as business-local (America/Lima) and convert them to `timestamptz`.

## Conventions

- All conversions use:

```sql
ALTER TABLE ...
  ALTER COLUMN ... TYPE timestamptz(3)
  USING ... AT TIME ZONE 'America/Lima';
```

- Nullable columns are safe: `NULL AT TIME ZONE ...` stays `NULL`.

## Suggested execution strategy

- Apply **core scheduling** first (Lead + Appointment + PagoRecepcion + Shift/Resource audit timestamps).
- Validate functional scenarios (23:30, date filters, browser TZ switch).
- Only then migrate the remaining tables.

See: ../../DOCS/TIMESTAMPTZ_MIGRATION_STAGING_PLAN.md
