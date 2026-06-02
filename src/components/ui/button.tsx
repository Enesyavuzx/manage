'use client'
import { cn } from '@/lib/utils'
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'xp'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'secondary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium font-display transition-all duration-150 active:translate-y-px disabled:opacity-40 disabled:cursor-not-allowed',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-5 py-2.5 text-base',
        variant === 'primary'   && 'bg-primary text-bg hover:brightness-110 shadow-glow',
        variant === 'xp'        && 'bg-xp text-bg hover:brightness-110 shadow-glow-xp',
        variant === 'secondary' && 'bg-surface-2 text-fg border border-border hover:border-border-hover',
        variant === 'ghost'     && 'text-muted hover:text-fg hover:bg-surface-2',
        variant === 'danger'    && 'bg-danger/15 text-danger border border-danger/30 hover:bg-danger/25',
        className,
      )}
    >
      {children}
    </button>
  )
}
