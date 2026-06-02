// Lightweight, dependency-free canvas confetti + haptic feedback.

interface Particle {
  x: number; y: number; vx: number; vy: number
  size: number; color: string; rot: number; vrot: number; life: number
}

const COLORS = ['#ff5c8a', '#ffd24a', '#54defc', '#7cfc84', '#9b6dff', '#ff9a3c']

export function fireConfetti(opts: { count?: number; origin?: { x: number; y: number }; power?: number } = {}) {
  if (typeof window === 'undefined') return
  const count = opts.count ?? 80
  const power = opts.power ?? 1
  const ox = opts.origin?.x ?? window.innerWidth / 2
  const oy = opts.origin?.y ?? window.innerHeight / 2

  const canvas = document.createElement('canvas')
  canvas.style.cssText = 'position:fixed;inset:0;pointer-events:none;z-index:9999'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  document.body.appendChild(canvas)
  const ctx = canvas.getContext('2d')
  if (!ctx) { canvas.remove(); return }

  const particles: Particle[] = Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2
    const speed = (4 + Math.random() * 7) * power
    return {
      x: ox, y: oy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed - 4,
      size: 5 + Math.random() * 7,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
      rot: Math.random() * Math.PI,
      vrot: (Math.random() - 0.5) * 0.4,
      life: 1,
    }
  })

  let frame = 0
  function tick() {
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    frame++
    let alive = false
    for (const p of particles) {
      p.vy += 0.18           // gravity
      p.vx *= 0.99
      p.x += p.vx
      p.y += p.vy
      p.rot += p.vrot
      p.life -= 0.012
      if (p.life > 0 && p.y < canvas.height + 20) {
        alive = true
        ctx.save()
        ctx.globalAlpha = Math.max(0, p.life)
        ctx.translate(p.x, p.y)
        ctx.rotate(p.rot)
        ctx.fillStyle = p.color
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6)
        ctx.restore()
      }
    }
    if (alive && frame < 240) {
      requestAnimationFrame(tick)
    } else {
      canvas.remove()
    }
  }
  requestAnimationFrame(tick)
}

export function haptic(pattern: number | number[] = 30) {
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try { navigator.vibrate(pattern) } catch { /* ignore */ }
  }
}
