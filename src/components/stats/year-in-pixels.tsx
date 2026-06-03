'use client'
import { useMemo } from 'react'
import { format, subDays, startOfWeek } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'

const WEEKS = 53

export function YearInPixels() {
  const { data } = useStore()

  const countByDate = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of data.completions) m.set(c.date, (m.get(c.date) ?? 0) + 1)
    return m
  }, [data.completions])

  const frozen = useMemo(() => new Set(data.frozenDates), [data.frozenDates])

  // Build a grid of WEEKS columns (oldest -> newest), each with 7 day-cells.
  const { columns, monthLabels, max } = useMemo(() => {
    const today = new Date()
    const gridStart = startOfWeek(subDays(today, (WEEKS - 1) * 7), { weekStartsOn: 1 })
    const cols: { date: string; count: number; future: boolean; frozen: boolean }[][] = []
    const labels: { col: number; text: string }[] = []
    let maxCount = 1
    let lastMonth = -1

    for (let w = 0; w < WEEKS; w++) {
      const col: { date: string; count: number; future: boolean; frozen: boolean }[] = []
      for (let d = 0; d < 7; d++) {
        const cur = new Date(gridStart)
        cur.setDate(cur.getDate() + w * 7 + d)
        const key = format(cur, 'yyyy-MM-dd')
        const count = countByDate.get(key) ?? 0
        if (count > maxCount) maxCount = count
        col.push({ date: key, count, future: cur > today, frozen: frozen.has(key) })
        if (d === 0) {
          const month = cur.getMonth()
          if (month !== lastMonth) { labels.push({ col: w, text: format(cur, 'LLL', { locale: tr }) }); lastMonth = month }
        }
      }
      cols.push(col)
    }
    return { columns: cols, monthLabels: labels, max: maxCount }
  }, [countByDate, frozen])

  const totalDays = countByDate.size
  const totalCompletions = data.completions.length

  return (
    <Card>
      <CardHeader>
        <CardTitle>Yıllık görünüm</CardTitle>
        <span className="text-xs text-muted">{totalDays} aktif gün · {totalCompletions} görev</span>
      </CardHeader>
      <CardBody>
        <div className="overflow-x-auto pb-1">
          <div className="inline-flex flex-col gap-1">
            {/* month labels */}
            <div className="flex gap-[3px] pl-[18px] text-[9px] text-muted-2">
              {columns.map((_, w) => {
                const label = monthLabels.find(l => l.col === w)
                return <span key={w} className="w-[11px] shrink-0">{label?.text ?? ''}</span>
              })}
            </div>
            <div className="flex gap-[3px]">
              {/* weekday gutter */}
              <div className="flex flex-col gap-[3px] pr-1 text-[8px] text-muted-2">
                {['P', 'S', 'Ç', 'P', 'C', 'C', 'P'].map((d, i) => (
                  <span key={i} className="flex h-[11px] items-center">{i % 2 === 1 ? d : ''}</span>
                ))}
              </div>
              {columns.map((col, w) => (
                <div key={w} className="flex flex-col gap-[3px]">
                  {col.map(cell => (
                    <div key={cell.date}
                      title={cell.future ? '' : `${cell.date}: ${cell.count} görev${cell.frozen ? ' (donduruldu)' : ''}`}
                      className="h-[11px] w-[11px] rounded-[2px]"
                      style={cellStyle(cell.count, max, cell.future, cell.frozen)} />
                  ))}
                </div>
              ))}
            </div>
            {/* legend */}
            <div className="flex items-center justify-end gap-1.5 pt-1 text-[9px] text-muted-2">
              az
              {[0, 0.25, 0.5, 0.75, 1].map((t, i) => (
                <div key={i} className="h-[10px] w-[10px] rounded-[2px]" style={cellStyle(Math.round(t * max), max, false, false)} />
              ))}
              çok
            </div>
          </div>
        </div>
      </CardBody>
    </Card>
  )
}

function cellStyle(count: number, max: number, future: boolean, frozen: boolean): React.CSSProperties {
  if (future) return { backgroundColor: 'transparent' }
  if (frozen && count === 0) return { backgroundColor: 'rgb(var(--c-primary2) / 0.35)' }
  if (count === 0) return { backgroundColor: 'rgb(var(--c-surface2))' }
  const intensity = 0.25 + 0.75 * Math.min(1, count / Math.max(1, max))
  return { backgroundColor: `rgb(var(--c-primary) / ${intensity.toFixed(2)})` }
}
