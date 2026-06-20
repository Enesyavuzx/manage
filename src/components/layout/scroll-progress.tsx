'use client'
import { useEffect, useState } from 'react'

/** Üstte ince scroll ilerleme çubuğu (#main-content kaydırmasına bağlı). */
export function ScrollProgress() {
  const [pct, setPct] = useState(0)
  useEffect(() => {
    const el = document.getElementById('main-content')
    if (!el) return
    let raf = 0
    const update = () => {
      raf = 0
      const max = el.scrollHeight - el.clientHeight
      setPct(max > 0 ? (el.scrollTop / max) * 100 : 0)
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    update()
    el.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { el.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])
  return (
    <div
      className="pointer-events-none fixed left-0 top-0 z-[60] h-[3px] bg-gradient-to-r from-primary to-accent"
      style={{ width: `${pct}%` }}
      aria-hidden="true"
    />
  )
}
