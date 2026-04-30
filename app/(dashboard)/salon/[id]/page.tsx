'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { format, differenceInDays, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import {
  ChevronLeft, ChevronRight, Trash2, Pencil, X, Check,
  MoreVertical, Share2, Copy, LogOut, Users, ShieldAlert,
  ShieldCheck, UserMinus, CheckCircle2, Circle, Calendar
} from 'lucide-react'
import { useTasks } from '@/hooks/useTasks'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/contexts/ToastContext'
import {
  getClassroomById,
  getClassroomMembers,
  changeUserRole,
  removeMember,
  leaveClassroom
} from '@/services/classrooms'
import { Classroom, Task, ClassroomMemberWithProfile } from '@/types'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

const SUBJECTS = [
  'Matemáticas',
  'Español',
  'Inglés',
  'Cívica',
  'Geografía',
  'Educación Física',
  'Ciencias Naturales',
  'Historia',
  'F.D.C.',
  'Tecnología de la Información'
]

export default function SalonPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const { user } = useAuth()
  const { showToast } = useToast()

  const [classroom, setClassroom] = useState<Classroom | null>(null)
  const [members, setMembers] = useState<ClassroomMemberWithProfile[]>([])
  const [loadingClassroom, setLoadingClassroom] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const [showMembers, setShowMembers] = useState(false)

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
  } = useTasks(id)

  const [dateInputVal, setDateInputVal] = useState('')

  // Formularios
  const [showCreate, setShowCreate] = useState(false)
  const [newTitle, setNewTitle] = useState('')
  const [newDesc, setNewDesc] = useState('')
  const [newSubject, setNewSubject] = useState('')
  const [newDueDate, setNewDueDate] = useState(() =>
    format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd')
  )
  const [creating, setCreating] = useState(false)

  const [editingId, setEditingId] = useState<string | null>(null)
  const [editTitle, setEditTitle] = useState('')
  const [editDesc, setEditDesc] = useState('')
  const [editSubject, setEditSubject] = useState('')
  const [editDueDate, setEditDueDate] = useState('')
  const [saving, setSaving] = useState(false)

  // Modal de confirmación para eliminar
  const [taskToDelete, setTaskToDelete] = useState<string | null>(null)

  const fetchClassroomData = async () => {
    try {
      const cls = await getClassroomById(id)
      setClassroom(cls)
      const mems = await getClassroomMembers(id)
      setMembers(mems)
    } catch (err) {
      showToast('Error al cargar datos del salón', 'error')
    } finally {
      setLoadingClassroom(false)
    }
  }

  useEffect(() => {
    if (id) fetchClassroomData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  const myMembership = members.find(m => m.user_id === user?.id)
  const isAdmin = myMembership?.role === 'admin'

  const handleDateChange = (val: string, setter: (val: string) => void) => {
    if (!val) {
      setter(val)
      return
    }
    const date = new Date(val + 'T12:00:00')
    const day = date.getDay()
    if (day === 0 || day === 6) {
      showToast('Las fechas de entrega solo pueden ser de lunes a viernes.', 'error')
      return
    }
    setter(val)
  }

  // --- Acciones de Tareas ---
  const handleCreateTask = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTitle.trim()) return
    setCreating(true)
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
      showToast('Tarea creada', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
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
        subject: editSubject.trim() || undefined,
        due_date: editDueDate,
      })
      setEditingId(null)
      showToast('Tarea actualizada', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
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
    } catch (err: any) {
      showToast(err.message, 'error')
    } finally {
      setTaskToDelete(null)
    }
  }

  // --- Acciones de Salón ---
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

  const handleLeave = async () => {
    if (!confirm('¿Estás seguro de que deseas salir del salón?')) return
    try {
      await leaveClassroom(id, user!.id)
      showToast('Has salido del salón', 'info')
      router.push('/salones')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  // --- Acciones de Miembros ---
  const handleRoleChange = async (targetId: string, newRole: 'admin'|'member') => {
    if (!confirm(`¿Cambiar rol a ${newRole}?`)) return
    try {
      await changeUserRole(id, targetId, newRole, user!.id)
      await fetchClassroomData()
      showToast('Rol actualizado', 'success')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  const handleRemoveMember = async (targetId: string) => {
    if (!confirm('¿Eliminar a este usuario del salón?')) return
    try {
      await removeMember(id, targetId, user!.id)
      await fetchClassroomData()
      showToast('Miembro eliminado', 'info')
    } catch (err: any) {
      showToast(err.message, 'error')
    }
  }

  // --- UI Helpers ---
  const dateLabel = format(currentDate, "EEEE d 'de' MMMM", { locale: es })
  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const isTodayDate = dateStr === format(new Date(), 'yyyy-MM-dd')
  const isTomorrowDate = dateStr === format(new Date(new Date().setDate(new Date().getDate() + 1)), 'yyyy-MM-dd')
  const dateBadge = isTodayDate ? 'Hoy' : isTomorrowDate ? 'Mañana' : null

  // Colores de tarea
  const getTaskColorClass = (task: Task) => {
    // Parse due_date ignoring timezones properly
    const [y, m, d] = task.due_date.split('-').map(Number)
    const due = new Date(y, m - 1, d)
    const today = startOfDay(new Date())
    const diff = differenceInDays(due, today)

    if (diff <= 1) return 'border-l-4 border-l-red-500' // Hoy o mañana
    if (diff <= 7) return 'border-l-4 border-l-yellow-400' // Semana
    return 'border-l-4 border-l-gray-300' // Futuro lejano
  }

  return (
    <Container>
      {/* Encabezado del salón */}
      <div className="flex justify-between items-start mb-8 relative">
        <div>
          <Link
            href="/salones"
            className="text-sm text-blue-600 hover:underline mb-1 inline-block"
          >
            ← Volver a Mis Salones
          </Link>
          <div className="flex items-center gap-3 mt-1">
            <h1 className="text-3xl font-bold text-gray-900 min-w-0">
              {loadingClassroom ? (
                <span className="inline-block w-48 h-8 bg-gray-200 animate-pulse rounded-lg" />
              ) : (
                classroom?.name || `Salón ${id}`
              )}
            </h1>
            <button
              onClick={() => setShowMembers(!showMembers)}
              className="text-gray-500 hover:text-blue-600 flex items-center gap-1 text-sm bg-gray-100 px-2 py-1 rounded-full transition-colors"
            >
              <Users className="w-4 h-4" />
              {members.length}
            </button>
          </div>
          {classroom?.invite_code && (
            <p className="text-sm text-gray-500 mt-1">
              Código de invitación: <span className="font-mono font-bold tracking-wider text-gray-800 bg-gray-100 px-1 rounded">{classroom.invite_code}</span>
            </p>
          )}
        </div>

        {/* Menú de Salón */}
        <div className="relative">
          <Button variant="outline" className="px-3" onClick={() => setMenuOpen(!menuOpen)}>
            <MoreVertical className="w-5 h-5" />
          </Button>

          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 py-2 z-20">
                <button
                  onClick={handleCopyCode}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Copy className="w-4 h-4" /> Copiar código
                </button>
                <button
                  onClick={handleShareWhatsApp}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Share2 className="w-4 h-4" /> Compartir en WhatsApp
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={() => { setMenuOpen(false); setShowMembers(true) }}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
                >
                  <Users className="w-4 h-4" /> Gestionar Miembros
                </button>
                <div className="h-px bg-gray-100 my-1" />
                <button
                  onClick={handleLeave}
                  className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
                >
                  <LogOut className="w-4 h-4" /> Salir del salón
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Panel de Miembros */}
      {showMembers && (
        <Card className="mb-8 border-gray-200 shadow-sm animate-[slideIn_0.2s_ease-out]">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-gray-500" />
              Miembros del Salón
            </h3>
            <button onClick={() => setShowMembers(false)} className="text-gray-400 hover:text-gray-700">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
            {members.map(member => (
              <div key={member.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div>
                  <p className="font-medium text-gray-900">
                    {member.profiles?.nombre_usuario || 'Usuario desconocido'}
                    {member.user_id === user?.id && <span className="ml-2 text-xs text-gray-400 font-normal">(Tú)</span>}
                  </p>
                  <p className="text-sm text-gray-500">Apoderado de {member.profiles?.nombre_hijo}</p>
                </div>
                
                <div className="flex items-center gap-3">
                  <span className={`text-xs px-2 py-1 rounded-full flex items-center gap-1 ${
                    member.role === 'admin' ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'
                  }`}>
                    {member.role === 'admin' ? <ShieldCheck className="w-3 h-3"/> : <Users className="w-3 h-3"/>}
                    {member.role === 'admin' ? 'Admin' : 'Miembro'}
                  </span>
                  
                  {/* Controles de admin sobre otros miembros */}
                  {isAdmin && member.user_id !== user?.id && (
                    <div className="flex gap-1 ml-2 border-l border-gray-200 pl-3">
                      {member.role === 'member' ? (
                        <button onClick={() => handleRoleChange(member.user_id, 'admin')} title="Hacer Admin" className="p-1.5 text-gray-400 hover:text-blue-600 rounded">
                          <ShieldAlert className="w-4 h-4" />
                        </button>
                      ) : (
                        <button onClick={() => handleRoleChange(member.user_id, 'member')} title="Quitar Admin" className="p-1.5 text-blue-400 hover:text-gray-600 rounded">
                          <ShieldCheck className="w-4 h-4" />
                        </button>
                      )}
                      <button onClick={() => handleRemoveMember(member.user_id)} title="Expulsar" className="p-1.5 text-gray-400 hover:text-red-600 rounded">
                        <UserMinus className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Selector de fecha rápido */}
      <div className="flex justify-end mb-3">
        <div className="relative">
          <Button 
            variant="outline" 
            onClick={() => (document.getElementById('hidden-date-picker') as HTMLInputElement)?.showPicker()}
            className="flex items-center gap-2 text-sm bg-white border-gray-200 shadow-sm hover:border-blue-300"
          >
            <Calendar className="w-4 h-4 text-blue-600" />
            Elegir fecha
          </Button>
          <input 
            id="hidden-date-picker"
            type="date" 
            className="absolute invisible pointer-events-none opacity-0"
            value={dateInputVal}
            onChange={(e) => {
              const val = e.target.value;
              if (val) {
                goToDate(new Date(val + 'T12:00:00'));
                setDateInputVal(val);
              }
            }}
          />
        </div>
      </div>

      {/* Navegación de fecha */}
      <div className="flex items-center justify-between mb-6 bg-white rounded-2xl border border-gray-200 px-4 py-3 shadow-sm">
        <button 
          onClick={goPrev}
          className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
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
          className="p-2 hover:bg-gray-50 rounded-xl transition-colors"
        >
          <ChevronRight className="w-5 h-5 text-gray-600" />
        </button>
      </div>

      {/* Botón crear tarea */}
      <div className="flex justify-end mb-4">
        <Button onClick={() => setShowCreate(true)}>
          + Crear tarea
        </Button>
      </div>

      {/* Formulario crear tarea */}
      {showCreate && (
        <Card className="mb-6 border-sky-300 bg-sky-100">
          <h3 className="text-lg font-bold text-sky-900 mb-4">Nueva Tarea</h3>
          <form onSubmit={handleCreateTask} className="flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Título *</label>
                <Input className="bg-white" value={newTitle} onChange={e => setNewTitle(e.target.value)} required placeholder="Ej. Leer capítulo 3" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Materia *</label>
                <select
                  value={newSubject}
                  onChange={e => setNewSubject(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>Elegir materia</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Descripción</label>
              <Input className="bg-white" value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Detalles de la tarea..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Fecha de entrega *</label>
              <Input className="bg-white" type="date" value={newDueDate} onChange={e => handleDateChange(e.target.value, setNewDueDate)} required />
            </div>
            <div className="flex gap-2 justify-end mt-2">
              <Button variant="outline" type="button" className="bg-white" onClick={() => setShowCreate(false)}>Cancelar</Button>
              <Button type="submit" disabled={creating}>{creating ? 'Guardando...' : 'Guardar'}</Button>
            </div>
          </form>
        </Card>
      )}

      {/* Lista de tareas */}
      <div className="space-y-3">
        {loading && (
          <>{[1, 2].map(i => <div key={i} className="h-20 rounded-2xl bg-gray-200 animate-pulse" />)}</>
        )}

        {!loading && error && (
          <div className="p-4 bg-red-50 text-red-700 rounded-lg text-sm border border-red-200">
            Error al cargar tareas: {error}
          </div>
        )}

        {!loading && !error && tasks.length === 0 && (
          <div className="text-center py-12 border-2 border-dashed border-gray-300 rounded-2xl bg-white/50">
            <p className="text-gray-500 font-medium">No hay tareas para este día.</p>
            <p className="text-gray-400 text-sm mt-1">¡Usa el botón "Crear tarea" para agregar una!</p>
          </div>
        )}
        {/* Debug Log (can be removed later) */}
        {process.env.NODE_ENV === 'development' && (
          <div className="hidden">{console.log('Task state:', { loading, error, count: tasks.length })}</div>
        )}

        {!loading && tasks.map(task => (
          <Card key={task.id} className={`py-4 transition-all ${getTaskColorClass(task)}`}>
            {editingId === task.id ? (
              <div className="flex flex-col gap-3">
                <Input value={editTitle} onChange={e => setEditTitle(e.target.value)} placeholder="Título" />
                <select
                  value={editSubject}
                  onChange={e => setEditSubject(e.target.value)}
                  required
                  className="w-full h-10 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                >
                  <option value="" disabled>Elegir materia</option>
                  {SUBJECTS.map(s => <option key={s} value={s}>{s}</option>)}
                </select>
                <Input value={editDesc} onChange={e => setEditDesc(e.target.value)} placeholder="Descripción" />
                <Input type="date" value={editDueDate} onChange={e => handleDateChange(e.target.value, setEditDueDate)} />
                <div className="flex gap-2 justify-end">
                  <button onClick={() => setEditingId(null)} className="p-1.5 text-gray-400 hover:text-gray-600 bg-white rounded-lg border border-gray-100"><X className="w-5 h-5" /></button>
                  <button onClick={() => handleEditSave(task)} disabled={saving} className="p-1.5 text-green-600 hover:text-green-700 bg-white rounded-lg border border-gray-100"><Check className="w-5 h-5" /></button>
                </div>
              </div>
            ) : (
              <div className="flex gap-4 items-start pl-2">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    {task.subject && (
                      <span className="text-[10px] uppercase font-bold tracking-wider bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md">
                        {task.subject}
                      </span>
                    )}
                  </div>
                  <h4 className="text-base font-medium text-gray-900">
                    {task.title}
                  </h4>
                  {task.description && (
                     <p className="text-sm mt-0.5 text-gray-500">
                      {task.description}
                    </p>
                  )}
                </div>

                {/* Acciones */}
                {(task.created_by === user?.id || isAdmin) && (
                  <div className="flex gap-1 ml-4 shrink-0">
                    <button onClick={() => startEdit(task)} className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors" title="Editar">
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button onClick={() => setTaskToDelete(task.id)} className="p-1.5 text-gray-400 hover:text-red-600 transition-colors" title="Eliminar">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </Card>
        ))}
      </div>

      {/* Modal Confirmar Eliminación */}
      {taskToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <Card className="max-w-md w-full animate-[slideIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold mb-2">¿Eliminar tarea?</h3>
            <p className="text-gray-500 mb-6">¿Estás seguro de que deseas eliminar esta tarea? Esta acción no se puede deshacer.</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setTaskToDelete(null)}>Cancelar</Button>
              <Button onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Eliminar</Button>
            </div>
          </Card>
        </div>
      )}
    </Container>
  )
}
