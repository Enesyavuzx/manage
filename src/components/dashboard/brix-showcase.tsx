'use client'
import { useEffect, useRef, useState } from 'react'
import { Check, Cpu } from 'lucide-react'
import { useStore } from '@/hooks/useStore'

/**
 * Brix "#job" bölümündeki laptop + %100 dolum görselinin bizim sisteme uyarlanmış hâli.
 * Ekranda bir ilerleme çubuğu %100'e dolar (sistem hazır flourish'i) ve sayaç yukarı sayar;
 * altta bugünün gerçek tamamlanma oranı gösterilir.
 */
export function BrixShowcase() {
  const { habitsToday, todayCompletedIds } = useStore()
  const total = habitsToday.length
  const done = habitsToday.filter(h => todayCompletedIds.has(h.id)).length
  const todayPct = total > 0 ? Math.round((done / total) * 100) : 100

  const [pct, setPct] = useState(0)
  const raf = useRef<number>()

  useEffect(() => {
    const start = performance.now()
    const DURATION = 1400
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DURATION)
      // ease-out
      const eased = 1 - Math.pow(1 - t, 3)
      setPct(Math.round(eased * 100))
      if (t < 1) raf.current = requestAnimationFrame(tick)
    }
    raf.current = requestAnimationFrame(tick)
    return () => { if (raf.current) cancelAnimationFrame(raf.current) }
  }, [])

  const ready = pct >= 100

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 pixel-shadow sm:p-8">
      <div className="grid items-center gap-8 md:grid-cols-2">
        {/* Sol: metin */}
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary font-display">
            <Cpu size={13} /> Kurulum
          </span>
          <h2 className="mt-3 text-2xl font-bold text-fg sm:text-3xl">
            Sistemin <span className="text-gradient">%100</span> hazır
          </h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Alışkanlıkların, odağın, ödüllerin ve diyarın — hepsi tek bir ekranda toplanır.
            Tek yapman gereken başlamak.
          </p>

          <div className="mt-5 flex flex-wrap gap-2">
            {['Alışkanlık', 'Odak', 'XP & Rütbe', 'Diyar', 'Bütçe'].map(tag => (
              <span
                key={tag}
                className="inline-flex items-center gap-1 rounded-full border border-border bg-surface-2 px-3 py-1 text-xs font-medium text-muted"
              >
                <Check size={11} className="text-success" /> {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Sağ: laptop */}
        <div className="mx-auto w-full max-w-sm">
          {/* ekran */}
          <div className="relative rounded-xl border-[3px] border-border-hover bg-surface-2 p-4 shadow-inner">
            {/* üst bar (kamera + noktalar) */}
            <div className="mb-3 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-danger/70" />
              <span className="h-2 w-2 rounded-full bg-xp/70" />
              <span className="h-2 w-2 rounded-full bg-success/70" />
              <span className="ml-auto h-1.5 w-1.5 rounded-full bg-border-hover" />
            </div>

            {/* büyük yüzde */}
            <div className="flex items-baseline gap-2">
              <span className="font-display text-5xl font-bold tabular-nums text-fg">{pct}</span>
              <span className="font-display text-2xl font-bold text-primary">%</span>
            </div>

            {/* ilerleme çubuğu */}
            <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-gradient-to-r from-primary to-primary-2 transition-[width] duration-100 ease-out"
                style={{ width: `${pct}%` }}
              />
            </div>

            {/* durum satırı */}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted">
              {ready ? (
                <><Check size={13} className="text-success" /> Sistem hazır</>
              ) : (
                <span className="animate-pulse">Kuruluyor…</span>
              )}
              <span className="ml-auto">Bugün: <span className="font-semibold text-fg">%{todayPct}</span> tamam</span>
            </p>
          </div>

          {/* taban */}
          <div className="mx-auto -mt-px h-2.5 w-[112%] -translate-x-[5.3%] rounded-b-xl border-x border-b border-border-hover bg-surface-2" />
          <div className="mx-auto h-1 w-[40%] rounded-b-md bg-border-hover" />
        </div>
      </div>
    </section>
  )
}
