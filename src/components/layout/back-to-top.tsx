'use client'
import { useEffect, useState } from 'react'
import { ArrowUp } from 'lucide-react'

/** Aşağı kaydırınca beliren, Lenis ile yumuşak yukarı çıkan buton. */
export function BackToTop() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    const el = document.getElementById('main-content')
    if (!el) return
    const onScroll = () => setShow(el.scrollTop > 500)
    onScroll()
    el.addEventListener('scroll', onScroll, { passive: true })
    return () => el.removeEventListener('scroll', onScroll)
  }, [])

  function toTop() {
    const lenis = (window as unknown as { __lenis?: { scrollTo: (t: number) => void } }).__lenis
    if (lenis?.scrollTo) lenis.scrollTo(0)
    else document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' })
  }

  if (!show) return null
  return (
    <button
      onClick={toTop}
      aria-label="Yukarı çık"
      className="fixed bottom-5 right-5 z-50 flex h-11 w-11 items-center justify-center rounded-full bg-primary text-bg brix-bevel-sm shadow-glow transition-transform hover:-translate-y-0.5 animate-fade-in"
    >
      <ArrowUp size={18} />
    </button>
  )
}
