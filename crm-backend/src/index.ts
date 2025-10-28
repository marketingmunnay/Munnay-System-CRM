import express, { Request, Response, NextFunction, Router, RequestHandler } from 'express'; // FIX: Added RequestHandler import
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';

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
// Ejemplo: https://munnay-system-crm-git-main-marketingmunnays-projects.vercel.app
// Ejemplo: https://sistema-munnay-73uk0p0jf-marketingmunnays-projects.vercel.app
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
// FIX: Removed explicit cast `as express.RequestHandler`. `express.json()` returns a RequestHandler.
app.use(express.json());
// FIX: Removed explicit cast `as express.RequestHandler`. `cookieParser()` returns a RequestHandler.
app.use(cookieParser());

// FIX: Corrected Request and Response types to use express.Request and express.Response.
app.get('/', (req: express.Request, res: express.Response) => {
  // FIX: Removed redundant cast `(res as express.Response)`. `res` is already typed as `Response`.
  res.status(200).send('CRM Munnay Backend is running!');
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});