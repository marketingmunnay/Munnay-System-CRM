import express, { Router, Request, Response, Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';

dotenv.config();

const app: Express = express();
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
// FIX: Explicitly cast `app` to `express.Application` to ensure `use` method accepts standard middleware types.
// This resolves the "No overload matches this call" errors for express.json() and cookieParser().
app.use(express.json() as express.RequestHandler);
app.use(cookieParser() as express.RequestHandler);

app.get('/', (req: Request, res: Response) => {
  // FIX: Ensure `res` is correctly typed as `express.Response` and `status` property is accessible.
  (res as express.Response).status(200).send('CRM Munnay Backend is running!');
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});