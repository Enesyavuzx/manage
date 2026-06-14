'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { ArrowRight, Castle, Sparkles } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
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
 * Brix hero: sıcak krem zemin, pixel/dot başlık, CTA'lar ve sağda zemin çizgisi
 * üzerinde GERÇEK Brix yürüyen karakter GIF'i (player_walk_right).
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
    <section className="relative overflow-hidden rounded-xl border-2 border-border bg-surface p-6 pixel-shadow sm:p-8">
      {/* sıcak köşe parıltıları */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(60% 80% at 100% 0%, rgb(var(--c-primary) / 0.16), transparent 60%), radial-gradient(55% 70% at 0% 100%, rgb(var(--c-accent) / 0.14), transparent 60%)',
        }}
      />

      <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
        {/* Sol: metin + CTA */}
        <div className="min-w-0 max-w-lg">
          <span className="inline-flex items-center gap-1.5 rounded border-2 border-border bg-primary/15 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-fg font-display">
            <Sparkles size={13} className="text-primary" /> {today}
          </span>

          <h1 className="mt-3 text-3xl font-bold leading-none text-fg sm:text-4xl">
            {greeting},{' '}
            <span style={{ color: 'rgb(var(--c-primary))' }}>{name}</span>
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
              className="group inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-bold text-bg brix-bevel transition-transform hover:-translate-y-0.5 font-display"
            >
              BUGÜNÜ PLANLA
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-0.5" />
            </Link>
            <Link
              href="/diyar"
              className="inline-flex items-center gap-2 rounded bg-surface px-5 py-2.5 text-sm font-bold text-fg brix-bevel-sm transition-transform hover:-translate-y-0.5 font-display"
            >
              <Castle size={16} className="text-accent" /> DİYARIM
            </Link>
            <span className="ml-1 inline-flex items-center gap-1.5 text-xs text-muted">
              <span style={{ color: rank.color }}>{rank.emoji}</span>
              Seviye {info.level} · {rank.label}
            </span>
          </div>
        </div>

        {/* Sağ: gerçek yürüyen karakter */}
        <div className="relative h-28 w-full shrink-0 md:w-72">
          {/* zemin çizgisi */}
          <div className="absolute bottom-2 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-border-hover to-transparent" />
          {/* karakter zemin boyunca yürür */}
          <div
            className="absolute bottom-2 left-4"
            style={{ animation: 'brixWalkAcross 11s linear infinite', ['--walk' as string]: '170px' }}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/brix/walk.gif"
              alt="Yürüyen karakter"
              width={48}
              height={77}
              className="pixelated select-none"
              draggable={false}
              style={{ imageRendering: 'pixelated' }}
            />
          </div>
        </div>
      </div>
    </section>
  )
}
