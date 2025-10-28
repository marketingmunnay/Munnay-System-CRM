import app from './app';
import prisma from './prisma/client';
import dotenv from 'dotenv';
dotenv.config();

const PORT = process.env.PORT || 4000;

async function main() {
  app.listen(PORT, () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});