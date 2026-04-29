import { supabase } from '@/lib/supabaseClient'
import { Task } from '@/types'

// ─── Crear tarea ──────────────────────────────────────────────
export async function createTask(task: {
  classroom_id: string
  title: string
  description?: string
  subject?: string
  due_date: string
  created_by: string
}): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .insert([task])
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Obtener tareas por fecha ─────────────────────────────────
export async function getTasksByDate(
  classroomId: string,
  date: string
): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('due_date', date)
    .order('created_at', { ascending: true })

  if (error) throw error
  return data || []
}

// ─── Editar tarea ─────────────────────────────────────────────
export async function updateTask(
  id: string,
  data: Partial<Pick<Task, 'title' | 'description' | 'subject' | 'due_date'>>
): Promise<Task> {
  const { data: updated, error } = await supabase
    .from('tasks')
    .update(data)
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return updated
}

// ─── Marcar como completada / pendiente ──────────────────────
export async function toggleTaskCompleted(
  id: string,
  is_completed: boolean
): Promise<Task> {
  const { data, error } = await supabase
    .from('tasks')
    .update({ is_completed })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data
}

// ─── Eliminar tarea ───────────────────────────────────────────
export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id)
  if (error) throw error
}
