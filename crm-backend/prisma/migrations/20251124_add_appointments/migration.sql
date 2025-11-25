-- Migration: add_appointments
-- Creates Appointment table and FK relations to User (resource) and Lead (optional)

CREATE TABLE IF NOT EXISTS "Appointment" (
  "id" SERIAL PRIMARY KEY,
  "startAt" TIMESTAMPTZ NOT NULL,
  "endAt" TIMESTAMPTZ NOT NULL,
  "resourceId" INTEGER NOT NULL,
  "title" TEXT,
  "leadId" INTEGER,
  "createdAt" TIMESTAMPTZ DEFAULT now() NOT NULL,
  "updatedAt" TIMESTAMPTZ DEFAULT now() NOT NULL
);

ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "User" ("id") ON DELETE CASCADE;
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "Lead" ("id") ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS "Appointment_startAt_idx" ON "Appointment" ("startAt");
CREATE INDEX IF NOT EXISTS "Appointment_resource_idx" ON "Appointment" ("resourceId");
