module.exports = {
  apps: [
    {
      name: 'munnay-backend',
      script: 'dist/index.js',
      env: {
        NODE_ENV: 'production',
        HTTP_PORT: 4000,
        PORT: 4000,
        DATABASE_URL: process.env.DATABASE_URL || 'postgresql://munnay_admin:MunnayAdmin2026!@localhost:5432/munnay_db',
        JWT_SECRET: process.env.JWT_SECRET || 'cambia-esto-por-un-secreto-seguro',
        ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS || 'https://crm.munnaymedicinaestetica.com,https://munnay-system-crm.vercel.app'
      },
      watch: false,
      max_memory_restart: '512M'
    }
  ]
};
