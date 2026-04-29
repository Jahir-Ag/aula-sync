'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'

export default function Home() {
  const { user, hasProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/login')
    else if (!hasProfile) router.replace('/registro')
    else router.replace('/salones')
  }, [user, hasProfile, loading, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Cargando AulaSync...</p>
      </div>
    </div>
  )
}