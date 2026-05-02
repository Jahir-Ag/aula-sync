import { supabase } from '@/lib/supabaseClient'
import { withTimeout } from '@/lib/utils/timeoutHelper'

type RunOptions = {
  operationName?: string
  timeoutMs?: number
}

// Ejecuta una operación contra Supabase y, si falla, intenta refrescar la sesión
// y reintenta la operación una vez. Acepta operaciones que devuelvan builders
// de Supabase o promesas; internamente se castea para mantener compatibilidad.
export async function runWithAuthRecovery<T = any>(
  operation: () => unknown,
  opts: RunOptions = {}
): Promise<any> {
  const attempt = () =>
    opts.timeoutMs
      ? withTimeout(operation() as Promise<T>, opts.timeoutMs, opts.operationName)
      : (operation() as Promise<T>)

  try {
    return await attempt()
  } catch (err) {
    console.warn(`${opts.operationName ?? 'operation'} failed — refreshing session`, err)
    try {
      const { data, error } = await supabase.auth.refreshSession()
      if (error) console.error('refreshSession error:', error)
      else console.log('refreshSession result:', data)
    } catch (refreshErr) {
      console.error('refreshSession threw:', refreshErr)
    }

    // Reintentar una vez después del refresh
    try {
      return await attempt()
    } catch (secondErr) {
      console.error(`${opts.operationName ?? 'operation'} failed after session refresh`, secondErr)
      throw secondErr
    }
  }
}

export default runWithAuthRecovery
