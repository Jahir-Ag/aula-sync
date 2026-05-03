import { Suspense } from 'react'
import InviteClient from './InviteClient'

export default function Page() {
  return (
    <Suspense fallback={
      <div className="flex mt-20 items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-gray-500">Cargando...</p>
        </div>
      </div>
    }>
      <InviteClient />
    </Suspense>
  )
}