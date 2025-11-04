<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Sistema CRM Munnay

Sistema de gestión de relaciones con clientes (CRM) para Munnay Medicina Estética, que incluye gestión de leads, citas, tratamientos, facturación y más.

## 🏗️ Arquitectura

- **Frontend**: React + Vite + TypeScript + Tailwind CSS
- **Backend**: Express + TypeScript + Prisma ORM
- **Base de Datos**: PostgreSQL en Google Cloud SQL
- **Despliegue**: 
  - Frontend: Vercel
  - Backend: Render
  - Base de Datos: Google Cloud SQL

View your app in AI Studio: https://ai.studio/apps/drive/1QNcUmZdPjS5HIwjoqinXlY5NShuSnBSl

## 🚀 Despliegue

### Quick Start (Producción)

Para desplegar el sistema en producción con Google Cloud SQL y Render:

**📖 Ver: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Guía completa de arquitectura y despliegue

**⚡ Ver: [crm-backend/QUICK_START.md](./crm-backend/QUICK_START.md)** - Despliegue rápido en 5-10 minutos

### Guías Detalladas

- **[crm-backend/DEPLOYMENT.md](./crm-backend/DEPLOYMENT.md)** - Guía detallada de despliegue en Render
- **[crm-backend/GOOGLE_CLOUD_SQL_SETUP.md](./crm-backend/GOOGLE_CLOUD_SQL_SETUP.md)** - Configuración completa de Google Cloud SQL

## 💻 Desarrollo Local

### Prerequisites

- Node.js 18+
- PostgreSQL (local o Cloud SQL)
- npm o yarn

### Frontend

```bash
# Instalar dependencias
npm install

# Configurar variables de entorno (opcional)
# Crear .env.local con:
# VITE_API_URL=http://localhost:4000

# Iniciar servidor de desarrollo
npm run dev
```

El frontend estará disponible en `http://localhost:5173`

### Backend

```bash
# Navegar al directorio del backend
cd crm-backend

# Instalar dependencias
npm install

# Configurar variables de entorno
# Copiar .env.example a .env y configurar DATABASE_URL
cp .env.example .env

# Generar Prisma Client
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# (Opcional) Seed de datos
npm run prisma:seed

# Iniciar servidor de desarrollo
npm run dev
```

El backend estará disponible en `http://localhost:4000`

### Verificar Instalación

```bash
# Health check
curl http://localhost:4000/health

# Verificar conexión a base de datos
curl http://localhost:4000/health/db
```

## 📁 Estructura del Proyecto

```
Munnay-System-CRM/
├── crm-backend/              # Backend (Express + Prisma)
│   ├── src/                 # Código fuente TypeScript
│   │   ├── api/            # Rutas de API
│   │   ├── controllers/    # Controladores
│   │   ├── lib/            # Prisma client
│   │   └── index.ts        # Punto de entrada
│   ├── prisma/             # Esquemas y migraciones
│   │   ├── schema.prisma   # Definición del schema
│   │   ├── migrations/     # Migraciones de base de datos
│   │   └── seed.ts         # Datos iniciales
│   ├── scripts/            # Scripts de utilidad
│   ├── Dockerfile          # Configuración Docker
│   ├── render.yaml         # Configuración Render
│   └── package.json
├── components/             # Componentes React (Frontend)
├── pages/                  # Páginas React
├── services/               # Servicios del frontend
├── utils/                  # Utilidades
├── DEPLOYMENT_GUIDE.md     # Guía de despliegue general
└── package.json            # Frontend dependencies
```

## 🔧 Scripts Disponibles

### Frontend

- `npm run dev` - Inicia servidor de desarrollo
- `npm run build` - Construye para producción
- `npm run preview` - Preview del build de producción

### Backend

- `npm run dev` - Inicia servidor de desarrollo con nodemon
- `npm run build` - Compila TypeScript a JavaScript
- `npm start` - Inicia servidor de producción (ejecuta migraciones primero)
- `npm run start:dev` - Inicia servidor sin migraciones
- `npx prisma generate` - Genera Prisma Client
- `npx prisma migrate dev` - Crea y aplica migraciones en desarrollo
- `npm run prisma:deploy` - Aplica migraciones en producción
- `npm run prisma:seed` - Ejecuta seed de datos

## 🔐 Variables de Entorno

### Backend (.env)

```env
# Base de datos
DATABASE_URL="postgresql://user:password@host:5432/database?sslmode=require"

# Configuración del servidor
PORT=4000
NODE_ENV=development

# JWT (si aplica)
JWT_SECRET=your-jwt-secret
JWT_EXPIRES_IN=7d
```

### Frontend (.env.local)

```env
# URL del backend
VITE_API_URL=http://localhost:4000

# Gemini API (si aplica)
GEMINI_API_KEY=your-gemini-api-key
```

## 🛠️ Tecnologías

### Frontend
- React 19
- Vite
- TypeScript
- Tailwind CSS
- Recharts (gráficos)

### Backend
- Node.js
- Express
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT (autenticación)
- bcryptjs (encriptación)

### DevOps
- Docker
- Render (backend hosting)
- Vercel (frontend hosting)
- Google Cloud SQL (base de datos)

## 📖 Documentación Adicional

- **Arquitectura y Despliegue**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)
- **Quick Start Backend**: [crm-backend/QUICK_START.md](./crm-backend/QUICK_START.md)
- **Despliegue en Render**: [crm-backend/DEPLOYMENT.md](./crm-backend/DEPLOYMENT.md)
- **Google Cloud SQL**: [crm-backend/GOOGLE_CLOUD_SQL_SETUP.md](./crm-backend/GOOGLE_CLOUD_SQL_SETUP.md)

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📝 Licencia

Este proyecto es privado y confidencial. Todos los derechos reservados.

## 📧 Contacto

Munnay Medicina Estética - [@marketingmunnay](https://github.com/marketingmunnay)

## 🔄 Estado del Proyecto

- ✅ Backend funcionando
- ✅ Base de datos en Google Cloud SQL
- ✅ Despliegue automatizado en Render
- ✅ Frontend en Vercel
- 🔄 En desarrollo continuo
