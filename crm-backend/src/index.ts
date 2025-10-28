// crm-backend/src/index.ts

import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import dotenv from 'dotenv';
import apiRouter from './api';

dotenv.config();

const app = express();

// ... (todo tu código de CORS, middleware, etc. se queda igual)
app.use(cors({
  //...
}));
app.use(express.json());
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).send('CRM Munnay Backend is running!');
});

app.use('/api', apiRouter);

// QUITA ESTA PARTE:
// const PORT = process.env.PORT || 4000;
// app.listen(PORT, () => {
//   console.log(`Server is running on http://localhost:${PORT}`);
// });

// AÑADE ESTA LÍNEA AL FINAL:
export default app;
