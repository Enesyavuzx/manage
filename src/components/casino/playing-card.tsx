'use client'
import { isRed, type Card } from '@/lib/casino'
import { cn } from '@/lib/utils'

export function PlayingCard({ card, hidden }: { card?: Card; hidden?: boolean }) {
  if (hidden || !card) {
    return (
      <div className="flex h-24 w-16 items-center justify-center rounded-lg border-2 border-white/20 bg-gradient-to-br from-indigo-700 to-indigo-900 shadow-md">
        <div className="h-16 w-10 rounded border border-white/15 bg-[repeating-linear-gradient(45deg,rgba(255,255,255,0.08)_0px,rgba(255,255,255,0.08)_4px,transparent_4px,transparent_8px)]" />
      </div>
    )
  }
  const red = isRed(card.suit)
  return (
    <div className="relative flex h-24 w-16 flex-col justify-between rounded-lg border border-black/10 bg-white p-1.5 shadow-md">
      <span className={cn('text-sm font-bold leading-none', red ? 'text-red-600' : 'text-zinc-900')}>
        {card.rank}
      </span>
      <span className={cn('self-center text-2xl leading-none', red ? 'text-red-600' : 'text-zinc-900')}>
        {card.suit}
      </span>
      <span className={cn('self-end text-sm font-bold leading-none rotate-180', red ? 'text-red-600' : 'text-zinc-900')}>
        {card.rank}
      </span>
    </div>
  )
}
