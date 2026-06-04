// SVG string'i PNG'ye çevirip indirir. Harici kütüphane yok; tamamen çevrimdışı
// çalışır (SVG blob -> Image -> canvas -> PNG). Paylaşılabilir kart üretimi için.

export function escapeXml(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

export function downloadSvgAsPng(svg: string, w: number, h: number, filename: string, onDone?: () => void): void {
  try {
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const img = new Image()
    img.onload = () => {
      const scale = 2
      const canvas = document.createElement('canvas')
      canvas.width = w * scale
      canvas.height = h * scale
      const ctx = canvas.getContext('2d')
      if (!ctx) { URL.revokeObjectURL(url); onDone?.(); return }
      ctx.scale(scale, scale)
      ctx.drawImage(img, 0, 0)
      URL.revokeObjectURL(url)
      canvas.toBlob(png => {
        if (png) {
          const a = document.createElement('a')
          const href = URL.createObjectURL(png)
          a.href = href
          a.download = filename
          document.body.appendChild(a)
          a.click()
          a.remove()
          setTimeout(() => URL.revokeObjectURL(href), 1000)
        }
        onDone?.()
      }, 'image/png')
    }
    img.onerror = () => { URL.revokeObjectURL(url); onDone?.() }
    img.src = url
  } catch {
    onDone?.()
  }
}
