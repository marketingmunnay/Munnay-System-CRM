import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 4000;

// ✅ Lista de orígenes permitidos en producción
const allowedOrigins = [
  'https://mcc.munnaymedicinaestetica.com',
  'https://munnay-system.vercel.app',
  'http://localhost:5173', // Para desarrollo local con Vite
];

// ✅ Patrón para permitir URLs de preview de Vercel
// Vercel preview URLs: https://munnay-system-{hash}-marketingmunnays-projects.vercel.app
const vercelPreviewPattern = /^https:\/\/munnay-system-[a-z0-9]{8,12}-marketingmunnays-projects\.vercel\.app$/;

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin || allowedOrigins.includes(origin) || vercelPreviewPattern.test(origin)) {
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
