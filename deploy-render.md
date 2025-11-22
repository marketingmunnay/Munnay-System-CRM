# Deployment Instructions for Render

## Automatic Deployment (Recommended)

1. **Connect Repository to Render**
   - Go to [Render.com](https://render.com)
   - Click "New +"
   - Select "Web Service"
   - Connect your GitHub account
   - Select the `Munnay-System-CRM` repository

2. **Configure Environment Variables**
   ```
   DATABASE_URL=postgresql://username:password@host:port/database
   NODE_ENV=production
   PORT=4000
   ```

3. **Deploy Configuration**
   - Render will automatically detect the `render.yaml` file
   - Two services will be created:
     - `munnay-crm-backend` (Node.js API)
     - `munnay-crm-frontend` (Static site)

## Manual Deployment

If automatic deployment fails, use these commands:

### Backend
```bash
cd crm-backend
npm install
npm run build
npm start
```

### Frontend
```bash
npm install
npm run build
npm run preview
```

## Health Check

Backend health endpoint: `/health`
- Should return: "CRM Munnay Backend is running!"

## Database Setup

Ensure PostgreSQL database is accessible with the connection string in `DATABASE_URL`.

Required tables will be created automatically via Prisma migrations.

## Troubleshooting

1. **Build Fails**: Check Node.js version (requires 18+)
2. **Database Connection**: Verify `DATABASE_URL` format
3. **CORS Issues**: Check allowed origins in `crm-backend/src/index.ts`

## URLs After Deployment

- **Frontend**: `https://munnay-crm-frontend.onrender.com`
- **Backend API**: `https://munnay-crm-backend.onrender.com`
- **Health Check**: `https://munnay-crm-backend.onrender.com/health`