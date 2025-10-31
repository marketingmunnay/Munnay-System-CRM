# Etapa de build
FROM node:18 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN npm run build

# Etapa final (solo producción)
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

# Copiamos el build compilado
COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma
COPY .env ./.env   # opcional, si necesitas variables locales

EXPOSE 8080
CMD ["npm", "start"]
