#!/bin/bash

# Script para deployment del backend del CRM Munnay
# Este script aplica las migraciones de Prisma y construye el proyecto

echo "🚀 Iniciando deployment del backend..."

# Generar el cliente de Prisma
echo "📦 Generando cliente de Prisma..."
npx prisma generate

# Aplicar migraciones a la base de datos de producción
echo "🗄️  Aplicando migraciones a la base de datos..."
npx prisma migrate deploy

# Construir el proyecto TypeScript
echo "🔨 Construyendo el proyecto..."
npm run build

echo "✅ Deployment completado exitosamente!"
echo "🌐 El backend está listo para servir en el puerto configurado."