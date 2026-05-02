import { supabase } from '@/lib/supabaseClient'
import { withTimeout } from '@/lib/utils/timeoutHelper'
import { runWithAuthRecovery } from '@/lib/utils/supabaseHelper'
import { Task } from '@/types'

// Timeout de 20 segundos para operaciones
const OPERATION_TIMEOUT = 20000

// Crear tarea
export async function createTask(task: {
  classroom_id: string
  title: string
  description?: string
  subject?: string
  due_date: string
  created_by: string
}): Promise<Task> {
  try {
    const { data, error } = await runWithAuthRecovery(
      () =>
        withTimeout(
          supabase.from('tasks').insert([task]).select().single(),
          OPERATION_TIMEOUT,
          'createTask'
        ),
      { operationName: 'createTask', timeoutMs: OPERATION_TIMEOUT }
    )

    if (error) throw new Error(error.message)
    return data
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al crear tarea'
    console.error('Error creating task:', message)
    throw new Error(message)
  }
}

// Obtener tareas por fecha
export async function getTasksByDate(
  classroomId: string,
  date: string
): Promise<Task[]> {
  try {
    const { data, error } = await runWithAuthRecovery(
      () =>
        withTimeout(
          supabase
            .from('tasks')
            .select('*')
            .eq('classroom_id', classroomId)
            .eq('due_date', date)
            .order('created_at', { ascending: true }),
          OPERATION_TIMEOUT,
          'getTasksByDate'
        ),
      { operationName: 'getTasksByDate', timeoutMs: OPERATION_TIMEOUT }
    )

    if (error) throw new Error(error.message)
    return data || []
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al obtener tareas'
    console.error('Error fetching tasks:', message)
    throw new Error(message)
  }
}

// Editar tarea
export async function updateTask(
  id: string,
  data: Partial<Pick<Task, 'title' | 'description' | 'subject' | 'due_date'>>
): Promise<Task> {
  try {
    const { data: updated, error } = await runWithAuthRecovery(
      () =>
        withTimeout(
          supabase.from('tasks').update(data).eq('id', id).select().single(),
          OPERATION_TIMEOUT,
          'updateTask'
        ),
      { operationName: 'updateTask', timeoutMs: OPERATION_TIMEOUT }
    )

    if (error) throw new Error(error.message)
    return updated
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al actualizar tarea'
    console.error('Error updating task:', message)
    throw new Error(message)
  }
}

// Nota: la columna `is_completed` no se gestiona en este archivo.

// Eliminar tarea
export async function deleteTask(id: string): Promise<void> {
  try {
    const { error } = await runWithAuthRecovery(
      () => withTimeout(supabase.from('tasks').delete().eq('id', id), OPERATION_TIMEOUT, 'deleteTask'),
      { operationName: 'deleteTask', timeoutMs: OPERATION_TIMEOUT }
    )
    if (error) throw new Error(error.message)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Error al eliminar tarea'
    console.error('Error deleting task:', message)
    throw new Error(message)
  }
}
