import { supabase } from '@/lib/supabaseClient'
import { Classroom, ClassroomWithRole, ClassroomMemberWithProfile } from '@/types'
import { generateUniqueCode } from '@/lib/utils/generateCode'
import { runWithAuthRecovery } from '@/lib/utils/supabaseHelper'

// Timeout de 20 segundos para operaciones (supabase puede demorarse)
const OPERATION_TIMEOUT = 20000

// ─── Crear salón ────────────────────────────────────────────
export async function createClassroom(
  name: string,
  userId: string,
  subjects: string[] = []
): Promise<Classroom> {
  if (!name || name.trim().length < 3) {
    throw new Error('El nombre del salón debe tener al menos 3 caracteres.')
  }

  const invite_code = await generateUniqueCode()

  const { data: classroom, error: createError } = await runWithAuthRecovery(
    () =>
      supabase
        .from('classrooms')
        .insert([{ name: name.trim(), created_by: userId, invite_code, subjects }])
        .select()
        .single(),
    { operationName: 'createClassroom', timeoutMs: OPERATION_TIMEOUT }
  )

  if (createError) throw createError

  const { error: memberError } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').insert({ user_id: userId, classroom_id: classroom.id, role: 'admin' }),
    { operationName: 'createClassroom_memberInsert', timeoutMs: OPERATION_TIMEOUT }
  )

  if (memberError) throw memberError

  return classroom
}

// ─── Obtener salones del usuario ─────────────────────────────
export async function getMyClassrooms(
  userId: string
): Promise<ClassroomWithRole[]> {
  const { data, error } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').select('role, classrooms!classroom_id(*)').eq('user_id', userId),
    { operationName: 'getMyClassrooms', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) {
    console.error('Error fetching classrooms:', error)
    throw error
  }
  // debug: data available in returned value if needed

  type ClassroomMemberRow = {
    role: string
    classrooms: Classroom | null
  }

  return ((data || []) as ClassroomMemberRow[])
    .filter((row) => row.classrooms)
    .map((row) => ({
      ...(row.classrooms as Classroom),
      role: row.role as 'admin' | 'member',
    }))
}

// ─── Unirse a salón por código ────────────────────────────────
export async function joinClassroom(
  code: string,
  userId: string
): Promise<Classroom> {
  const { data: classroom, error: findError } = await runWithAuthRecovery(
    () => supabase.from('classrooms').select('*').eq('invite_code', code.toUpperCase().trim()).maybeSingle(),
    { operationName: 'joinClassroom_find', timeoutMs: OPERATION_TIMEOUT }
  )

  if (findError) {
    console.error('Error fetching classroom by invite code:', findError)
    throw findError
  }
  if (!classroom) throw new Error('Código inválido. No existe ningún salón con ese código.')

  const { data: existing } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').select('id').eq('classroom_id', classroom.id).eq('user_id', userId).maybeSingle(),
    { operationName: 'joinClassroom_existing', timeoutMs: OPERATION_TIMEOUT }
  )

  if (existing) throw new Error('Ya perteneces a este salón.')

  const { error: joinError } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').insert({ user_id: userId, classroom_id: classroom.id, role: 'member' }),
    { operationName: 'joinClassroom_insert', timeoutMs: OPERATION_TIMEOUT }
  )

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
  const { data: myMembership } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').select('role').eq('classroom_id', classroomId).eq('user_id', userId).single(),
    { operationName: 'leaveClassroom_myMembership', timeoutMs: OPERATION_TIMEOUT }
  )

  if (myMembership?.role === 'admin') {
    const { data: admins } = await runWithAuthRecovery(
      () => supabase.from('classroom_members').select('id').eq('classroom_id', classroomId).eq('role', 'admin'),
      { operationName: 'leaveClassroom_admins', timeoutMs: OPERATION_TIMEOUT }
    )

    if ((admins?.length ?? 0) === 1) {
      throw new Error('No puedes salir: eres el único administrador de este salón.')
    }
  }

  const { error } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').delete().eq('classroom_id', classroomId).eq('user_id', userId),
    { operationName: 'leaveClassroom_delete', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) throw error
}

// ─── Eliminar salón (solo admin) ──────────────────────────────
export async function deleteClassroom(
  classroomId: string,
  userId: string
): Promise<void> {
  const { data: membership } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').select('role').eq('classroom_id', classroomId).eq('user_id', userId).single(),
    { operationName: 'deleteClassroom_membership', timeoutMs: OPERATION_TIMEOUT }
  )

  if (membership?.role !== 'admin') {
    throw new Error('No tienes permisos para eliminar este salón.')
  }

  const { error } = await runWithAuthRecovery(
    () => supabase.from('classrooms').delete().eq('id', classroomId),
    { operationName: 'deleteClassroom_delete', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) throw error
}

// ─── Obtener salón por ID ─────────────────────────────────────
export async function getClassroomById(id: string): Promise<Classroom> {
  const { data, error } = await runWithAuthRecovery(
    () => supabase.from('classrooms').select('*').eq('id', id).single(),
    { operationName: 'getClassroomById', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) throw error
  return data
}

// ─── Actualizar salón (nombre + subjects) ──────────────────────────
export async function updateClassroom(
  classroomId: string,
  updates: { name?: string; subjects?: string[] },
  userId: string
): Promise<void> {
  const { data: membership } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').select('role').eq('classroom_id', classroomId).eq('user_id', userId).single(),
    { operationName: 'updateClassroom_membership', timeoutMs: OPERATION_TIMEOUT }
  )

  if (membership?.role !== 'admin') {
    throw new Error('Solo el administrador puede editar el salón.')
  }

  const payload: any = {}
  if (typeof updates.name === 'string') payload.name = updates.name.trim()
  if (Array.isArray(updates.subjects)) payload.subjects = updates.subjects

  const { error } = await runWithAuthRecovery(
    () => supabase.from('classrooms').update(payload).eq('id', classroomId),
    { operationName: 'updateClassroom_update', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) throw error
}

// ─── Obtener salón por slug (nombre) ──────────────────────────
export async function getClassroomBySlug(slug: string): Promise<Classroom | null> {
  // Busca por nombre exacto (case-insensitive)
  const { data: classrooms, error } = await runWithAuthRecovery(
    () => supabase.from('classrooms').select('*'),
    { operationName: 'getClassroomBySlug_all', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) throw error

  // Filtrar localmente por slug
  const classroom = classrooms?.find((c: Classroom) => {
    const cSlug = c.name
      .toLowerCase()
      .trim()
      .replace(/[áéíóú]/g, (char: string) => {
        const map: Record<string, string> = { á: 'a', é: 'e', í: 'i', ó: 'o', ú: 'u' }
        return map[char] || char
      })
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
    return cSlug === slug
  })

  return classroom || null
}

// ─── Actualizar nombre (solo admin) ──────────────────────────
export async function updateClassroomName(
  classroomId: string,
  name: string,
  userId: string
): Promise<void> {
  const { data: membership } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').select('role').eq('classroom_id', classroomId).eq('user_id', userId).single(),
    { operationName: 'updateClassroomName_membership', timeoutMs: OPERATION_TIMEOUT }
  )

  if (membership?.role !== 'admin') {
    throw new Error('Solo el administrador puede cambiar el nombre del salón.')
  }

  const { error } = await runWithAuthRecovery(
    () => supabase.from('classrooms').update({ name: name.trim() }).eq('id', classroomId),
    { operationName: 'updateClassroomName_update', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) throw error
}

// ─── Obtener miembros del salón (con nombre del profile) ──────
export async function getClassroomMembers(
  classroomId: string
): Promise<ClassroomMemberWithProfile[]> {
  const { data, error } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').select('*, profiles(nombre_usuario, nombre_hijo)').eq('classroom_id', classroomId).order('created_at', { ascending: true }),
    { operationName: 'getClassroomMembers', timeoutMs: OPERATION_TIMEOUT }
  )

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
  const { data: requesterMembership } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').select('role').eq('classroom_id', classroomId).eq('user_id', requesterId).single(),
    { operationName: 'changeUserRole_requesterMembership', timeoutMs: OPERATION_TIMEOUT }
  )

  if (requesterMembership?.role !== 'admin') {
    throw new Error('Solo el administrador puede cambiar roles.')
  }

  // Evitar degradar al único admin
  if (newRole === 'member') {
    const { data: admins } = await runWithAuthRecovery(
      () => supabase.from('classroom_members').select('id').eq('classroom_id', classroomId).eq('role', 'admin'),
      { operationName: 'changeUserRole_admins', timeoutMs: OPERATION_TIMEOUT }
    )

    const targetIsAdmin = await runWithAuthRecovery(
      () => supabase.from('classroom_members').select('role').eq('classroom_id', classroomId).eq('user_id', targetUserId).single(),
      { operationName: 'changeUserRole_targetIsAdmin', timeoutMs: OPERATION_TIMEOUT }
    )

    if (targetIsAdmin.data?.role === 'admin' && (admins?.length ?? 0) === 1) {
      throw new Error('No puedes degradar al único administrador del salón.')
    }
  }

  const { error } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').update({ role: newRole }).eq('classroom_id', classroomId).eq('user_id', targetUserId),
    { operationName: 'changeUserRole_update', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) throw error
}

// ─── Remover miembro del salón (solo admin) ───────────────────
export async function removeMember(
  classroomId: string,
  targetUserId: string,
  requesterId: string
): Promise<void> {
  const { data: requesterMembership } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').select('role').eq('classroom_id', classroomId).eq('user_id', requesterId).single(),
    { operationName: 'removeMember_requesterMembership', timeoutMs: OPERATION_TIMEOUT }
  )

  if (requesterMembership?.role !== 'admin') {
    throw new Error('Solo el administrador puede remover miembros.')
  }

  // El trigger de DB también lo protege si fuera el único admin
  const { error } = await runWithAuthRecovery(
    () => supabase.from('classroom_members').delete().eq('classroom_id', classroomId).eq('user_id', targetUserId),
    { operationName: 'removeMember_delete', timeoutMs: OPERATION_TIMEOUT }
  )

  if (error) throw error
}
