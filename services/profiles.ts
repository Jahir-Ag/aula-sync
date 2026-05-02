import { supabase } from '@/lib/supabaseClient'
import { Profile } from '@/types'
import { runWithAuthRecovery } from '@/lib/utils/supabaseHelper'

const OPERATION_TIMEOUT = 20000

export async function getProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await runWithAuthRecovery(
    () => supabase.from('profiles').select('*').eq('id', userId).maybeSingle(),
    { operationName: 'getProfile', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) throw error
  return data
}

export async function upsertProfile(
  userId: string,
  data: { nombre_usuario: string; nombre_hijo: string }
): Promise<Profile> {
  const { data: profile, error } = await runWithAuthRecovery(
    () => supabase.from('profiles').upsert({ id: userId, ...data }, { onConflict: 'id' }).select().single(),
    { operationName: 'upsertProfile', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) throw error
  return profile
}
