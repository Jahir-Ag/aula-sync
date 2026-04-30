import { supabase } from '@/lib/supabaseClient'
import { Classroom, ClassroomWithRole, ClassroomMemberWithProfile } from '@/types'
import { generateUniqueCode } from '@/lib/utils/generateCode'

// ─── Crear salón ────────────────────────────────────────────
export async function createClassroom(
  name: string,
  userId: string
): Promise<Classroom> {
  if (!name || name.trim().length < 3) {
    throw new Error('El nombre del salón debe tener al menos 3 caracteres.')
  }

  const invite_code = await generateUniqueCode()

  const { data: classroom, error: createError } = await supabase
    .from('classrooms')
    .insert([{ name: name.trim(), created_by: userId, invite_code }])
    .select()
    .single()

  if (createError) throw createError

  const { error: memberError } = await supabase
    .from('classroom_members')
    .insert({ user_id: userId, classroom_id: classroom.id, role: 'admin' })

  if (memberError) throw memberError

  return classroom
}

// ─── Obtener salones del usuario ─────────────────────────────
export async function getMyClassrooms(
  userId: string
): Promise<ClassroomWithRole[]> {
  const { data, error } = await supabase
    .from('classroom_members')
    .select('role, classrooms!classroom_id(*)')
    .eq('user_id', userId)

  if (error) {
    console.error('Error fetching classrooms:', error)
    throw error
  }

  console.log('Classrooms fetched data:', JSON.stringify(data, null, 2))

  return (data || [])
    .filter((row: any) => row.classrooms)
    .map((row: any) => ({
      ...row.classrooms,
      role: row.role,
    }))
}

// ─── Unirse a salón por código ────────────────────────────────
export async function joinClassroom(
  code: string,
  userId: string
): Promise<Classroom> {
  const { data: classroom, error: findError } = await supabase
    .from('classrooms')
    .select('*')
    .eq('invite_code', code.toUpperCase().trim())
    .maybeSingle()

  if (findError) throw findError
  if (!classroom) throw new Error('Código inválido. No existe ningún salón con ese código.')

  const { data: existing } = await supabase
    .from('classroom_members')
    .select('id')
    .eq('classroom_id', classroom.id)
    .eq('user_id', userId)
    .maybeSingle()

  if (existing) throw new Error('Ya perteneces a este salón.')

  const { error: joinError } = await supabase
    .from('classroom_members')
    .insert({ user_id: userId, classroom_id: classroom.id, role: 'member' })

  if (joinError) throw joinError

  return classroom
}

// ─── Salir de un salón ────────────────────────────────────────
export async function leaveClassroom(
  classroomId: string,
  userId: string
): Promise<void> {
  // El trigger de DB lo rechazará si es el último admin.
  // Hacemos verificación previa en el cliente para mensaje amigable.
  const { data: myMembership } = await supabase
    .from('classroom_members')
    .select('role')
    .eq('classroom_id', classroomId)
    .eq('user_id', userId)
    .single()

  if (myMembership?.role === 'admin') {
    const { data: admins } = await supabase
      .from('classroom_members')
      .select('id')
      .eq('classroom_id', classroomId)
      .eq('role', 'admin')

    if ((admins?.length ?? 0) === 1) {
      throw new Error('No puedes salir: eres el único administrador de este salón.')
    }
  }

  const { error } = await supabase
    .from('classroom_members')
    .delete()
    .eq('classroom_id', classroomId)
    .eq('user_id', userId)

  if (error) throw error
}

// ─── Eliminar salón (solo admin) ──────────────────────────────
export async function deleteClassroom(
  classroomId: string,
  userId: string
): Promise<void> {
  const { data: membership } = await supabase
    .from('classroom_members')
    .select('role')
    .eq('classroom_id', classroomId)
    .eq('user_id', userId)
    .single()

  if (membership?.role !== 'admin') {
    throw new Error('No tienes permisos para eliminar este salón.')
  }

  const { error } = await supabase
    .from('classrooms')
    .delete()
    .eq('id', classroomId)

  if (error) throw error
}

// ─── Obtener salón por ID ─────────────────────────────────────
export async function getClassroomById(id: string): Promise<Classroom> {
  const { data, error } = await supabase
    .from('classrooms')
    .select('*')
    .eq('id', id)
    .single()

  if (error) throw error
  return data
}

// ─── Actualizar nombre (solo admin) ──────────────────────────
export async function updateClassroomName(
  classroomId: string,
  name: string,
  userId: string
): Promise<void> {
  const { data: membership } = await supabase
    .from('classroom_members')
    .select('role')
    .eq('classroom_id', classroomId)
    .eq('user_id', userId)
    .single()

  if (membership?.role !== 'admin') {
    throw new Error('Solo el administrador puede cambiar el nombre del salón.')
  }

  const { error } = await supabase
    .from('classrooms')
    .update({ name: name.trim() })
    .eq('id', classroomId)

  if (error) throw error
}

// ─── Obtener miembros del salón (con nombre del profile) ──────
export async function getClassroomMembers(
  classroomId: string
): Promise<ClassroomMemberWithProfile[]> {
  const { data, error } = await supabase
    .from('classroom_members')
    .select('*, profiles(nombre_usuario, nombre_hijo)')
    .eq('classroom_id', classroomId)
    .order('created_at', { ascending: true })

  if (error) throw error
  return (data || []) as ClassroomMemberWithProfile[]
}

// ─── Cambiar rol de un miembro (solo admin) ───────────────────
export async function changeUserRole(
  classroomId: string,
  targetUserId: string,
  newRole: 'admin' | 'member',
  requesterId: string
): Promise<void> {
  // Verificar que el requester sea admin
  const { data: requesterMembership } = await supabase
    .from('classroom_members')
    .select('role')
    .eq('classroom_id', classroomId)
    .eq('user_id', requesterId)
    .single()

  if (requesterMembership?.role !== 'admin') {
    throw new Error('Solo el administrador puede cambiar roles.')
  }

  // Evitar degradar al único admin
  if (newRole === 'member') {
    const { data: admins } = await supabase
      .from('classroom_members')
      .select('id')
      .eq('classroom_id', classroomId)
      .eq('role', 'admin')

    const targetIsAdmin = await supabase
      .from('classroom_members')
      .select('role')
      .eq('classroom_id', classroomId)
      .eq('user_id', targetUserId)
      .single()

    if (targetIsAdmin.data?.role === 'admin' && (admins?.length ?? 0) === 1) {
      throw new Error('No puedes degradar al único administrador del salón.')
    }
  }

  const { error } = await supabase
    .from('classroom_members')
    .update({ role: newRole })
    .eq('classroom_id', classroomId)
    .eq('user_id', targetUserId)

  if (error) throw error
}

// ─── Remover miembro del salón (solo admin) ───────────────────
export async function removeMember(
  classroomId: string,
  targetUserId: string,
  requesterId: string
): Promise<void> {
  const { data: requesterMembership } = await supabase
    .from('classroom_members')
    .select('role')
    .eq('classroom_id', classroomId)
    .eq('user_id', requesterId)
    .single()

  if (requesterMembership?.role !== 'admin') {
    throw new Error('Solo el administrador puede remover miembros.')
  }

  // El trigger de DB también lo protege si fuera el único admin
  const { error } = await supabase
    .from('classroom_members')
    .delete()
    .eq('classroom_id', classroomId)
    .eq('user_id', targetUserId)

  if (error) throw error
}
