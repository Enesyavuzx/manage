'use client'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

const STEPS = [10, 50, 100, 500]

export function BetControl({
  bet, setBet, available, disabled, min = 10, max,
}: {
  bet: number
  setBet: (v: number) => void
  available: number
  disabled?: boolean
  min?: number
  max?: number
}) {
  const cap = Math.min(max ?? available, available)
  const clamp = (v: number) => Math.max(min, Math.min(cap, v))

  return (
    <div className={cn('space-y-2', disabled && 'pointer-events-none opacity-50')}>
      <div className="flex items-center gap-2">
        <button onClick={() => setBet(clamp(bet - 10))}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-fg hover:border-border-hover">
          <Minus size={15} />
        </button>
        <div className="flex-1 rounded-lg border border-border bg-surface-2 py-2 text-center">
          <span className="text-lg font-bold text-xp font-display tabular-nums">{bet}</span>
          <span className="ml-1 text-xs text-muted">XP bahis</span>
        </div>
        <button onClick={() => setBet(clamp(bet + 10))}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-fg hover:border-border-hover">
          <Plus size={15} />
        </button>
      </div>
      <div className="flex gap-1.5">
        {STEPS.map(s => (
          <button key={s} onClick={() => setBet(clamp(s))}
            className="flex-1 rounded-lg border border-border bg-surface-2 py-1.5 text-xs font-medium text-muted hover:text-fg">
            {s}
          </button>
        ))}
        <button onClick={() => setBet(clamp(cap))}
          className="flex-1 rounded-lg border border-border bg-surface-2 py-1.5 text-xs font-medium text-muted hover:text-fg">
          Max
        </button>
      </div>
    </div>
  )
}
