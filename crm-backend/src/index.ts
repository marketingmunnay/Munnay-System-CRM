import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';
import prisma from './lib/prisma';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 4000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// ✅ Lista de orígenes permitidos en producción
const allowedOrigins = [
  'https://mcc.munnaymedicinaestetica.com',
  'https://munnay-system-crm.vercel.app',
  'https://munnay-system.vercel.app',
  'https://munnay-system-git-dev-marketingmunnays-projects.vercel.app',
];

// ✅ En desarrollo, permitir localhost
if (NODE_ENV === 'development') {
  allowedOrigins.push('http://localhost:5173', 'http://localhost:3000', 'http://localhost:4000');
}

// ✅ Regex para permitir previews de Vercel
const vercelPreviewRegex = /^https:\/\/(.+)-marketingmunnays-projects\.vercel\.app$/;

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir requests sin origin (ej: Postman, curl, mobile apps)
    if (!origin) {
      callback(null, true);
      return;
    }

    // Verificar si el origin está en la lista permitida o coincide con el regex
    if (allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS: Origen no permitido: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());

// ✅ Health check básico
app.get('/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    message: 'CRM Munnay Backend is running!',
    timestamp: new Date().toISOString(),
    environment: NODE_ENV,
  });
});

// ✅ Health check con verificación de base de datos
app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({
      status: 'ok',
      message: 'Database connection successful',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    // Log only error message to avoid exposing sensitive connection details
    console.error('Database health check failed:', error instanceof Error ? error.message : 'Unknown error');
    res.status(503).json({
      status: 'error',
      message: 'Database connection failed',
      timestamp: new Date().toISOString(),
    });
  }
});

// ✅ API routes
app.use('/api', apiRouter);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
