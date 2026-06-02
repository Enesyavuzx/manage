'use client'
import { useStore } from '@/hooks/useStore'
import { RANKS, getLevelInfo, getRank } from '@/lib/gamification'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function RanksLadder() {
  const { data } = useStore()
  const level = getLevelInfo(data.profile.totalXP).level
  const current = getRank(level).rank

  return (
    <Card>
      <CardHeader><CardTitle>Rütbe Merdiveni</CardTitle></CardHeader>
      <div className="space-y-1.5 p-4">
        {RANKS.map(r => {
          const reached = level >= r.minLevel
          const isCurrent = r.id === current.id
          return (
            <div key={r.id} className={cn(
              'flex items-center gap-3 rounded-lg border px-3 py-2.5 transition-all',
              isCurrent ? 'bg-surface-2' : 'border-transparent',
            )} style={isCurrent ? { borderColor: r.color, boxShadow: `0 0 18px -6px ${r.glow}` } : undefined}>
              <span className={cn('text-xl', !reached && 'grayscale opacity-40')}>{r.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium font-display" style={{ color: reached ? r.color : 'rgb(var(--c-muted2))' }}>
                  {r.label}
                </p>
                <p className="text-xs text-muted">Seviye {r.minLevel}+</p>
              </div>
              {isCurrent && <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">Şu an</span>}
              {reached && !isCurrent && <span className="text-xs text-success">✓</span>}
            </div>
          )
        })}
      </div>
    </Card>
  )
}
