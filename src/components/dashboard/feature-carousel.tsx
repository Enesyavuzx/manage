'use client'
import { useEffect, useRef } from 'react'
import Link from 'next/link'

const CARDS = [
  { emoji: '✅', label: 'Alışkanlıklar', desc: 'Streak yap, zincirle', href: '/habits', accent: '74 124 89' },
  { emoji: '🎯', label: 'Odak', desc: 'Derin çalışma, akış', href: '/focus', accent: '123 149 255' },
  { emoji: '🏰', label: 'Diyar', desc: 'Şehrini büyüt', href: '/diyar', accent: '224 179 65' },
  { emoji: '🚩', label: 'Seferler', desc: 'XP, rütbe, sezon', href: '/seferler', accent: '180 130 255' },
  { emoji: '🙂', label: 'Ruh Hali', desc: 'Mood & enerji', href: '/mood', accent: '63 143 90' },
  { emoji: '💬', label: 'Koç', desc: 'Bilgelik & rehber', href: '/coach', accent: '249 166 32' },
  { emoji: '📒', label: 'Finans', desc: 'Bütçe & hedef', href: '/budget', accent: '183 71 42' },
]

/** Yatay kayan kart şeridi: viewport ortasındaki kart büyür, kenardakiler küçülür/soluklaşır. */
export function FeatureCarousel() {
  const trackRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const track = trackRef.current
    if (!track) return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    let raf = 0
    const update = () => {
      raf = 0
      const r = track.getBoundingClientRect()
      const cx = r.left + r.width / 2
      for (const node of Array.from(track.children)) {
        const el = node as HTMLElement
        const er = el.getBoundingClientRect()
        const ec = er.left + er.width / 2
        const norm = Math.min(1, Math.abs(ec - cx) / (r.width / 2))
        if (reduce) { el.style.transform = ''; el.style.opacity = ''; continue }
        el.style.transform = `scale(${1 - norm * 0.18})`
        el.style.opacity = String(Math.max(0.45, 1 - norm * 0.5))
      }
    }
    const onScroll = () => { if (!raf) raf = requestAnimationFrame(update) }
    // ilk kartı ortala
    requestAnimationFrame(() => { update() })
    track.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => { track.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); if (raf) cancelAnimationFrame(raf) }
  }, [])

  return (
    <section>
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 rounded border-2 border-border bg-primary/15 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-fg font-display">Özellikler</span>
        <h2 className="mt-3 text-2xl font-bold text-fg sm:text-3xl">Kaydır, keşfet</h2>
        <p className="mt-1 text-sm text-muted">Yana kaydır — ortadaki kart öne çıkar.</p>
      </div>

      <div
        ref={trackRef}
        data-lenis-prevent
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4"
        style={{ scrollPaddingLeft: '50%', scrollPaddingRight: '50%' }}
      >
        {CARDS.map(c => (
          <Link
            key={c.label}
            href={c.href}
            className="ui-card flex min-w-[220px] shrink-0 snap-center flex-col gap-2 rounded-xl border-2 border-border bg-surface p-5 first:ml-[calc(50%-110px)] last:mr-[calc(50%-110px)]"
            style={{ boxShadow: `5px 5px 0 0 rgb(${c.accent})`, willChange: 'transform, opacity' }}
          >
            <span className="flex h-12 w-12 items-center justify-center rounded-lg text-3xl" style={{ background: `rgb(${c.accent} / 0.16)` }}>{c.emoji}</span>
            <span className="font-display text-lg font-bold text-fg">{c.label}</span>
            <span className="text-sm text-muted">{c.desc}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
