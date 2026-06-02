'use client'
import { useState } from 'react'
import { Sparkles, Gift } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { MYSTERY_BOX_COST } from '@/lib/constants'
import { formatXP } from '@/lib/utils'
import { cn } from '@/lib/utils'
import { fireConfetti, haptic } from '@/lib/confetti'

export function MysteryBox() {
  const { data, openMysteryBox } = useStore()
  const available = data.profile.totalXP - data.profile.redeemedXP
  const canAfford = available >= MYSTERY_BOX_COST
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<{ reward: number; label: string } | null>(null)

  function handleOpen() {
    if (!canAfford || spinning) return
    setSpinning(true)
    setResult(null)
    // brief suspense before revealing the outcome
    setTimeout(() => {
      const outcome = openMysteryBox()
      setResult(outcome)
      setSpinning(false)
      if (outcome) {
        const big = outcome.label === 'JACKPOT!'
        fireConfetti({ count: big ? 180 : 70, power: big ? 1.5 : 0.9 })
        haptic(big ? [40, 60, 40, 60, 80] : 30)
      }
    }, 900)
  }

  const jackpot = result?.label === 'JACKPOT!'

  return (
    <Card glow className="overflow-hidden">
      <div className="relative flex flex-col items-center gap-4 p-6 text-center">
        <div
          className={cn(
            'flex h-24 w-24 items-center justify-center rounded-2xl border border-border bg-surface-2 text-5xl transition-transform',
            spinning && 'animate-float',
          )}
        >
          {spinning ? '🎲' : result ? '🎉' : '🎁'}
        </div>

        <div>
          <h2 className="text-base font-bold text-fg font-display">Sürpriz Kutu</h2>
          <p className="mt-1 text-xs text-muted">
            {MYSTERY_BOX_COST} XP karşılığı rastgele ödül. Şansını dene!
          </p>
        </div>

        {result && !spinning && (
          <div
            className={cn(
              'w-full rounded-lg border px-4 py-3 animate-pop',
              jackpot ? 'border-xp/50 bg-xp/10' : 'border-success/30 bg-success/5',
            )}
          >
            <p className={cn('text-sm font-bold font-display', jackpot ? 'text-xp' : 'text-success')}>
              {result.label}
            </p>
            <p className="mt-0.5 text-2xl font-bold text-xp font-display">+{result.reward} XP</p>
          </div>
        )}

        <Button
          variant="xp"
          size="lg"
          className="w-full"
          disabled={!canAfford || spinning}
          onClick={handleOpen}
        >
          {spinning ? (
            <><Sparkles size={16} className="animate-glow-pulse" /> Açılıyor...</>
          ) : canAfford ? (
            <><Gift size={16} /> Kutuyu Aç ({MYSTERY_BOX_COST} XP)</>
          ) : (
            <>Yetersiz XP ({formatXP(available)} / {MYSTERY_BOX_COST})</>
          )}
        </Button>
      </div>
    </Card>
  )
}
