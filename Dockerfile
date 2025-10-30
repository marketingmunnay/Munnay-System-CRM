# Usa Node.js LTS como base
FROM node:18

# Crea directorio de la app
WORKDIR /usr/src/app

# Copia package.json y package-lock.json
COPY package*.json ./

# Instala dependencias
RUN npm install

# Copia el resto del código
COPY . .

# Compila TypeScript (si usas ts-node en dev, en prod conviene compilar)
RUN npm run build

# Expone el puerto (Cloud Run usará $PORT)
EXPOSE 8080

# Comando de inicio
CMD ["node", "dist/index.js"]
