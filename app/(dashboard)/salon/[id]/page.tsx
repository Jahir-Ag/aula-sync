'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { differenceInDays, format, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  Calendar,
  Check,
  ChevronLeft,
  ChevronRight,
  Copy,
  LogOut,
  MoreVertical,
  Pencil,
  Settings,
  Share2,
  ShieldAlert,
  ShieldCheck,
  Trash2,
  UserMinus,
  Users,
  X,
} from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useClassroomData } from '@/hooks/useClassroomData'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import { changeUserRole, leaveClassroom, removeMember } from '@/services/classrooms'
import { Task } from '@/types'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { ExpandableDescription } from '@/components/ExpandableDescription'
import { ResponsiveDatePicker } from '@/components/ResponsiveDatePicker'

const DEFAULT_SUBJECTS = [
  'Matemáticas',
  'Español',
  'Inglés',
  'Cívica',
  'Geografía',
  'Educación Física',
  'Ciencias Naturales',
  'Historia',
  'F.D.C.',
  'Tecnología de la Información',
]

function normalizeSubject(subject: string) {
  return subject.trim().replace(/\s+/g, ' ')
}

function buildSubjectOptions(baseSubjects: string[], currentSubject?: string) {
  const options = [...baseSubjects]
  const normalizedCurrent = normalizeSubject(currentSubject || '')

  if (!normalizedCurrent) {
    return options
  }

  const exists = options.some(
    (subject) => subject.toLocaleLowerCase('es') === normalizedCurrent.toLocaleLowerCase('es')
  )

  if (!exists) {
    options.push(normalizedCurrent)
  }

  return options
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Error inesperado'
}

function getCreatorName(userId: string, members: Array<{ user_id: string; profiles: { nombre_usuario?: string } | null }>) {
  return members.find((member) => member.user_id === userId)?.profiles?.nombre_usuario || 'Usuario desconocido'
}

export default function SalonPage() {
  const params = useParams()
  const router = useRouter()
  const slug = params.id as string
  const { user } = useAuth()
  const { showToast } = useToast()

  const { classroom, members, loading: loadingClassroom, realId } = useClassroomData(slug)
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
    goToDate,
  } = useTasks(realId || '')

  const [menuOpen, setMenuOpen] = useState(false)
  const [showMembers, setShowMembers] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState<'navigate' | 'create' | 'edit' | null>(null)

  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newDueDate, setNewDueDate] = useState(() => format(new Date(), 'yyyy-MM-dd'))
  const [creating, setCreating] = useState(false)
  const [showLeaveModal, setShowLeaveModal] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  useEffect(() => {
    if (!loadingClassroom && !classroom) {
      showToast('Salón no encontrado', 'error')
      router.push('/salones')
    }
  }, [classroom, loadingClassroom, router, showToast])

  const myMembership = members.find((member) => member.user_id === user?.id)
  const isAdmin = myMembership?.role === 'admin'
  const classroomSubjects =
    Array.isArray(classroom?.subjects) && classroom.subjects.length > 0
      ? classroom.subjects
      : DEFAULT_SUBJECTS
  const createSubjectOptions = buildSubjectOptions(classroomSubjects)
  const editSubjectOptions = buildSubjectOptions(classroomSubjects, editSubject)

  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newTitle.trim()) return

    setCreating(true)

    try {
      await createTask({
        title: newTitle.trim(),
        description: newDesc.trim() || undefined,
        subject: normalizeSubject(newSubject) || undefined,
        due_date: newDueDate,
      })
      setNewTitle('')
      setNewDesc('')
      setNewSubject('')
      setShowCreate(false)
      showToast('Tarea creada', 'success')
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error')
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
        subject: normalizeSubject(editSubject) || undefined,
        due_date: editDueDate,
      })
      setEditingId(null)
      showToast('Tarea actualizada', 'success')
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setSaving(false)
    }
  }

  const startEdit = (task: Task) => {
    setEditingId(task.id)
    setEditTitle(task.title)
    setEditDesc(task.description || '')
    setEditSubject(task.subject || '')
    setEditDueDate(task.due_date)
  }

  const handleDelete = async () => {
    if (!taskToDelete) return

    try {
      await deleteTask(taskToDelete)
      showToast('Tarea eliminada', 'info')
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setTaskToDelete(null)
    }
  }

  const handleCopyCode = () => {
    if (!classroom) return

    navigator.clipboard.writeText(classroom.invite_code)
    showToast('Código copiado al portapapeles', 'success')
    setMenuOpen(false)
  }

  const handleShareWhatsApp = () => {
    if (!classroom) return

    const url = `${window.location.origin}/invite?code=${classroom.invite_code}`
    const text = `¡Únete a mi salón "${classroom.name}" en AulaSync!\nEnlace: ${url}`

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank')
    setMenuOpen(false)
  }

  const handleLeave = () => {
    setShowLeaveModal(true)
  }

  const handleOpenCreate = () => {
    setNewDueDate(format(currentDate, 'yyyy-MM-dd'))
    setShowCreate(true)
  }

  const confirmLeave = async () => {
    try {
      if (members.length === 1) {
        showToast('Salón eliminado (eras el único miembro)', 'info')
      }

      await leaveClassroom(realId!, user!.id)
      showToast('Has salido del salón', 'info')
      router.push('/salones')
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setShowLeaveModal(false)
    }
  }

  const handleRoleChange = async (targetId: string, newRole: 'admin' | 'member') => {
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) return

    try {
      await changeUserRole(realId!, targetId, newRole, user!.id)
      showToast('Rol actualizado', 'success')
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  const handleRemoveMember = async (targetId: string) => {
    if (!confirm('¿Eliminar a este usuario del salón?')) return

    try {
      await removeMember(realId!, targetId, user!.id)
      showToast('Miembro eliminado', 'info')
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error')
    }
  }

  const dateLabel = format(currentDate, "EEEE d 'de' MMMM", { locale: es })
  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const isTodayDate = dateStr === format(new Date(), 'yyyy-MM-dd')
  const isTomorrowDate =
    dateStr === format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd')
  const dateBadge = isTodayDate ? 'Hoy' : isTomorrowDate ? 'Mañana' : null

  const getTaskColorClass = (task: Task) => {
    const [year, month, day] = task.due_date.split('-').map(Number)
    const due = new Date(year, month - 1, day)
    const today = startOfDay(new Date())
    const diff = differenceInDays(due, today)

    if (diff <= 1) return 'border-l-4 border-l-red-500'
    if (diff <= 7) return 'border-l-4 border-l-yellow-400'
    return 'border-l-4 border-l-gray-300'
  }

  return (
    <Container>
      <div className="relative mb-8 flex items-start justify-between">
        <div>
          <Link
            href="/salones"
            className="mb-1 inline-block text-sm text-blue-600 hover:underline"
          >
            ← Volver a Mis Salones
          </Link>
          <div className="mt-1 flex items-center gap-3">
            <h1 className="min-w-0 text-3xl font-bold text-gray-900">
              {loadingClassroom ? (
                <span className="inline-block h-8 w-48 animate-pulse rounded-lg bg-gray-200" />
              ) : (
                classroom?.name || 'Salón'
              )}
            </h1>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="flex items-center gap-1 rounded-full bg-gray-100 px-2 py-1 text-sm text-gray-500 transition-colors hover:text-blue-600"
            >
              <Users className="h-4 w-4" />
              {members.length}
            </button>
          </div>
          {classroom?.invite_code && (
            <p className="mt-1 text-sm text-gray-500">
              Código de invitación:{' '}
              <span className="rounded bg-gray-100 px-1 font-mono font-bold tracking-wider text-gray-800">
                {classroom.invite_code}
              </span>
            </p>
          )}
        </div>

        <div className="relative">
          <Button variant="outline" className="px-3" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreVertical className="h-5 w-5" />
          </Button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 z-20 mt-2 w-56 rounded-xl border border-gray-100 bg-white py-2 shadow-xl">
                <button
                  onClick={handleCopyCode}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Copy className="h-4 w-4" /> Copiar código
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Share2 className="h-4 w-4" /> Compartir en WhatsApp
                </button>
                {isAdmin && (
                  <button
                    onClick={() => {
                      setMenuOpen(false)
                      router.push(`/editar?classroomId=${realId}`)
                    }}
                    className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                  >
                    <Settings className="h-4 w-4" /> Editar
                  </button>
                )}
                <div className="my-1 h-px bg-gray-100" />
                <button
                  onClick={() => {
                    setMenuOpen(false)
                    setShowMembers(true)
                  }}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50"
                >
                  <Users className="h-4 w-4" /> Gestionar Miembros
                </button>
                <div className="my-1 h-px bg-gray-100" />
                <button
                  onClick={handleLeave}
                  className="flex w-full items-center gap-3 px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" /> Salir del salón
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {showMembers && (
        <Card className="mb-8 animate-[slideIn_0.2s_ease-out] border-gray-200 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-lg font-semibold">
              <Users className="h-5 w-5 text-gray-500" />
              Miembros del Salón
            </h3>
            <button
              onClick={() => setShowMembers(false)}
              className="text-gray-400 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          <div className="max-h-60 space-y-2 overflow-y-auto pr-2">
            {members.map((member) => (
              <div
                key={member.id}
                className="flex items-center justify-between rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <div>
                  <p className="font-medium text-gray-900">
                    {member.profiles?.nombre_usuario || 'Usuario desconocido'}
                    {member.user_id === user?.id && (
                      <span className="ml-2 text-xs font-normal text-gray-400">(Tú)</span>
                    )}
                  </p>
                  <p className="text-sm text-gray-500">
                    Apoderado de {member.profiles?.nombre_hijo}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <span
                    className={`flex items-center gap-1 rounded-full px-2 py-1 text-xs ${
                      member.role === 'admin'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-gray-200 text-gray-700'
                    }`}
                  >
                    {member.role === 'admin' ? (
                      <ShieldCheck className="h-3 w-3" />
                    ) : (
                      <Users className="h-3 w-3" />
                    )}
                    {member.role === 'admin' ? 'Admin' : 'Miembro'}
                  </span>

                  {isAdmin && member.user_id !== user?.id && (
                    <div className="ml-2 flex gap-1 border-l border-gray-200 pl-3">
                      {member.role === 'member' ? (
                        <button
                          onClick={() => handleRoleChange(member.user_id, 'admin')}
                          title="Hacer Admin"
                          className="rounded p-1.5 text-gray-400 hover:text-blue-600"
                        >
                          <ShieldAlert className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleRoleChange(member.user_id, 'member')}
                          title="Quitar Admin"
                          className="rounded p-1.5 text-blue-400 hover:text-gray-600"
                        >
                          <ShieldCheck className="h-4 w-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleRemoveMember(member.user_id)}
                        title="Expulsar"
                        className="rounded p-1.5 text-gray-400 hover:text-red-600"
                      >
                        <UserMinus className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <div className="mb-3 flex justify-end">
        <Button
          variant="outline"
          onClick={() => setShowDatePicker('navigate')}
          className="flex items-center gap-2 border-gray-200 bg-white text-sm shadow-sm hover:border-blue-300"
        >
          <Calendar className="h-4 w-4 text-blue-600" />
          Elegir fecha
        </Button>
      </div>

      <div className="mb-6 flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <button
          onClick={() => {
            setShowCreate(false)
            goPrev()
          }}
          className="rounded-xl p-2 transition-colors hover:bg-gray-50"
        >
          <ChevronLeft className="h-5 w-5 text-gray-600" />
        </button>

        <div className="text-center">
          <p className="text-lg font-semibold capitalize text-gray-900">{dateLabel}</p>
          {dateBadge && (
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-medium text-blue-700">
              {dateBadge}
            </span>
          )}
        </div>

        <button
          onClick={() => {
            setShowCreate(false)
            goNext()
          }}
          className="rounded-xl p-2 transition-colors hover:bg-gray-50"
        >
          <ChevronRight className="h-5 w-5 text-gray-600" />
        </button>
      </div>

      <div className="mb-4 flex justify-end">
        <Button onClick={handleOpenCreate}>+ Crear tarea</Button>
      </div>

      {showCreate && (
        <Card className="mb-6 border-sky-300 bg-sky-100">
          <h3 className="mb-4 text-lg font-bold text-sky-900">Nueva Tarea</h3>
          <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Título *</label>
                <Input
                  className="bg-white"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  required
                  placeholder="Ej. Leer capítulo 3"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-gray-700">Materia *</label>
                <select
                  value={newSubject}
                  onChange={(e) => setNewSubject(e.target.value)}
                  required
                  className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="" disabled>
                    Elegir materia
                  </option>
                  {createSubjectOptions.map((subject) => (
                    <option key={subject} value={subject}>
                      {subject}
                    </option>
                  ))}
                </select>
              </div>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Descripción (máx. 200 caracteres)
              </label>
              <Input
                className="bg-white"
                value={newDesc}
                onChange={(e) => setNewDesc(e.target.value)}
                maxLength={200}
                placeholder="Detalles de la tarea..."
              />
              <p className="mt-1 text-xs text-gray-500">{newDesc.length}/200</p>
            </div>
            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Fecha de entrega *
              </label>
              <div
                onClick={() => setShowDatePicker('create')}
                className="flex h-10 w-full cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <span className="text-gray-700">
                  {newDueDate
                    ? format(new Date(`${newDueDate}T12:00:00`), 'dd/MM/yyyy')
                    : 'Seleccionar fecha'}
                </span>
              </div>
            </div>
            <div className="mt-2 flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                className="bg-white"
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

      <div className="space-y-3" key={`tasks-${dateStr}`}>
        {loading && (
          <>
            {[1, 2].map((item) => (
              <div key={item} className="h-20 animate-pulse rounded-2xl bg-gray-200" />
            ))}
          </>
        )}

        {!loading && error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            Error al cargar tareas: {error}
            <button
              onClick={() => window.location.reload()}
              className="ml-2 font-medium underline hover:no-underline"
            >
              Recargar página
            </button>
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="rounded-2xl border-2 border-dashed border-gray-300 bg-white/50 py-12 text-center">
            <p className="font-medium text-gray-500">No hay tareas para este día.</p>
            <p className="mt-1 text-sm text-gray-400">
              ¡Usa el botón &quot;Crear tarea&quot; para agregar una!
            </p>
          </div>
        )}

        {!loading &&
          tasks.length > 0 &&
          tasks.map((task) => (
            <Card key={task.id} className={`py-4 transition-all ${getTaskColorClass(task)}`}>
              {editingId === task.id ? (
                <div className="flex flex-col gap-3">
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Título"
                  />
                  <select
                    value={editSubject}
                    onChange={(e) => setEditSubject(e.target.value)}
                    required
                    className="h-10 w-full rounded-md border border-gray-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="" disabled>
                      Elegir materia
                    </option>
                    {editSubjectOptions.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject}
                      </option>
                    ))}
                  </select>
                  <div>
                    <Input
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      maxLength={200}
                      placeholder="Descripción"
                    />
                    <p className="mt-1 text-xs text-gray-500">{editDesc.length}/200</p>
                  </div>
                  <div
                    onClick={() => setShowDatePicker('edit')}
                    className="flex h-10 w-full cursor-pointer items-center rounded-md border border-gray-300 bg-white px-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="text-gray-700">
                      {editDueDate
                        ? format(new Date(`${editDueDate}T12:00:00`), 'dd/MM/yyyy')
                        : 'Seleccionar fecha'}
                    </span>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="rounded-lg border border-gray-100 bg-white p-1.5 text-gray-400 hover:text-gray-600"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => handleEditSave(task)}
                      disabled={saving}
                      className="rounded-lg border border-gray-100 bg-white p-1.5 text-green-600 hover:text-green-700"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-start justify-between gap-3 sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="mb-1 flex items-center gap-2">
                        {task.subject && (
                          <span className="rounded-md bg-gray-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-gray-600">
                            {task.subject}
                          </span>
                        )}
                      </div>
                      <h4 className="text-base font-medium text-gray-900">{task.title}</h4>
                    </div>

                    {(task.created_by === user?.id || isAdmin) && (
                      <div className="flex shrink-0 self-start gap-1">
                        <button
                          onClick={() => startEdit(task)}
                          className="p-1.5 text-gray-400 transition-colors hover:text-blue-600"
                          title="Editar"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setTaskToDelete(task.id)}
                          className="p-1.5 text-gray-400 transition-colors hover:text-red-600"
                          title="Eliminar"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <ExpandableDescription text={task.description} />
                    <p className="mt-2 break-words text-xs text-gray-400 sm:text-sm">
                      Creado por: {getCreatorName(task.created_by, members)}
                    </p>
                  </div>
                </div>
              )}
            </Card>
          ))}
      </div>

      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-[slideIn_0.2s_ease-out]">
            <h3 className="mb-2 text-xl font-bold">¿Eliminar tarea?</h3>
            <p className="mb-6 text-gray-500">
              ¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setTaskToDelete(null)}>
                Cancelar
              </Button>
              <Button onClick={handleDelete} className="bg-red-600 text-white hover:bg-red-700">
                Eliminar
              </Button>
            </div>
          </Card>
        </div>
      )}

      {showDatePicker && (
        <ResponsiveDatePicker
          classroomId={realId || undefined}
          value={
            showDatePicker === 'navigate'
              ? format(currentDate, 'yyyy-MM-dd')
              : showDatePicker === 'create'
                ? newDueDate
                : editDueDate
          }
          onChange={(date) => {
            if (showDatePicker === 'navigate') {
              setShowCreate(false)
              goToDate(new Date(`${date}T12:00:00`))
              setShowDatePicker(null)
              return
            }

            if (showDatePicker === 'create') {
              setNewDueDate(date)
              return
            }

            setEditDueDate(date)
          }}
          onClose={() => setShowDatePicker(null)}
          onlyWeekdays={true}
        />
      )}

      {showLeaveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
          <Card className="w-full max-w-md animate-[slideIn_0.2s_ease-out]">
            <h3 className="mb-2 text-xl font-bold">¿Salir del salón?</h3>
            <p className="mb-6 text-gray-500">
              {members.length === 1
                ? 'Eres el único miembro; al salir el salón y sus registros se eliminarán.'
                : '¿Estás seguro de que deseas salir de este salón?'}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowLeaveModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={confirmLeave}
                className="bg-red-600 text-white hover:bg-red-700"
              >
                {members.length === 1 ? 'Salir y eliminar' : 'Salir'}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </Container>
  )
}
