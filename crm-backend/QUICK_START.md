# 🚀 Quick Start - Despliegue Rápido

Guía de inicio rápido para desplegar el backend de Munnay CRM en Render con Google Cloud SQL.

## ⚡ Pasos Rápidos (5-10 minutos)

### 1️⃣ Crear Base de Datos en Google Cloud SQL

```bash
1. Ir a: https://console.cloud.google.com/sql
2. Click "CREAR INSTANCIA" → PostgreSQL
3. Configurar:
   - ID: munnay-crm-db
   - Contraseña: [crear contraseña segura]
   - Región: us-central1 (o southamerica-east1 para Perú)
4. Click "CREAR INSTANCIA" (esperar 5-10 min)
```

### 2️⃣ Configurar Base de Datos

```bash
1. En la instancia → "DATABASES" → "CREATE DATABASE"
2. Nombre: basemunnaycrm
3. Click "CREATE"
```

### 3️⃣ Habilitar Conectividad

```bash
1. En la instancia → "CONNECTIONS" → "NETWORKING"
2. Verificar que "Public IP" esté habilitado
3. Anotar la IP pública (ej: 34.136.111.115)
4. En "Authorized networks" → "ADD NETWORK"
   - Nombre: Render
   - Red: 0.0.0.0/0 (temporal, mejorar después)
5. En "SECURITY" → Marcar "Only allow SSL connections"
```

### 4️⃣ Obtener URL de Conexión

```
postgresql://postgres:TU_PASSWORD@TU_IP:5432/basemunnaycrm?sslmode=require
```

Ejemplo:
```
postgresql://postgres:MyPass123!@34.136.111.115:5432/basemunnaycrm?sslmode=require
```

### 5️⃣ Desplegar en Render

#### Opción A: Usando render.yaml (Automático)

```bash
1. Ir a: https://dashboard.render.com/
2. Click "New" → "Blueprint"
3. Conectar repositorio: marketingmunnay/Munnay-System-CRM
4. Render detectará el archivo render.yaml automáticamente
5. En "Environment Variables" agregar:
   DATABASE_URL=postgresql://postgres:PASSWORD@IP:5432/basemunnaycrm?sslmode=require
6. Click "Apply"
```

#### Opción B: Manual

```bash
1. Ir a: https://dashboard.render.com/
2. Click "New" → "Web Service"
3. Conectar repositorio: marketingmunnay/Munnay-System-CRM
4. Configurar:
   - Name: munnay-crm-backend
   - Root Directory: crm-backend
   - Build Command: npm ci && npx prisma generate && npm run build
   - Start Command: npm start
   - Health Check Path: /health
5. En "Environment" agregar:
   DATABASE_URL=postgresql://postgres:PASSWORD@IP:5432/basemunnaycrm?sslmode=require
   NODE_ENV=production
   PORT=4000
6. Click "Create Web Service"
```

### 6️⃣ Verificar Despliegue

Una vez desplegado (5-10 minutos):

```bash
# Health check
curl https://tu-servicio.onrender.com/health

# Respuesta esperada:
{
  "status": "ok",
  "message": "CRM Munnay Backend is running!",
  "timestamp": "2024-11-04T16:00:00.000Z",
  "environment": "production"
}

# Verificar base de datos
curl https://tu-servicio.onrender.com/health/db

# Respuesta esperada:
{
  "status": "ok",
  "message": "Database connection successful",
  "timestamp": "2024-11-04T16:00:00.000Z"
}
```

## ✅ Checklist de Verificación

- [ ] Instancia de Cloud SQL creada y corriendo
- [ ] Base de datos `basemunnaycrm` creada
- [ ] IP pública habilitada y anotada
- [ ] Redes autorizadas configuradas
- [ ] SSL habilitado
- [ ] URL de conexión generada
- [ ] Servicio en Render creado
- [ ] Variable DATABASE_URL configurada en Render
- [ ] Servicio desplegado exitosamente
- [ ] Health check básico funcionando
- [ ] Health check de base de datos funcionando

## 🔧 Configuración Adicional

### Conectar Frontend (Vercel)

Si necesitas que el frontend se conecte al backend:

1. Ir a proyecto en Vercel
2. Settings → Environment Variables
3. Agregar:
   ```
   VITE_API_URL=https://tu-servicio.onrender.com
   ```
4. Redeploy

### Actualizar CORS

Agregar la URL de tu frontend en `crm-backend/src/index.ts`:

```typescript
const allowedOrigins = [
  'https://mcc.munnaymedicinaestetica.com',
  'https://munnay-system-crm.vercel.app',
  'https://munnay-system.vercel.app',
  'https://tu-frontend-url.vercel.app', // ← Agregar aquí
];
```

Commit y push los cambios. Render redesplegará automáticamente.

## 🐛 Troubleshooting Rápido

### Backend no inicia

```bash
1. Revisar logs en Render Dashboard
2. Verificar que DATABASE_URL esté configurada correctamente
3. Verificar que Cloud SQL esté corriendo
```

### Error de conexión a base de datos

```bash
1. Verificar IP pública de Cloud SQL
2. Verificar que Render esté en redes autorizadas
3. Verificar contraseña en DATABASE_URL
4. Verificar que dice ?sslmode=require al final
```

### Error de CORS en frontend

```bash
1. Verificar que la URL del frontend esté en allowedOrigins
2. Redeploy el backend después de agregar la URL
3. Verificar que credentials: true esté configurado
```

## 📚 Documentación Completa

Para información más detallada, consulta:

- **Guía completa de despliegue**: [DEPLOYMENT.md](./DEPLOYMENT.md)
- **Configuración de Google Cloud SQL**: [GOOGLE_CLOUD_SQL_SETUP.md](./GOOGLE_CLOUD_SQL_SETUP.md)
- **Guía general del sistema**: [../DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)

## 💡 Mejoras de Seguridad (Post-Despliegue)

Después de verificar que todo funciona:

### 1. Restringir IPs en Cloud SQL

En lugar de `0.0.0.0/0`, usa IPs específicas de Render:
- Consulta: https://render.com/docs/static-outbound-ip-addresses
- Agrega solo las IPs de tu región

### 2. Crear Usuario Específico

En lugar de usar `postgres`, crea un usuario dedicado:

```sql
-- Conectar a Cloud SQL
CREATE USER munnay_admin WITH PASSWORD 'password_seguro';
GRANT ALL PRIVILEGES ON DATABASE basemunnaycrm TO munnay_admin;
```

Actualizar DATABASE_URL en Render:
```
postgresql://munnay_admin:password_seguro@IP:5432/basemunnaycrm?sslmode=require
```

### 3. Habilitar Backups Automáticos

En Cloud SQL:
1. Ir a "BACKUPS"
2. Click "EDIT AUTOMATED BACKUPS"
3. Habilitar y configurar horario
4. Habilitar point-in-time recovery

### 4. Configurar Alertas

En Google Cloud Console → Monitoring:
1. Crear alertas para:
   - CPU > 80%
   - Memoria > 85%
   - Storage > 90%
2. Configurar notificaciones por email

## 🎉 ¡Listo!

Tu backend ahora está desplegado en Render conectado a Google Cloud SQL.

**URLs importantes:**
- Backend: https://tu-servicio.onrender.com
- Health: https://tu-servicio.onrender.com/health
- API: https://tu-servicio.onrender.com/api

**Próximos pasos:**
1. Migrar datos existentes (si aplica)
2. Configurar frontend para usar el backend
3. Implementar mejoras de seguridad
4. Configurar monitoreo y alertas
