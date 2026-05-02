'use client'

import { useRef } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useAuth } from '@/contexts/AuthContext'
import {
  getMyClassrooms,
  createClassroom as createClassroomService,
  joinClassroom as joinClassroomService,
  leaveClassroom as leaveClassroomService,
  deleteClassroom as deleteClassroomService,
  changeUserRole as changeUserRoleService,
  removeMember as removeMemberService,
} from '@/services/classrooms'
import { ClassroomWithRole } from '@/types'

const CLASSROOMS_QUERY_KEY = ['classrooms']

export function useClassrooms() {
  const { user } = useAuth()
  const queryClient = useQueryClient()
  const hasMounted = useRef(false)

  const { data: classrooms = [], isLoading, error } = useQuery({
    queryKey: CLASSROOMS_QUERY_KEY,
    queryFn: async () => {
      if (!user) return []
      return await getMyClassrooms(user.id)
    },
    enabled: !!user,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })

  const createClassroom = async (name: string) => {
    if (!user) return
    const classroom = await createClassroomService(name, user.id)
    // Invalidar y refetch
    await queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY })
    return classroom
  }

  const joinClassroom = async (code: string) => {
    if (!user) return
    const classroom = await joinClassroomService(code, user.id)
    // Invalidar y refetch
    await queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY })
    return classroom
  }

  const leaveClassroom = async (classroomId: string) => {
    if (!user) return
    await leaveClassroomService(classroomId, user.id)
    // Invalidar y refetch
    await queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY })
  }

  const deleteClassroom = async (classroomId: string) => {
    if (!user) return
    await deleteClassroomService(classroomId, user.id)
    // Invalidar y refetch
    await queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY })
  }

  const changeUserRole = async (
    classroomId: string,
    targetUserId: string,
    newRole: 'admin' | 'member'
  ) => {
    if (!user) return
    await changeUserRoleService(classroomId, targetUserId, newRole, user.id)
    // Invalidar y refetch
    await queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY })
  }

  const removeMember = async (classroomId: string, targetUserId: string) => {
    if (!user) return
    await removeMemberService(classroomId, targetUserId, user.id)
    // Invalidar y refetch
    await queryClient.invalidateQueries({ queryKey: CLASSROOMS_QUERY_KEY })
  }

  return {
    classrooms,
    loading: isLoading,
    error: error?.message || null,
    fetchClassrooms: () => queryClient.refetchQueries({ queryKey: CLASSROOMS_QUERY_KEY }),
    createClassroom,
    joinClassroom,
    leaveClassroom,
    deleteClassroom,
    changeUserRole,
    removeMember,
  }
}
