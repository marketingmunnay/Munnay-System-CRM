import express, { Request, Response, NextFunction, Router, RequestHandler } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';
import path from 'path';
import { fileURLToPath } from 'url';

// FIX: Define __dirname for ES module scope.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const app: express.Application = express();
const PORT = process.env.PORT || 4000;

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',  // Vite default dev port for frontend
  'http://127.0.0.1:5173',  // Alternative local dev
  'https://mcc.munnaymedicinaestetica.com', // Tu subdominio de producción
  'https://munnay-system-crm.vercel.app', // Frontend desplegado en Vercel (dominio principal)
];

// Regex para permitir cualquier subdominio de Vercel para proyectos de marketingmunnays
const vercelPreviewRegex = /^https:\/\/(.+)-marketingmunnays-projects\.vercel\.app$/;


app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    // Permitir solicitudes sin origen (ej. Postman, curl)
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

// Serve static files from the React build folder
app.use(express.static(path.join(__dirname, '..', 'public')));

// Health check endpoint
// FIX: Use named Request and Response types to fix typing errors.
// FIX: Removed explicit Request and Response types to fix typing errors.
app.get('/health', (req, res) => {
  res.status(200).send('CRM Munnay Backend is running!');
});

// API routes are prefixed with /api
app.use('/api', apiRouter);

// For any other request that doesn't match an API route or a static file,
// serve the frontend's index.html file. This is crucial for client-side routing.
// FIX: Use named Request and Response types to fix typing errors.
// FIX: Removed explicit Request and Response types to fix typing errors.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});