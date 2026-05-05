-- Schema for AulaSync
-- AulaSync — esquema base (extensiones y tablas)
-- Este archivo crea las tablas principales; ejecutar en Supabase SQL Editor.

create extension if not exists "uuid-ossp";

-- Tabla de perfiles vinculada a auth.users
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_usuario text,
  nombre_hijo text,
  created_at timestamptz default now()
);

-- Salones
create table if not exists classrooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  invite_code text unique not null,
  created_by uuid references auth.users(id),
  subjects jsonb default '[]',
  created_at timestamptz default now()
);

-- Miembros de salón
create table if not exists classroom_members (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid references classrooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('admin','member')) default 'member',
  created_at timestamptz default now(),
  unique (classroom_id, user_id)
);

-- Tareas
create table if not exists tasks (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid references classrooms(id) on delete cascade,
  created_by uuid references auth.users(id) on delete cascade,
  title text not null,
  description text,
  subject text,
  due_date date not null,
  is_completed boolean default false,
  created_at timestamptz default now()
);

-- Invitaciones
create table if not exists invites (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid references classrooms(id) on delete cascade,
  code text unique,
  expires_at timestamptz
);

-- NOTA: las políticas RLS y los índices se definen en los archivos
-- sql/profiles.sql y sql/hardening.sql. Para instalación rápida use sql/setup.sql
