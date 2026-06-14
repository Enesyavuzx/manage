'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Castle, Sparkles } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { PixelSprite } from '@/components/decor/pixel-sprite'
import { getLevelInfo, getRank } from '@/lib/gamification'

function timeContext(): { greeting: string; nudge: string } {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return { greeting: 'Günaydın', nudge: 'Güne iyi bir başlangıç yap' }
  if (h >= 11 && h < 14) return { greeting: 'İyi öğlenler', nudge: 'Öğleden önce yetiştir' }
  if (h >= 14 && h < 18) return { greeting: 'Merhaba', nudge: 'Bugün henüz bitmedi' }
  if (h >= 18 && h < 22) return { greeting: 'İyi akşamlar', nudge: 'Günü güzel bitir' }
  return { greeting: 'Gece geç', nudge: 'Erken yatmak da bir alışkanlık' }
}

/**
 * Brix-tarzı hero: ferah açık kart, sol blokta eyebrow + büyük başlık + CTA,
 * sağ blokta bir "zemin çizgisi" üzerinde ileri-geri yürüyen pixel karakter.
 */
export function BrixHero() {
  const { data, habitsToday, todayCompletedIds } = useStore()
  const { greeting, nudge } = timeContext()
  const today = format(new Date(), 'd MMMM EEEE', { locale: tr })

  const name = (data.profile.name || '').trim() || 'kahraman'
  const completed = habitsToday.filter(h => todayCompletedIds.has(h.id)).length
  const remaining = habitsToday.length - completed
  const allDone = habitsToday.length > 0 && remaining === 0

  const info = getLevelInfo(data.profile.totalXP)
  const { rank } = getRank(info.level)

  const nextHabit = useMemo(
    () => habitsToday.find(h => !todayCompletedIds.has(h.id)) ?? null,
    [habitsToday, todayCompletedIds],
  )

  return (
    <section className="relative overflow-hidden rounded-2xl border border-border bg-surface p-6 pixel-shadow sm:p-8">
      {/* yumuşak köşe parıltıları */}
      <div
        className="pointer-events-none absolute inset-0 opacity-80"
        style={{
          background:
            'radial-gradient(60% 80% at 100% 0%, rgb(var(--c-primary) / 0.10), transparent 60%), radial-gradient(50% 70% at 0% 100%, rgb(var(--c-accent) / 0.08), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        {/* Sol: metin + CTA */}
        <div className="min-w-0 max-w-lg">
          <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary font-display">
            <Sparkles size={13} /> {today}
          </span>

          <h1 className="mt-3 text-3xl font-bold leading-tight text-fg sm:text-4xl">
            {greeting}, <span className="text-gradient">{name}</span>
          </h1>

          <p className="mt-3 text-sm text-muted sm:text-base">
            {habitsToday.length === 0 ? (
              nudge
            ) : allDone ? (
              <span className="font-medium text-success">Bugün her şey tamam! 🎉</span>
            ) : (
              <>
                Bugün <span className="font-semibold text-fg">{remaining}</span> alışkanlık kaldı
                {nextHabit && (
                  <> · şimdi sıra: <span className="font-medium text-fg">{nextHabit.emoji} {nextHabit.name}</span></>
                )}
              </>
            )}
          </p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Link
              href="/bugun"
              className="group inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-bg shadow-glow transition-all hover:brightness-110 font-display"
            >
              Bugünü planla
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/diyar"
              className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-5 py-2.5 text-sm font-semibold text-fg transition-colors hover:border-border-hover font-display"
            >
              <Castle size={16} /> Diyarım
            </Link>
            <span className="ml-1 inline-flex items-center gap-1.5 text-xs text-muted">
              <span style={{ color: rank.color }}>{rank.emoji}</span>
              Seviye {info.level} · {rank.label}
            </span>
          </div>
        </div>

        {/* Sağ: yürüyen pixel karakter */}
        <div className="relative h-32 w-full shrink-0 overflow-hidden md:w-72">
          {/* dekoratif uçuşan sprite'lar */}
          <PixelSprite name="star" pixel={3} className="pixelated absolute right-6 top-1 animate-float opacity-80" />
          <PixelSprite name="coin" pixel={3} className="pixelated absolute right-20 top-6 animate-float opacity-70" style={{ animationDelay: '1.2s' }} />
          <PixelSprite name="gem" pixel={3} className="pixelated absolute right-2 top-12 animate-float opacity-70" style={{ animationDelay: '0.6s' }} />

          {/* zemin çizgisi */}
          <div className="absolute bottom-6 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border-hover to-transparent" />

          {/* yürüyen karakter (ileri-geri adımlar) */}
          <div className="absolute bottom-6 left-2" style={{ animation: 'brixPace 9s ease-in-out infinite' }}>
            <PixelSprite name="hero" pixel={5} className="pixelated animate-bob" />
          </div>
        </div>
      </div>
    </section>
  )
}
