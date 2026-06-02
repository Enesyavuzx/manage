'use client'
import { Flame } from 'lucide-react'
import { useStore, getStreak } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export function StreakOverview() {
  const { data } = useStore()
  const streaks = data.habits
    .filter(h => !h.archived)
    .map(h => ({ habit: h, streak: getStreak(data.completions, h.id) }))
    .filter(s => s.streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5)

  return (
    <Card>
      <CardHeader>
        <CardTitle><span className="inline-flex items-center gap-2"><Flame size={15} className="text-orange-400" /> Aktif Streakler</span></CardTitle>
      </CardHeader>
      <div className="space-y-3 p-4">
        {streaks.length === 0 && <p className="py-4 text-center text-sm text-muted">Henüz streak yok. Bugün başla!</p>}
        {streaks.map(({ habit, streak }) => (
          <div key={habit.id} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base" style={{ backgroundColor: habit.color + '22' }}>
              {habit.emoji}
            </div>
            <span className="min-w-0 flex-1 truncate text-sm text-fg">{habit.name}</span>
            <span className="flex shrink-0 items-center gap-1 text-sm font-bold text-orange-400">
              <Flame size={14} fill="currentColor" />{streak}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
