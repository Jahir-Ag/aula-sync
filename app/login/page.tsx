"use client"

import { signInWithGoogle } from '@/services/auth'

export default function LoginPage() {
  const handleGoogle = async () => {
    try {
      await signInWithGoogle()
    } catch (err) {
      console.error(err)
      alert('Error al iniciar sesión')
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Iniciar sesión</h2>
      <button onClick={handleGoogle} className="w-full px-4 py-2 bg-red-500 text-white rounded">
        Continuar con Google
      </button>
    </div>
  )
}
