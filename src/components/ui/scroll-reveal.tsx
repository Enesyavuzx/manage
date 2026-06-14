'use client'
import { useEffect, useLayoutEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

// SSR'de useLayoutEffect uyarısı vermesin diye izomorfik sürüm.
const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect

/**
 * Brix-tarzı scroll-reveal: sayfa kök kapsayıcısının doğrudan çocuklarını
 * (bölümleri) görünüm alanına girdikçe yumuşakça fade + slide-up ile açar.
 *
 * - Tek noktadan tüm uygulamaya uygulanır (her sayfa tek bir kapsayıcıda
 *   "space-y" ile bölümlerini sıralar; bu bileşen o kapsayıcının çocuklarını hedefler).
 * - `prefers-reduced-motion` açıksa hiçbir şey gizlenmez, içerik anında görünür.
 * - Animasyon bitince inline stiller temizlenir (sticky/fixed çocukları etkilememek için).
 */
export function ScrollReveal({ children }: { children: React.ReactNode }) {
  const rootRef = useRef<HTMLDivElement>(null)
  const pathname = usePathname()

  useIsoLayoutEffect(() => {
    const root = rootRef.current
    if (!root) return

    const prefersReduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced || !('IntersectionObserver' in window)) return

    // Sayfanın kök kapsayıcısı = sarmalayıcının ilk eleman çocuğu.
    // Hedefler = o kapsayıcının doğrudan çocukları (bölümler).
    const container = root.firstElementChild as HTMLElement | null
    const targets = container
      ? (Array.from(container.children) as HTMLElement[])
      : []
    if (targets.length === 0) return

    const EASE = 'cubic-bezier(.16,1,.3,1)'

    // Başlangıç durumu (boyamadan önce gizle — flash olmaz).
    for (const el of targets) {
      el.style.opacity = '0'
      el.style.transform = 'translateY(22px) scale(0.985)'
      el.style.willChange = 'opacity, transform'
    }

    const reveal = (el: HTMLElement, stagger: number) => {
      const delay = Math.min(stagger, 8) * 75
      el.style.transition =
        `opacity .6s ${EASE} ${delay}ms, transform .6s ${EASE} ${delay}ms`
      el.style.opacity = '1'
      el.style.transform = 'translateY(0) scale(1)'
      const cleanup = (e: TransitionEvent) => {
        if (e.target !== el) return
        el.style.transition = ''
        el.style.transform = ''
        el.style.willChange = ''
        el.style.opacity = ''
        el.removeEventListener('transitionend', cleanup)
      }
      el.addEventListener('transitionend', cleanup)
    }

    const io = new IntersectionObserver(
      (entries, obs) => {
        // Aynı partide görünür olanları index'e göre kademelendir
        // (ilk yüklemede şelale etkisi; sonradan kaydırınca gecikme ~0).
        const visible = entries.filter(e => e.isIntersecting)
        visible.forEach((entry, i) => {
          reveal(entry.target as HTMLElement, i)
          obs.unobserve(entry.target)
        })
      },
      { rootMargin: '0px 0px -8% 0px', threshold: 0.05 },
    )

    const raf = requestAnimationFrame(() => {
      for (const el of targets) io.observe(el)
    })

    return () => {
      cancelAnimationFrame(raf)
      io.disconnect()
      for (const el of targets) {
        el.style.transition = ''
        el.style.transform = ''
        el.style.willChange = ''
        el.style.opacity = ''
      }
    }
  }, [pathname])

  return <div ref={rootRef}>{children}</div>
}
