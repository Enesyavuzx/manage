'use client'
import { useEffect } from 'react'
import Lenis from 'lenis'

/**
 * Lenis ile "buttery" smooth scroll. Uygulama iç içe kaydırıldığından
 * (#main-content), Lenis wrapper/content olarak o öğeleri hedefler.
 * prefers-reduced-motion açıksa devre dışı (normal scroll).
 */
export function SmoothScroll() {
  useEffect(() => {
    if (typeof window === 'undefined') return
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return
    const wrapper = document.getElementById('main-content')
    const content = document.getElementById('scroll-content')
    if (!wrapper || !content) return

    const lenis = new Lenis({
      wrapper,
      content,
      lerp: 0.1,
      smoothWheel: true,
      wheelMultiplier: 1,
      touchMultiplier: 1.5,
    })

    ;(window as unknown as { __lenis?: unknown }).__lenis = lenis

    let raf = 0
    const loop = (time: number) => { lenis.raf(time); raf = requestAnimationFrame(loop) }
    raf = requestAnimationFrame(loop)

    return () => { cancelAnimationFrame(raf); lenis.destroy(); delete (window as unknown as { __lenis?: unknown }).__lenis }
  }, [])

  return null
}
