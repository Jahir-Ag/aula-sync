import Link from 'next/link'

export default function Header() {
  return (
    <header className="bg-white border-b">
      <div className="container mx-auto px-4 py-3 flex items-center justify-between">
        <Link href="/" className="font-semibold">AulaSync</Link>
        <nav className="flex gap-3">
          <Link href="/salones" className="text-sm text-gray-700">Salones</Link>
          <Link href="/login" className="text-sm text-gray-700">Login</Link>
        </nav>
      </div>
    </header>
  )
}
