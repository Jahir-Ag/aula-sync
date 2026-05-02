# Aula Sync

🇺🇸 Read in English → ./README.md

Resumen
-------

Aula Sync es una aplicación web ligera para la gestión de salones, creada con Next.js (App Router), React y Supabase. Permite crear salones, invitar miembros por código y organizar tareas de forma simple y segura para grupos pequeños.

Problema y motivación
---------------------

- Grupos pequeños (docentes, tutores, padres) necesitan una herramienta ágil para gestionar miembros y tareas sin procesos complejos.
- Aula Sync ofrece un flujo mínimo, con control de roles y políticas de seguridad a nivel de base de datos (RLS).

Características
---------------

- Crear y administrar salones
- Invitar miembros mediante código
- Roles (admin / member)
- Crear, actualizar y eliminar tareas por salón
- Perfiles de usuario vinculados a Supabase Auth
- Inicio de sesión con Google (Supabase)

Tecnologías
-----------

- Next.js (App Router)
- React + TypeScript
- Supabase (Auth + Postgres)
- React Query (presente en `providers/QueryProvider.tsx`)
- Hooks personalizados (`hooks/`)
- Context API para autenticación (`contexts/AuthContext.tsx`)

Arquitectura (alto nivel)
------------------------

Aplicación web cliente (Next.js) que consume Supabase directamente. Las llamadas a la base de datos están encapsuladas en `services/`. El estado de auth y perfil lo provee `contexts/AuthContext.tsx` y React Query se usa para caching y sincronización de datos. Las políticas RLS incluidas protegen el acceso a nivel de base de datos.

Autenticación
-------------

El proyecto usa Supabase Auth con Google como proveedor OAuth. Para habilitarlo:

1. Crea credenciales OAuth en Google Cloud Console (tipo Web application)
2. Añade los redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://<tu-dominio-produccion>/auth/callback`
3. Pega Client ID y Client Secret en Supabase > Authentication > Providers > Google

Base de datos
-------------

Los scripts SQL están en `sql/`:

- `sql/setup.sql` — script todo-en-uno (recomendado)
- `sql/schema.sql`, `sql/profiles.sql`, `sql/hardening.sql` — scripts modulados

Orden de ejecución recomendado:

1. Ejecutar `sql/setup.sql` en Supabase SQL Editor
2. Verificar que las tablas y políticas se hayan creado correctamente

Inicio rápido (local)
--------------------

1. Clona el repositorio

```bash
git clone <your-repo-url>
cd aula-sync
```

2. Copia el ejemplo de variables de entorno y edítalo

```bash
cp .env.local.example .env.local
# Rellena NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY
```

3. Instala y arranca

```bash
npm install
npm run dev
```

4. Abre http://localhost:3000 y prueba el inicio de sesión con Google

Variables de entorno
--------------------

- `NEXT_PUBLIC_SUPABASE_URL` — URL del proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — anon public key
- `NEXT_PUBLIC_APP_URL` — por ejemplo `http://localhost:3000`

Nota: no subir claves privadas (`SUPABASE_SERVICE_ROLE`) al repositorio. Usar secretos en Vercel para producción.

Estructura (puntos clave)
-------------------------

- `app/` — rutas y layouts (App Router)
- `lib/supabaseClient.ts` — inicialización del cliente Supabase
- `contexts/AuthContext.tsx` — manejo de sesión y perfil
- `providers/QueryProvider.tsx` — React Query provider
- `services/` — funciones que acceden a la base de datos
- `hooks/` — hooks reutilizables (Ej.: `useAuth`, `useTasks`)
- `sql/` — scripts para crear esquema, políticas y hardening

Mejoras futuras
----------------

- Automatizar migraciones con Supabase CLI
- Añadir tests end-to-end
- Mejorar i18n y accesibilidad

Licencia
--------

No hay archivo de licencia incluido. Si piensas publicar el proyecto, añade un `LICENSE` (MIT es recomendable para portafolios).
