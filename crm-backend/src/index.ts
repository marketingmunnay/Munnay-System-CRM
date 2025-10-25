import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';

dotenv.config();

const app = express();
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
app.use(express.json());
app.use(cookieParser());

app.get('/', (req: express.Request, res: express.Response) => {
  res.send('CRM Munnay Backend is running!');
});

app.use('/api', apiRouter);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});