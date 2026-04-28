import Link from 'next/link'

export default function Home() {
  return (
    <div className="prose">
      <h1>AulaSync</h1>
      <p>Bienvenido. Accede al dashboard o inicia sesión.</p>
      <div className="flex gap-4 mt-4">
        <Link href="/login" className="px-4 py-2 bg-blue-600 text-white rounded">Login</Link>
        <Link href="/salones" className="px-4 py-2 border rounded">Dashboard</Link>
      </div>
    </div>
  )
}
