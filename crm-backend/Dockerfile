# Etapa de build
FROM node:18 AS builder

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --include=dev


COPY . .
RUN npx tsc   # ejecuta el compilador desde node_modules/.bin

# Etapa final (solo producción)
FROM node:18

WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

EXPOSE 8080
CMD ["npm", "start"]
