# AulaSync — Desarrollo local (MVP)

Pasos rápidos:

1. Copia las variables de entorno:

```
cp .env.local.example .env.local
```

Rellena `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

2. Instala dependencias (si no se instalaron automáticamente):

```bash
cd aula-sync
npm install
```

3. Ejecuta en desarrollo:

```bash
npm run dev
```

4. En Supabase: crea las tablas usando `sql/schema.sql` y configura OAuth (Google) y variables.

Archivos añadidos por la guía inicial:
- `sql/schema.sql` — esquema SQL
- `lib/supabaseClient.ts` — cliente Supabase
- `services/*` — servicios básicos (`auth`, `classrooms`, `tasks`)
- `hooks/useTasks.ts` — hook de ejemplo
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
