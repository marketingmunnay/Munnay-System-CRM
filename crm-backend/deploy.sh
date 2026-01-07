#!/bin/bash

# Asegurarse de estar en la rama correcta
git checkout copilot/disable-login-open-dashboard

# Traer los últimos cambios
git pull origin copilot/disable-login-open-dashboard

# Instalar dependencias
npm install

# Generar cliente de Prisma
npx prisma generate

# Compilar TypeScript
npm run build

# Reiniciar la aplicación con PM2
pm2 restart munnay-crm-backend || pm2 start ecosystem.config.js --env production

echo "Deploy completado exitosamente."
