'use client'
import { cn } from '@/lib/utils'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'xp' | 'accent'
  className?: string
}

export function Badge({ children, variant = 'default', className }: BadgeProps) {
  return (
    <span className={cn(
      'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium',
      variant === 'default' && 'bg-surface-2 text-muted border border-border',
      variant === 'success' && 'bg-success/10 text-success border border-success/20',
      variant === 'xp'      && 'bg-xp/10 text-xp border border-xp/20',
      variant === 'accent'  && 'bg-accent/10 text-accent-light border border-accent/20',
      className,
    )}>
      {children}
    </span>
  )
}
