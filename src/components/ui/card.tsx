'use client'
import { cn } from '@/lib/utils'
import React from 'react'

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  glow?: boolean
  interactive?: boolean
  bordered?: boolean
}

export function Card({ className, glow, interactive, bordered = true, children, ...props }: CardProps) {
  return (
    <div
      {...props}
      className={cn(
        'ui-card relative rounded-xl bg-surface pixel-shadow',
        bordered && 'border border-border',
        glow && 'aurora-border',
        interactive && 'transition-all duration-200 hover:border-border-hover hover:-translate-y-0.5',
        className,
      )}
    >
      {children}
    </div>
  )
}

export function CardHeader({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('flex items-center justify-between border-b border-border px-5 py-4', className)}>{children}</div>
}

export function CardTitle({ className, children }: { className?: string; children: React.ReactNode }) {
  return <h2 className={cn('text-sm font-semibold text-fg font-display', className)}>{children}</h2>
}

export function CardBody({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn('p-5', className)}>{children}</div>
}
