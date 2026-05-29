'use client'
import { Flame } from 'lucide-react'
import { useStore, getStreak } from '@/hooks/useStore'

export function StreakOverview() {
  const { data } = useStore()

  const habitStreaks = data.habits
    .filter(h => !h.archived)
    .map(h => ({
      habit: h,
      streak: getStreak(data.completions, h.id),
    }))
    .filter(({ streak }) => streak > 0)
    .sort((a, b) => b.streak - a.streak)
    .slice(0, 5)

  if (habitStreaks.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-white flex items-center gap-2">
          <Flame size={16} className="text-orange-400" />
          Active Streaks
        </h2>
      </div>
      <div className="p-4 space-y-3">
        {habitStreaks.map(({ habit, streak }) => (
          <div key={habit.id} className="flex items-center gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
              style={{ backgroundColor: habit.color + '22' }}>
              {habit.emoji}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-white truncate">{habit.name}</p>
            </div>
            <div className="flex items-center gap-1 text-orange-400 font-bold text-sm shrink-0">
              <Flame size={14} fill="currentColor" />
              {streak}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
