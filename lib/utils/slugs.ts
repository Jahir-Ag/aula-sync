/**
 * Genera un slug desde el nombre del salón
 * Ejemplo: "Matemáticas 1A" → "matematicas-1a"
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[áéíóú]/g, (char) => {
      const map: Record<string, string> = {
        á: 'a',
        é: 'e',
        í: 'i',
        ó: 'o',
        ú: 'u'
      }
      return map[char] || char
    })
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

/**
 * Obtiene el ID del salón desde params (que puede ser slug o UUID)
 * Si es slug, busca en classrooms; si es UUID, retorna directamente
 */
export function isUUID(str: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return uuidRegex.test(str)
}
