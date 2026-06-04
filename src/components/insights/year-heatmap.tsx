'use client'
import { useMemo } from 'react'
import { format, subDays, startOfWeek, addDays, addWeeks } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'

const DAY_KEY = 'yyyy-MM-dd'
const WEEKDAY_LABELS = ['Pzt', '', 'Çar', '', 'Cum', '', 'Paz']

// Tamamlama sayısını 0-4 yoğunluk seviyesine eşler.
function intensity(count: number): number {
  if (count <= 0) return 0
  if (count === 1) return 1
  if (count <= 3) return 2
  if (count <= 5) return 3
  return 4
}

function cellStyle(level: number): React.CSSProperties {
  if (level === 0) return { background: 'rgb(var(--c-surface2))' }
  const opacity = [0, 0.3, 0.5, 0.72, 1][level]
  return { background: `rgb(var(--c-success) / ${opacity})` }
}

export function YearHeatmap() {
  const { data } = useStore()

  const { weeks, monthLabels, total, activeDays, busiest } = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of data.completions) {
      counts.set(c.date, (counts.get(c.date) ?? 0) + 1)
    }

    const today = new Date()
    const todayStr = format(today, DAY_KEY)
    // 53 haftalık pencere, Pazartesi başlangıçlı.
    const start = startOfWeek(subDays(today, 364), { weekStartsOn: 1 })

    const weeks: { date: string; count: number; future: boolean }[][] = []
    const monthLabels: { index: number; label: string }[] = []
    let lastMonth = -1

    for (let w = 0; w < 53; w++) {
      const weekStart = addWeeks(start, w)
      const col: { date: string; count: number; future: boolean }[] = []
      for (let d = 0; d < 7; d++) {
        const day = addDays(weekStart, d)
        const dateStr = format(day, DAY_KEY)
        col.push({
          date: dateStr,
          count: counts.get(dateStr) ?? 0,
          future: dateStr > todayStr,
        })
      }
      // Ayın değiştiği ilk haftada ay etiketi.
      const m = weekStart.getMonth()
      if (m !== lastMonth) {
        monthLabels.push({ index: w, label: format(weekStart, 'LLL', { locale: tr }) })
        lastMonth = m
      }
      weeks.push(col)
    }

    let total = 0
    let activeDays = 0
    let busiest = { date: '', count: 0 }
    for (const [date, count] of counts) {
      if (date < format(start, DAY_KEY) || date > todayStr) continue
      total += count
      if (count > 0) activeDays++
      if (count > busiest.count) busiest = { date, count }
    }

    return { weeks, monthLabels, total, activeDays, busiest }
  }, [data.completions])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yıllık aktivite</CardTitle>
        <span className="text-xs text-muted">{total} tamamlama · {activeDays} aktif gün</span>
      </CardHeader>
      <CardBody className="space-y-3">
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex flex-col gap-1">
            {/* Ay etiketleri */}
            <div className="flex gap-[3px] pl-7">
              {weeks.map((_, wi) => {
                const label = monthLabels.find(m => m.index === wi)
                return (
                  <div key={wi} className="w-[11px] text-[9px] text-muted-2">
                    {label ? label.label : ''}
                  </div>
                )
              })}
            </div>
            {/* Gün etiketleri + grid */}
            <div className="flex gap-[3px]">
              <div className="flex w-6 shrink-0 flex-col gap-[3px]">
                {WEEKDAY_LABELS.map((label, i) => (
                  <div key={i} className="h-[11px] text-[8px] leading-[11px] text-muted-2">{label}</div>
                ))}
              </div>
              {weeks.map((col, wi) => (
                <div key={wi} className="flex flex-col gap-[3px]">
                  {col.map(cell => (
                    cell.future ? (
                      <div key={cell.date} className="h-[11px] w-[11px]" />
                    ) : (
                      <div key={cell.date}
                        title={`${format(new Date(cell.date + 'T12:00:00'), 'd MMM', { locale: tr })} · ${cell.count} tamamlama`}
                        className="h-[11px] w-[11px] rounded-[2px]"
                        style={cellStyle(intensity(cell.count))}
                      />
                    )
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-muted">
          <span>
            {busiest.count > 0
              ? `En yoğun gün: ${format(new Date(busiest.date + 'T12:00:00'), 'd MMM', { locale: tr })} (${busiest.count})`
              : 'Henüz tamamlama yok'}
          </span>
          <span className="flex items-center gap-1">
            Az
            {[0, 1, 2, 3, 4].map(l => (
              <span key={l} className="h-2.5 w-2.5 rounded-[2px]" style={cellStyle(l)} />
            ))}
            Çok
          </span>
        </div>
      </CardBody>
    </Card>
  )
}
