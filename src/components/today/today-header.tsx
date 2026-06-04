'use client'
import { useMemo } from 'react'
import { useStore } from '@/hooks/useStore'
import { todayKey, isHabitDueToday } from '@/lib/store'

function greeting(hour: number): string {
  if (hour < 6) return 'İyi geceler'
  if (hour < 12) return 'Günaydın'
  if (hour < 18) return 'İyi günler'
  if (hour < 22) return 'İyi akşamlar'
  return 'İyi geceler'
}

export function TodayHeader() {
  const { data } = useStore()
  const { doneCount, total, pct } = useMemo(() => {
    const today = todayKey()
    const due = data.habits.filter(h => !h.archived && isHabitDueToday(h))
    const done = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
    const dc = due.filter(h => done.has(h.id)).length
    return { doneCount: dc, total: due.length, pct: due.length ? Math.round((dc / due.length) * 100) : 0 }
  }, [data])

  const now = new Date()
  const name = data.profile.name?.trim()
  const dateStr = now.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <div>
      <p className="text-xs font-medium text-muted font-display">{dateStr}</p>
      <h1 className="mt-0.5 text-2xl font-bold text-fg text-gradient">
        {greeting(now.getHours())}{name ? `, ${name}` : ''}
      </h1>
      {total > 0 && (
        <div className="mt-3">
          <div className="mb-1 flex justify-between text-xs text-muted">
            <span>Bugünün ilerlemesi</span>
            <span className="font-semibold text-fg tabular-nums">{doneCount}/{total}</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div className={pct === 100 ? 'h-full rounded-full bg-success transition-all duration-700' : 'h-full rounded-full bg-primary transition-all duration-700'} style={{ width: `${pct}%` }} />
          </div>
        </div>
      )}
    </div>
  )
}
