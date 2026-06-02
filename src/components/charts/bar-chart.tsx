'use client'

interface Bar { label: string; value: number; color?: string }

interface BarChartProps {
  data: Bar[]
  height?: number
}

export function BarChart({ data, height = 160 }: BarChartProps) {
  const max = Math.max(1, ...data.map(d => d.value))
  return (
    <div className="flex items-end justify-between gap-2" style={{ height }}>
      {data.map((d, i) => {
        const pct = (d.value / max) * 100
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1.5 h-full justify-end">
            <span className="text-xs font-semibold text-fg">{d.value > 0 ? d.value : ''}</span>
            <div className="w-full rounded-md transition-all duration-700 ease-out relative overflow-hidden"
              style={{
                height: `${Math.max(2, pct)}%`,
                background: d.color ?? 'linear-gradient(to top, rgb(var(--c-primary)), rgb(var(--c-primary2)))',
                minHeight: d.value > 0 ? 6 : 2,
              }}
            />
            <span className="text-xs text-muted">{d.label}</span>
          </div>
        )
      })}
    </div>
  )
}
