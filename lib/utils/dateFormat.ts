/**
 * Convierte fecha en formato yyyy-MM-dd a dd/MM/yyyy
 * Ejemplo: "2026-05-06" → "06/05/2026"
 */
export function formatDateDisplay(dateStr: string): string {
  if (!dateStr) return ''
  const [year, month, day] = dateStr.split('-')
  return `${day}/${month}/${year}`
}

/**
 * Obtiene la fecha de hoy en formato yyyy-MM-dd
 */
export function getTodayString(): string {
  const today = new Date()
  const year = today.getFullYear()
  const month = String(today.getMonth() + 1).padStart(2, '0')
  const day = String(today.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
