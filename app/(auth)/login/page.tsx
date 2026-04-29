'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { loginWithGoogle } from '@/services/auth'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'

export default function LoginPage() {
  const { user, hasProfile, loading } = useAuth()
  const router = useRouter()
  const [isLoggingIn, setIsLoggingIn] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (loading) return
    if (user && hasProfile) router.replace('/salones')
    else if (user && !hasProfile) router.replace('/registro')
  }, [user, hasProfile, loading, router])

  const handleLogin = async () => {
    setIsLoggingIn(true)
    setError(null)
    try {
      await loginWithGoogle()
    } catch (err: any) {
      setError(err.message || 'Error inesperado al iniciar sesión.')
    } finally {
      setIsLoggingIn(false)
    }
  }

  if (loading) return null

  return (
    <Container className="flex mt-20 items-center justify-center">
      <Card className="w-full max-w-md text-center py-12 px-8">
        <h1 className="text-4xl font-bold text-blue-600 mb-2">AulaSync</h1>
        <p className="text-gray-600 mb-8">
          Organiza las tareas de tu salón escolar de forma simple y rápida.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm text-left">
            {error}
          </div>
        )}

        <Button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full py-3 text-lg"
        >
          {isLoggingIn ? 'Redirigiendo a Google...' : 'Continuar con Google'}
        </Button>
      </Card>
    </Container>
  )
}
