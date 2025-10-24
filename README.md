# Munnay-System-CRM — Backend scaffold

Este repo contiene el scaffold del backend en Node.js + TypeScript + Express + Prisma (Postgres) con autenticación JWT + refresh tokens.

Rama propuesta: feature/backend-scaffold

Quick start (local)
1. Copia .env.example a .env y ajusta variables.
2. Levanta Postgres y el app:
   - con Docker: docker-compose up --build
3. Generar cliente Prisma y migraciones:
   - npx prisma generate
   - npx prisma migrate dev --name init
4. En desarrollo:
   - npm run dev

Endpoints principales (implementados como ejemplo)
- POST /api/auth/login
- POST /api/auth/refresh
- GET /api/auth/me
- POST /api/auth/logout
- CRUD /api/users

Siguientes pasos
- Implementar routers CRUD para roles, leads, campaigns, meta-campaigns, publications, followers, extra-sales, incidents, expenses, providers, goals, y los endpoints /config/* (estructuras de ejemplo en Prisma).
- Añadir validaciones (zod/joi), tests, y documentación OpenAPI/Swagger.
