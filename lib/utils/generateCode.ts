import { supabase } from '@/lib/supabaseClient'

/**
 * Genera un código de invitación único de 6 caracteres (letras mayúsculas + números).
 * Valida unicidad contra la DB antes de retornar.
 */
export async function generateUniqueCode(): Promise<string> {
  const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  const LENGTH = 6

  while (true) {
    let code = ''
    for (let i = 0; i < LENGTH; i++) {
      code += CHARS.charAt(Math.floor(Math.random() * CHARS.length))
    }

    // Verificar unicidad
    const { data, error } = await supabase
      .from('classrooms')
      .select('id')
      .ilike('invite_code', code)
      .maybeSingle()

    if (error) {
      console.error('Error checking invite code uniqueness:', error)
      throw error
    }

    if (!data) return code // código libre, usarlo
  }
}
