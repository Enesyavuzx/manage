'use client'
import type { RankDef } from '@/lib/types'
import { cn } from '@/lib/utils'

export function RankBadge({ rank, size = 'md' }: { rank: RankDef; size?: 'sm' | 'md' | 'lg' }) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full border font-display font-semibold',
        size === 'sm' && 'px-2 py-0.5 text-xs',
        size === 'md' && 'px-3 py-1 text-xs',
        size === 'lg' && 'px-4 py-1.5 text-sm',
      )}
      style={{
        color: rank.color,
        borderColor: rank.color,
        backgroundColor: `${rank.color}1a`,
        boxShadow: `0 0 16px -2px ${rank.glow}`,
      }}
    >
      <span>{rank.emoji}</span>
      {rank.label}
    </span>
  )
}
