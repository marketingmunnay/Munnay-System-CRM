FROM node:20-alpine

WORKDIR /usr/src/app

COPY package*.json ./
COPY prisma ./prisma/
RUN npm ci --production

COPY . .

RUN npm run build

EXPOSE 4000

CMD ["node", "dist/server.js"]