#!/bin/bash

echo "🚀 Starting deployment process..."

# Install dependencies for frontend
echo "📦 Installing frontend dependencies..."
npm install

# Build frontend
echo "🔨 Building frontend..."
npm run build

# Move to backend directory
cd crm-backend

# Install backend dependencies
echo "📦 Installing backend dependencies..."
npm install

# Build backend
echo "🔨 Building backend..."
npm run build

echo "✅ Build completed successfully!"

# Start the backend server
echo "🏃 Starting backend server..."
npm start
