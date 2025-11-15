# Instrucciones para Migración de Base de Datos - Sistema de Inventario

## 📋 Resumen de Cambios

Se han agregado nuevas funcionalidades al módulo de Productos para gestión completa de inventario:

### Nuevos Campos en `Product`:
- `tipo`: Tipo de producto (venta/insumo)
- `costoCompra`: Costo de compra del producto
- `precioVenta`: Precio de venta
- `stockActual`: Cantidad actual en inventario
- `stockMinimo`: Nivel mínimo de stock (alerta amarilla)
- `stockCritico`: Nivel crítico de stock (alerta roja)

### Nueva Tabla `MovimientoStock`:
Registra todas las entradas y salidas de inventario con:
- Producto relacionado
- Tipo de movimiento (entrada/salida)
- Cantidad
- Costos y precios unitarios
- Motivo del movimiento
- Referencias opcionales a ventas y procedimientos

## 🚀 Pasos para Aplicar la Migración

### 1. Generar la migración de Prisma

```powershell
cd crm-backend
npx prisma migrate dev --name add_inventory_system
```

Este comando:
- Crea una nueva migración basada en los cambios del schema.prisma
- Aplica automáticamente la migración a la base de datos de desarrollo
- Regenera el Prisma Client

### 2. Revisar la migración generada

Verifica el archivo SQL generado en:
```
crm-backend/prisma/migrations/[timestamp]_add_inventory_system/migration.sql
```

### 3. Aplicar a producción (Render)

Cuando estés listo para producción:

```powershell
# Desde el directorio crm-backend
npx prisma migrate deploy
```

O configurar en Render para que ejecute automáticamente:
```bash
npx prisma migrate deploy && npm start
```

## 📊 Valores por Defecto

Los nuevos campos tienen valores por defecto seguros:
- `tipo`: "venta"
- `costoCompra`: 0
- `precioVenta`: 0
- `stockActual`: 0
- `stockMinimo`: 5
- `stockCritico`: 3

Los productos existentes se migrarán automáticamente con estos valores.

## ⚠️ Consideraciones Importantes

1. **Backup**: Siempre haz backup de la base de datos antes de migrar en producción
2. **Datos existentes**: Los productos actuales mantendrán su campo `precio` original y se agregarán los nuevos campos
3. **Stock inicial**: Después de la migración, deberás:
   - Actualizar el `tipo` de cada producto (venta/insumo)
   - Registrar inventario inicial usando movimientos de stock
   - Ajustar `stockMinimo` y `stockCritico` según tus necesidades

## 🔧 Comandos Útiles

```powershell
# Ver estado de migraciones
npx prisma migrate status

# Regenerar Prisma Client (si es necesario)
npx prisma generate

# Abrir Prisma Studio para ver datos
npx prisma studio

# Crear nueva migración sin aplicar
npx prisma migrate dev --create-only --name nombre_migracion
```

## 📝 Siguientes Pasos

Después de aplicar la migración:

1. ✅ Actualizar productos existentes con stock inicial
2. ✅ Configurar alertas de stock en el dashboard
3. ✅ Entrenar al equipo en el uso del nuevo sistema
4. ✅ Configurar insumos para servicios (opcional)

## 🆘 Resolución de Problemas

### Error: "Migration failed"
- Verifica conexión a la base de datos
- Revisa que no haya conflictos con datos existentes
- Consulta los logs en `crm-backend/prisma/migrations/`

### Error: "Type 'TipoProducto' does not exist"
- Asegúrate de que el enum esté definido en schema.prisma
- Regenera el cliente: `npx prisma generate`

### Datos inconsistentes
- Usa Prisma Studio para verificar: `npx prisma studio`
- Revisa que los valores por defecto se hayan aplicado correctamente
