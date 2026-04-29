'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { upsertProfile } from '@/services/profiles'
import { Button } from '@/components/ui/Button'
import { Container } from '@/components/ui/Container'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'

export default function RegistroPage() {
  const { user, hasProfile, loading, refreshProfile } = useAuth()
  const router = useRouter()

  const [nombreUsuario, setNombreUsuario] = useState('')
  const [nombreHijo, setNombreHijo] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (loading) return
    if (!user) router.replace('/login')
    else if (hasProfile) router.replace('/salones')
  }, [user, hasProfile, loading, router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return
    if (!nombreUsuario.trim() || !nombreHijo.trim()) {
      setError('Todos los campos son obligatorios.')
      return
    }

    setSaving(true)
    setError(null)
    try {
      await upsertProfile(user.id, {
        nombre_usuario: nombreUsuario.trim(),
        nombre_hijo: nombreHijo.trim(),
      })
      await refreshProfile()
      router.replace('/salones')
    } catch (err: any) {
      setError(err.message || 'Error al guardar el perfil.')
    } finally {
      setSaving(false)
    }
  }

  if (loading || !user) return null

  return (
    <Container className="flex mt-20 items-center justify-center">
      <Card className="w-full max-w-md py-12 px-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-1">¡Bienvenido!</h1>
        <p className="text-gray-600 mb-8">
          Completa tu perfil para comenzar a usar AulaSync.
        </p>

        {error && (
          <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-lg text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Tu nombre (padre/madre/tutor)
            </label>
            <Input
              id="nombre_usuario"
              placeholder="Ej. María García"
              value={nombreUsuario}
              onChange={e => setNombreUsuario(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nombre de tu hijo/hija
            </label>
            <Input
              id="nombre_hijo"
              placeholder="Ej. Andrés García"
              value={nombreHijo}
              onChange={e => setNombreHijo(e.target.value)}
              required
            />
          </div>

          <Button type="submit" disabled={saving} className="w-full py-3 mt-2">
            {saving ? 'Guardando...' : 'Crear cuenta'}
          </Button>
        </form>
      </Card>
    </Container>
  )
}
