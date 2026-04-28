import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Header } from '@/components/ui/Header'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'AulaSync',
  description: 'Gestión de tareas por salones escolares',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es">
      <body className={`${inter.className} bg-gray-50 min-h-screen text-gray-900`}>
        <Header />
        {children}
      </body>
    </html>
  )
}
