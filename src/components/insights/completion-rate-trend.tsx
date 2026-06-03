'use client'
import { useStore } from '@/hooks/useStore'
import { weeklyRates } from '@/lib/insights'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'

export function CompletionRateTrend() {
  const { data } = useStore()
  const weeks = weeklyRates(data, 8)
  const hasAny = weeks.some(w => w.due > 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tamamlama oranı trendi</CardTitle>
        <span className="text-xs text-muted">Son 8 hafta</span>
      </CardHeader>
      <CardBody>
        {!hasAny ? (
          <p className="py-6 text-center text-sm text-muted">Trend için yeterli veri yok.</p>
        ) : (
          <div className="flex items-end gap-2" style={{ height: 140 }}>
            {weeks.map((w, i) => {
              const pct = Math.round(w.rate * 100)
              const barH = w.due > 0 ? Math.max(4, pct) : 0
              return (
                <div key={i} className="flex flex-1 flex-col items-center gap-1.5">
                  <span className="text-[10px] font-medium text-muted">{w.due > 0 ? `%${pct}` : ''}</span>
                  <div className="flex w-full items-end" style={{ height: 100 }}>
                    <div
                      className="w-full bg-primary transition-all duration-500"
                      style={{ height: `${barH}%`, opacity: 0.35 + w.rate * 0.65 }}
                      title={`${w.done}/${w.due}`}
                    />
                  </div>
                  <span className="text-[10px] text-muted-2">{w.label}</span>
                </div>
              )
            })}
          </div>
        )}
      </CardBody>
    </Card>
  )
}
