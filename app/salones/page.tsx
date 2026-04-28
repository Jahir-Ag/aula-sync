import Link from 'next/link'

export default function SalonesPage() {
  // Placeholder: list of classrooms will be fetched from Supabase
  const mock = [
    { id: '1', name: 'Salón 1' },
    { id: '2', name: 'Salón 2' },
  ]

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Mis salones</h2>
      <ul className="space-y-2">
        {mock.map(c => (
          <li key={c.id} className="p-3 bg-white border rounded flex justify-between items-center">
            <div>{c.name}</div>
            <Link href={`/salon/${c.id}`} className="text-blue-600">Abrir</Link>
          </li>
        ))}
      </ul>
      <div className="mt-4">
        <button className="px-3 py-1 bg-green-600 text-white rounded">Crear salón</button>
      </div>
    </div>
  )
}
