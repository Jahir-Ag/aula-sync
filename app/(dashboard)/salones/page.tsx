'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useClassrooms } from '@/hooks/useClassrooms'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'

export default function DashboardPage() {
  const { classrooms, loading, error, createClassroom, joinClassroom } =
    useClassrooms()

  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [createName, setCreateName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)
    setActionLoading(true)
    try {
      await createClassroom(createName)
      setCreateName('')
      setShowCreate(false)
    } catch (err: any) {
      setActionError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionError(null)
    setActionLoading(true)
    try {
      await joinClassroom(joinCode)
      setJoinCode('')
      setShowJoin(false)
    } catch (err: any) {
      setActionError(err.message)
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <Container>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Mis Salones</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { setShowJoin(true); setShowCreate(false); setActionError(null) }}
          >
            Unirse con código
          </Button>
          <Button onClick={() => { setShowCreate(true); setShowJoin(false); setActionError(null) }}>
            Crear salón
          </Button>
        </div>
      </div>

      {/* Error de acción */}
      {actionError && (
        <div className="mb-6 p-3 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
          {actionError}
        </div>
      )}

      {/* Formulario: Crear salón */}
      {showCreate && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">Nuevo Salón</h2>
          <form onSubmit={handleCreate} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre del salón
              </label>
              <Input
                id="create-salon-name"
                placeholder="Ej. 1ro B - Ciencias"
                value={createName}
                onChange={e => setCreateName(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Creando...' : 'Crear'}
            </Button>
            <Button variant="outline" onClick={() => setShowCreate(false)}>
              Cancelar
            </Button>
          </form>
        </Card>
      )}

      {/* Formulario: Unirse a salón */}
      {showJoin && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <h2 className="text-xl font-semibold mb-4">Unirse a un salón</h2>
          <form onSubmit={handleJoin} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Código de invitación
              </label>
              <Input
                id="join-salon-code"
                placeholder="Ej. A9F3K2"
                value={joinCode}
                onChange={e => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
                required
              />
            </div>
            <Button type="submit" disabled={actionLoading}>
              {actionLoading ? 'Buscando...' : 'Unirse'}
            </Button>
            <Button variant="outline" onClick={() => setShowJoin(false)}>
              Cancelar
            </Button>
          </form>
        </Card>
      )}

      {/* Estado: cargando */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      )}

      {/* Estado: error de carga */}
      {!loading && error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg border border-red-200">
          Error al cargar salones: {error}
        </div>
      )}

      {/* Estado: sin salones */}
      {!loading && !error && classrooms.length === 0 && (
        <div className="text-center py-16 border-2 border-dashed border-gray-300 rounded-2xl">
          <p className="text-gray-500 text-lg mb-2">No tienes salones aún.</p>
          <p className="text-gray-400 text-sm">
            Crea uno nuevo o únete con un código de invitación.
          </p>
        </div>
      )}

      {/* Lista de salones */}
      {!loading && !error && classrooms.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {classrooms.map(classroom => (
            <Card
              key={classroom.id}
              className="flex flex-col justify-between hover:border-blue-300 transition-colors"
            >
              <div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-xl font-bold text-gray-900">
                    {classroom.name}
                  </h3>
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      classroom.role === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {classroom.role === 'admin' ? 'Admin' : 'Miembro'}
                  </span>
                </div>
                <p className="text-sm text-gray-400 font-mono mb-6">
                  Código: {classroom.invite_code}
                </p>
              </div>
              <Link href={`/salon/${classroom.id}`} className="w-full">
                <Button variant="outline" className="w-full">
                  Ver salón
                </Button>
              </Link>
            </Card>
          ))}
        </div>
      )}
    </Container>
  )
}
