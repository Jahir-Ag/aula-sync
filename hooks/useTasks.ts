'use client'

import { useState, useCallback } from 'react'
import { addDays, format, isWeekend } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import {
  getTasksByDate,
  createTask as createTaskService,
  updateTask as updateTaskService,
  deleteTask as deleteTaskService,
} from '@/services/tasks'
import { Task } from '@/types'

function addBusinessDays(date: Date, skipAmount: number): Date {
  let result = new Date(date)
  const step = skipAmount > 0 ? 1 : -1
  let remaining = Math.abs(skipAmount)
  while (remaining > 0) {
    result = addDays(result, step)
    if (!isWeekend(result)) remaining--
  }
  return result
}

function toNearestBusinessDay(date: Date): Date {
  if (!isWeekend(date)) return date
  return addBusinessDays(date, 1)
}

const TASKS_QUERY_KEY_PREFIX = 'tasks'

export function useTasks(classroomId: string) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const [currentDate, setCurrentDate] = useState<Date>(() =>
    toNearestBusinessDay(addDays(new Date(), 1))
  )

  const dateStr = format(currentDate, 'yyyy-MM-dd')
  const tasksQueryKey = [TASKS_QUERY_KEY_PREFIX, classroomId, dateStr]

  const { data: tasks = [], isLoading, error, refetch } = useQuery({
    queryKey: tasksQueryKey,
    queryFn: async () => {
      if (!classroomId) return []
      try {
        return await getTasksByDate(classroomId, dateStr)
      } catch (err) {
        console.error('Error fetching tasks:', err)
        throw err
      }
    },
    enabled: !!classroomId,
    staleTime: 1000 * 60 * 5, // 5 minutos
    retry: 1, // Solo 1 reintento para evitar múltiples solicitudes
    retryDelay: (attemptIndex) => Math.min(1000 * Math.pow(2, attemptIndex), 5000), // Max 5 segundos
  })

  const goNext = () => setCurrentDate(prev => addBusinessDays(prev, 1))
  const goPrev = () => setCurrentDate(prev => addBusinessDays(prev, -1))
  const goToDate = (date: Date) => setCurrentDate(toNearestBusinessDay(date))

  const createTask = async (data: {
    title: string
    description?: string
    subject?: string
    due_date: string
  }) => {
    if (!user) throw new Error('Usuario no autenticado')
    try {
      const task = await createTaskService({
        ...data,
        classroom_id: classroomId,
        created_by: user.id,
      })
      // Invalidar todas las queries de tareas de este salón y esperar a que se refresque
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY_PREFIX, classroomId] }),
        queryClient.invalidateQueries({ queryKey: ['task-dates', classroomId] }),
      ])
      return task
    } catch (err) {
      console.error('Error creating task:', err)
      throw err
    }
  }

  const updateTask = async (
    id: string,
    data: Partial<Pick<Task, 'title' | 'description' | 'subject' | 'due_date'>>
  ) => {
    try {
      const updated = await updateTaskService(id, data)
      // Invalidar todas las queries de tareas de este salón
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY_PREFIX, classroomId] }),
        queryClient.invalidateQueries({ queryKey: ['task-dates', classroomId] }),
      ])
      return updated
    } catch (err) {
      console.error('Error updating task:', err)
      throw err
    }
  }

  const deleteTask = async (id: string) => {
    try {
      await deleteTaskService(id)
      // Invalidar todas las queries de tareas de este salón
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: [TASKS_QUERY_KEY_PREFIX, classroomId] }),
        queryClient.invalidateQueries({ queryKey: ['task-dates', classroomId] }),
      ])
    } catch (err) {
      console.error('Error deleting task:', err)
      throw err
    }
  }

  return {
    tasks,
    loading: isLoading,
    error: error?.message || null,
    currentDate,
    dateStr,
    goNext,
    goPrev,
    goToDate,
    createTask,
    updateTask,
    deleteTask,
    fetchTasks: () => queryClient.refetchQueries({ queryKey: tasksQueryKey }),
  }
}
