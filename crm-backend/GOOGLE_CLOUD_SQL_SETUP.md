# Configuración de Google Cloud SQL para Munnay CRM

Esta guía detalla el proceso completo para configurar una instancia de Google Cloud SQL PostgreSQL para el CRM Munnay.

## 📋 Tabla de Contenidos

1. [Crear Instancia](#crear-instancia)
2. [Configurar Usuario y Base de Datos](#configurar-usuario-y-base-de-datos)
3. [Configurar Conectividad](#configurar-conectividad)
4. [Obtener Credenciales](#obtener-credenciales)
5. [Configurar en Render](#configurar-en-render)
6. [Migrar Datos Existentes](#migrar-datos-existentes)
7. [Seguridad y Mejores Prácticas](#seguridad-y-mejores-prácticas)

## 🚀 Crear Instancia

### 1. Acceder a Google Cloud Console

1. Ir a [Google Cloud Console](https://console.cloud.google.com/)
2. Seleccionar o crear un proyecto
3. Navegar a **SQL** en el menú lateral

### 2. Crear Nueva Instancia

```
Click en: "CREAR INSTANCIA"
Seleccionar: PostgreSQL
```

### 3. Configuración de la Instancia

#### Información Básica

- **ID de instancia**: `munnay-crm-db` (o el nombre que prefieras)
- **Contraseña de root**: Crear una contraseña segura y guardarla
- **Versión de base de datos**: PostgreSQL 14 o superior
- **Configuración preestablecida**: Production (o Development para pruebas)

#### Ubicación

- **Región**: `us-central1` (o la más cercana a tus usuarios)
  - Para Perú: `southamerica-east1` (São Paulo) es la más cercana
  - Para usuarios en USA: `us-central1` o `us-east1`
- **Zona**: Zona única (más económico) o Multiple zones (alta disponibilidad)

#### Configuración de Máquina

**Para Desarrollo/Testing:**
```
Tipo de máquina: Shared-core
CPUs: 1 vCPU compartido
Memoria: 0.614 GB
Almacenamiento: 10 GB SSD
```

**Para Producción:**
```
Tipo de máquina: Dedicated-core
CPUs: 2 vCPUs
Memoria: 4 GB
Almacenamiento: 20-50 GB SSD (con autoexpansión habilitada)
```

#### Almacenamiento

- **Tipo**: SSD (recomendado)
- **Capacidad**: 10-20 GB inicial
- **Habilitar aumento automático**: ✅ Sí (recomendado)
- **Límite de almacenamiento**: 100 GB (ajustar según necesidad)

#### Conexiones

- **IP pública**: ✅ Habilitar
- **IP privada**: ⬜ (opcional, más seguro pero requiere VPC)

#### Respaldos Automáticos

- **Respaldos automáticos**: ✅ Habilitar
- **Ventana de respaldo**: 02:00 AM (hora local)
- **Retención**: 7 días (mínimo recomendado)
- **Log de transacciones**: ✅ Habilitar (para recuperación point-in-time)

### 4. Crear Instancia

Click en **"CREAR INSTANCIA"**

⏱️ La creación puede tomar 5-10 minutos.

## 🗄️ Configurar Usuario y Base de Datos

### 1. Acceder a la Instancia

Una vez creada, click en el nombre de tu instancia.

### 2. Crear Base de Datos

1. Ir a la pestaña **"DATABASES"**
2. Click en **"CREATE DATABASE"**
3. Configurar:
   ```
   Nombre: basemunnaycrm
   Character set: UTF8 (default)
   Collation: Default
   ```
4. Click en **"CREATE"**

### 3. Configurar Usuario (Opcional)

Por defecto, usarás el usuario `postgres`. Para mayor seguridad, puedes crear un usuario específico:

1. Ir a la pestaña **"USERS"**
2. Click en **"ADD USER ACCOUNT"**
3. Configurar:
   ```
   Username: munnay_admin
   Password: [contraseña segura]
   ```
4. Click en **"ADD"**

## 🔌 Configurar Conectividad

### Opción 1: IP Pública (Recomendado para Render)

#### 1. Habilitar IP Pública

1. En tu instancia, ir a **"CONNECTIONS"**
2. Pestaña **"NETWORKING"**
3. Verificar que **"Public IP"** esté habilitado

#### 2. Obtener IP Pública

La IP pública aparece en la página principal de tu instancia:
```
Ejemplo: 34.136.111.115
```

#### 3. Configurar Redes Autorizadas

Para permitir conexiones desde Render:

1. En **"CONNECTIONS"** → **"NETWORKING"**
2. Scroll a **"Authorized networks"**
3. Click en **"ADD NETWORK"**
4. Agregar IPs de Render:

```
Nombre: Render Servers
Red: 0.0.0.0/0 (para permitir cualquier IP - solo para desarrollo)
```

**⚠️ IMPORTANTE para Producción:**

Para mayor seguridad, en lugar de `0.0.0.0/0`, usa las IPs específicas de Render. Consulta la [documentación de Render](https://render.com/docs/static-outbound-ip-addresses) para obtener las IPs actuales por región.

#### 4. Configurar SSL

1. En **"CONNECTIONS"** → **"SECURITY"**
2. Marcar **"Only allow SSL connections"** ✅
3. Guardar cambios

### Opción 2: Cloud SQL Proxy (Para Desarrollo Local)

#### Instalar Cloud SQL Proxy

**Linux/Mac:**
```bash
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.0.0/cloud-sql-proxy.linux.amd64
chmod +x cloud-sql-proxy
```

**Windows:**
```bash
# Descargar desde: https://dl.google.com/cloudsql/cloud_sql_proxy_x64.exe
```

#### Configurar Credenciales

1. Crear service account en Google Cloud Console
2. Descargar JSON key
3. Configurar variable de entorno:
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/key.json"
   ```

#### Iniciar Proxy

```bash
./cloud-sql-proxy --port 5432 PROJECT_ID:REGION:INSTANCE_NAME
```

Ejemplo:
```bash
./cloud-sql-proxy --port 5432 munnay-crm-project:us-central1:munnay-crm-db
```

## 🔑 Obtener Credenciales

### Formato de la URL de Conexión

```
postgresql://USER:PASSWORD@HOST:PORT/DATABASE?sslmode=require
```

### Componentes

- **USER**: `postgres` (o el usuario que creaste)
- **PASSWORD**: La contraseña configurada
- **HOST**: IP pública de Cloud SQL (ej: `34.136.111.115`)
- **PORT**: `5432` (default de PostgreSQL)
- **DATABASE**: `basemunnaycrm`
- **sslmode**: `require` (obligatorio para seguridad)

### Ejemplo Completo

```
postgresql://postgres:MySecurePass123!@34.136.111.115:5432/basemunnaycrm?sslmode=require
```

### Obtener Connection Name

El connection name se usa para Cloud SQL Proxy:

```
Formato: PROJECT_ID:REGION:INSTANCE_NAME
Ejemplo: munnay-crm-project:us-central1:munnay-crm-db
```

Lo encuentras en:
- Página principal de tu instancia
- Sección "Connect to this instance"
- Campo "Connection name"

## 🚀 Configurar en Render

### 1. Agregar Variable de Entorno

1. Ir a [Render Dashboard](https://dashboard.render.com/)
2. Seleccionar tu servicio backend
3. Ir a **"Environment"**
4. Agregar nueva variable:

```
Key: DATABASE_URL
Value: postgresql://postgres:PASSWORD@34.136.111.115:5432/basemunnaycrm?sslmode=require
```

5. Click en **"Save Changes"**

### 2. Redeploy

Render redesplegará automáticamente con la nueva configuración.

### 3. Verificar Conexión

Una vez desplegado, verificar:

```bash
curl https://tu-servicio.onrender.com/health/db
```

Respuesta esperada:
```json
{
  "status": "ok",
  "message": "Database connection successful",
  "timestamp": "2024-11-04T16:00:00.000Z"
}
```

## 📦 Migrar Datos Existentes

### Opción 1: Exportar e Importar con pg_dump

#### 1. Exportar Base de Datos Actual

```bash
# Desde tu base de datos actual
pg_dump -h OLD_HOST -U OLD_USER -d OLD_DATABASE -F c -b -v -f munnay_backup.dump
```

#### 2. Importar a Cloud SQL

```bash
# A Cloud SQL (requiere Cloud SQL Proxy o IP pública)
pg_restore -h 34.136.111.115 -U postgres -d basemunnaycrm -v munnay_backup.dump
```

### Opción 2: Usar Prisma Migrations

#### 1. Conectar a Nueva Base de Datos

Actualizar `.env` local:
```env
DATABASE_URL="postgresql://postgres:PASSWORD@34.136.111.115:5432/basemunnaycrm?sslmode=require"
```

#### 2. Aplicar Migraciones

```bash
npx prisma migrate deploy
```

#### 3. Seed Datos (si aplica)

```bash
npm run prisma:seed
```

### Opción 3: Import desde Google Cloud Console

1. Ir a tu instancia en Cloud SQL
2. Click en **"IMPORT"**
3. Seleccionar archivo SQL desde Cloud Storage
4. Especificar base de datos: `basemunnaycrm`
5. Click en **"IMPORT"**

## 🔒 Seguridad y Mejores Prácticas

### 1. Contraseñas Seguras

✅ **Hacer:**
- Usar contraseñas de al menos 16 caracteres
- Incluir mayúsculas, minúsculas, números y símbolos
- Usar un generador de contraseñas

❌ **No hacer:**
- Usar contraseñas simples o comunes
- Reutilizar contraseñas
- Compartir contraseñas en texto plano

### 2. Configuración de Red

✅ **Hacer:**
- Usar SSL/TLS siempre (`sslmode=require`)
- Restringir IPs autorizadas a las específicas de Render
- Considerar usar Cloud SQL Proxy para conexiones más seguras

❌ **No hacer:**
- Permitir conexiones sin SSL
- Usar `0.0.0.0/0` en producción sin necesidad
- Exponer credenciales en logs o código

### 3. Respaldos

✅ **Hacer:**
- Habilitar respaldos automáticos
- Guardar respaldos por al menos 7 días
- Probar restauración de respaldos regularmente
- Habilitar log de transacciones para point-in-time recovery

### 4. Monitoreo

✅ **Hacer:**
- Configurar alertas para uso de CPU/memoria
- Monitorear conexiones activas
- Revisar logs de errores regularmente
- Configurar alertas para almacenamiento

Configurar en Google Cloud Console:
1. Ir a **Monitoring** → **Alerting**
2. Crear políticas de alerta para:
   - CPU > 80%
   - Memoria > 85%
   - Storage > 90%
   - Conexiones fallidas

### 5. Actualización de Versiones

✅ **Hacer:**
- Mantener PostgreSQL actualizado
- Programar ventanas de mantenimiento
- Probar actualizaciones en ambiente de desarrollo primero

### 6. Variables de Entorno

✅ **Hacer:**
- Usar variables de entorno para credenciales
- Nunca commitear `.env` al repositorio
- Rotar credenciales periódicamente

❌ **No hacer:**
- Hard-codear credenciales en el código
- Compartir `.env` por email o chat
- Usar las mismas credenciales en dev y prod

## 📊 Monitoreo y Optimización

### Métricas Importantes

1. **CPU Usage**: Mantener bajo 70%
2. **Memory Usage**: Mantener bajo 80%
3. **Storage Usage**: Planear escalado al 75%
4. **Connections**: Monitorear conexiones activas vs. máximo
5. **Query Performance**: Identificar queries lentas

### Ver Métricas

En Cloud SQL Console:
1. Seleccionar tu instancia
2. Ir a **"MONITORING"**
3. Ver dashboards de:
   - CPU
   - Memoria
   - Almacenamiento
   - Conexiones
   - Operaciones de I/O

### Query Insights

Para identificar queries problemáticas:

1. En tu instancia, ir a **"QUERY INSIGHTS"**
2. Habilitar la funcionalidad
3. Analizar queries más lentas o frecuentes

## 💰 Costos y Optimización

### Estimación de Costos

**Shared-core (Development):**
```
Instancia: ~$10-15/mes
Almacenamiento: ~$0.17/GB/mes
Respaldos: ~$0.08/GB/mes
Red: ~$0.01/GB
```

**Dedicated 2vCPU/4GB (Production):**
```
Instancia: ~$100-150/mes
Almacenamiento: ~$0.17/GB/mes
Respaldos: ~$0.08/GB/mes
Red: ~$0.01/GB
```

### Optimizar Costos

1. **Usar shared-core para desarrollo**
2. **Habilitar auto-scaling de almacenamiento** con límite razonable
3. **Programar stop/start** para instancias de desarrollo (no disponible en producción)
4. **Limitar retención de respaldos** a lo necesario (7-14 días suele ser suficiente)
5. **Revisar y eliminar logs antiguos**

## 🆘 Troubleshooting

### Error: "Connection refused"

**Causas:**
- IP no autorizada en Cloud SQL
- Cloud SQL no está ejecutándose
- Puerto bloqueado

**Soluciones:**
1. Verificar que la IP está en redes autorizadas
2. Verificar estado de la instancia en Console
3. Probar con Cloud SQL Proxy

### Error: "SSL required"

**Causa:**
- Conexión sin SSL cuando está requerido

**Solución:**
Agregar `?sslmode=require` a la URL:
```
postgresql://user:pass@host:5432/db?sslmode=require
```

### Error: "Too many connections"

**Causa:**
- Límite de conexiones excedido

**Soluciones:**
1. Aumentar `max_connections` en configuración de Cloud SQL
2. Implementar connection pooling en aplicación
3. Verificar que las conexiones se cierran correctamente

### Error: "Authentication failed"

**Causa:**
- Credenciales incorrectas

**Soluciones:**
1. Verificar usuario y contraseña
2. Resetear contraseña en Cloud SQL Console
3. Verificar que el usuario tiene permisos en la base de datos

## 📚 Recursos Adicionales

- [Documentación oficial de Cloud SQL](https://cloud.google.com/sql/docs)
- [Mejores prácticas de Cloud SQL](https://cloud.google.com/sql/docs/postgres/best-practices)
- [Precios de Cloud SQL](https://cloud.google.com/sql/pricing)
- [Render Static IP Addresses](https://render.com/docs/static-outbound-ip-addresses)
- [Prisma con PostgreSQL](https://www.prisma.io/docs/concepts/database-connectors/postgresql)

## 📞 Soporte

Para problemas específicos:
- **Google Cloud Support**: https://cloud.google.com/support
- **Render Support**: https://render.com/support
- **Prisma Discord**: https://pris.ly/discord
