-- Setup completo para AulaSync (todo en un solo archivo)
-- Puede ejecutarse en Supabase SQL Editor: este script es idempotente

-- 1) Extensión
create extension if not exists "uuid-ossp";

-- 2) Tablas (si no existen)
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre_usuario text,
  nombre_hijo text,
  created_at timestamptz default now()
);

create table if not exists classrooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  invite_code text unique not null,
  created_by uuid references auth.users(id),
  created_at timestamptz default now()
);

create table if not exists classroom_members (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid references classrooms(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('admin','member')) default 'member',
  created_at timestamptz default now(),
  unique (classroom_id, user_id)
);

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

create table if not exists invites (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid references classrooms(id) on delete cascade,
  code text unique,
  expires_at timestamptz
);

-- 3) RLS y políticas (profiles + classrooms + classroom_members + tasks + invites)
-- Recomendado: ejecutar también sql/profiles.sql para mantener políticas legibles.
-- Para conveniencia, aquí aplicamos políticas mínimas necesarias.

ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invites ENABLE ROW LEVEL SECURITY;

-- Policies: profiles
CREATE POLICY IF NOT EXISTS "Users can view their own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can insert their own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY IF NOT EXISTS "Users can update their own profile" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Policies: classrooms (permitir búsqueda por código para usuarios autenticados)
CREATE POLICY IF NOT EXISTS "Members can view their classrooms" ON classrooms FOR SELECT USING (
  id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "Authenticated users can search classrooms by code" ON classrooms FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY IF NOT EXISTS "Users can create their own classrooms" ON classrooms FOR INSERT WITH CHECK (auth.uid() = created_by);
CREATE POLICY IF NOT EXISTS "Admins can update classroom" ON classrooms FOR UPDATE USING (
  id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY IF NOT EXISTS "Admins can delete classroom" ON classrooms FOR DELETE USING (
  id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policies: classroom_members
CREATE POLICY IF NOT EXISTS "Members can view memberships" ON classroom_members FOR SELECT USING (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "Users can join classrooms" ON classroom_members FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY IF NOT EXISTS "Users can leave classrooms" ON classroom_members FOR DELETE USING (auth.uid() = user_id);

-- Policies: tasks
CREATE POLICY IF NOT EXISTS "Members can view tasks" ON tasks FOR SELECT USING (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);
CREATE POLICY IF NOT EXISTS "Members can create tasks" ON tasks FOR INSERT WITH CHECK (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
  AND auth.uid() = created_by
);
CREATE POLICY IF NOT EXISTS "Users can update their own tasks or admins any" ON tasks FOR UPDATE USING (
  created_by = auth.uid()
  OR classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY IF NOT EXISTS "Users can delete their own tasks or admins any" ON tasks FOR DELETE USING (
  created_by = auth.uid()
  OR classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- Policies: invites
CREATE POLICY IF NOT EXISTS "Admins can create invites" ON invites FOR INSERT WITH CHECK (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);
CREATE POLICY IF NOT EXISTS "Members can view invites" ON invites FOR SELECT USING (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);

-- 4) Hardening: trigger e índices
DROP POLICY IF EXISTS "Authenticated users can create classrooms" ON classrooms;
CREATE POLICY IF NOT EXISTS "Users can create their own classrooms" ON classrooms FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE OR REPLACE FUNCTION prevent_last_admin_leaving()
RETURNS trigger AS $$
BEGIN
  IF OLD.role = 'admin' THEN
    IF (
      SELECT COUNT(*)
      FROM classroom_members
      WHERE classroom_id = OLD.classroom_id
        AND role = 'admin'
    ) = 1 THEN
      RAISE EXCEPTION 'No puedes salir: eres el único administrador de este salón';
    END IF;
  END IF;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trigger_prevent_last_admin ON classroom_members;
CREATE TRIGGER trigger_prevent_last_admin
BEFORE DELETE ON classroom_members
FOR EACH ROW
EXECUTE FUNCTION prevent_last_admin_leaving();

CREATE INDEX IF NOT EXISTS idx_members_classroom_user ON classroom_members(classroom_id, user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_classroom_due_date ON tasks(classroom_id, due_date);
CREATE INDEX IF NOT EXISTS idx_tasks_due_date ON tasks(due_date);

ALTER TABLE tasks ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;

-- FIN: setup completo
