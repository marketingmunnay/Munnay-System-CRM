FROM node:18 AS builder
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --include=dev

COPY . .
RUN node node_modules/typescript/bin/tsc

# -------------------------
FROM node:18
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /usr/src/app/dist ./dist
COPY --from=builder /usr/src/app/prisma ./prisma

# Generamos Prisma aquí, cuando schema.prisma ya existe
RUN npx prisma generate

EXPOSE 8080
CMD ["npm", "start"]

