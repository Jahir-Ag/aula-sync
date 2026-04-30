'use client'

import { useState, useEffect, useCallback } from 'react'
import { addDays, format, isWeekend } from 'date-fns'
import { useAuth } from '@/contexts/AuthContext'
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

export function useTasks(classroomId: string) {
  const { user } = useAuth()

  const [currentDate, setCurrentDate] = useState<Date>(() =>
    toNearestBusinessDay(addDays(new Date(), 1))
  )
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const dateStr = format(currentDate, 'yyyy-MM-dd')

  const fetchTasks = useCallback(async () => {
    if (!classroomId) return
    setLoading(true)
    setError(null)
    try {
      const data = await getTasksByDate(classroomId, dateStr)
      setTasks(data)
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [classroomId, dateStr])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const goNext = () => setCurrentDate(prev => addBusinessDays(prev, 1))
  const goPrev = () => setCurrentDate(prev => addBusinessDays(prev, -1))
  const goToDate = (date: Date) => setCurrentDate(toNearestBusinessDay(date))

  const createTask = async (data: {
    title: string
    description?: string
    subject?: string
    due_date: string
  }) => {
    if (!user) return
    const task = await createTaskService({
      ...data,
      classroom_id: classroomId,
      created_by: user.id,
    })
    await fetchTasks()
    return task
  }

  const updateTask = async (
    id: string,
    data: Partial<Pick<Task, 'title' | 'description' | 'subject' | 'due_date'>>
  ) => {
    const updated = await updateTaskService(id, data)
    await fetchTasks()
    return updated
  }



  const deleteTask = async (id: string) => {
    await deleteTaskService(id)
    await fetchTasks()
  }

  return {
    tasks,
    loading,
    error,
    currentDate,
    dateStr,
    goNext,
    goPrev,
    goToDate,
    createTask,
    updateTask,
    deleteTask,
    fetchTasks,
  }
}
