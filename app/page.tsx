import Link from 'next/link'
import { supabase } from '@/lib/supabaseClient'

export default async function Home() {
  // Try a connection test
  let statusParams = { success: true, message: "Connected to Supabase" };
  try {
    const { error } = await supabase.from('classrooms').select('*').limit(1);
    if (error && error.code !== '42P01') { // 42P01 means table does not exist, which still implies connection is fine
      statusParams = { success: false, message: error.message };
    }
  } catch (err: any) {
    statusParams = { success: false, message: err?.message || 'Unknown error' };
  }

  return (
    <div className="prose">
      <h1>AulaSync</h1>
      <p>Bienvenido. Accede al dashboard o inicia sesión.</p>

      <div className={`p-4 mt-4 rounded-md text-sm ${statusParams.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
        <strong>Supabase status:</strong> {statusParams.message}
      </div>

      <div className="flex gap-4 mt-4">
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Login</Link>
        <Link href="/salones" className="px-4 py-2 border rounded">Dashboard</Link>
      </div>
    </div>
  )
}
