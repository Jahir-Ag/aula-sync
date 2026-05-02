'use client'

import { useState } from 'react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isBefore, startOfDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

interface ResponsiveDatePickerProps {
  value: string // formato 'yyyy-MM-dd'
  onChange: (date: string) => void
  onClose: () => void
  onlyWeekdays?: boolean
  minDate?: Date
}

export function ResponsiveDatePicker({
  value,
  onChange,
  onClose,
  onlyWeekdays = true,
  minDate
}: ResponsiveDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const [y, m, d] = value.split('-')
      return new Date(parseInt(y), parseInt(m) - 1)
    }
    return new Date()
  })

  const start = startOfMonth(currentMonth)
  const end = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start, end })

  const isWeekend = (date: Date) => {
    const day = getDay(date)
    return day === 0 || day === 6
  }

  const isDisabled = (date: Date) => {
    if (onlyWeekdays && isWeekend(date)) return true
    if (minDate && isBefore(date, startOfDay(minDate))) return true
    return false
  }

  const handleSelectDay = (date: Date) => {
    if (!isDisabled(date)) {
      const dateStr = format(date, 'yyyy-MM-dd')
      onChange(dateStr)
      onClose()
    }
  }

  // Filtrar solo días de lunes a viernes
  const weekdaysOnly = days.filter(day => !isWeekend(day))

  return (
    <div className="fixed inset-0 bg-black/50 flex items-end z-50 md:items-center md:justify-center">
      <div className="bg-white w-full md:w-96 rounded-t-2xl md:rounded-2xl p-4 md:p-6 shadow-xl max-h-screen md:max-h-none overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-semibold text-gray-900">Seleccionar fecha</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Navegación de mes */}
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h4 className="font-semibold text-gray-900 text-center flex-1">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h4>
          <button
            onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
            className="p-1 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>

        {/* Headers de días - Solo L-V */}
        <div className="grid grid-cols-5 gap-2 mb-2">
          {['L', 'M', 'X', 'J', 'V'].map(day => (
            <div key={day} className="text-center text-xs font-semibold text-gray-500 py-2">
              {day}
            </div>
          ))}
        </div>

        {/* Grid de días - Solo lunes a viernes */}
        <div className="grid grid-cols-5 gap-2">
          {weekdaysOnly.map(day => {
            const isSelected = value === format(day, 'yyyy-MM-dd')
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
            const disabled = isDisabled(day)

            return (
              <button
                key={format(day, 'yyyy-MM-dd')}
                onClick={() => handleSelectDay(day)}
                disabled={disabled}
                className={`
                  w-full aspect-square rounded-lg font-medium text-sm transition-colors
                  ${disabled ? 'text-gray-300 cursor-not-allowed bg-gray-50' : ''}
                  ${isSelected ? 'bg-blue-600 text-white' : ''}
                  ${!disabled && !isSelected ? 'hover:bg-blue-50 text-gray-900' : ''}
                  ${isToday && !isSelected ? 'border-2 border-blue-400' : ''}
                `}
              >
                {format(day, 'd')}
              </button>
            )
          })}
        </div>

        {onlyWeekdays && (
          <p className="text-xs text-gray-500 mt-4 text-center">
            ℹ️ Solo se muestran días de lunes a viernes
          </p>
        )}
      </div>
    </div>
  )
}
