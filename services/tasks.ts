import { supabase } from '@/lib/supabaseClient'

export const createTask = async (task: {
  classroom_id: string
  title: string
  description?: string
  due_date?: string
  created_by?: string
}) => {
  const { data, error } = await supabase.from('tasks').insert([task]).select()

  if (error) throw error
  return data
}

export const getTomorrowTasks = async (classroomId: string) => {
  const tomorrow = new Date()
  tomorrow.setDate(tomorrow.getDate() + 1)

  const date = tomorrow.toISOString().split('T')[0]

  return await supabase
    .from('tasks')
    .select('*')
    .eq('classroom_id', classroomId)
    .eq('due_date', date)
}
