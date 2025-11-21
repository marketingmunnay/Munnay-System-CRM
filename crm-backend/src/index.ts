import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';
import path from 'path';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 4000;

// ✅ Lista de orígenes permitidos en producción
const allowedOrigins = [
  'https://mcc.munnaymedicinaestetica.com',
  'https://munnay-system-crm.vercel.app',
  'https://munnay-system.vercel.app',
  'https://munnay-crm-frontend.onrender.com',
  'http://localhost:4173',
  'http://localhost:3000'
];

// ✅ Regex para permitir previews de Vercel
const vercelPreviewRegex = /^https:\/\/(.+)-marketingmunnays-projects\.vercel\.app$/;

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin) || vercelPreviewRegex.test(origin)) {
      callback(null, true);
    } else {
      console.error(`CORS: Origen no permitido: ${origin}`);
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());

// Serve uploaded files (comprobantes, etc.)
const uploadsDir = path.join(__dirname, '..', 'uploads');
app.use('/uploads', express.static(uploadsDir));

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
