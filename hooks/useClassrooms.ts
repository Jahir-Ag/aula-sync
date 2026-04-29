'use client'

import { useState, useEffect, useCallback } from 'react'
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

export function useClassrooms() {
  const { user } = useAuth()
  const [classrooms, setClassrooms] = useState<ClassroomWithRole[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchClassrooms = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setError(null)
    try {
      const data = await getMyClassrooms(user.id)
      setClassrooms(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [user])

  useEffect(() => {
    fetchClassrooms()
  }, [fetchClassrooms])

  const createClassroom = async (name: string) => {
    if (!user) return
    const classroom = await createClassroomService(name, user.id)
    await fetchClassrooms()
    return classroom
  }

  const joinClassroom = async (code: string) => {
    if (!user) return
    const classroom = await joinClassroomService(code, user.id)
    await fetchClassrooms()
    return classroom
  }

  const leaveClassroom = async (classroomId: string) => {
    if (!user) return
    await leaveClassroomService(classroomId, user.id)
    await fetchClassrooms()
  }

  const deleteClassroom = async (classroomId: string) => {
    if (!user) return
    await deleteClassroomService(classroomId, user.id)
    await fetchClassrooms()
  }

  const changeUserRole = async (
    classroomId: string,
    targetUserId: string,
    newRole: 'admin' | 'member'
  ) => {
    if (!user) return
    await changeUserRoleService(classroomId, targetUserId, newRole, user.id)
  }

  const removeMember = async (classroomId: string, targetUserId: string) => {
    if (!user) return
    await removeMemberService(classroomId, targetUserId, user.id)
  }

  return {
    classrooms,
    loading,
    error,
    fetchClassrooms,
    createClassroom,
    joinClassroom,
    leaveClassroom,
    deleteClassroom,
    changeUserRole,
    removeMember,
  }
}
