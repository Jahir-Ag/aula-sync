# Aula Sync

🌐 Available in:
- 🇺🇸 English
- 🇪🇸 Español → [README.es.md](./README.es.md)

---

## Overview

Aula Sync is a lightweight classroom management web application built with Next.js (App Router), React, and Supabase. It provides a simple workflow to create and manage classrooms, invite members, and coordinate tasks for small teaching groups or parent communities.

---

## Problem & Motivation

- Small teaching groups (teachers, tutors, parents) often lack a simple tool to manage members and tasks efficiently.
- Existing solutions are often too complex or overloaded.
- Aula Sync provides a minimal, secure, and easy-to-use workflow with role-based access and database-level security.

---

## Features

- Create and manage classrooms
- Invite members using an invite code
- Role-based membership (admin / member)
- Create, update, and delete tasks per classroom
- User profiles linked to Supabase Auth
- Google sign-in via Supabase Auth
- Row-Level Security (RLS) policies for data protection

---

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Supabase (Auth + Postgres)
- React Query
- Custom React Hooks
- Context API for authentication

---

## Architecture (High-Level)

The application is a client-side Next.js app that communicates directly with Supabase.

- Data access is handled through `services/`
- Authentication state is managed via `AuthContext`
- React Query handles caching and synchronization
- Security is enforced through Supabase RLS policies

---

## Authentication

Uses Supabase Auth with Google OAuth.

### Setup:

1. Create OAuth credentials in Google Cloud Console (Web Application)
2. Add redirect URIs:
   - `http://localhost:3000/auth/callback`
   - `https://your-domain.vercel.app/auth/callback`
3. Add credentials in Supabase → Authentication → Providers → Google

---

## Database

SQL scripts are located in `sql/`:

- `setup.sql` (recommended)
- `schema.sql`
- `profiles.sql`
- `hardening.sql`

### Setup steps:

1. Open Supabase SQL Editor
2. Run `sql/setup.sql`
3. Verify tables and policies

---

## Getting Started (Local)

```bash
git clone <your-repo-url>
cd aula-sync