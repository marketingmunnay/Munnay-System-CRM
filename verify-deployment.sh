#!/bin/bash

# Render Deployment Verification Script
# Checks if latest changes are deployed

echo "🚀 Verifying Render Deployment Status..."
echo "============================================="

# Check backend health
echo "📡 Checking Backend Health..."
BACKEND_STATUS=$(curl -s https://munnay-crm-backend.onrender.com/health)
if [[ "$BACKEND_STATUS" == *"CRM Munnay Backend is running!"* ]]; then
    echo "✅ Backend is running"
else
    echo "❌ Backend check failed"
    echo "Response: $BACKEND_STATUS"
fi

echo ""

# Check frontend availability
echo "🌐 Checking Frontend Availability..."
FRONTEND_STATUS=$(curl -s -o /dev/null -w "%{http_code}" https://munnay-crm-frontend.onrender.com)
if [[ "$FRONTEND_STATUS" == "200" ]]; then
    echo "✅ Frontend is accessible (HTTP $FRONTEND_STATUS)"
else
    echo "❌ Frontend check failed (HTTP $FRONTEND_STATUS)"
fi

echo ""

# Git status verification
echo "📋 Latest Git Commit Info..."
echo "Commit: $(git rev-parse --short HEAD)"
echo "Message: $(git log -1 --pretty=%B)"
echo "Date: $(git log -1 --pretty=%cd --date=relative)"

echo ""
echo "🔍 Debug Features Expected:"
echo "- DEBUG INFO panel in Procedimientos tab"
echo "- TEST section with simple procedimientos display"
echo "- Enhanced console logging"

echo ""
echo "✨ Deployment verification complete!"
echo "Access the app: https://munnay-crm-frontend.onrender.com"