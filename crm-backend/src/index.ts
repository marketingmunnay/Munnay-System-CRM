import express, { Request, Response, NextFunction, Express } from 'express';
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
  'https://mcc.munnaymedicinaestetica.com' // Tu subdominio de producción
];

app.use(cors({
  origin: (origin, callback) => {
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
// FIX: Removed path argument for express.json()
app.use(express.json());
// FIX: Removed path argument for cookieParser()
app.use(cookieParser());

// FIX: Ensure correct types for Request and Response.
// FIX: Use res.send() for sending responses, which is a standard Express method.
app.get('/', (req: Request, res: Response) => {
  // FIX: Add .status() method to the response object.
  res.status(200).send('CRM Munnay Backend is running!');
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});