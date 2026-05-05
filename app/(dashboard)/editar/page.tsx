"use client"

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { Button } from '@/components/ui/Button'
import { Card } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { useToast } from '@/contexts/ToastContext'
import { getClassroomById, updateClassroom } from '@/services/classrooms'
import { useAuth } from '@/contexts/AuthContext'
import { useClassrooms } from '@/hooks/useClassrooms'
import { generateSlug } from '@/lib/utils/slugs'

const DEFAULT_SUBJECTS = [
  'Español',
  'Inglés',
  'Ciencias Naturales',
  'Cívica',
  'Religión',
  'Orientación',
  'Matemáticas',
  'Tecnología de la Información',
  'Educación Física',
  'Geografía',
  'Historia',
]

function normalizeSubjectName(subject: string) {
  return subject.trim().replace(/\s+/g, ' ')
}

function sanitizeSubjects(subjects: string[]) {
  const uniqueSubjects = new Map<string, string>()

  for (const subject of subjects) {
    const normalized = normalizeSubjectName(subject)

    if (!normalized) continue

    const key = normalized.toLocaleLowerCase('es')

    if (!uniqueSubjects.has(key)) {
      uniqueSubjects.set(key, normalized)
    }
  }

  return Array.from(uniqueSubjects.values())
}

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : 'Error inesperado'
}

export default function EditarSalonPage() {
  const router = useRouter()
  const params = useSearchParams()
  const queryClient = useQueryClient()
  const classroomId = params?.get('classroomId') || null
  const { showToast } = useToast()
  const { user } = useAuth()
  const { createClassroom } = useClassrooms()
  const isEditing = Boolean(classroomId)

  const [name, setName] = useState('')
  const [subjects, setSubjects] = useState<string[]>(() => (isEditing ? [] : DEFAULT_SUBJECTS.slice()))
  const [actionLoading, setActionLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [newSubject, setNewSubject] = useState('')
  const [loadingClassroom, setLoadingClassroom] = useState(isEditing)

  useEffect(() => {
    if (!classroomId) return

    getClassroomById(classroomId)
      .then((classroom) => {
        setName(classroom.name || '')
        setSubjects(
          Array.isArray(classroom.subjects) && classroom.subjects.length > 0
            ? sanitizeSubjects(classroom.subjects)
            : DEFAULT_SUBJECTS.slice()
        )
      })
      .catch((err: Error) => {
        showToast(err.message || 'Error al cargar salón', 'error')
      })
      .finally(() => {
        setLoadingClassroom(false)
      })
  }, [classroomId, showToast])

  const removeSubject = (subjectToRemove: string) => {
    setSubjects((prev) => prev.filter((subject) => subject !== subjectToRemove))
  }

  const addSubject = () => {
    const subject = normalizeSubjectName(newSubject)

    if (!subject) return

    const exists = subjects.some(
      (currentSubject) => currentSubject.toLocaleLowerCase('es') === subject.toLocaleLowerCase('es')
    )

    if (exists) {
      showToast('La materia ya existe', 'info')
      return
    }

    setSubjects((prev) => [...prev, subject])
    setNewSubject('')
    setShowModal(false)
  }

  const handleCancel = () => {
    router.back()
  }

  const handleSave = async () => {
    if (!name || name.trim().length < 3) {
      showToast('El nombre del salón debe tener al menos 3 caracteres.', 'error')
      return
    }

    const cleanSubjects = sanitizeSubjects(subjects)

    if (cleanSubjects.length === 0) {
      showToast('El salón debe tener al menos una materia.', 'error')
      return
    }

    setActionLoading(true)

    try {
      if (!user) throw new Error('No autorizado')

      if (classroomId) {
        await updateClassroom(classroomId, { name: name.trim(), subjects: cleanSubjects }, user.id)
        await Promise.all([
          queryClient.invalidateQueries({ queryKey: ['classrooms'] }),
          queryClient.invalidateQueries({ queryKey: ['classroom'] }),
        ])
        showToast('Salón actualizado', 'success')
        router.push(`/salon/${generateSlug(name.trim())}`)
        return
      }

      const classroom = await createClassroom(name.trim(), cleanSubjects)
      if (!classroom) throw new Error('Error al crear el salón')
      
      await queryClient.invalidateQueries({ queryKey: ['classroom'] })
      showToast('Salón creado', 'success')
      router.push(`/salon/${generateSlug(classroom.name)}`)
    } catch (err: unknown) {
      showToast(getErrorMessage(err), 'error')
    } finally {
      setActionLoading(false)
    }
  }

  return (
    <div className="mx-auto max-w-3xl p-4">
      <h1 className="mb-4 text-2xl font-bold">{classroomId ? 'Editar salón' : 'Crear salón'}</h1>

      <Card className="mb-4">
        <label className="mb-1 block text-sm font-medium text-gray-700">Nombre del salón</label>
        {loadingClassroom ? (
          <div className="h-10 animate-pulse rounded-md bg-gray-100" />
        ) : (
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. 1ro B - Ciencias"
          />
        )}
      </Card>

      <Card className="mb-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <h2 className="text-lg font-medium">Materias escolares</h2>
          <Button type="button" onClick={() => setShowModal(true)} disabled={loadingClassroom}>
            Agregar materia
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          {loadingClassroom && subjects.length === 0 && (
            <>
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="h-8 w-24 animate-pulse rounded-full bg-gray-100" />
              ))}
            </>
          )}
          {!loadingClassroom && subjects.length === 0 && (
            <p className="text-sm text-gray-500">No hay materias. Agrega al menos una.</p>
          )}

          {subjects.map((subject) => (
            <div
              key={subject}
              className="inline-flex items-center rounded-full bg-gray-100 px-3 py-1 text-sm"
            >
              <span>{subject}</span>
              <button
                type="button"
                onClick={() => removeSubject(subject)}
                className="ml-2 text-xs text-gray-500"
                aria-label={`Eliminar ${subject}`}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" type="button" onClick={handleCancel}>
          Cancelar
        </Button>
        <Button type="button" onClick={handleSave} disabled={actionLoading || loadingClassroom}>
          {actionLoading ? 'Guardando...' : classroomId ? 'Guardar' : 'Crear'}
        </Button>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md">
            <h3 className="mb-2 text-lg font-semibold">Nueva materia</h3>
            <Input
              placeholder="materia"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button
                variant="outline"
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setNewSubject('')
                }}
              >
                Cancelar
              </Button>
              <Button type="button" onClick={addSubject}>
                Guardar
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}
