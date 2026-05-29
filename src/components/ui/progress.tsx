'use client'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  color?: 'accent' | 'xp' | 'success'
  size?: 'sm' | 'md'
  className?: string
}

export function Progress({ value, max = 1, color = 'accent', size = 'md', className }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn(
      'w-full rounded-full overflow-hidden',
      size === 'sm' && 'h-1',
      size === 'md' && 'h-2',
      'bg-surface-2',
      className,
    )}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-500',
          color === 'accent'  && 'bg-accent-light',
          color === 'xp'      && 'bg-xp',
          color === 'success' && 'bg-success-light',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
