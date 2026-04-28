import { supabase } from '@/lib/supabaseClient'

export const signInWithGoogle = async () => {
  return await supabase.auth.signInWithOAuth({ provider: 'google' })
}

export const getCurrentUser = async () => {
  const { data } = await supabase.auth.getUser()
  return data.user
}
