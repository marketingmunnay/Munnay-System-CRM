# Guía de Despliegue - Munnay CRM Backend

Esta guía explica cómo desplegar el backend del CRM Munnay usando **Render** para el servidor y **Google Cloud SQL** para la base de datos PostgreSQL.

## 📋 Requisitos Previos

- Cuenta en [Render](https://render.com/)
- Proyecto en [Google Cloud Platform](https://console.cloud.google.com/)
- Instancia de Cloud SQL PostgreSQL creada
- Código fuente del backend en repositorio Git

## 🗄️ Configuración de Google Cloud SQL

### 1. Crear Instancia de Cloud SQL

1. En Google Cloud Console, ve a **SQL** → **Crear instancia**
2. Selecciona **PostgreSQL**
3. Configura:
   - **ID de instancia**: `munnay-crm-db` (o el nombre que prefieras)
   - **Contraseña**: Crea una contraseña segura
   - **Región**: Selecciona la región más cercana a tus usuarios
   - **Zona**: Única o múltiples zonas (según disponibilidad requerida)
   - **Versión**: PostgreSQL 14 o superior

### 2. Configurar Base de Datos

```sql
-- Conectarse a la instancia y crear la base de datos
CREATE DATABASE basemunnaycrm;
```

### 3. Configurar Conectividad

#### Opción A: IP Pública (Recomendado para Render)

1. En tu instancia de Cloud SQL, ve a **Conexiones**
2. Habilita **IP pública**
3. En **Redes autorizadas**, agrega:
   - Las IPs de Render (consulta la documentación de Render para IPs actuales)
   - Tu IP local para desarrollo (opcional)
4. **Importante**: Marca la opción **Requerir SSL** para conexiones seguras

#### Opción B: Cloud SQL Proxy (Para desarrollo local)

```bash
# Instalar Cloud SQL Proxy
curl -o cloud-sql-proxy https://storage.googleapis.com/cloud-sql-connectors/cloud-sql-proxy/v2.0.0/cloud-sql-proxy.linux.amd64
chmod +x cloud-sql-proxy

# Ejecutar proxy
./cloud-sql-proxy --port 5432 PROJECT_ID:REGION:INSTANCE_NAME
```

### 4. Obtener Cadena de Conexión

Tu `DATABASE_URL` debería verse así:

```
postgresql://USER:PASSWORD@PUBLIC_IP:5432/basemunnaycrm?sslmode=require
```

Donde:
- `USER`: Usuario de la base de datos (por defecto: `postgres`)
- `PASSWORD`: La contraseña configurada
- `PUBLIC_IP`: IP pública de tu instancia Cloud SQL
- `basemunnaycrm`: Nombre de tu base de datos

**Ejemplo:**
```
postgresql://postgres:7MX"vFmL*x2r&~y*@34.136.111.115:5432/basemunnaycrm?sslmode=require
```

## 🚀 Despliegue en Render

### 1. Preparar Repositorio

Asegúrate de que tu repositorio tenga:
- ✅ `render.yaml` en el directorio `crm-backend/`
- ✅ `Dockerfile` optimizado
- ✅ `.env.example` con variables de entorno documentadas

### 2. Crear Servicio en Render

#### Opción A: Usando render.yaml (Recomendado)

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **New** → **Blueprint**
3. Conecta tu repositorio de GitHub
4. Render detectará automáticamente el archivo `render.yaml`
5. Especifica la ruta del directorio: `crm-backend`
6. Click en **Apply**

#### Opción B: Configuración Manual

1. Ve a [Render Dashboard](https://dashboard.render.com/)
2. Click en **New** → **Web Service**
3. Conecta tu repositorio de GitHub
4. Configura:
   - **Name**: `munnay-crm-backend`
   - **Region**: Oregon (o la más cercana)
   - **Branch**: `main` (o tu rama principal)
   - **Root Directory**: `crm-backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (o el que prefieras)

### 3. Configurar Variables de Entorno

En Render, ve a **Environment** y agrega:

```env
DATABASE_URL=postgresql://USER:PASSWORD@IP:5432/basemunnaycrm?sslmode=require
NODE_ENV=production
PORT=4000
```

**⚠️ IMPORTANTE**: Nunca subas el archivo `.env` al repositorio. Las variables de entorno deben configurarse directamente en Render.

### 4. Ejecutar Migraciones de Prisma

Después del primer despliegue, ejecuta las migraciones:

1. En Render, ve a **Shell** (en el menú de tu servicio)
2. Ejecuta:
   ```bash
   npx prisma migrate deploy
   ```

O configura un script en `package.json`:
```json
{
  "scripts": {
    "postinstall": "npx prisma generate",
    "start": "npx prisma migrate deploy && node dist/index.js"
  }
}
```

### 5. Verificar Despliegue

Una vez desplegado, verifica:

1. **Health Check**: 
   ```bash
   curl https://tu-servicio.onrender.com/health
   ```
   Debería responder: `CRM Munnay Backend is running!`

2. **Logs**: Revisa los logs en Render para asegurarte de que no hay errores

3. **Conexión a Base de Datos**: Verifica que Prisma se conecte correctamente

## 🔒 Seguridad

### Mejores Prácticas

1. **Variables de Entorno**:
   - Nunca expongas credenciales en el código
   - Usa variables de entorno en Render
   - Mantén `.env` en `.gitignore`

2. **Base de Datos**:
   - Usa contraseñas fuertes
   - Habilita SSL/TLS (`sslmode=require`)
   - Restringe IPs autorizadas en Cloud SQL
   - Considera usar Cloud SQL Auth Proxy para mayor seguridad

3. **API**:
   - Configura CORS correctamente
   - Implementa rate limiting
   - Usa HTTPS en producción (Render lo proporciona automáticamente)

## 🔄 Actualizaciones y CI/CD

Render se sincroniza automáticamente con tu repositorio:

1. Haz push a tu rama principal
2. Render detecta el cambio
3. Ejecuta el build automáticamente
4. Despliega la nueva versión

Para desactivar el auto-deploy, configura `autoDeploy: false` en `render.yaml`

## 🐛 Troubleshooting

### Error: "Cannot connect to database"

1. Verifica que la IP de Render esté autorizada en Cloud SQL
2. Confirma que el `DATABASE_URL` es correcto
3. Asegúrate de que Cloud SQL está en ejecución
4. Revisa que el puerto 5432 esté accesible

### Error: "Prisma Client not initialized"

```bash
# En Render Shell
npx prisma generate
```

### Error de Migraciones

```bash
# Resetear y aplicar migraciones
npx prisma migrate reset --force
npx prisma migrate deploy
```

## 📞 Soporte

Para problemas específicos:
- **Render**: [Documentación de Render](https://render.com/docs)
- **Google Cloud SQL**: [Documentación de Cloud SQL](https://cloud.google.com/sql/docs)
- **Prisma**: [Documentación de Prisma](https://www.prisma.io/docs)

## 📚 Recursos Adicionales

- [Render PostgreSQL Guide](https://render.com/docs/databases)
- [Google Cloud SQL Best Practices](https://cloud.google.com/sql/docs/postgres/best-practices)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)
