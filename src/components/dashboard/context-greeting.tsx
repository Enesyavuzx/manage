'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { Castle } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

function timeContext(): { emoji: string; greeting: string; nudge: string } {
  const h = new Date().getHours()
  if (h >= 5 && h < 11) return { emoji: '🌅', greeting: 'Günaydın', nudge: 'Güne iyi bir başlangıç yap' }
  if (h >= 11 && h < 14) return { emoji: '☀️', greeting: 'İyi öğlenler', nudge: 'Öğleden önce yetiştir' }
  if (h >= 14 && h < 18) return { emoji: '🌤️', greeting: 'Merhaba', nudge: 'Bugün henüz bitmedi' }
  if (h >= 18 && h < 22) return { emoji: '🌙', greeting: 'İyi akşamlar', nudge: 'Günü güzel bitir' }
  return { emoji: '🌃', greeting: 'Gece geç', nudge: 'Erken yatmak da bir alışkanlık' }
}

export function ContextGreeting() {
  const { data, habitsToday, todayCompletedIds } = useStore()
  const { emoji, greeting, nudge } = timeContext()
  const today = format(new Date(), 'd MMMM EEEE', { locale: tr })

  const name = (data.profile.name || '').trim() || 'kahraman'
  const completedCount = habitsToday.filter(h => todayCompletedIds.has(h.id)).length
  const remaining = habitsToday.length - completedCount
  const allDone = habitsToday.length > 0 && remaining === 0

  const nextHabit = useMemo(
    () => habitsToday.find(h => !todayCompletedIds.has(h.id)) ?? null,
    [habitsToday, todayCompletedIds],
  )

  return (
    <div>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-bold text-fg text-gradient truncate">
            {emoji} {greeting}, {name}
          </h1>
          <p className="mt-0.5 text-sm text-muted">{today}</p>
        </div>
        <Link
          href="/diyar"
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-primary/40 bg-primary/10 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/20 transition-colors font-display"
        >
          <Castle size={12} /> Diyar
        </Link>
      </div>

      {habitsToday.length > 0 && (
        <p className="mt-2 text-sm text-muted">
          {allDone ? (
            <span className="font-medium text-success">Bugün her şey tamam! 🎉</span>
          ) : (
            <>
              <span className="font-semibold text-fg">{remaining}</span> alışkanlık kaldı
              {nextHabit && (
                <> · şimdi: <span className="font-medium text-fg">{nextHabit.emoji} {nextHabit.name}</span></>
              )}
            </>
          )}
        </p>
      )}

      {habitsToday.length === 0 && (
        <p className="mt-2 text-sm text-muted">{nudge}</p>
      )}
    </div>
  )
}
