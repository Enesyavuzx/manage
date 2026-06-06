'use client'
import { useEffect, useMemo, useRef } from 'react'
import { Flame, Star, Zap } from 'lucide-react'
import { useStore, getStreak } from '@/hooks/useStore'
import { todayKey, isHabitDueToday } from '@/lib/store'
import { philosopherOf, philosopherLine } from '@/lib/advisor'
import { xpForDifficulty } from '@/lib/gamification'
import { fireConfetti } from '@/lib/confetti'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function PerfectDayCard() {
  const { data } = useStore()
  const firedRef = useRef(false)

  const { allDone, total, todayXP, topStreaks } = useMemo(() => {
    const today = todayKey()
    const due = data.habits.filter(h => !h.archived && isHabitDueToday(h))
    const doneSet = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
    const done = due.filter(h => doneSet.has(h.id))
    const allDone = due.length > 0 && done.length === due.length

    const todayXP = data.completions
      .filter(c => c.date === today)
      .reduce((s, c) => s + (c.xpAwarded ?? 0), 0)

    const topStreaks = data.habits
      .filter(h => !h.archived)
      .map(h => ({ habit: h, streak: getStreak(data.completions, h.id, data.frozenDates) }))
      .filter(s => s.streak >= 3)
      .sort((a, b) => b.streak - a.streak)
      .slice(0, 3)

    return { allDone, total: due.length, todayXP, topStreaks }
  }, [data])

  const philosopher = useMemo(() => philosopherOf(data), [data])
  const line = useMemo(() => philosopherLine(philosopher), [philosopher])

  useEffect(() => {
    if (allDone && !firedRef.current) {
      firedRef.current = true
      setTimeout(() => {
        fireConfetti({ count: 120, power: 1.1 })
      }, 300)
    }
    if (!allDone) firedRef.current = false
  }, [allDone])

  if (!allDone || total === 0) return null

  return (
    <Card className="overflow-hidden border-success/40 bg-gradient-to-br from-success/5 to-transparent">
      {/* Başlık */}
      <div className="flex items-center gap-3 border-b border-success/20 px-4 py-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/15 text-2xl">
          🏆
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-bold text-success font-display">Mükemmel Gün!</p>
          <p className="text-xs text-muted">Bugünün {total} alışkanlığını tamamladın</p>
        </div>
        <div className="flex items-center gap-1 rounded-full bg-xp/15 px-2.5 py-1">
          <Zap size={12} className="text-xp" fill="currentColor" />
          <span className="text-xs font-bold text-xp">+{todayXP} XP</span>
        </div>
      </div>

      <div className="p-4 space-y-3">
        {/* Aktif seriler */}
        {topStreaks.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Aktif seriler</p>
            <div className="flex flex-wrap gap-2">
              {topStreaks.map(({ habit, streak }) => (
                <div key={habit.id}
                  className="flex items-center gap-1.5 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5">
                  <span className="text-sm">{habit.emoji}</span>
                  <span className="text-xs font-medium text-fg">{habit.name}</span>
                  <span className="flex items-center gap-0.5 text-xs font-bold text-orange-400">
                    <Flame size={11} fill="currentColor" />{streak}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filozof mesajı */}
        <div className="flex items-start gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
          <span className="mt-0.5 text-base shrink-0">{philosopher.emoji}</span>
          <div className="min-w-0">
            <p className="text-[11px] font-medium text-muted-2 mb-0.5">{philosopher.name}</p>
            <p className="text-xs italic leading-snug text-muted">&ldquo;{line}&rdquo;</p>
          </div>
        </div>

        {/* Motivasyon satırı */}
        <div className="flex items-center justify-center gap-1.5 pt-1">
          {[...Array(5)].map((_, i) => (
            <Star key={i} size={14} className={cn('text-xp', i < 3 ? 'fill-xp' : 'fill-xp/30')} />
          ))}
          <span className="ml-1 text-xs text-muted font-medium">Diyarın bugün çiçek açtı</span>
        </div>
      </div>
    </Card>
  )
}
