import { supabase } from '@/lib/supabaseClient'

export const createClassroom = async (name: string, userId: string) => {
  const { data, error } = await supabase
    .from('classrooms')
    .insert([{ name, created_by: userId }])
    .select()

  if (error) throw error

  await supabase.from('classroom_members').insert({
    user_id: userId,
    classroom_id: data[0].id,
    role: 'admin'
  })

  return data[0]
}
