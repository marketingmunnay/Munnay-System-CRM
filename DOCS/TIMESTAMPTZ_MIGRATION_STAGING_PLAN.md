# Migración a TIMESTAMPTZ (STAGING primero)

Fecha: 2026-02-18

## Objetivo

- Migrar columnas críticas de fecha/hora desde `TIMESTAMP WITHOUT TIME ZONE` a `TIMESTAMPTZ`.
- Interpretar los valores existentes como **hora local del negocio** (`America/Lima`) y convertirlos a un **instante absoluto**.
- Validar en **staging** los escenarios de borde (23:30, cambio de zona del navegador, refrescar) antes de tocar producción.

## Principio de conversión

Para cada columna `timestamp` que hoy representa hora local Lima, el cambio recomendado es:

```sql
ALTER TABLE ...
  ALTER COLUMN ... TYPE timestamptz(3)
  USING ... AT TIME ZONE 'America/Lima';
```

Esto interpreta el valor previo como “hora Lima” y lo convierte a `timestamptz` (guardando el instante).

> Nota importante: si al auditar se descubre que los `timestamp` actuales ya representan instantes UTC (poco probable en este sistema histórico), entonces el `USING` debe ser `AT TIME ZONE 'UTC'`.

## Columnas DateTime (inventario completo)

Este repositorio (Prisma) contiene `DateTime` en múltiples modelos. Se listan para planificar por fases:

### Core (agenda/calendario/pagos recepción) — migrar primero

- `Lead`: `fechaLead`, `fechaHoraAgenda`, `fechaVolverLlamar`, `createdAt`, `updatedAt`
- `Appointment`: `startTime`, `endTime`, `createdAt`, `updatedAt`
- `PagoRecepcion`: `fechaPago`, `createdAt`, `updatedAt`
- `Shift`: `createdAt`, `updatedAt` (mantener `date` como `DATE`)
- `Resource`: `createdAt`, `updatedAt`
- `ResourceUser`: `createdAt`, `updatedAt`

### Siguiente ola (reportes/marketing/finanzas/inventario) — NO en esta primera migración

- `Procedure.fechaAtencion`
- `Seguimiento.fechaSeguimiento`
- `Campaign.fecha`
- `MetaCampaign.fechaInicio`, `MetaCampaign.fechaFin`
- `Publicacion.fechaPost`
- `Seguidor.fecha`
- `VentaExtra.fechaVenta`, `VentaExtra.fechaPagoDeuda`, `VentaExtra.fechaEntrega`
- `Incidencia.fecha`
- `ComprobanteElectronico.fechaEmision`
- `Egreso.fechaRegistro`, `Egreso.fechaPago`
- `Reconocimiento.fecha`
- `Goal.startDate`, `Goal.endDate`, `Goal.createdAt`, `Goal.updatedAt`
- `Product.createdAt`, `Product.updatedAt`
- `Membership.createdAt`, `Membership.updatedAt`
- `MembershipService.createdAt`, `MembershipService.updatedAt`
- `LeadMembership.fechaCompra`, `LeadMembership.createdAt`, `LeadMembership.updatedAt`
- Inventario:
  - `ConfiguracionProducto.createdat`, `ConfiguracionProducto.updatedat`
  - `MovimientoInventario.createdat`
  - `PagoProducto.fechapago`, `PagoProducto.fechaentrega`, `PagoProducto.createdat`, `PagoProducto.updatedat`
  - `HistorialPagoProducto.fechapago`, `HistorialPagoProducto.createdat`
  - `AlertaStock.createdat`, `AlertaStock.resolvidoat`

> Recomendación: antes de migrar esta “siguiente ola”, terminar de migrar los módulos UI restantes a `useDate` para evitar que sobreviva lógica `toISOString().split('T')[0]` en otras páginas.

## Rango de día local: semi-abierto

El sistema usa rango de día local en zona de negocio como:

- `start = YYYY-MM-DD 00:00:00` (America/Lima) → UTC
- `endExclusive = (YYYY-MM-DD + 1) 00:00:00` (America/Lima) → UTC

Y en queries se filtra con:

- `startTime >= start AND startTime < endExclusive`

Esto evita errores en milisegundos y problemas de inclusividad.

## Orden de ejecución (staging)

1. Snapshot/backup de staging.
2. Aplicar migración core (SQL):
   - [crm-backend/prisma/migrations/20260219_timestamptz_core_scheduling/migration.sql](../crm-backend/prisma/migrations/20260219_timestamptz_core_scheduling/migration.sql)
3. Ejecutar `npx prisma migrate deploy` en staging (si staging usa Prisma migrations).
4. Reiniciar backend.
5. Validaciones funcionales (manual QA):

### Checklist de validación

1. **Crear cita 23:30** (America/Lima)
   - Crear una cita para hoy a las 23:30.
   - Confirmar que se guarda y se vuelve a listar.

2. **Filtrar por hoy**
   - En Calendario: hoy debe incluir 23:30.
   - En Agendados: rango “Hoy” debe incluir la cita.
   - En Kanban de Leads (Agendado): debe mostrar fecha/hora correcta.

3. **Cambiar zona del navegador**
   - Cambiar timezone del sistema operativo/navegador (por ejemplo UTC, America/Mexico_City).
   - Refrescar.
   - Confirmar que:
     - Calendario muestra la cita a 23:30 Lima (no se “mueve” al día siguiente/anterior).
     - Agendados y Kanban siguen mostrando lo mismo.

4. **Refrescar y re-consultar**
   - Confirmar que las fechas siguen consistentes tras refresh.

## Nota sobre producción

No tocar producción hasta que staging pase el checklist anterior. En producción, esta migración puede requerir ventana de mantenimiento (los `ALTER TABLE ... TYPE` bloquean la tabla). Para alta disponibilidad se recomienda una migración online (columna nueva + backfill + swap), que se puede diseñar luego de validar staging.
