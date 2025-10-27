import express, { Request, Response, NextFunction, Express } from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';
// FIX: Removed `ParamsDictionary` import as it was causing type conflicts.

dotenv.config();

const app: Express = express();
const PORT = process.env.PORT || 4000;

// Lista de orígenes permitidos
const allowedOrigins = [
  'http://localhost:5173',  // Vite default dev port for frontend
  'http://127.0.0.1:5173',  // Alternative local dev
  'https://mcc.munnaymedicinaestetica.com' // Tu subdominio de producción
];

app.use(cors({
  origin: (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
    if (!origin) { // Permitir solicitudes sin origen (ej. Postman, curl)
      callback(null, true);
    } else if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`Not allowed by CORS: ${origin}`));
    }
  },
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// FIX: Explicitly typed req and res for the root route handler and removed `ParamsDictionary` generic for `Request`.
app.get('/', (req: Request, res: Response) => {
  // FIX: Accessing status method on the response object directly (added explicit cast for clarity if needed by linter).
  (res as Response).status(200).send('CRM Munnay Backend is running!');
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});