'use client'
import { useStore } from '@/hooks/useStore'

export function RecentAchievements() {
  const { data } = useStore()

  const recent = data.achievements
    .filter(a => a.unlockedAt)
    .sort((a, b) => new Date(b.unlockedAt!).getTime() - new Date(a.unlockedAt!).getTime())
    .slice(0, 3)

  if (recent.length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-white">Recent Achievements</h2>
      </div>
      <div className="p-4 space-y-3">
        {recent.map(a => (
          <div key={a.id} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-accent/10 text-xl">
              {a.emoji}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">{a.name}</p>
              <p className="text-xs text-muted">{a.description}</p>
            </div>
            <span className="text-xs text-xp font-medium shrink-0">+{a.xpBonus} XP</span>
          </div>
        ))}
      </div>
    </div>
  )
}
