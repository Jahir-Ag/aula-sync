'use client'

import {
  createContext,
  useContext,
  useState,
  useCallback,
  ReactNode,
} from 'react'

export type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: number
  message: string
  type: ToastType
}

interface ToastContextType {
  showToast: (message: string, type?: ToastType) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

let counter = 0

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    const id = ++counter
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 3500)
  }, [])

  const remove = (id: number) =>
    setToasts(prev => prev.filter(t => t.id !== id))

  const colors: Record<ToastType, string> = {
    success: 'bg-green-600',
    error:   'bg-red-600',
    info:    'bg-blue-600',
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {/* Toast container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              ${colors[toast.type]}
              text-white text-sm font-medium px-4 py-3 rounded-xl shadow-lg
              flex items-center gap-3 pointer-events-auto
              animate-[slideIn_0.2s_ease-out]
            `}
          >
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={() => remove(toast.id)}
              className="text-white/70 hover:text-white transition-colors text-lg leading-none"
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export function useToast(): ToastContextType {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used inside <ToastProvider>')
  return ctx
}
