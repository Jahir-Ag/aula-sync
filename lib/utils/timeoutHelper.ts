// Añade un timeout a una promesa para evitar esperas indefinidas.
export function withTimeout<T>(
  promise: Promise<T> | any,
  timeoutMs: number = 20000,
  operationName: string = 'Operación'
): Promise<T> {
  const p = promise as Promise<T>
  return Promise.race([
    p,
    new Promise<T>((_, reject) =>
      setTimeout(
        () =>
          reject(
            new Error(
              `${operationName} excedió el tiempo límite de ${timeoutMs / 1000}s. Verifica tu conexión e intenta de nuevo.`
            )
          ),
        timeoutMs
      )
    ),
  ])
}
