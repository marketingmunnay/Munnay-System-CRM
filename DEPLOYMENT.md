# 🚀 Guía de Deployment en Vercel

## Variables de Entorno Requeridas

Configura las siguientes variables de entorno en tu proyecto de Vercel:

1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:

```env
VITE_API_URL=https://api.munnaymedicinaestetica.com/api
```

O si usas tu propio backend:

```env
VITE_API_URL=https://tu-backend.com/api
```

## Configuración del Proyecto

### Build Settings

- **Framework Preset:** Vite
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### Root Directory

Si estás desplegando desde un monorepo, asegúrate de configurar el directorio raíz correctamente.

## Troubleshooting

### Pantalla en Blanco

Si ves una pantalla en blanco:

1. **Verifica las variables de entorno**
   - Asegúrate de que `VITE_API_URL` esté configurada
   - Las variables deben comenzar con `VITE_` para ser accesibles en el cliente

2. **Revisa los logs de build**
   - Ve a Deployments → [tu deployment] → Building
   - Busca errores de compilación

3. **Verifica la consola del navegador**
   - Abre DevTools (F12)
   - Revisa errores en la consola
   - Revisa la pestaña Network para errores de API

4. **Redeploy**
   - Después de configurar variables de entorno, haz redeploy
   - Deployments → [...] → Redeploy

### Error de CORS

Si recibes errores de CORS, asegúrate de que tu backend permita el dominio de Vercel:

```javascript
// En tu backend (crm-backend/src/index.ts)
const allowedOrigins = [
  'https://munnay-system.vercel.app',
  'https://tu-dominio-personalizado.com',
  // ... otros dominios
];
```

## Deployment Automático

Vercel desplegará automáticamente:
- **Production:** Cada push a la rama `main`
- **Preview:** Cada push a otras ramas

## Dominios Personalizados

Para configurar un dominio personalizado:

1. Ve a Settings → Domains
2. Agrega tu dominio
3. Configura los registros DNS según las instrucciones

## Optimizaciones

### Build Performance

Si el build es lento:
- Limita las dependencias
- Usa dynamic imports para code splitting
- Revisa el tamaño del bundle

### Runtime Performance

- Vercel sirve los archivos estáticos desde CDN
- Usa `lazy()` de React para cargar componentes bajo demanda
- Optimiza imágenes antes de subirlas

## Enlaces Útiles

- [Documentación de Vercel](https://vercel.com/docs)
- [Variables de Entorno en Vite](https://vitejs.dev/guide/env-and-mode.html)
- [Deployment de SPA en Vercel](https://vercel.com/docs/frameworks/vite)
