'use client'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'

const HOUR_LABELS = [
  '00', '01', '02', '03', '04', '05', '06', '07',
  '08', '09', '10', '11', '12', '13', '14', '15',
  '16', '17', '18', '19', '20', '21', '22', '23',
]

const PERIOD = [
  { label: 'Gece', range: [0, 5],   emoji: '🌑' },
  { label: 'Sabah', range: [6, 11],  emoji: '🌅' },
  { label: 'Öğle',  range: [12, 17], emoji: '☀️' },
  { label: 'Akşam', range: [18, 23], emoji: '🌙' },
]

export function HourAnalysis() {
  const { data } = useStore()
  if (data.completions.length === 0) return null

  const hourCounts = Array(24).fill(0)
  for (const c of data.completions) {
    const h = new Date(c.completedAt).getHours()
    hourCounts[h]++
  }

  const max = Math.max(1, ...hourCounts)
  const peakHour = hourCounts.indexOf(Math.max(...hourCounts))

  const periodTotals = PERIOD.map(p => ({
    ...p,
    count: hourCounts.slice(p.range[0], p.range[1] + 1).reduce((s, v) => s + v, 0),
  })).sort((a, b) => b.count - a.count)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Günün En Aktif Saati</CardTitle>
        <span className="text-xs text-muted">Saat {peakHour}:00 zirvesi</span>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="flex items-end gap-0.5 h-20">
          {hourCounts.map((count, h) => {
            const pct = (count / max) * 100
            const isPeak = h === peakHour
            return (
              <div key={h} className="flex flex-1 flex-col items-center justify-end h-full" title={`${h}:00 - ${count}`}>
                <div
                  className="w-full rounded-sm transition-all"
                  style={{
                    height: `${Math.max(4, pct)}%`,
                    backgroundColor: isPeak
                      ? 'rgb(var(--c-xp))'
                      : `rgb(var(--c-primary) / ${0.2 + (pct / 100) * 0.8})`,
                  }}
                />
              </div>
            )
          })}
        </div>
        <div className="flex justify-between text-[10px] text-muted-2">
          {[0, 6, 12, 18, 23].map(h => <span key={h}>{HOUR_LABELS[h]}</span>)}
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {periodTotals.map((p, i) => (
            <div key={p.label} className="rounded-lg border border-border bg-surface-2 p-2.5 text-center">
              <p className="text-base">{p.emoji}</p>
              <p className="mt-0.5 text-xs font-medium text-fg">{p.label}</p>
              <p className="text-xs text-muted">{p.count} görev</p>
              {i === 0 && <p className="mt-0.5 text-[10px] text-primary">En aktif</p>}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
