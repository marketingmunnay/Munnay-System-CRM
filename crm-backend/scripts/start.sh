#!/bin/bash
set -e

echo "🚀 Starting Munnay CRM Backend..."

# Check if DATABASE_URL is set
if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: DATABASE_URL environment variable is not set"
  exit 1
fi

echo "✅ Environment variables validated"

# Run Prisma migrations
echo "📦 Running Prisma migrations..."
npx prisma migrate deploy

echo "✅ Migrations completed"

# Start the application
echo "🎯 Starting Node.js application..."
# Use configurable entry point, default to dist/index.js
node "${START_SCRIPT:-dist/index.js}"
