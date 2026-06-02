'use client'
import { useState } from 'react'
import { Lock } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { ACHIEVEMENTS, TIER_META } from '@/lib/achievements'
import { getProgressValue } from '@/lib/store'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import type { AchievementDef } from '@/lib/types'

type Filter = 'all' | 'unlocked' | 'locked'

export function AchievementGrid() {
  const { data } = useStore()
  const [filter, setFilter] = useState<Filter>('all')

  const unlockedCount = Object.keys(data.unlockedAchievements).length
  const total = ACHIEVEMENTS.length

  const isUnlocked = (a: AchievementDef) => Boolean(data.unlockedAchievements[a.id])
  const list = ACHIEVEMENTS.filter(a =>
    filter === 'all' ? true : filter === 'unlocked' ? isUnlocked(a) : !isUnlocked(a)
  )

  const filters: { id: Filter; label: string }[] = [
    { id: 'all', label: `Tümü ${total}` },
    { id: 'unlocked', label: `Açık ${unlockedCount}` },
    { id: 'locked', label: `Kilitli ${total - unlockedCount}` },
  ]

  return (
    <Card>
      <CardHeader>
        <CardTitle>Başarımlar</CardTitle>
        <div className="flex gap-1 rounded-lg border border-border bg-surface-2 p-1">
          {filters.map(f => (
            <button key={f.id} onClick={() => setFilter(f.id)}
              className={cn('rounded-md px-2.5 py-1 text-xs font-medium transition-all',
                filter === f.id ? 'bg-primary text-bg' : 'text-muted hover:text-fg')}>
              {f.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <div className="grid grid-cols-2 gap-3 p-4 sm:grid-cols-3 lg:grid-cols-4">
        {list.map(a => {
          const unlocked = isUnlocked(a)
          const tier = TIER_META[a.tier]
          const current = unlocked ? a.requirement.value : Math.min(getProgressValue(data, a.requirement), a.requirement.value)
          const pct = Math.min(100, Math.round((current / a.requirement.value) * 100))

          return (
            <div key={a.id} className={cn(
              'relative flex flex-col items-center gap-2 rounded-xl border p-4 text-center transition-all',
              unlocked ? 'bg-surface-2' : 'border-border bg-surface opacity-70',
            )} style={unlocked ? { borderColor: tier.color + '66', boxShadow: `0 0 18px -6px ${tier.ring}` } : undefined}>
              <span className="absolute right-2 top-2 text-[10px] font-medium uppercase" style={{ color: unlocked ? tier.color : 'rgb(var(--c-muted2))' }}>
                {tier.label}
              </span>
              <div className="flex h-12 w-12 items-center justify-center rounded-xl text-2xl"
                style={{ backgroundColor: unlocked ? tier.ring : 'rgb(var(--c-surface2))' }}>
                {unlocked ? a.emoji : <Lock size={18} className="text-muted-2" />}
              </div>
              <div>
                <p className="text-xs font-semibold text-fg">{a.name}</p>
                <p className="mt-0.5 text-xs text-muted leading-snug">{a.description}</p>
              </div>
              <span className="text-xs font-medium text-xp">+{a.xpBonus} XP</span>

              {/* Progress bar for locked achievements */}
              {!unlocked && (
                <div className="w-full space-y-1">
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${pct}%`, backgroundColor: tier.color }}
                    />
                  </div>
                  <p className="text-[10px] text-muted-2">
                    {current.toLocaleString('tr-TR')} / {a.requirement.value.toLocaleString('tr-TR')}
                  </p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
