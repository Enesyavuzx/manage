'use client'
import { useEffect, useRef } from 'react'

/** Hafif, temaya uyumlu (--c-primary) yüzen partikül arka planı. Canvas, harici lib yok. */
export function ParticleField({ className, density = 0.00009 }: { className?: string; density?: number }) {
  const ref = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = ref.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    const dpr = Math.min(2, window.devicePixelRatio || 1)
    let w = 0, h = 0
    let parts: { x: number; y: number; vx: number; vy: number; r: number }[] = []
    let rgba = 'rgba(99,102,241,0.35)'

    const readColor = () => {
      const v = getComputedStyle(document.documentElement).getPropertyValue('--c-primary').trim()
      if (v) rgba = `rgba(${v.split(/\s+/).join(',')},0.4)`
    }
    const resize = () => {
      const rect = canvas.getBoundingClientRect()
      w = rect.width; h = rect.height
      canvas.width = Math.max(1, w * dpr); canvas.height = Math.max(1, h * dpr)
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      const n = Math.max(12, Math.min(54, Math.floor(w * h * density)))
      parts = Array.from({ length: n }, () => ({
        x: Math.random() * w, y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25, vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.8 + 0.6,
      }))
    }

    readColor(); resize()
    const ro = new ResizeObserver(resize); ro.observe(canvas)
    const mo = new MutationObserver(readColor)
    mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] })

    let raf = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)
      ctx.fillStyle = rgba
      for (const p of parts) {
        if (!reduce) {
          p.x += p.vx; p.y += p.vy
          if (p.x < 0) p.x += w; if (p.x > w) p.x -= w
          if (p.y < 0) p.y += h; if (p.y > h) p.y -= h
        }
        ctx.beginPath(); ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2); ctx.fill()
      }
      if (!reduce) raf = requestAnimationFrame(draw)
    }
    draw()

    return () => { cancelAnimationFrame(raf); ro.disconnect(); mo.disconnect() }
  }, [density])

  return <canvas ref={ref} className={className} aria-hidden="true" />
}
