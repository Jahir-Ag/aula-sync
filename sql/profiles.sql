-- ============================================================
-- SCRIPT DE ACTUALIZACIÓN Y RLS
-- (Asumiendo que ya ejecutaste tu primer script)
-- ============================================================
-- RLS y políticas recomendadas para AulaSync

-- Habilitar RLS
ALTER TABLE IF EXISTS profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS invites ENABLE ROW LEVEL SECURITY;

-- POLÍTICAS: PROFILES
CREATE POLICY IF NOT EXISTS "Users can view their own profile"
ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can insert their own profile"
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY IF NOT EXISTS "Users can update their own profile"
ON profiles FOR UPDATE USING (auth.uid() = id);

-- POLÍTICAS: CLASSROOMS
CREATE POLICY IF NOT EXISTS "Members can view their classrooms"
ON classrooms FOR SELECT USING (
  id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);

-- Permitir búsqueda por código si el usuario está autenticado (necesario para unirse por código)
CREATE POLICY IF NOT EXISTS "Authenticated users can search classrooms by code"
ON classrooms FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY IF NOT EXISTS "Users can create their own classrooms"
ON classrooms FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY IF NOT EXISTS "Admins can update classroom"
ON classrooms FOR UPDATE USING (
  id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY IF NOT EXISTS "Admins can delete classroom"
ON classrooms FOR DELETE USING (
  id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- POLÍTICAS: CLASSROOM_MEMBERS
CREATE POLICY IF NOT EXISTS "Members can view memberships"
ON classroom_members FOR SELECT USING (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);

CREATE POLICY IF NOT EXISTS "Users can join classrooms"
ON classroom_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can leave classrooms"
ON classroom_members FOR DELETE USING (auth.uid() = user_id);

-- POLÍTICAS: TASKS
CREATE POLICY IF NOT EXISTS "Members can view tasks"
ON tasks FOR SELECT USING (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);

CREATE POLICY IF NOT EXISTS "Members can create tasks"
ON tasks FOR INSERT WITH CHECK (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
  AND auth.uid() = created_by
);

CREATE POLICY IF NOT EXISTS "Users can update their own tasks or admins any"
ON tasks FOR UPDATE USING (
  created_by = auth.uid()
  OR classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY IF NOT EXISTS "Users can delete their own tasks or admins any"
ON tasks FOR DELETE USING (
  created_by = auth.uid()
  OR classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- POLÍTICAS: INVITES
CREATE POLICY IF NOT EXISTS "Admins can create invites"
ON invites FOR INSERT WITH CHECK (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY IF NOT EXISTS "Members can view invites"
ON invites FOR SELECT USING (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);
