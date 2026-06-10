'use client'
import { useMemo } from 'react'
import { Flame, Check } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { todayKey, isHabitDueToday, getStreak } from '@/lib/store'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

// Bugün kalan tüm alışkanlıklar — at-risk ve düşük streak birlikte,
// streak'e göre sıralı (en yüksek = en acil). Tek dokunuşla tamamlama.
export function RemainingToday() {
  const { data, toggleHabit } = useStore()

  const { remaining, allDone, hasDue } = useMemo(() => {
    const today = todayKey()
    const doneSet = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
    const due = data.habits.filter(h => !h.archived && isHabitDueToday(h))
    const undone = due
      .filter(h => !doneSet.has(h.id))
      .map(h => ({ h, streak: getStreak(data.completions, h.id, data.frozenDates) }))
      .sort((a, b) => b.streak - a.streak)
    return {
      remaining: undone,
      allDone: due.length > 0 && undone.length === 0,
      hasDue: due.length > 0,
    }
  }, [data])

  if (!hasDue) return null

  if (allDone) {
    return (
      <Card className="p-5 text-center">
        <p className="text-3xl">🎉</p>
        <p className="mt-2 text-sm font-semibold text-fg">Bugünün alışkanlıkları tamam</p>
        <p className="mt-0.5 text-xs text-muted">Diyarın bugün çiçek açıyor.</p>
      </Card>
    )
  }

  function handleComplete(e: React.MouseEvent, habitId: string) {
    fireConfetti({ count: 40, origin: { x: e.clientX, y: e.clientY }, power: 0.7 })
    haptic([15, 30, 15])
    playChime(1)
    toggleHabit(habitId)
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="text-base">📋</span>
        <span className="text-sm font-bold text-fg font-display">Bugün kalan</span>
        <span className="ml-1 rounded-full bg-surface-2 px-2 py-0.5 text-xs font-semibold text-muted tabular-nums">
          {remaining.length}
        </span>
      </div>

      <div className="divide-y divide-border">
        {remaining.map(({ h, streak }) => {
          const atRisk = streak >= 2
          return (
            <button
              key={h.id}
              onClick={e => handleComplete(e, h.id)}
              className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-surface-2 active:bg-surface-2">
              {/* Emoji ikonu */}
              <span
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: h.color + '22' }}>
                {h.emoji}
              </span>

              {/* İsim + streak */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-fg">{h.name}</p>
                {atRisk ? (
                  <p className="flex items-center gap-1 text-xs font-medium text-orange-400">
                    <Flame size={11} fill="currentColor" />
                    {streak} günlük seri — koru!
                  </p>
                ) : streak === 1 ? (
                  <p className="text-xs text-muted">1 gün seri başlıyor</p>
                ) : null}
              </div>

              {/* Tamamla halkası */}
              <span className={cn(
                'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                atRisk
                  ? 'border-orange-400/50 hover:border-orange-400 hover:bg-orange-400/10'
                  : 'border-border hover:border-primary hover:bg-primary/10',
              )}>
                <Check size={16} className={atRisk ? 'text-orange-400' : 'text-muted'} />
              </span>
            </button>
          )
        })}
      </div>
    </Card>
  )
}
