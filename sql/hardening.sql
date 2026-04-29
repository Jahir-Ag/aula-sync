-- ============================================================
-- AulaSync — Hardening SQL
-- Ejecutar en Supabase SQL Editor (después de profiles.sql)
-- ============================================================

-- ─── 1.1 FIX: política INSERT más estricta en classrooms ─────
DROP POLICY IF EXISTS "Authenticated users can create classrooms" ON classrooms;

CREATE POLICY "Users can create their own classrooms"
ON classrooms FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- ─── 1.2 Trigger: proteger último admin ──────────────────────
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

-- ─── 1.3 Índices de rendimiento ──────────────────────────────
CREATE INDEX IF NOT EXISTS idx_members_classroom_user
  ON classroom_members(classroom_id, user_id);

CREATE INDEX IF NOT EXISTS idx_tasks_classroom_date
  ON tasks(classroom_id, due_date);

-- ─── 5.1 Campo is_completed en tasks ─────────────────────────
ALTER TABLE tasks
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT false;

-- RLS: permitir que el dueño o admin actualice is_completed
-- (ya cubierto por la policy UPDATE existente)
