'use client'

import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import {
  addMonths,
  endOfMonth,
  format,
  getDay,
  isBefore,
  isSameMonth,
  startOfDay,
  startOfMonth,
  subMonths,
} from 'date-fns'
import { es } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { getTaskDatesInRange } from '@/services/tasks'

interface ResponsiveDatePickerProps {
  value: string
  onChange: (date: string) => void
  onClose: () => void
  onlyWeekdays?: boolean
  minDate?: Date
  classroomId?: string
}

type CalendarCell = {
  date: Date | null
  key: string
}

function buildWeekdayCalendarDays(currentMonth: Date): CalendarCell[] {
  const firstDayOfMonth = startOfMonth(currentMonth)
  const lastDayOfMonth = endOfMonth(currentMonth)
  const cells: CalendarCell[] = []

  const cursor = new Date(firstDayOfMonth)

  while (cursor <= lastDayOfMonth) {
    const weekDay = getDay(cursor)
    const weekdayColumn = weekDay === 0 || weekDay === 6 ? null : weekDay - 1

    if (weekdayColumn !== null) {
      if (cells.length === 0) {
        for (let i = 0; i < weekdayColumn; i += 1) {
          cells.push({ date: null, key: `leading-${i}` })
        }
      } else if (cells.length % 5 !== weekdayColumn) {
        while (cells.length % 5 !== weekdayColumn) {
          cells.push({ date: null, key: `gap-${cursor.toISOString()}-${cells.length}` })
        }
      }

      cells.push({
        date: new Date(cursor),
        key: format(cursor, 'yyyy-MM-dd'),
      })
    }

    cursor.setDate(cursor.getDate() + 1)
  }

  while (cells.length % 5 !== 0) {
    cells.push({ date: null, key: `trailing-${cells.length}` })
  }

  return cells
}

export function ResponsiveDatePicker({
  value,
  onChange,
  onClose,
  onlyWeekdays = true,
  minDate,
  classroomId,
}: ResponsiveDatePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const [year, month] = value.split('-').map(Number)
      return new Date(year, month - 1, 1)
    }

    return startOfMonth(new Date())
  })

  const monthStart = format(startOfMonth(currentMonth), 'yyyy-MM-dd')
  const monthEnd = format(endOfMonth(currentMonth), 'yyyy-MM-dd')

  const { data: markedDates = [] } = useQuery({
    queryKey: ['task-dates', classroomId, monthStart, monthEnd],
    queryFn: async () => {
      if (!classroomId) return []
      return getTaskDatesInRange(classroomId, monthStart, monthEnd)
    },
    enabled: Boolean(classroomId),
    staleTime: 1000 * 60 * 10,
  })

  const markedDatesSet = useMemo(() => new Set(markedDates), [markedDates])
  const calendarCells = useMemo(() => buildWeekdayCalendarDays(currentMonth), [currentMonth])

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
    if (isDisabled(date)) return

    onChange(format(date, 'yyyy-MM-dd'))
    onClose()
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end bg-black/50 md:items-center md:justify-center"
      onClick={onClose}
    >
      <div
        className="max-h-screen w-full overflow-y-auto rounded-t-2xl bg-white p-4 shadow-xl md:max-h-none md:w-96 md:rounded-2xl md:p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-semibold text-gray-900">Seleccionar fecha</h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 transition-colors hover:bg-gray-100"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <button
            onClick={() => setCurrentMonth((prev) => subMonths(prev, 1))}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <h4 className="flex-1 text-center font-semibold text-gray-900">
            {format(currentMonth, 'MMMM yyyy', { locale: es })}
          </h4>
          <button
            onClick={() => setCurrentMonth((prev) => addMonths(prev, 1))}
            className="rounded-lg p-1 hover:bg-gray-100"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-2 grid grid-cols-5 gap-2">
          {['L', 'M', 'X', 'J', 'V'].map((day) => (
            <div key={day} className="py-2 text-center text-xs font-semibold text-gray-500">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-5 gap-2">
          {calendarCells.map((cell) => {
            if (!cell.date) {
              return <div key={cell.key} className="aspect-square" />
            }

            const date = cell.date
            const dateKey = format(date, 'yyyy-MM-dd')
            const isSelected = value === dateKey
            const isToday = dateKey === format(new Date(), 'yyyy-MM-dd')
            const disabled = isDisabled(date)
            const hasTasks = markedDatesSet.has(dateKey) && isSameMonth(date, currentMonth)

            return (
              <button
                key={cell.key}
                onClick={() => handleSelectDay(date)}
                disabled={disabled}
                className={`
                  relative aspect-square w-full rounded-lg text-sm font-medium transition-colors
                  ${disabled ? 'cursor-not-allowed bg-gray-50 text-gray-300' : ''}
                  ${isSelected ? 'bg-blue-600 text-white' : ''}
                  ${!disabled && !isSelected ? 'text-gray-900 hover:bg-blue-50' : ''}
                  ${isToday && !isSelected ? 'border-2 border-blue-400' : ''}
                `}
              >
                <span>{format(date, 'd')}</span>
                {hasTasks && (
                  <span
                    className={`absolute right-1.5 top-1.5 h-2 w-2 rounded-full ${
                      isSelected ? 'bg-yellow-300 ring-1 ring-white/70' : 'bg-yellow-400'
                    }`}
                  />
                )}
              </button>
            )
          })}
        </div>

        {onlyWeekdays && (
          <p className="mt-4 text-center text-xs text-gray-500">
            Solo se muestran días de lunes a viernes
          </p>
        )}
      </div>
    </div>
  )
}
