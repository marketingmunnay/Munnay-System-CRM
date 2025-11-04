# Guía de Despliegue - Sistema CRM Munnay

Este repositorio contiene el sistema CRM Munnay completo con frontend y backend.

## 🏗️ Arquitectura de Despliegue

```
┌─────────────────────────────────────────────────────────────┐
│                     ARQUITECTURA                             │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  Frontend (React + Vite)                                     │
│  └─> Vercel / Netlify                                        │
│       └─> https://munnay-system-crm.vercel.app              │
│                                                              │
│  Backend (Express + TypeScript + Prisma)                     │
│  └─> Render                                                  │
│       └─> https://munnay-crm-backend.onrender.com           │
│                                                              │
│  Base de Datos (PostgreSQL)                                  │
│  └─> Google Cloud SQL                                        │
│       └─> Instancia: munnay-crm-db                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

## 📁 Estructura del Proyecto

```
Munnay-System-CRM/
├── crm-backend/           # Backend (Express + Prisma)
│   ├── src/              # Código fuente TypeScript
│   ├── prisma/           # Esquemas y migraciones
│   ├── Dockerfile        # Configuración Docker
│   ├── render.yaml       # Configuración Render
│   ├── DEPLOYMENT.md     # Guía detallada de despliegue
│   └── package.json
├── components/           # Componentes React (Frontend)
├── pages/               # Páginas React
├── services/            # Servicios del frontend
└── package.json         # Frontend dependencies
```

## 🚀 Despliegue Rápido

### Backend en Render

#### Opción 1: Usando render.yaml (Recomendado)

1. **Crear cuenta en Render**: https://render.com/
2. **Conectar repositorio**:
   - Dashboard → New → Blueprint
   - Conectar GitHub y seleccionar este repositorio
3. **Render detectará automáticamente** el archivo `crm-backend/render.yaml`
4. **Configurar variables de entorno**:
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/database?sslmode=require
   NODE_ENV=production
   PORT=4000
   ```
5. **Deploy**: Render desplegará automáticamente

#### Opción 2: Configuración Manual

1. Dashboard → New → Web Service
2. Configurar:
   - **Root Directory**: `crm-backend`
   - **Build Command**: `npm ci && npx prisma generate && npm run build`
   - **Start Command**: `npm start`
   - **Health Check Path**: `/health`
3. Agregar variables de entorno (ver arriba)
4. Deploy

### Base de Datos en Google Cloud SQL

1. **Crear instancia en Google Cloud Console**:
   ```
   Nombre: munnay-crm-db
   Tipo: PostgreSQL 14+
   Región: us-central1 (o la más cercana)
   ```

2. **Configurar conectividad**:
   - Habilitar IP pública
   - Agregar IPs de Render a redes autorizadas
   - Habilitar SSL/TLS

3. **Crear base de datos**:
   ```sql
   CREATE DATABASE basemunnaycrm;
   ```

4. **Obtener cadena de conexión**:
   ```
   postgresql://postgres:PASSWORD@PUBLIC_IP:5432/basemunnaycrm?sslmode=require
   ```

5. **Configurar en Render**:
   - Agregar `DATABASE_URL` en variables de entorno

### Frontend en Vercel

El frontend está desplegado en Vercel con las siguientes URLs:

- **Producción**: https://munnay-system.vercel.app/
- **Dev branch**: https://munnay-system-git-dev-marketingmunnays-projects.vercel.app/

**Nota**: El backend ya está configurado para aceptar requests de estas URLs vía CORS.

Para actualizar el frontend:

1. Push a la rama correspondiente (main o dev)
2. Vercel despliega automáticamente
3. El backend acepta automáticamente las nuevas previews de Vercel

## 📝 Guías Detalladas

- **Backend**: Ver [crm-backend/DEPLOYMENT.md](./crm-backend/DEPLOYMENT.md) para guía completa
- **Google Cloud SQL**: Configuración detallada de base de datos
- **Render**: Configuración detallada del servidor

## 🔧 Variables de Entorno

### Backend (Render)

Configurar en Render Dashboard → Environment:

```env
# Requeridas
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
NODE_ENV=production
PORT=4000

# Opcionales (si se usan en el código)
JWT_SECRET=tu-secreto-jwt
JWT_EXPIRES_IN=7d
```

### Frontend (Vercel)

Si necesitas conectar el frontend con el backend:

```env
VITE_API_URL=https://munnay-crm-backend.onrender.com
```

## ✅ Verificación Post-Despliegue

### 1. Verificar Backend

```bash
# Health check
curl https://tu-servicio.onrender.com/health
# Respuesta esperada: "CRM Munnay Backend is running!"

# Verificar API
curl https://tu-servicio.onrender.com/api/
```

### 2. Verificar Base de Datos

```bash
# En Render Shell
npx prisma db pull
```

### 3. Verificar Frontend

Acceder a: https://munnay-system-crm.vercel.app

## 🔒 Seguridad

### Checklist de Seguridad

- [ ] `.env` está en `.gitignore`
- [ ] Variables de entorno configuradas en Render (no en código)
- [ ] SSL habilitado en Cloud SQL (`sslmode=require`)
- [ ] IPs restringidas en Cloud SQL
- [ ] CORS configurado correctamente en backend
- [ ] Contraseñas fuertes para base de datos
- [ ] HTTPS habilitado (automático en Render)

## 🐛 Troubleshooting

### Backend no se conecta a la base de datos

1. Verificar `DATABASE_URL` en Render
2. Verificar que IP de Render está autorizada en Cloud SQL
3. Verificar que Cloud SQL está en ejecución
4. Revisar logs en Render

### Error de Prisma Client

```bash
# En Render Shell
npx prisma generate
npx prisma migrate deploy
```

### Frontend no se conecta al backend

1. Verificar CORS en `crm-backend/src/index.ts`
2. Agregar URL de Vercel a `allowedOrigins`
3. Verificar `VITE_API_URL` en Vercel

## 📞 Comandos Útiles

### Desarrollo Local

```bash
# Backend
cd crm-backend
npm install
npm run dev

# Frontend
npm install
npm run dev
```

### Prisma

```bash
# Generar cliente
npx prisma generate

# Crear migración
npx prisma migrate dev --name nombre-migracion

# Aplicar migraciones en producción
npx prisma migrate deploy

# Ver base de datos
npx prisma studio
```

### Docker

```bash
# Construir imagen
cd crm-backend
docker build -t munnay-crm-backend .

# Ejecutar contenedor
docker run -p 4000:4000 -e DATABASE_URL="..." munnay-crm-backend
```

## 📚 Recursos Adicionales

- [Documentación de Render](https://render.com/docs)
- [Google Cloud SQL](https://cloud.google.com/sql/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)

## 🔄 Actualizaciones

### Despliegue Automático

Ambos servicios (Render y Vercel) tienen auto-deploy habilitado:

1. Push a rama principal
2. CI/CD se ejecuta automáticamente
3. Nueva versión se despliega

### Despliegue Manual

En Render Dashboard:
1. Ir a tu servicio
2. Click en "Manual Deploy"
3. Seleccionar rama
4. Deploy

## 📈 Monitoreo

### Render

- Dashboard → tu servicio → Metrics
- Ver CPU, memoria, requests
- Revisar logs en tiempo real

### Google Cloud SQL

- Console → SQL → tu instancia → Monitoring
- Ver conexiones, CPU, storage

## 💡 Mejores Prácticas

1. **Usa variables de entorno** para todas las credenciales
2. **Habilita auto-deploy** para CI/CD
3. **Revisa logs regularmente** para detectar problemas
4. **Mantén dependencias actualizadas** con `npm update`
5. **Haz backups** de la base de datos regularmente
6. **Usa migraciones de Prisma** para cambios de schema
7. **Configura alertas** en Google Cloud para monitorear la base de datos

## 📧 Contacto y Soporte

Para problemas o preguntas sobre el despliegue, consulta:
- Documentación detallada en `crm-backend/DEPLOYMENT.md`
- Logs en Render Dashboard
- Logs en Google Cloud Console

---

**Nota**: Este es un entorno de desarrollo. Para producción, considera:
- Plan de pago en Render para mejor rendimiento
- Cloud SQL en alta disponibilidad
- CDN para assets estáticos
- Monitoreo con Sentry o similar
