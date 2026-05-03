import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      // Allow the client to parse OAuth callback data from the URL
      // so sessions are processed automatically in both dev and prod.
      detectSessionInUrl: true,
    },
  }
)
