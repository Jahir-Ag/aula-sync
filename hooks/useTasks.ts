import { useEffect, useState } from 'react'
import { getTomorrowTasks } from '@/services/tasks'

export const useTasks = (classroomId: string) => {
  const [tasks, setTasks] = useState<any[]>([])

  useEffect(() => {
    if (!classroomId) return
    getTomorrowTasks(classroomId).then(res => {
      setTasks((res as any).data || [])
    })
  }, [classroomId])

  return { tasks }
}
