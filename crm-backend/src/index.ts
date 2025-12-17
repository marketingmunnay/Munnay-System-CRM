import express from 'express';
import cors from 'cors';
import type { CorsOptions } from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 4000;

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

// ✅ Health check
app.get('/health', (_req, res) => {
  res.status(200).send('CRM Munnay Backend is running!');
});

// ✅ API routes
app.use('/api', apiRouter);

// ✅ Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
