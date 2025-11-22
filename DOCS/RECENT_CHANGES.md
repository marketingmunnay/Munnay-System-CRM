# Documentación — Cambios recientes (IA y UI)

Fecha: 2025-11-22
Rama: `copilot/disable-login-open-dashboard`

Resumen
-------
Este documento resume los cambios recientes que implementé para mejorar el manejo de errores de la integración con la API de IA (Google Generative / Gemini), la experiencia de usuario cuando la IA falla, y algunas correcciones/pequeñas mejoras en el frontend relacionadas con alertas y manejo de fechas.

Cambios principales
-------------------
1) Backend — Mejor manejo de errores de IA
- Archivo: `crm-backend/src/controllers/ai.controller.ts`
  - Detecto errores del proveedor y mapeo respuestas útiles:
    - Si se recibe 429 (Too Many Requests / cuota excedida) ahora devuelvo 429 con un mensaje legible.
    - Si se recibe 5xx del proveedor devuelvo 502 (Bad Gateway) con mensaje genérico para no filtrar detalles internos.
  - Se añadió un "circuit breaker" (cooldown) en memoria:
    - Variable: `aiCooldownUntil` y constante `AI_COOLDOWN_MS` (por defecto 5 min).
    - Si el backend recibe un 429, activa el cooldown y subsecuentes peticiones durante ese periodo reciben 429 inmediatamente (evita seguir llamadas al proveedor).
  - Beneficio: reduce intentos fallidos repetidos, evita ruido en logs y mejora UX en el frontend.

2) Backend — Mensajes claros
- Cuando ocurre 429 devolvemos JSON con mensaje amigable en español para que el frontend lo muestre al usuario.

3) Frontend — Manejo de errores IA y UX
- Archivo: `services/api.ts`
  - Introduje `ApiError` que encapsula `status` y `body` para que los llamadores puedan distinguir 429/5xx/
  - `apiRequest` ahora lanza `ApiError` (en vez de Error genérico) cuando response.ok === false.
  - `generateAiContent` y `generateAiAnalysis` capturan `ApiError` y devuelven mensajes legibles según el `status` (429 -> mensaje de cuota, 5xx -> proveedor caído).

- Archivo: `components/informes/InformeComercial.tsx`
  - Importa `AlertModal` y muestra un modal con el mensaje amigable cuando la generación IA falla.

- Archivo: `components/shared/AlertModal.tsx`
  - Nuevo componente modal estilizado para reemplazar llamadas a `alert()` nativas en UX importantes.

4) Frontend — Correcciones y mejoras varias
- `components/marketing/LeadFormModal.tsx`:
  - Procedimientos: tratamiento con `cantidadSesiones === 0` es considerado "ilimitado" (no bloquea la adición de procedimientos).
  - Normalización de ID numeric/string para evitar mismatches.
  - Se reemplazaron varios `alert()` nativos en favor de `AlertModal` (sustitución en progreso; muchas ya convertidas).
  - Eliminado un comentario tipo `// ...` que estaba dentro de JSX y se mostraba como texto en la UI (seguimientos).

- `components/configuracion/CatalogFormModal.tsx` y `components/configuracion/ConfiguracionPage.tsx`
  - Corregí el bug "rooms is not defined" pasando `itemRooms` desde `ConfiguracionPage` y destructurando `roomField` en el modal.

5) Nuevos archivos añadidos
- `components/shared/AlertModal.tsx` (modal de alerta moderno y reutilizable)
- Docs: `DOCS/RECENT_CHANGES.md` (este archivo)

Cómo probar localmente
----------------------
(Se asume PowerShell en Windows con Node.js instalado)

1) Levantar frontend (root del repo):
```powershell
npm install
npm run dev
```

2) Levantar backend (carpeta `crm-backend`):
```powershell
cd crm-backend
npm install
npm run dev
```

3) Flujo a probar
- Abrir `Informe Comercial` → click en "Generar Análisis IA".
  - Si la cuota está OK, verás el resumen generado.
  - Si la cuota está excedida, verás un modal con el mensaje amigable que explica la situación.
- En el modal de `Lead` (procedimientos): probar agregar procedimiento para tratamiento con `cantidadSesiones === 0` (debe permitirlo).
- Revisar `Configuración` → `Servicios/Productos` → Añadir: el select de `Sala` debe renderizar correctamente cuando hay salas guardadas.

Detalles técnicos importantes
----------------------------
- Circuit breaker en memoria: esto protege contra ráfagas de 429, pero no persiste entre reinicios ni funciona entre instancias (si tienes múltiples instancias/replicas necesitarás una store central como Redis).
- Mensajes del backend: ahora el backend devuelve respuestas claras para 429 y 502. El frontend ya consume y muestra estas respuestas con `AlertModal`.

Cómo ajustar el cooldown
------------------------
- En `crm-backend/src/controllers/ai.controller.ts` puedes cambiar `AI_COOLDOWN_MS` (valor actual 5 minutos). Para un entorno con múltiples instancias, reemplaza la variable en memoria con una key TTL en Redis.

Recomendaciones y siguientes pasos
---------------------------------
- Reemplazar el resto de `alert()`/`confirm()` en el repo por `AlertModal` o un `ConfirmModal` para una UX consistente. (pendiente: sweep repo)
- Considerar:
  - Usar Redis para el estado del circuit breaker en producción (evita reinicios y sincroniza instancias).
  - Añadir retries exponenciales solo para errores 5xx (no para 429).
  - Mostrar un banner global (TopBar/Notification) cuando la IA esté en cooldown para informar a todos los usuarios.
  - Monitorizar la tasa de 429 (logs o servicio de errores) para decidir si aumentar cuota o optimizar prompts.
- Revisión administrativa: valida el estado de billing/cuota en Google Cloud (Proyecto que usa `GOOGLE_GEMINI_API_KEY`). Si prefieres, puedo listar los pasos para revisar cuota en Google Cloud Console.

Commits y branch
-----------------
- Branch: `copilot/disable-login-open-dashboard`
- Últimos commits relacionados:
  - `chore: AI error handling + UI fixes (Seguimientos comment, modal alerts)`
  - `feat: AI UX — surface IA errors in UI; api error mapping`

Contacto / notas finales
------------------------
Si quieres que documente esto en un changelog más formal (cambios por archivo, PR notes) o que abra PR con estos cambios y la descripción lista para revisión, lo hago.

¿Deseas que también:
- añada un `README.md` pequeño en `crm-backend` con la explicación del circuit breaker y cómo desactivarlo? (recomendado)
- implemente el banner global que indica cooldown en la UI ahora? (puedo hacerlo)
- implemente persistencia del circuit breaker con Redis? (requiere acceso a Redis o configuración)

