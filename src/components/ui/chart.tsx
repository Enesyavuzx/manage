'use client'
import type React from 'react'

interface ChartTooltipProps {
  active?: boolean
  label?: React.ReactNode
  payload?: ReadonlyArray<{
    name?: string | number
    value?: string | number
    color?: string
    stroke?: string
  }>
}

// Recharts için tema renkleriyle uyumlu ortak tooltip.
// Renkler globals.css'teki --chart-* değişkenlerinden gelir; tema değişince
// grafikler otomatik uyum sağlar.
export function ChartTooltip({ active, payload, label }: ChartTooltipProps) {
  if (!active || !payload?.length) return null
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-xs shadow-lg">
      {label != null && <p className="mb-1 font-semibold text-fg">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} className="flex items-center gap-1.5 text-muted">
          <span className="inline-block h-2 w-2 rounded-full" style={{ background: p.color ?? p.stroke }} />
          {p.name}: <span className="font-medium text-fg">{p.value}</span>
        </p>
      ))}
    </div>
  )
}

export const CHART = {
  primary: 'var(--chart-primary)',
  primarySoft: 'var(--chart-primary-soft)',
  primary2: 'var(--chart-primary2)',
  xp: 'var(--chart-xp)',
  grid: 'var(--chart-grid)',
  label: 'var(--chart-label)',
} as const

export const AXIS_TICK = { fill: 'var(--chart-label)', fontSize: 10 } as const
