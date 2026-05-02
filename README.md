
# Aula Sync

🇪🇸 Read in Spanish → ./README.es.md

Overview
--------

Aula Sync is a lightweight classroom management web application built with Next.js (App Router), React and Supabase. It provides a simple workflow to create and manage classrooms, invite members, and coordinate tasks for small teaching groups or parents' cohorts.

Problem & Motivation
--------------------

- Many small teaching groups (teachers, tutors, parent groups) lack a focused, low-friction tool for managing class membership and simple task assignments.
- Aula Sync provides a minimal, secure workflow for classrooms, member roles (admin/member), invites by code, and task management without heavy configuration.

Features
--------

- Create and manage classrooms
- Invite members using an invite code
- Role-based membership (admin / member)
- Create, update and delete tasks for a classroom
- User profiles (linked to Supabase Auth)
- Google sign-in via Supabase Auth
- Database Row-Level Security (RLS) policies included

Tech stack
----------

- Next.js (App Router)
- React + TypeScript
- Supabase (Auth + Postgres) via `@supabase/supabase-js`
- React Query (present in `providers/QueryProvider.tsx`)
- Custom React hooks (see `hooks/`)
- React Context for auth (`contexts/AuthContext.tsx`)

Architecture (high-level)
-------------------------

The application is a client-rendered Next.js app that talks directly to Supabase using the official client. Data access is encapsulated in `services/` modules; auth state is provided by `contexts/AuthContext.tsx`. React Query is used to cache and manage server data. Database-level access control is enforced via RLS policies included in the repository SQL.

Authentication
--------------

Authentication uses Supabase Auth with Google as an OAuth provider. To enable Google login you must:

1. Create OAuth credentials in Google Cloud Console (type: Web application)
2. Add redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://<your-production-domain>/auth/callback` (for deployment)
3. Add the Google client ID/secret to Supabase Authentication > Providers > Google

Database
--------

Database setup scripts are included under `sql/`:

- `sql/setup.sql` — single, idempotent setup script (recommended for new projects)
- `sql/schema.sql`, `sql/profiles.sql`, `sql/hardening.sql` — modular scripts if you prefer step-by-step

Recommended steps to provision a fresh Supabase project:

1. In Supabase dashboard, open SQL Editor
2. Run `sql/setup.sql` (creates tables, policies, triggers, and indexes)
3. Verify OAuth provider settings and site URL

Getting started (local)
-----------------------

1. Clone the repository

```bash
git clone <your-repo-url>
cd aula-sync
```

2. Copy and edit environment variables

```bash
cp .env.local.example .env.local
# Edit .env.local and set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
```

3. Install dependencies and run

```bash
npm install
npm run dev
```

4. Open http://localhost:3000 and sign in (Google) to use the app

Environment variables
---------------------

Minimum required (set in `.env.local`):

- `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — public anon key
- `NEXT_PUBLIC_APP_URL` — e.g. `http://localhost:3000`

Optional (server-side only, never commit):

- `SUPABASE_SERVICE_ROLE` — service role (store as secret server-side only)

Usage
-----

After signing in with Google you'll be able to:

- Create a classroom and obtain an invite code
- Share the invite code with others to join
- Add and manage tasks scoped to a classroom
- Manage member roles (admin/member)

Project structure (important files)
----------------------------------

- `app/` — Next.js App Router pages and layout
- `lib/supabaseClient.ts` — Supabase client instance
- `contexts/AuthContext.tsx` — authentication & profile context
- `providers/QueryProvider.tsx` — React Query provider
- `services/` — database access wrappers
- `hooks/` — custom hooks (e.g., `useAuth`, `useTasks`)
- `sql/` — database scripts to create schema, policies, triggers and indexes

Future improvements
-------------------

- Add CI-driven migrations (Supabase CLI) for repeatable deployments
- Add end-to-end tests and automated database checks
- Improve internationalization (i18n) and accessibility
- Add admin UX for inviting and managing members

Deployment (Vercel)
-------------------

1. Push the repository to GitHub
2. Import the project into Vercel
3. Add the same environment variables in Vercel dashboard
4. Configure OAuth redirect URIs to include your Vercel domain

License
-------

This repository does not include a license file. If you intend to publish the project as open source, add a `LICENSE` file (MIT is a common choice).

Acknowledgements
----------------
This project was built as a small MVP targeting classroom workflows and is intended for small groups. For further questions or assistance, open an issue in the repository.
# AulaSync — Desarrollo local (MVP)

Breve: AulaSync es una pequeña app Next.js que usa Supabase (Postgres + Auth) para gestionar salones, miembros y tareas.

Requisitos previos:
- Node 18+ / npm o pnpm
- Cuenta de Supabase (crear proyecto)
- (Para Google OAuth) proyecto en Google Cloud Console con credenciales OAuth

Instalación local

1. Clona el repositorio:

```bash
git clone <tu-repo-url>
cd aula-sync
```

2. Copia el ejemplo de variables de entorno y complétalo:

```bash
cp .env.local.example .env.local
# Edita .env.local y rellena NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
```

3. Instala dependencias:

```bash
npm install
```

4. Ejecuta en desarrollo:

```bash
npm run dev
```

Configurar Supabase (DB + Auth)

1. Crea un proyecto en Supabase.
2. En el panel de Supabase abre **SQL Editor** y ejecuta el script `sql/setup.sql`. Es idempotente y crea las tablas, políticas RLS, índices y triggers necesarios.
	 - Alternativa: ejecutar por separado `sql/schema.sql`, `sql/profiles.sql`, `sql/hardening.sql` en ese orden.

3. Configura OAuth (Google):
	 - Crea credenciales OAuth en Google Cloud Console (tipo "Web application").
	 - Añade estos redirect URIs en Google Console:
		 - `http://localhost:3000/auth/callback`
		 - `https://<tu-dominio-vercel>/auth/callback` (cuando despliegues)
	 - En Supabase > Authentication > Providers > Google pega el Client ID y Client Secret.
	 - En Supabase > Settings > Site URL establece `http://localhost:3000` y añade tu dominio de producción cuando lo tengas.

Variables de entorno

Rellena `.env.local` con los valores de tu proyecto Supabase. Usa `.env.local.example` como guía.

Variables mínimas requeridas:
- `NEXT_PUBLIC_SUPABASE_URL` (URL pública de tu proyecto Supabase)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` (ANON key pública)

Importante: nunca subir keys privadas o `SERVICE_ROLE` al repositorio. Si necesitas una `SERVICE_ROLE` para tareas de backend, guárala en un secreto de Vercel o en tu servidor y no en el frontend.

Despliegue en Vercel

1. Sube el repositorio a GitHub.
2. En Vercel, importa el repositorio e instala el proyecto.
3. En Vercel Settings > Environment Variables añade las mismas variables (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
4. En Supabase añade el dominio de Vercel en las Redirect URIs para Google OAuth.

Notas de seguridad y operativas

- `.gitignore` ya excluye archivos sensibles (`.env*`, `node_modules/`, `.next/`). No publiques tus claves.
- Las políticas RLS en `sql/profiles.sql` y `sql/setup.sql` protegen acceso: revisa y adáptalas si cambias la lógica de la app.
- Si necesitas ejecutar migraciones automáticamente, considera usar el Supabase CLI o un sistema de migraciones; por ahora `sql/setup.sql` es suficiente para un MVP.

Problemas comunes

- Si recibes errores de autorización en consultas, verifica:
	- Que el usuario está autenticado (login con Google)
	- Que ejecutaste `sql/setup.sql` (políticas RLS aplicadas)
	- Que las variables de entorno en Vercel/Local son correctas

Soporte y siguientes pasos

- Si quieres, puedo: 1) crear un script de migraciones automatizado (supabase CLI), 2) limpiar comentarios en todo el repo, o 3) aplicar tipos estrictos a las respuestas de Supabase.

