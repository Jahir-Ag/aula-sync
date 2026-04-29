'use client'

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { joinClassroom } from '@/services/classrooms'
import { useToast } from '@/contexts/ToastContext'
import { Container } from '@/components/ui/Container'

export default function InvitePage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { user, loading, hasProfile } = useAuth()
  const { showToast } = useToast()
  
  const code = searchParams.get('code')

  useEffect(() => {
    if (loading) return
    if (!code) {
      router.replace('/salones')
      return
    }

    if (!user) {
      sessionStorage.setItem('pending_invite', code)
      router.replace('/login')
      return
    }

    if (!hasProfile) {
      sessionStorage.setItem('pending_invite', code)
      router.replace('/registro')
      return
    }

    const join = async () => {
      try {
        await joinClassroom(code, user.id)
        showToast('Te has unido al salón exitosamente', 'success')
      } catch (err: any) {
        if (err.message !== 'Ya perteneces a este salón.') {
          showToast(err.message, 'error')
        }
      } finally {
        router.replace('/salones')
      }
    }

    join()
  }, [code, user, loading, hasProfile, router, showToast])

  return (
    <Container className="flex mt-20 items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-gray-500">Procesando invitación...</p>
      </div>
    </Container>
  )
}
