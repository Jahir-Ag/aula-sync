'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Trash2, Pencil, X, Check } from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useAuth } from '@/contexts/AuthContext'
import { getClassroomById } from '@/services/classrooms'
import { Classroom, Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export default function SalonPage() {
  const params = useParams()
  const id = params.id as string
  const { user } = useAuth()

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [loadingClassroom, setLoadingClassroom] = useState(true)

  const {
    tasks,
    loading,
    error,
    currentDate,
    goNext,
    goPrev,
    createTask,
    updateTask,
    deleteTask,
  } = useTasks(id)

  // Estado formulario crear
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newDueDate, setNewDueDate] = useState(() =>
    format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd')
  )
  const [creating, setCreating] = useState(false)
  const [createError, setCreateError] = useState<string | null>(null)

  // Estado editar
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [saving, setSaving] = useState(false)

  // Cargar datos del salón
  useEffect(() => {
    if (!id) return
    getClassroomById(id)
      .then(setClassroom)
      .catch(() => {})
      .finally(() => setLoadingClassroom(false))
  }, [id])

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
    setCreateError(null)
    try {
      await createTask({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        subject: newSubject.trim() || undefined,
        due_date: newDueDate,
      })
      setNewTitle('')
      setNewDesc('')
      setNewSubject('')
      setShowCreate(false)
    } catch (err: any) {
      setCreateError(err.message)
    } finally {
      setCreating(false)
    }
  }

  const handleEditSave = async (task: Task) => {
    setSaving(true)
    try {
      await updateTask(task.id, {
        title: editTitle.trim(),
        description: editDesc.trim() || undefined,
      })
      setEditingId(null)
    } catch {
      // silencio — podría mostrar error en UI
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDesc(task.description || '')
  }

  const handleDelete = async (id: string) => {
    if (!confirm('¿Eliminar esta tarea?')) return
    await deleteTask(id)
  }

  const dateLabel = format(currentDate, "EEEE d 'de' MMMM", { locale: es })
  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const isToday = dateStr === format(new Date(), 'yyyy-MM-dd')
  const isTomorrow = dateStr === format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd')

  const dateBadge = isToday ? 'Hoy' : isTomorrow ? 'Mañana' : null

  return (
    <Container>
      {/* Encabezado del salón */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <Link
            href="/salones"
            className="text-sm text-blue-600 hover:underline mb-1 inline-block"
          >
            ← Volver a Mis Salones
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">
            {loadingClassroom ? '...' : classroom?.name ?? `Salón ${id}`}
          </h1>
          {classroom?.invite_code && (
            <p className="text-sm text-gray-400 font-mono mt-0.5">
              Código: <span className="font-semibold tracking-wider">{classroom.invite_code}</span>
            </p>
          )}
        </div>
        <Button variant="outline" className="text-sm">Ajustes</Button>
      </div>

      {/* Navegación de fecha */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-gray-200 px-4 py-3">
        <button
          onClick={goPrev}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Día anterior"
        >
          <ChevronLeft className="w-5 h-5 text-gray-600" />
        </button>

        <div className="text-center">
          <p className="text-lg font-semibold text-gray-900 capitalize">{dateLabel}</p>
          {dateBadge && (
            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
              {dateBadge}
            </span>
          )}
        </div>

        <button
          onClick={goNext}
          className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
          aria-label="Día siguiente"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Botón crear tarea */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => { setShowCreate(true); setCreateError(null) }}>
          + Crear tarea
        </Button>
      </div>

      {/* Formulario crear tarea */}
      {showCreate && (
        <Card className="mb-6 border-blue-200 bg-blue-50">
          <h3 className="text-lg font-semibold mb-4">Nueva Tarea</h3>
          {createError && (
            <div className="mb-3 p-2 bg-red-50 text-red-700 text-sm rounded">
              {createError}
            </div>
          )}
          <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
              <Input
                id="task-title"
                placeholder="Ej. Leer capítulo 3"
                value={newTitle}
                onChange={e => setNewTitle(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Materia</label>
              <Input
                id="task-subject"
                placeholder="Ej. Matemáticas"
                value={newSubject}
                onChange={e => setNewSubject(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <Input
                id="task-desc"
                placeholder="Detalles de la tarea..."
                value={newDesc}
                onChange={e => setNewDesc(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de entrega *</label>
              <Input
                id="task-due-date"
                type="date"
                value={newDueDate}
                onChange={e => setNewDueDate(e.target.value)}
                required
              />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => setShowCreate(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={creating}>
                {creating ? 'Guardando...' : 'Guardar'}
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de tareas */}
      <div className="space-y-3">
        {loading && (
          <>
            {[1, 2].map(i => (
              <div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse" />
            ))}
          </>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            Error al cargar tareas: {error}
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl">
            <p className="text-gray-500">No hay tareas para este día.</p>
            <p className="text-gray-400 text-sm mt-1">
              ¡Usa el botón "Crear tarea" para agregar una!
            </p>
          </div>
        )}

        {!loading &&
          tasks.map(task => (
            <Card key={task.id} className="py-4">
              {editingId === task.id ? (
                // Modo edición
                <div className="flex flex-col gap-2">
                  <Input
                    value={editTitle}
                    onChange={e => setEditTitle(e.target.value)}
                    placeholder="Título"
                  />
                  <Input
                    value={editDesc}
                    onChange={e => setEditDesc(e.target.value)}
                    placeholder="Descripción"
                  />
                  <div className="flex gap-2 justify-end mt-1">
                    <button
                      onClick={() => setEditingId(null)}
                      className="p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleEditSave(task)}
                      disabled={saving}
                      className="p-1.5 text-green-600 hover:text-green-700"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                // Vista normal
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2 mb-0.5">
                      {task.subject && (
                        <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                          {task.subject}
                        </span>
                      )}
                    </div>
                    <h4 className="text-base font-medium text-gray-900">{task.title}</h4>
                    {task.description && (
                      <p className="text-sm text-gray-500 mt-0.5">{task.description}</p>
                    )}
                    <p className="text-xs text-gray-400 mt-1">
                      Para: {task.due_date}
                    </p>
                  </div>
                  {/* Acciones — solo el creador o admin */}
                  {task.created_by === user?.id && (
                    <div className="flex gap-1 ml-4 shrink-0">
                      <button
                        onClick={() => startEdit(task)}
                        className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors"
                        title="Editar"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 transition-colors"
                        title="Eliminar"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </Card>
          ))}
      </div>
    </Container>
  )
}
