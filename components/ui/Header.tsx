'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from './Button'

export function Header() {
  const { user, profile, hasProfile, signOut } = useAuth()
  const router = useRouter()

  const handleLogout = async () => {
    console.log('Logging out...')
    try {
      await signOut()
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout failed:', err)
    }
  }

  // Iniciales para avatar
  const initials = profile?.nombre_usuario
    ? profile.nombre_usuario.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : user?.email?.[0]?.toUpperCase() ?? '?'

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10 w-full">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo — solo navega al dashboard si tiene perfil */}
        <button
          onClick={() => router.push(hasProfile ? '/salones' : '/registro')}
          className="text-xl font-bold tracking-tight text-blue-600 hover:text-blue-700 transition-colors"
        >
          AulaSync
        </button>

        <div className="flex items-center gap-4">
          {user && (
            <>
              {/* Avatar con iniciales reales */}
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-sm font-semibold text-blue-700">
                  {initials}
                </div>
                {profile?.nombre_usuario && (
                  <span className="hidden sm:block text-sm text-gray-600">
                    {profile.nombre_usuario}
                  </span>
                )}
              </div>

              <Button
                variant="outline"
                onClick={handleLogout}
                className="text-sm px-3 py-1.5 h-auto"
              >
                Salir
              </Button>
            </>
          )}

          {!user && (
            <Link
              href="/login"
              className="text-sm font-medium text-blue-600 hover:underline"
            >
              Iniciar sesión
            </Link>
          )}
        </div>
      </div>
    </header>
  )
}
