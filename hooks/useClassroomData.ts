'use client'

import { useQuery } from '@tanstack/react-query'
import {
  getClassroomBySlug,
  getClassroomById,
  getClassroomMembers,
} from '@/services/classrooms'
import { Classroom, ClassroomMemberWithProfile } from '@/types'

const CLASSROOM_QUERY_KEY_PREFIX = 'classroom'

export function useClassroomData(slug: string) {
  // Query para obtener el classroom por slug
  const { data: classroomData, isLoading: slugLoading } = useQuery({
    queryKey: [CLASSROOM_QUERY_KEY_PREFIX, 'slug', slug],
    queryFn: async () => {
      if (!slug) return null
      return await getClassroomBySlug(slug)
    },
    enabled: !!slug,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const classroomId = classroomData?.id

  // Query para obtener detalles del classroom
  const { data: classroom, isLoading: classroomLoading } = useQuery({
    queryKey: [CLASSROOM_QUERY_KEY_PREFIX, 'details', classroomId],
    queryFn: async () => {
      if (!classroomId) return null
      return await getClassroomById(classroomId)
    },
    enabled: !!classroomId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  // Query para obtener miembros del classroom
  const { data: members = [], isLoading: membersLoading } = useQuery({
    queryKey: [CLASSROOM_QUERY_KEY_PREFIX, 'members', classroomId],
    queryFn: async () => {
      if (!classroomId) return []
      return await getClassroomMembers(classroomId)
    },
    enabled: !!classroomId,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  return {
    classroom: classroom || null,
    members,
    loading: slugLoading || classroomLoading || membersLoading,
    realId: classroomId || null,
  }
}
