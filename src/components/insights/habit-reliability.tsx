'use client'
import { AlertTriangle } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { habitReliability } from '@/lib/insights'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function rateColor(rate: number): string {
  if (rate >= 0.7) return 'bg-success'
  if (rate >= 0.4) return 'bg-xp'
  return 'bg-danger'
}

export function HabitReliability() {
  const { data } = useStore()
  const rows = habitReliability(data, 30)
  const atRisk = rows.filter(r => r.rate < 0.4)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Alışkanlık tutarlılığı</CardTitle>
        <span className="text-xs text-muted">Son 30 gün</span>
      </CardHeader>
      <CardBody className="space-y-3">
        {rows.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">Planlı alışkanlık verisi birikince burada görünecek.</p>
        ) : (
          <>
            {atRisk.length > 0 && (
              <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2.5">
                <AlertTriangle size={14} className="mt-0.5 shrink-0 text-danger" />
                <p className="text-xs text-fg">
                  {atRisk.length} alışkanlık geride kalıyor. Küçük bir adımla yeniden başlatmayı dene.
                </p>
              </div>
            )}
            {rows.map(r => {
              const pct = Math.round(r.rate * 100)
              return (
                <div key={r.habit.id} className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-base">{r.habit.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-fg">{r.habit.name}</span>
                    <span className="shrink-0 text-xs text-muted">{r.done}/{r.due}</span>
                    <span className="w-10 shrink-0 text-right text-xs font-semibold text-fg">%{pct}</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden bg-surface-2">
                    <div className={cn('h-full transition-all duration-500', rateColor(r.rate))} style={{ width: `${Math.max(3, pct)}%` }} />
                  </div>
                </div>
              )
            })}
          </>
        )}
      </CardBody>
    </Card>
  )
}
