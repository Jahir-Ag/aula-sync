'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from './Button'
import { useToast } from '@/contexts/ToastContext'
import { Card } from './Card'

export function Header() {
  const { user, profile, hasProfile, signOut } = useAuth()
  const router = useRouter()
  const { showToast } = useToast()
  const [showLogoutModal, setShowLogoutModal] = useState(false)

  const handleLogout = async () => {
    setShowLogoutModal(false)
    console.log('Logging out...')
    try {
      await signOut()
      showToast('Sesión cerrada correctamente', 'success')
      window.location.href = '/login'
    } catch (err) {
      console.error('Logout failed:', err)
      showToast('Error al cerrar sesión', 'error')
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
                onClick={() => setShowLogoutModal(true)}
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

      {/* Modal de confirmación de logout */}
      {showLogoutModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <Card className="max-w-md w-full animate-[slideIn_0.2s_ease-out]">
            <h3 className="text-xl font-bold mb-2">¿Cerrar sesión?</h3>
            <p className="text-gray-500 mb-6">¿Estás seguro de que deseas cerrar tu sesión?</p>
            <div className="flex gap-3 justify-end">
              <Button variant="outline" onClick={() => setShowLogoutModal(false)}>Cancelar</Button>
              <Button onClick={handleLogout} className="bg-red-600 hover:bg-red-700 text-white">
                Cerrar sesión
              </Button>
            </div>
          </Card>
        </div>
      )}
    </header>
  )
}
