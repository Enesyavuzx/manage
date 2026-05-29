'use client'
import { cn } from '@/lib/utils'
import React from 'react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
}

export function Button({ variant = 'secondary', size = 'md', className, children, ...props }: ButtonProps) {
  return (
    <button
      {...props}
      className={cn(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed',
        size === 'sm' && 'px-3 py-1.5 text-xs',
        size === 'md' && 'px-4 py-2 text-sm',
        size === 'lg' && 'px-5 py-2.5 text-base',
        variant === 'primary'   && 'bg-accent hover:bg-accent-hover text-white',
        variant === 'secondary' && 'bg-surface-2 hover:bg-border text-white border border-border hover:border-border-hover',
        variant === 'ghost'     && 'text-muted hover:text-white hover:bg-surface-2',
        variant === 'danger'    && 'bg-red-900/30 hover:bg-red-900/50 text-red-400 border border-red-900/30',
        className,
      )}
    >
      {children}
    </button>
  )
}
