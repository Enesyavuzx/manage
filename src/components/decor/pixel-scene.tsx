'use client'

// Pixel teması için arka plan manzara katmanı. Yumuşak/bulanık bir ufuk
// gradyanı çizer; üstüne globals.css'teki vinyet + piksel ızgara biner.
// Yalnızca pixel temasında görünür (CSS ile gizlenir).
export function PixelScene() {
  return <div className="pixel-scene" aria-hidden="true" />
}
