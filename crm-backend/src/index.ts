import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';
import path from 'path';

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 4000;

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',  // Vite dev
  'http://127.0.0.1:5173',
  'https://mcc.munnaymedicinaestetica.com',
  'https://munnay-system-crm.vercel.app',
  'https://munnay-system.vercel.app',
];

// Regex para permitir previews de Vercel
const vercelPreviewRegex = /^https:\/\/(.+)-marketingmunnays-projects\.vercel\.app$/;

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) {
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else if (vercelPreviewRegex.test(origin)) {
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

// Health check
app.get('/health', (req, res) => {
  res.status(200).send('CRM Munnay Backend is running!');
});

// API routes
app.use('/api', apiRouter);

// Static files (opcional si sirves frontend desde aquí)
app.use(express.static(path.join(__dirname, '..', 'public')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
