import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';
import path from 'path';
import { PrismaClient } from '@prisma/client'

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
app.get('/health', (req, res) => {
  res.status(200).send('CRM Munnay Backend is running!');
});

// API routes are prefixed with /api
app.use('/api', apiRouter);

// For any other request that doesn't match an API route or a static file,
// serve the frontend's index.html file. This is crucial for client-side routing.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});

const prisma = new PrismaClient()

async function main() {
  // Crear un usuario de prueba
  const user = await prisma.user.create({
    data: {
      nombres: "Juan",
      apellidos: "Pérez",
      usuario: "admin",
      password: "123456",
      rol: {
        create: {
          nombre: "ADMIN",
          permissions: ["*"],
          dashboardMetrics: []
        }
      }
    }
  })
  console.log("Usuario creado:", user)
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })