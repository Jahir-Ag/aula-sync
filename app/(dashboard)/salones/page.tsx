'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { MoreVertical, Copy, Share2, LogOut, Trash2 } from 'lucide-react'
import { useClassrooms } from '@/hooks/useClassrooms'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Container } from '@/components/ui/Container'
import { Input } from '@/components/ui/Input'

export default function DashboardPage() {
  const { classrooms, loading, error, createClassroom, joinClassroom, leaveClassroom, deleteClassroom } =
    useClassrooms()
  const { user } = useAuth()
  const { showToast } = useToast()
  const router = useRouter()

  const PASTEL_COLORS = [
    'bg-white',
    'bg-pink-100',
    'bg-blue-100',
    'bg-green-100',
    'bg-yellow-100',
    'bg-purple-100',
    'bg-orange-100'
  ]

  const [classroomColors, setClassroomColors] = useState<Record<string, string>>({})

  useEffect(() => {
    const saved = localStorage.getItem('aula_sync_colors')
    if (saved) {
      setClassroomColors(JSON.parse(saved))
    }
  }, [])

  const changeColor = (classroomId: string, color: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const newColors = { ...classroomColors, [classroomId]: color }
    setClassroomColors(newColors)
    localStorage.setItem('aula_sync_colors', JSON.stringify(newColors))
  }

  // Procesar invitación pendiente si existe
  useEffect(() => {
    const pendingCode = sessionStorage.getItem('pending_invite')
    if (pendingCode && user) {
      sessionStorage.removeItem('pending_invite')
      joinClassroom(pendingCode)
        .then(() => showToast('Te has unido al salón de tu invitación', 'success'))
        .catch(err => {
          if (err.message !== 'Ya perteneces a este salón.') {
            showToast(err.message, 'error')
          }
        })
    }
  }, [user, joinClassroom, showToast])

  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [createName, setCreateName] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null)
  
  // Modal de confirmación para eliminar salón
  const [classroomToDelete, setClassroomToDelete] = useState<{id: string, name: string} | null>(null)

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await createClassroom(createName)
      setCreateName('')
      setShowCreate(false)
      showToast('Salón creado con éxito', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault()
    setActionLoading(true)
    try {
      await joinClassroom(joinCode)
      setJoinCode('')
      setShowJoin(false)
      showToast('Te has unido al salón', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setActionLoading(false)
    }
  }

  const handleCopyCode = (code: string, e: React.MouseEvent) => {
    e.stopPropagation()
    navigator.clipboard.writeText(code)
    showToast('Código copiado al portapapeles', 'success')
    setMenuOpenId(null)
  }

  const handleShareWhatsApp = (code: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    const url = `${window.location.origin}/invite?code=${code}`
    const text = `¡Únete a mi salón "${name}" en AulaSync!\nEnlace: ${url}`
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    setMenuOpenId(null)
  }

  const handleLeave = async (id: string, name: string, e: React.MouseEvent) => {
    e.stopPropagation()
    if (!confirm(`¿Estás seguro de que deseas salir del salón "${name}"?`)) return
    try {
      await leaveClassroom(id)
      showToast('Has salido del salón', 'info')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setMenuOpenId(null)
    }
  }

  const handleDelete = async () => {
    if (!classroomToDelete) return
    try {
      await deleteClassroom(classroomToDelete.id)
      showToast('Salón eliminado', 'info')
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setClassroomToDelete(null)
    }
  }

  return (
    <Container>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
        <h1 className="text-3xl font-bold text-gray-900">Mis Salones</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => { setShowJoin(true); setShowCreate(false) }}
          >
            Unirse con código
          </Button>
          <Button onClick={() => { setShowCreate(true); setShowJoin(false) }}>
            Crear salón
          </Button>
        </div>
      </div>

      {/* Formulario: Crear salón */}
      {showCreate && (
        <Card className="mb-8 border-blue-200 bg-blue-50">
          <h2 className="text-xl font-semibold mb-4">Nuevo Salón</h2>
          <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="submit" disabled={actionLoading} className="flex-1 sm:flex-none">
                {actionLoading ? 'Creando...' : 'Crear'}
              </Button>
              <Button variant="outline" type="button" onClick={() => setShowCreate(false)}>
                Cancelar
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Formulario: Unirse a salón */}
      {showJoin && (
        <Card className="mb-8 border-green-200 bg-green-50">
          <h2 className="text-xl font-semibold mb-4">Unirse a un salón</h2>
          <form onSubmit={handleJoin} className="flex flex-col sm:flex-row gap-4 items-end">
            <div className="flex-1 w-full">
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
            <div className="flex gap-2 w-full sm:w-auto">
              <Button type="submit" disabled={actionLoading} className="flex-1 sm:flex-none">
                {actionLoading ? 'Buscando...' : 'Unirse'}
              </Button>
              <Button variant="outline" type="button" onClick={() => setShowJoin(false)}>
                Cancelar
              </Button>
            </div>
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
          {classrooms.map(classroom => {
            const bgColor = classroomColors[classroom.id] || 'bg-white'
            return (
            <Card
              key={classroom.id}
              onClick={() => router.push(`/salon/${classroom.id}`)}
              className={`flex flex-col justify-between hover:border-blue-400 transition-colors relative group cursor-pointer h-40 ${bgColor}`}
            >
              <div>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-xl font-bold text-gray-900 pr-8 line-clamp-2">
                    {classroom.name}
                  </h3>
                  
                  {/* Menu 3 puntos */}
                  <div className="absolute top-4 right-4">
                    <button
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setMenuOpenId(menuOpenId === classroom.id ? null : classroom.id)
                      }}
                      className="p-1.5 text-gray-400 hover:text-gray-700 rounded-lg hover:bg-white/50 transition-colors"
                    >
                      <MoreVertical className="w-5 h-5" />
                    </button>

                    {menuOpenId === classroom.id && (
                      <>
                        <div 
                          className="fixed inset-0 z-10" 
                          onClick={(e) => {
                            e.stopPropagation();
                            setMenuOpenId(null);
                          }} 
                        />
                        <div className="absolute right-0 mt-1 w-56 bg-white rounded-xl shadow-lg border border-gray-100 py-1 z-20">
                          <button
                            onClick={(e) => handleCopyCode(classroom.invite_code, e)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Copy className="w-4 h-4" /> Copiar código
                          </button>
                          <button
                            onClick={(e) => handleShareWhatsApp(classroom.invite_code, classroom.name, e)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <Share2 className="w-4 h-4" /> Enviar WhatsApp
                          </button>
                          <div className="h-px bg-gray-100 my-1" />
                          <div className="px-4 py-2" onClick={e => e.stopPropagation()}>
                            <p className="text-xs text-gray-500 mb-2 font-medium">Color del salón</p>
                            <div className="flex gap-2 flex-wrap">
                              {PASTEL_COLORS.map(color => (
                                <button
                                  key={color}
                                  onClick={(e) => changeColor(classroom.id, color, e)}
                                  className={`w-6 h-6 rounded-full border border-gray-200 ${color} ${classroomColors[classroom.id] === color ? 'ring-2 ring-blue-500 ring-offset-1' : ''}`}
                                />
                              ))}
                            </div>
                          </div>
                          <div className="h-px bg-gray-100 my-1" />
                          <button
                            onClick={(e) => handleLeave(classroom.id, classroom.name, e)}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-2"
                          >
                            <LogOut className="w-4 h-4" /> Salir del salón
                          </button>
                          {classroom.role === 'admin' && (
                            <button
                              onClick={(e) => { e.stopPropagation(); setClassroomToDelete({ id: classroom.id, name: classroom.name }); setMenuOpenId(null); }}
                              className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                            >
                              <Trash2 className="w-4 h-4" /> Eliminar salón
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 mb-6">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                      classroom.role === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}
                  >
                    {classroom.role === 'admin' ? 'Admin' : 'Miembro'}
                  </span>
                  <span className="text-xs bg-white/80 border border-white shadow-sm text-gray-600 px-2 py-0.5 rounded-md font-mono tracking-wider flex items-center gap-1 backdrop-blur-sm">
                    <span className="text-[10px] text-gray-400">CÓDIGO:</span> {classroom.invite_code}
                  </span>
                </div>
              </div>
                <div className="w-full text-right mt-auto">
                  <span className="text-sm font-semibold text-blue-600 group-hover:text-blue-700 transition-colors">
                    Ver salón →
                  </span>
                </div>
            </Card>
          )})}
        </div>
      )}

      {/* Modal Confirmar Eliminación de Salón */}
      {classroomToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <Card className="max-w-md w-full animate-[slideIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold mb-2">¿Eliminar salón?</h3>
            <p className="text-gray-500 mb-6">
              ¿Estás seguro de que deseas eliminar definitivamente el salón "{classroomToDelete.name}"? Esta acción no se puede deshacer y borrará todas las tareas.
            </p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setClassroomToDelete(null)}>Cancelar</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</Button>
            </div>
          </Card>
        </div>
      )}
    </Container>
  )
}
