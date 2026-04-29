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
    const { data } = await supabase
      .from('classrooms')
      .select('id')
      .eq('invite_code', code)
      .maybeSingle()

    if (!data) return code // código libre, usarlo
  }
}
