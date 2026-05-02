'use client'

import React, { ReactNode, ErrorInfo } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends React.Component<Props, State> {
  public constructor(props: Props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-red-50">
          <div className="max-w-md w-full mx-auto px-4">
            <div className="bg-white rounded-lg shadow-lg border border-red-200 p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">
                  <div className="flex items-center justify-center h-12 w-12 rounded-md bg-red-100">
                    <svg
                      className="h-6 w-6 text-red-600"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4v.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-medium text-gray-900">
                    ¡Algo salió mal!
                  </h3>
                  <p className="mt-2 text-sm text-gray-600">
                    Parece que encontramos un problema. Por favor, intenta recargar la página.
                  </p>
                  {process.env.NODE_ENV === 'development' && (
                    <details className="mt-4 text-xs text-gray-500 bg-gray-50 p-3 rounded border border-gray-200">
                      <summary className="cursor-pointer font-mono font-bold">
                        Detalles del error (dev)
                      </summary>
                      <pre className="mt-2 whitespace-pre-wrap word-break">
                        {this.state.error?.toString()}
                      </pre>
                    </details>
                  )}
                  <div className="mt-6 flex gap-3">
                    <button
                      onClick={() => window.location.href = '/salones'}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Ir a Salones
                    </button>
                    <button
                      onClick={() => window.location.reload()}
                      className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                    >
                      Recargar
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
