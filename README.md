This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

## Configuración y puesta en marcha

**Requisito:** backend `cnm-backend` corriendo (por defecto `http://localhost:8080`) con la
base de datos PostgreSQL `cnm` sembrada (`cnm-backend/seed-dev.sql` tiene las instrucciones).

- El frontend no necesita `.env`: usa `NEXT_PUBLIC_API_URL` con fallback
  `http://localhost:8080`. Si tu backend corre en otro host/puerto, crea `.env.local`:
  `NEXT_PUBLIC_API_URL=http://localhost:9090`.
- CORS: el backend acepta cualquier origen por defecto (funciona con cualquier puerto
  que asigne `next dev`: 3000, 3001, 3002…). Para producción, define `CORS_ORIGINS`
  en el `.env` del backend (ver `.env.example` de `cnm-backend`).
- Cuentas demo del seed: `admin@cnmontanismo.com` / `Admin1234` ·
  `carlos.gonzalez@example.com` / `Cliente1234`.

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
