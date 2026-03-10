# Munnay System CRM

Sistema de gestión de relaciones con clientes (CRM) para Munnay Medicina Estética.

## 🚀 Deployment

### Vercel (Frontend)

1. Conecta tu repositorio a Vercel
2. Configura las siguientes variables de entorno en Vercel:
   - `VITE_API_URL`: URL del backend API (ej: `https://api.munnaymedicinaestetica.com/api`)
3. Deploy automático en cada push

**Comando de build:** `npm run build`
**Directorio de output:** `dist`

### Render.com (Backend - Recomendado)

1. Fork este repositorio en GitHub
2. Conecta tu repositorio a Render.com
3. Usa el archivo `render.yaml` para configuración automática
4. Configura las variables de entorno necesarias (ver `.env.example`)

### Docker

```bash
docker build -t munnay-crm .
docker run -p 4000:4000 munnay-crm
```

### Script Manual

```bash
chmod +x build_and_run.sh
./build_and_run.sh
```

## 🛠 Desarrollo Local

**Prerequisites:** Node.js 18+

### Frontend
```bash
npm install
npm run dev
```

### Backend
```bash
cd crm-backend
npm install  
npm run dev
```

## 📁 Estructura del Proyecto

```
├── components/          # Componentes React
├── crm-backend/        # Servidor Node.js/Express
├── hooks/              # Custom React Hooks
├── pages/              # Páginas de la aplicación
├── services/           # Servicios API
└── utils/              # Utilidades compartidas
```

## 🔧 Variables de Entorno

Ver `.env.example` para configuración completa.

## 📋 Funcionalidades

- ✅ Gestión de Leads y Pacientes
- ✅ Sistema de Procedimientos
- ✅ Dashboard con Métricas
- ✅ Calendario de Citas
- ✅ Sistema de Facturación
- ✅ Gestión de Marketing
- ✅ Reportes e Informes
