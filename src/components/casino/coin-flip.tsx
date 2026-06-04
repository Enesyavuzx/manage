'use client'
import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { coinFlip } from '@/lib/casino'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'
import { Card as UICard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BetControl } from './bet-control'
import { cn } from '@/lib/utils'

type Side = 'heads' | 'tails'
const FACE: Record<Side, { emoji: string; label: string }> = {
  heads: { emoji: '👑', label: 'Yazı' },
  tails: { emoji: '🪙', label: 'Tura' },
}

export function CoinFlip() {
  const { data, placeBet, payout } = useStore()
  const available = data.profile.totalXP - data.profile.redeemedXP

  const [bet, setBet] = useState(50)
  const [pick, setPick] = useState<Side>('heads')
  const [flipping, setFlipping] = useState(false)
  const [landed, setLanded] = useState<Side | null>(null)
  const [won, setWon] = useState<boolean | null>(null)

  function play() {
    if (flipping || !placeBet(bet)) return
    setFlipping(true); setWon(null); setLanded(null)
    const outcome = coinFlip()
    setTimeout(() => {
      setLanded(outcome)
      const win = outcome === pick
      setWon(win)
      setFlipping(false)
      if (win) {
        payout(bet * 2)
        fireConfetti({ count: 50 }); playChime(2); haptic(30)
      } else {
        haptic(12)
      }
    }, 900)
  }

  return (
    <UICard className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg font-display">🪙 Yazı Tura</h2>
        <span className="text-xs text-muted">Doğru tahmin = 2x</span>
      </div>

      <div className="flex justify-center py-2">
        <div className={cn('flex h-28 w-28 items-center justify-center rounded-full border-4 border-xp/40 bg-gradient-to-br from-amber-300 to-amber-500 text-6xl shadow-lg',
          flipping && 'animate-spin')}>
          {flipping ? '🪙' : landed ? FACE[landed].emoji : FACE[pick].emoji}
        </div>
      </div>

      {won !== null && !flipping && (
        <p className={cn('text-center text-sm font-bold font-display', won ? 'text-success' : 'text-danger')}>
          {FACE[landed!].label} geldi · {won ? `+${bet * 2} XP` : `-${bet} XP`}
        </p>
      )}

      <div className="flex gap-2">
        {(Object.keys(FACE) as Side[]).map(s => (
          <button key={s} onClick={() => setPick(s)} disabled={flipping}
            className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2.5 text-sm font-medium transition-all',
              pick === s ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg',
              flipping && 'opacity-50')}>
            {FACE[s].emoji} {FACE[s].label}
          </button>
        ))}
      </div>

      <BetControl bet={bet} setBet={setBet} available={available} disabled={flipping} />

      <Button variant="xp" className="w-full" onClick={play} disabled={flipping || available < bet || bet <= 0}>
        {flipping ? 'Havada...' : available < bet ? 'Yetersiz XP' : `At (${bet} XP)`}
      </Button>
    </UICard>
  )
}
