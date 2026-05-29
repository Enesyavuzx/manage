'use client'
import { Lock } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { cn } from '@/lib/utils'

export function AchievementGrid() {
  const { data } = useStore()

  const unlocked = data.achievements.filter(a => a.unlockedAt).length
  const total = data.achievements.length

  return (
    <div className="rounded-xl border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <h2 className="text-sm font-semibold text-white">Achievements</h2>
        <span className="text-xs text-muted">{unlocked} / {total}</span>
      </div>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
        {data.achievements.map(a => (
          <div
            key={a.id}
            className={cn(
              'relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all',
              a.unlockedAt
                ? 'border-accent/20 bg-accent/5'
                : 'border-border bg-surface-2 opacity-50',
            )}
          >
            <div className={cn(
              'flex h-12 w-12 items-center justify-center rounded-xl text-2xl',
              a.unlockedAt ? 'bg-accent/10' : 'bg-surface grayscale',
            )}>
              {a.unlockedAt ? a.emoji : <Lock size={20} className="text-muted-2" />}
            </div>
            <div>
              <p className="text-xs font-semibold text-white">{a.name}</p>
              <p className="text-xs text-muted mt-0.5">{a.description}</p>
            </div>
            {a.unlockedAt && (
              <span className="text-xs text-xp font-medium">+{a.xpBonus} XP</span>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
