import { defineConfig } from 'prisma/cli-config';

export default defineConfig({
  schema: './prisma/schema.prisma',
  seed: 'ts-node prisma/seed.ts'
});