'use client'
import { cn } from '@/lib/utils'

interface ProgressProps {
  value: number
  max?: number
  color?: 'primary' | 'xp' | 'success'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  animated?: boolean
}

export function Progress({ value, max = 1, color = 'primary', size = 'md', className, animated }: ProgressProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100))
  return (
    <div className={cn(
      'w-full overflow-hidden rounded-full bg-surface-2',
      size === 'sm' && 'h-1.5',
      size === 'md' && 'h-2.5',
      size === 'lg' && 'h-4',
      className,
    )}>
      <div
        className={cn(
          'h-full rounded-full transition-all duration-700 ease-out relative overflow-hidden',
          color === 'primary' && 'bg-primary',
          color === 'xp'      && 'bg-xp',
          color === 'success' && 'bg-success',
        )}
        style={{ width: `${pct}%` }}
      >
        {animated && pct > 0 && (
          <span className="absolute inset-0 shimmer animate-shimmer" />
        )}
      </div>
    </div>
  )
}
