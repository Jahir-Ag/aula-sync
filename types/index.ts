// ============================================================
// Tipos centrales de AulaSync
// ============================================================

export interface Profile {
  id: string
  nombre_usuario: string
  nombre_hijo: string
  created_at: string
}

export interface Classroom {
  id: string
  name: string
  invite_code: string
  created_by: string
  created_at: string
  subjects?: string[]
}

export interface ClassroomMember {
  id: string
  user_id: string
  classroom_id: string
  role: 'admin' | 'member'
  created_at: string
}

export interface ClassroomMemberWithProfile extends ClassroomMember {
  profiles: Pick<Profile, 'nombre_usuario' | 'nombre_hijo'> | null
}

export interface ClassroomWithRole extends Classroom {
  role: 'admin' | 'member'
}

export interface Task {
  id: string
  classroom_id: string
  title: string
  description?: string
  subject?: string
  due_date: string
  created_by: string
  is_completed: boolean
  created_at: string
}
