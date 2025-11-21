# CRM Backend (crm-backend)

This folder contains the backend for Munnay System CRM.

## Quick start

1. Install dependencies

```powershell
cd crm-backend
npm install
```

2. Environment

Create a `.env` file with your database connection and any required keys. Example:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/dbname
PORT=4000
```

3. Generate Prisma client and build

```powershell
npm run build
```

4. Run in development

```powershell
npm run dev
```

## Uploads (comprobantes)

- Uploaded comprobantes (PDF/images) are stored under `uploads/egresos`.
- The API exposes an endpoint to upload a single file under the form field name `comprobante`.
- Uploaded files are served statically by the server under `/uploads/egresos/<filename>`.

## Notes

- The upload handler enforces a 10 MB limit and only accepts common image types and PDF (`image/*`, `application/pdf`).
- When an `Egreso` is deleted, the server attempts to remove the associated comprobante file from disk if it exists.

## Scripts

- `npm run dev` - start in dev mode with `nodemon` (requires TypeScript present)
- `npm run build` - generate Prisma client and compile TypeScript
- `npm run start` - run compiled app from `dist`

## Troubleshooting

If TypeScript complains about missing types for `multer`, install the dev types:

```powershell
npm i -D @types/multer
```

If you deploy to a platform with ephemeral file systems (like some PaaS), consider using S3 or another persistent object store for uploads.
