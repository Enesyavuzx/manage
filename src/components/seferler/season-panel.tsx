'use client'
import { useMemo } from 'react'
import { Check } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getSeason } from '@/lib/season'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function SeasonPanel() {
  const { data } = useStore()
  const season = useMemo(() => getSeason(data), [data])

  const next = season.nextTier
  const prevAt = next ? (season.tiers.filter(t => t.reached).slice(-1)[0]?.at ?? 0) : 0
  const span = next ? next.at - prevAt : 1
  const into = next ? season.completions - prevAt : 1
  const pct = next ? Math.max(0, Math.min(100, Math.round((into / span) * 100))) : 100

  const delta = season.completions - season.lastSeasonCompletions

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🏁</span>
          <span className="text-sm font-bold text-fg font-display">{season.label}</span>
        </div>
        <span className="text-xs text-muted">{season.daysLeft > 0 ? `${season.daysLeft} gün kaldı` : 'son gün'}</span>
      </div>

      <div className="p-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-2xl font-bold text-fg font-display tabular-nums">{season.completions}</p>
            <p className="text-xs text-muted">bu sezon tamamlama</p>
          </div>
          {season.lastSeasonCompletions > 0 && (
            <p className={cn('text-xs font-medium', delta >= 0 ? 'text-success' : 'text-danger')}>
              geçen sezona göre {delta >= 0 ? '+' : ''}{delta}
            </p>
          )}
        </div>

        {next ? (
          <div className="mt-3">
            <div className="mb-1 flex justify-between text-xs text-muted">
              <span>Sonraki: <span className="font-semibold text-fg">{next.label}</span></span>
              <span className="tabular-nums">{season.completions}/{next.at}</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
              <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${pct}%` }} />
            </div>
          </div>
        ) : (
          <p className="mt-3 text-sm font-semibold text-xp">Bu sezonun tüm kademelerini açtın! 🌟</p>
        )}

        {/* Kademe çizelgesi */}
        <div className="mt-4 space-y-1.5">
          {season.tiers.map(t => (
            <div key={t.at} className="flex items-center gap-2.5">
              <span className={cn('flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px]',
                t.reached ? 'bg-success/20 text-success' : 'bg-surface-2 text-muted-2')}>
                {t.reached ? <Check size={11} /> : t.at}
              </span>
              <span className={cn('flex-1 text-xs', t.reached ? 'font-medium text-fg' : 'text-muted')}>{t.label}</span>
              <span className="text-[11px] text-muted-2 tabular-nums">{t.at}</span>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
