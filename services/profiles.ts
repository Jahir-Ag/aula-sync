import { supabase } from '@/lib/supabaseClient'
import { Profile } from '@/types'

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) throw error
  return data
}

export async function upsertProfile(
  userId: string,
  data: { nombre_usuario: string; nombre_hijo: string }
): Promise<Profile> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .upsert({ id: userId, ...data }, { onConflict: 'id' })
    .select()
    .single()

  if (error) throw error
  return profile
}
