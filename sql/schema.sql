-- Schema for AulaSync
create extension if not exists "uuid-ossp";

create table classrooms (
  id uuid primary key default uuid_generate_v4(),
  name text not null,
  created_by uuid,
  created_at timestamp default now()
);

create table classroom_members (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid,
  classroom_id uuid,
  role text default 'member'
);

create table tasks (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid,
  title text not null,
  description text,
  due_date date,
  created_by uuid,
  created_at timestamp default now()
);

create table invites (
  id uuid primary key default uuid_generate_v4(),
  classroom_id uuid,
  code text unique,
  expires_at timestamp
);

-- RLS enable (apply in Supabase SQL editor as needed)
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;

-- Example policy for tasks (apply in Supabase SQL editor)
create policy "Users can view tasks from their classrooms"
on tasks
for select
using (
  classroom_id in (
    select classroom_id
    from classroom_members
    where user_id = auth.uid()
  )
);
