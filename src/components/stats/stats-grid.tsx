'use client'
import { TrendingUp, Target, Flame, Calendar } from 'lucide-react'
import { useStore, getStreak } from '@/hooks/useStore'
import { getLongestStreak } from '@/lib/store'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { cn } from '@/lib/utils'
import { CATEGORY_META } from '@/lib/constants'
import type { Category } from '@/lib/types'

function StatCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType, label: string, value: string | number, sub?: string
}) {
  return (
    <div className="rounded-xl border border-border bg-surface p-5">
      <div className="flex items-center gap-2 mb-3">
        <Icon size={15} className="text-muted" />
        <span className="text-xs text-muted font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-muted mt-1">{sub}</p>}
    </div>
  )
}

export function StatsGrid() {
  const { data } = useStore()

  const totalCompletions = data.completions.length
  const activeHabits = data.habits.filter(h => !h.archived).length
  const maxStreak = Math.max(0, ...data.habits.map(h => getStreak(data.completions, h.id)))
  const longestEver = Math.max(0, ...data.habits.map(h => getLongestStreak(data.completions, h.id)))

  // Last 28 days heatmap
  const today = new Date()
  const days = eachDayOfInterval({ start: subDays(today, 27), end: today })
  const completionsByDate = new Map<string, number>()
  for (const c of data.completions) {
    completionsByDate.set(c.date, (completionsByDate.get(c.date) ?? 0) + 1)
  }

  // Category breakdown
  const catCounts: Record<string, number> = {}
  for (const c of data.completions) {
    const habit = data.habits.find(h => h.id === c.habitId)
    if (habit) catCounts[habit.category] = (catCounts[habit.category] ?? 0) + 1
  }
  const topCats = Object.entries(catCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)

  const maxDay = Math.max(1, ...days.map(d => completionsByDate.get(format(d, 'yyyy-MM-dd')) ?? 0))

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatCard icon={Target}    label="Total completions" value={totalCompletions} />
        <StatCard icon={Flame}     label="Current streak"    value={maxStreak}       sub="days" />
        <StatCard icon={TrendingUp} label="Longest streak"   value={longestEver}     sub="days" />
        <StatCard icon={Calendar}  label="Active habits"     value={activeHabits}    />
      </div>

      {/* Heatmap */}
      <div className="rounded-xl border border-border bg-surface p-5">
        <h3 className="text-sm font-semibold text-white mb-4">Last 28 days</h3>
        <div className="grid grid-cols-28 gap-1" style={{ gridTemplateColumns: 'repeat(28, minmax(0, 1fr))' }}>
          {days.map(day => {
            const key = format(day, 'yyyy-MM-dd')
            const count = completionsByDate.get(key) ?? 0
            const intensity = count === 0 ? 0 : Math.min(1, count / maxDay)
            return (
              <div
                key={key}
                title={`${key}: ${count} completions`}
                className="aspect-square rounded-sm"
                style={{
                  backgroundColor: count === 0
                    ? '#1a1a1a'
                    : `rgba(124,58,237,${0.2 + intensity * 0.8})`,
                }}
              />
            )
          })}
        </div>
        <div className="mt-2 flex justify-between text-xs text-muted">
          <span>{format(days[0], 'MMM d')}</span>
          <span>Today</span>
        </div>
      </div>

      {/* Category breakdown */}
      {topCats.length > 0 && (
        <div className="rounded-xl border border-border bg-surface p-5">
          <h3 className="text-sm font-semibold text-white mb-4">By category</h3>
          <div className="space-y-3">
            {topCats.map(([cat, count]) => {
              const meta = CATEGORY_META[cat as Category]
              const pct = Math.round((count / totalCompletions) * 100)
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-white">{meta.emoji} {meta.label}</span>
                    <span className="text-muted">{count} ({pct}%)</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: meta.color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Per habit table */}
      {data.habits.filter(h => !h.archived).length > 0 && (
        <div className="rounded-xl border border-border bg-surface">
          <div className="border-b border-border px-5 py-4">
            <h3 className="text-sm font-semibold text-white">Per habit</h3>
          </div>
          <div className="divide-y divide-border">
            {data.habits.filter(h => !h.archived).map(h => {
              const completions = data.completions.filter(c => c.habitId === h.id).length
              const streak = getStreak(data.completions, h.id)
              const longest = getLongestStreak(data.completions, h.id)
              return (
                <div key={h.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="text-lg shrink-0">{h.emoji}</span>
                  <span className="flex-1 text-sm text-white truncate">{h.name}</span>
                  <div className="flex items-center gap-4 text-xs text-muted shrink-0">
                    <span className="hidden sm:block">{completions} total</span>
                    <span className={cn('font-medium', streak > 0 ? 'text-orange-400' : '')}>
                      {streak} streak
                    </span>
                    <span className="hidden md:block">{longest} best</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
