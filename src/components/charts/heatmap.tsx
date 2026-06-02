'use client'
import { format, subDays, eachDayOfInterval } from 'date-fns'

interface HeatmapProps {
  countsByDate: Map<string, number>
  days?: number
}

export function Heatmap({ countsByDate, days = 119 }: HeatmapProps) {
  const today = new Date()
  const range = eachDayOfInterval({ start: subDays(today, days - 1), end: today })
  const max = Math.max(1, ...Array.from(countsByDate.values()))

  // pad to start on Sunday column
  const firstDow = range[0].getDay()
  const cells: (Date | null)[] = [...Array(firstDow).fill(null), ...range]
  const weeks: (Date | null)[][] = []
  for (let i = 0; i < cells.length; i += 7) weeks.push(cells.slice(i, i + 7))

  return (
    <div className="flex gap-1 overflow-x-auto pb-1">
      {weeks.map((week, wi) => (
        <div key={wi} className="flex flex-col gap-1">
          {Array.from({ length: 7 }).map((_, di) => {
            const day = week[di]
            if (!day) return <div key={di} className="h-3 w-3" />
            const key = format(day, 'yyyy-MM-dd')
            const count = countsByDate.get(key) ?? 0
            const intensity = count === 0 ? 0 : 0.25 + (count / max) * 0.75
            return (
              <div
                key={di}
                title={`${key}: ${count}`}
                className="h-3 w-3 rounded-sm"
                style={{
                  backgroundColor: count === 0
                    ? 'rgb(var(--c-surface2))'
                    : `rgb(var(--c-primary) / ${intensity})`,
                }}
              />
            )
          })}
        </div>
      ))}
    </div>
  )
}
