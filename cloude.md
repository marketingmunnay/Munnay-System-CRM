# Errores recientes

No se reportaron errores recientes en el archivo adjunto ni en el contexto actual.

Si tienes errores específicos que deseas guardar, por favor indícalos o pégalos aquí para agregarlos a este archivo.

# Registro de errores solucionados

1. **Conexión backend a PostgreSQL VPS**
   - Problema: El backend intentaba conectarse a localhost en vez del VPS.
   - Solución: Se actualizó la configuración `.env` y los archivos de PostgreSQL (`postgresql.conf`, `pg_hba.conf`) y firewall para aceptar conexiones externas.

2. **Error de rutas en backend**
   - Problema: "Route.get() requires a callback function but got a [object Undefined]" en `users.routes.js`.
   - Solución: Se revisaron y corrigieron los imports/exports de controladores y se validó la sincronización del build/despliegue.

3. **Diferenciación de usuarios (users/allUsers)**
   - Problema: El array `users` no filtraba correctamente para Recepcionistas y Call Center, y la configuración requería la lista completa.
   - Solución: Se implementó `getSellers` y el estado `allUsers`, ajustando el flujo de datos en el frontend.

4. **Commit y push de cambios**
   - Problema: Cambios no reflejados en el repositorio.
   - Solución: Se realizó commit y push exitosamente.

Si necesitas el detalle de algún error adicional, indícalo y lo agrego.
