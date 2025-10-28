#!/bin/bash

# Este script generará un `Dockerfile` en el directorio actual.
# Este Dockerfile está configurado para construir y desplegar tu aplicación CRM Munnay,
# incluyendo tanto el frontend (React/Vite) como el backend (Node.js/Express con Prisma).
#
# Asume la siguiente estructura de directorios:
# / (raíz del proyecto, contiene `package.json` del frontend, `index.html`, `index.tsx`, etc.)
# └── crm-backend/ (contiene `package.json` del backend, `src/`, `prisma/`, etc.)
#
# El backend servirá los archivos estáticos del frontend.
#
# Comandos para construir y ejecutar el Docker:
# 1. `docker build -t crm-munnay-app .`
# 2. `docker run -p 4000:4000 -e DATABASE_URL="<tu_database_url_aqui>" -e API_KEY="<tu_gemini_api_key_aqui>" crm-munnay-app`
#
# ¡IMPORTANTE! Reemplaza `<tu_database_url_aqui>` y `<tu_gemini_api_key_aqui>`
# con tus valores reales cuando ejecutes el contenedor.

OUTPUT_FILE="Dockerfile"

echo "Generando el Dockerfile en $OUTPUT_FILE..."

cat << 'EOF' > "$OUTPUT_FILE"
# ====================================================================================
# Stage 1: Build Frontend (React/Vite)
# ====================================================================================
FROM node:20-alpine AS frontend_builder

WORKDIR /app/frontend

# Copiar archivos de configuración de dependencias del frontend
COPY package.json ./
COPY package-lock.json ./

# Instalar dependencias del frontend
RUN npm install

# Copiar todo el código fuente del frontend
COPY . .

# Construir la aplicación de frontend para producción
RUN npm run build

# ====================================================================================
# Stage 2: Build Backend (Node.js/Express con TypeScript y Prisma)
# ====================================================================================
FROM node:20-alpine AS backend_builder

WORKDIR /app/crm-backend

# Copiar archivos de configuración de dependencias del backend
COPY crm-backend/package.json ./
COPY crm-backend/package-lock.json ./

# Instalar dependencias del backend
RUN npm install

# Copiar el directorio `prisma` para generar el cliente Prisma
COPY crm-backend/prisma ./prisma/

# Generar el cliente Prisma (necesario para el build de TypeScript del backend)
RUN npx prisma generate

# Copiar el código fuente del backend
COPY crm-backend/src ./src/

# Construir la aplicación de backend a TypeScript a JavaScript
RUN npm run build

# ====================================================================================
# Stage 3: Final Production Image
#   - Utiliza una imagen base más ligera para el despliegue.
#   - Copia solo los artefactos de build necesarios.
#   - Configura el servidor de backend para servir el frontend.
# ====================================================================================
FROM node:20-slim AS production

WORKDIR /app

# Crear un directorio para los archivos estáticos del frontend dentro del contexto del backend
# Esto permite que el servidor Express del backend sirva el frontend
RUN mkdir -p /app/crm-backend/public

# Copiar los archivos construidos del frontend al directorio público del backend
COPY --from=frontend_builder /app/frontend/dist /app/crm-backend/public

# Copiar la aplicación de backend construida
COPY --from=backend_builder /app/crm-backend/dist /app/crm-backend/dist
# Copiar los node_modules del backend (solo dependencias de producción)
COPY --from=backend_builder /app/crm-backend/node_modules /app/crm-backend/node_modules
# Copiar el directorio prisma (incluye el cliente generado y esquema para migraciones)
COPY --from=backend_builder /app/crm-backend/prisma /app/crm-backend/prisma

# Configurar variables de entorno para producción
ENV NODE_ENV=production
ENV PORT=4000
# Las variables DATABASE_URL y API_KEY deben ser provistas al ejecutar el contenedor Docker
# Ejemplo: -e DATABASE_URL="postgresql://user:password@host:port/database" -e API_KEY="your_gemini_api_key"

# Exponer el puerto en el que correrá el servidor de backend
EXPOSE 4000

# Establecer el directorio de trabajo para los comandos del backend
WORKDIR /app/crm-backend

# Aplicar las migraciones pendientes de Prisma a la base de datos en el inicio del contenedor
# Esto asegura que la base de datos esté actualizada para la versión de la aplicación.
RUN npx prisma migrate deploy

# Comando para iniciar la aplicación de backend
CMD ["node", "dist/index.js"]
EOF

echo "El archivo '$OUTPUT_FILE' ha sido creado."
echo ""
echo "¡ATENCIÓN!"
echo "Para que el backend sirva los archivos estáticos del frontend, necesitas añadir"
echo "la siguiente línea en tu archivo `crm-backend/src/index.ts`:"
echo ""
echo "import path from 'path';"
echo "..."
echo "app.use(express.static(path.join(__dirname, '../public')));"
echo ""
echo "Asegúrate de que esta línea esté antes de cualquier otra ruta que pueda interceptar solicitudes."
echo "Después de modificar `crm-backend/src/index.ts`, vuelve a construir tu aplicación con `npm run build`"
echo "dentro de la carpeta `crm-backend` para que los cambios se reflejen en la carpeta `dist`."
echo ""
echo "Además, recuerda proveer las variables de entorno `DATABASE_URL` y `API_KEY`"
echo "cuando ejecutes tu contenedor Docker en producción."
