import { use } from 'react'

type Props = { params: { id: string } }

export default function SalonPage({ params }: Props) {
  const { id } = params

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Salón {id}</h2>
      <p>Lista de tareas (placeholder).</p>
      <div className="mt-4">
        <button className="px-3 py-1 bg-blue-600 text-white rounded">Crear tarea</button>
      </div>
    </div>
  )
}
