# Deploy Frontend to Production
# Run this manually after SSH authentication

Write-Host "=== Frontend Deployment Script ===" -ForegroundColor Cyan
Write-Host ""

# Step 1: Fetch and reset to latest code
Write-Host "Step 1: Fetching latest code from GitHub..." -ForegroundColor Yellow
ssh root@157.173.119.186 "cd /var/www/html/Munnay-System-CRM && git fetch origin"

Write-Host "Step 2: Resetting to fix-timezone-issues branch..." -ForegroundColor Yellow  
ssh root@157.173.119.186 "cd /var/www/html/Munnay-System-CRM && git reset --hard origin/fix-timezone-issues"

Write-Host "Step 3: Building frontend..." -ForegroundColor Yellow
ssh root@157.173.119.186 "cd /var/www/html/Munnay-System-CRM && npm run build"

Write-Host ""
Write-Host "=== Deployment Complete ===" -ForegroundColor Green
Write-Host "Visit: https://crm.munnaymedicinaestetica.com/calendario" -ForegroundColor Cyan
Write-Host "Test the 'Asistidos' tab to verify LeadFormModal loads correctly" -ForegroundColor Cyan
