# Multi-stage build for production optimization
FROM node:18-alpine AS frontend-build

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Backend build stage  
FROM node:18-alpine AS backend-build

WORKDIR /app/backend
COPY crm-backend/package*.json ./
RUN npm ci --only=production

COPY crm-backend/ .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy backend build and dependencies
COPY --from=backend-build /app/backend/dist ./backend/dist
COPY --from=backend-build /app/backend/node_modules ./backend/node_modules
COPY --from=backend-build /app/backend/package.json ./backend/package.json

# Copy frontend build
COPY --from=frontend-build /app/dist ./frontend/dist

# Expose ports
EXPOSE 4000

# Set working directory to backend
WORKDIR /app/backend

# Start backend server
CMD ["npm", "start"]
