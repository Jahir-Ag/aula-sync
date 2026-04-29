'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Header } from '@/components/ui/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, hasProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return
    if (!user) {
      router.replace('/login')
      return
    }
    if (!hasProfile) {
      router.replace('/registro')
    }
  }, [user, hasProfile, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!user || !hasProfile) return null

  return (
    <>
      <Header />
      <main>{children}</main>
    </>
  )
}
