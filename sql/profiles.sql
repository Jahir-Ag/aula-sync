-- ============================================================
-- SCRIPT DE ACTUALIZACIÓN Y RLS
-- (Asumiendo que ya ejecutaste tu primer script)
-- ============================================================

-- 1. Ajustes de esquema (Para coincidir con el código TypeScript)
-- Renombramos user_id a created_by en tasks porque nuestros hooks y services usan created_by
ALTER TABLE tasks RENAME COLUMN user_id TO created_by;

-- Hacemos requeridos los campos del profile
ALTER TABLE profiles ALTER COLUMN nombre_usuario SET NOT NULL;
ALTER TABLE profiles ALTER COLUMN nombre_hijo SET NOT NULL;

-- 2. Habilitar RLS en todas las tablas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE classrooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE classroom_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- ============================================================
-- POLÍTICAS: PROFILES
-- ============================================================
CREATE POLICY "Users can view their own profile" 
ON profiles FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" 
ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile" 
ON profiles FOR UPDATE USING (auth.uid() = id);

-- ============================================================
-- POLÍTICAS: CLASSROOMS
-- ============================================================
CREATE POLICY "Members can view their classrooms" 
ON classrooms FOR SELECT USING (
  id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);

CREATE POLICY "Authenticated users can create classrooms" 
ON classrooms FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Admins can update classroom" 
ON classrooms FOR UPDATE USING (
  id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Admins can delete classroom" 
ON classrooms FOR DELETE USING (
  id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);

-- ============================================================
-- POLÍTICAS: CLASSROOM_MEMBERS
-- ============================================================
CREATE POLICY "Members can view memberships" 
ON classroom_members FOR SELECT USING (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);

CREATE POLICY "Users can join classrooms" 
ON classroom_members FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can leave classrooms" 
ON classroom_members FOR DELETE USING (auth.uid() = user_id);

-- ============================================================
-- POLÍTICAS: TASKS
-- ============================================================
CREATE POLICY "Members can view tasks" 
ON tasks FOR SELECT USING (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
);

CREATE POLICY "Members can create tasks" 
ON tasks FOR INSERT WITH CHECK (
  classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid())
  AND auth.uid() = created_by
);

CREATE POLICY "Users can update their own tasks or admins any" 
ON tasks FOR UPDATE USING (
  created_by = auth.uid() 
  OR classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);

CREATE POLICY "Users can delete their own tasks or admins any" 
ON tasks FOR DELETE USING (
  created_by = auth.uid() 
  OR classroom_id IN (SELECT classroom_id FROM classroom_members WHERE user_id = auth.uid() AND role = 'admin')
);
