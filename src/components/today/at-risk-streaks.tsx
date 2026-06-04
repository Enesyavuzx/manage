'use client'
import { useMemo } from 'react'
import { Flame } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { todayKey, isHabitDueToday, getStreak } from '@/lib/store'
import { Card } from '@/components/ui/card'

// Risk altındaki seriler: bugün yapılmamış, 2+ günlük serisi olan alışkanlıklar.
// Kayıp-kaçınma DEHB'de güçlü bir tetikleyicidir; tek dokunuşla korunur.
export function AtRiskStreaks() {
  const { data, toggleHabit } = useStore()
  const late = new Date().getHours() >= 17

  const atRisk = useMemo(() => {
    const today = todayKey()
    const done = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
    return data.habits
      .filter(h => !h.archived && isHabitDueToday(h) && !done.has(h.id))
      .map(h => ({ h, streak: getStreak(data.completions, h.id, data.frozenDates) }))
      .filter(x => x.streak >= 2)
      .sort((a, b) => b.streak - a.streak)
  }, [data])

  if (atRisk.length === 0) return null

  return (
    <Card className="overflow-hidden border-danger/30">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Flame size={15} className="text-danger" />
        <span className="text-sm font-bold text-fg font-display">Korunacak seriler</span>
        {late && <span className="text-xs text-danger">bu gece kopabilir</span>}
      </div>
      <div className="divide-y divide-border">
        {atRisk.map(({ h, streak }) => (
          <div key={h.id} className="flex items-center gap-3 px-4 py-2.5">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ backgroundColor: h.color + '22' }}>{h.emoji}</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">{h.name}</p>
              <p className="text-xs text-danger">🔥 {streak} günlük seri risk altında</p>
            </div>
            <button onClick={() => toggleHabit(h.id)} className="shrink-0 rounded-lg bg-danger/15 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/25">
              Koru
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}
