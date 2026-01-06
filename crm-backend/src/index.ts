import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import path from 'path';
import apiRouter from './api';
import prisma from './lib/prisma';
import fs from 'fs';
import https from 'https';
import http from 'http';

dotenv.config();

// ========== AUTO-MIGRATION: Agregar columnas faltantes a Service ==========
const runAutoMigrations = async () => {
  try {
    console.log('[Migration] Checking for missing columns in Service table...');
    
    // Verificar si la columna duracionMinutos existe
    const columns: any[] = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Service' AND column_name = 'duracionMinutos'
    `;
    
    if (columns.length === 0) {
      console.log('[Migration] Adding duracionMinutos column to Service...');
      await prisma.$executeRaw`
        ALTER TABLE "Service" 
        ADD COLUMN IF NOT EXISTS "duracionMinutos" INTEGER NOT NULL DEFAULT 60
      `;
      console.log('[Migration] duracionMinutos column added successfully');
    }
    
    // Verificar si la columna descripcion existe
    const descColumns: any[] = await prisma.$queryRaw`
      SELECT column_name 
      FROM information_schema.columns 
      WHERE table_name = 'Service' AND column_name = 'descripcion'
    `;
    
    if (descColumns.length === 0) {
      console.log('[Migration] Adding descripcion column to Service...');
      await prisma.$executeRaw`
        ALTER TABLE "Service" 
        ADD COLUMN IF NOT EXISTS "descripcion" TEXT
      `;
      console.log('[Migration] descripcion column added successfully');
    }
    
    console.log('[Migration] Auto-migration completed');
  } catch (error) {
    console.error('[Migration] Error running auto-migrations:', error);
    // No detenemos el servidor si falla la migración
  }
};

const app: express.Application = express();
const PORT = process.env.PORT || 4000;
const HTTP_PORT = process.env.HTTP_PORT || 8080;

// Helper: mask DB URL (hide password), show host:port and database
const maskDatabaseTarget = (url?: string): string => {
  if (!url) return 'unknown';
  try {
    const u = new URL(url);
    const host = u.hostname || 'unknown-host';
    const port = u.port || '5432';
    const db = (u.pathname || '/').replace('/', '') || 'unknown-db';
    return `${host}:${port}/${db}`;
  } catch {
    return 'invalid-url';
  }
};

// ✅ Lista de orígenes permitidos en producción
const defaultAllowedOrigins = [
  'https://mcc.munnaymedicinaestetica.com',
  'https://crm.munnaymedicinaestetica.com',
  'https://munnay-system-crm.vercel.app',
  'https://munnay-system.vercel.app',
  'https://munnay-crm-frontend.onrender.com',
  'http://localhost:4173',
  'http://localhost:3000'
];

const envAllowedOrigins = (process.env.ALLOWED_ORIGINS || '')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

const allowedOrigins = Array.from(new Set([...defaultAllowedOrigins, ...envAllowedOrigins]));

// ✅ Regex para permitir previews de Vercel
const vercelPreviewRegex = /^https:\/\/([^/]+)-marketingmunnays-projects\.vercel\.app$/i;
const munaySystemRegex = /^https:\/\/munnay-system(?:-[a-z0-9-]+)?\.vercel\.app$/i;

const normalizeOrigin = (value?: string): string => {
  if (!value) return '';
  return value.replace(/\/$/, '').toLowerCase();
};

type OriginCallback = (err: Error | null, origin?: boolean | string | RegExp | Array<boolean | string | RegExp>) => void;

const handleCorsOrigin = (origin: string | undefined, callback: OriginCallback) => {
  if (!origin) {
    callback(null, true);
    return;
  }

  const normalizedOrigin = normalizeOrigin(origin);
  const isExplicitlyAllowed = allowedOrigins.some(allowed => normalizeOrigin(allowed) === normalizedOrigin);
  const isPatternAllowed = vercelPreviewRegex.test(normalizedOrigin) || munaySystemRegex.test(normalizedOrigin);

  if (isExplicitlyAllowed || isPatternAllowed) {
    callback(null, true);
    return;
  }

  console.error(`CORS: Origen no permitido: ${origin}`);
  callback(new Error(`Not allowed by CORS: ${origin}`));
};

const corsOptions: CorsOptions = {
  origin: handleCorsOrigin,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Authorization', 'Content-Type', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['Content-Disposition'],
  optionsSuccessStatus: 204,
};

console.log('[CORS] Allowed origins:', allowedOrigins);

app.use(cors(corsOptions));
app.options('*', cors(corsOptions));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Log database target (masked) to help diagnose connectivity issues
console.log('[DB] Target:', maskDatabaseTarget(process.env.DATABASE_URL));

const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

// ✅ Health check
app.get('/health', (_req, res) => {
  res.status(200).send('CRM Munnay Backend is running!');
});

// ✅ DB health check
app.get('/health/db', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ ok: true });
  } catch (error: any) {
    res.status(500).json({ ok: false, error: error?.message || 'Unknown error' });
  }
});

// ✅ API routes
app.use('/api', apiRouter);


// ✅ Start server con soporte HTTP y HTTPS
const startServer = async () => {
  await runAutoMigrations();

  // Leer certificados SSL
  let credentials = undefined;
  try {
    const key = fs.readFileSync(path.join(__dirname, '..', 'key.pem'), 'utf8');
    const cert = fs.readFileSync(path.join(__dirname, '..', 'cert.pem'), 'utf8');
    credentials = { key, cert };
  } catch (err) {
    console.error('No se pudieron cargar los certificados SSL (key.pem, cert.pem). Solo se iniciará HTTP.');
  }

  if (credentials) {
    // Servidor HTTPS
    https.createServer(credentials, app).listen(PORT, () => {
      console.log(`Servidor HTTPS corriendo en el puerto ${PORT}`);
    });

    // Servidor HTTP que redirige a HTTPS
    http.createServer((req, res) => {
      const host = req.headers['host'] ? req.headers['host'].replace(/:\d+$/, ':' + PORT) : '';
      res.writeHead(301, { "Location": `https://${host}${req.url}` });
      res.end();
    }).listen(HTTP_PORT, () => {
      console.log(`Servidor HTTP (redirecciona a HTTPS) en el puerto ${HTTP_PORT}`);
    });
  } else {
    // Solo HTTP si no hay certificados
    app.listen(HTTP_PORT, () => {
      console.log(`Servidor HTTP corriendo en el puerto ${HTTP_PORT}`);
    });
  }
};

startServer();
