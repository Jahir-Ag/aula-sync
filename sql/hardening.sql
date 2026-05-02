-- ============================================================
-- AulaSync — Hardening SQL
-- Ejecutar en Supabase SQL Editor (después de profiles.sql)
-- ============================================================
-- Hardening: triggers, índices y ajustes de seguridad

-- Reforzar: política CREATE en classrooms (idempotente)
DROP POLICY IF EXISTS "Authenticated users can create classrooms" ON classrooms;
CREATE POLICY IF NOT EXISTS "Users can create their own classrooms"
ON classrooms FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Trigger: proteger que el último admin no pueda irse
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

-- Índices de rendimiento
CREATE INDEX IF NOT EXISTS idx_members_classroom_user
  ON classroom_members(classroom_id, user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_classroom_due_date
  ON tasks(classroom_id, due_date);

CREATE INDEX IF NOT EXISTS idx_tasks_due_date
  ON tasks(due_date);

-- Asegurar is_completed existe (migración segura)
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;

-- Nota: las políticas RLS principales están en sql/profiles.sql
