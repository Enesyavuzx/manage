'use client'

interface StatBarProps {
  label: string
  value: number
  max: number
  color?: string
  emoji?: string
  valueLabel?: string
}

export function StatBar({ label, value, max, color, emoji, valueLabel }: StatBarProps) {
  const pct = max > 0 ? Math.min(100, (value / max) * 100) : 0
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="flex items-center gap-1.5 font-medium text-fg">
          {emoji && <span>{emoji}</span>}
          {label}
        </span>
        <span className="text-muted">{valueLabel ?? value}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-2">
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{ width: `${pct}%`, background: color ?? 'rgb(var(--c-primary))' }}
        />
      </div>
    </div>
  )
}
