'use client'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/hooks/useStore'
import { spinSlots, SLOT_SYMBOLS, type SlotResult } from '@/lib/casino'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'
import { Card as UICard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BetControl } from './bet-control'
import { cn } from '@/lib/utils'

export function SlotMachine() {
  const { data, placeBet, payout } = useStore()
  const available = data.profile.totalXP - data.profile.redeemedXP

  const [bet, setBet] = useState(50)
  const [reels, setReels] = useState<string[]>(['🍒', '🍋', '🔔'])
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<SlotResult | null>(null)
  const timers = useRef<ReturnType<typeof setInterval>[]>([])
  const stops = useRef<ReturnType<typeof setTimeout>[]>([])

  useEffect(() => () => {
    timers.current.forEach(clearInterval)
    stops.current.forEach(clearTimeout)
  }, [])

  function spin() {
    if (spinning) return
    if (!placeBet(bet)) return
    setResult(null)
    setSpinning(true)

    const final = spinSlots(bet)
    const emojis = SLOT_SYMBOLS.map(s => s.emoji)

    timers.current.forEach(clearInterval)
    stops.current.forEach(clearTimeout)
    timers.current = []
    stops.current = []

    // Her makara hızla döner, sırayla durur.
    for (let i = 0; i < 3; i++) {
      const iv = setInterval(() => {
        setReels(prev => {
          const next = [...prev]
          next[i] = emojis[Math.floor(Math.random() * emojis.length)]
          return next
        })
      }, 70)
      timers.current.push(iv)

      const stopAt = 600 + i * 450
      const to = setTimeout(() => {
        clearInterval(iv)
        setReels(prev => {
          const next = [...prev]
          next[i] = final.reels[i].emoji
          return next
        })
        if (i === 2) settle(final)
      }, stopAt)
      stops.current.push(to)
    }
  }

  function settle(final: SlotResult) {
    setSpinning(false)
    setResult(final)
    if (final.payout > 0) {
      payout(final.payout)
      fireConfetti({ count: final.jackpot ? 160 : 60, power: final.jackpot ? 1.4 : 1 })
      playChime(final.jackpot ? 4 : 2)
      haptic(final.jackpot ? [40, 60, 40, 60] : 30)
    } else {
      haptic(12)
    }
  }

  return (
    <UICard className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg font-display">🎰 Jackpot Slot</h2>
        <span className="text-xs text-muted">7-7-7 = 50x</span>
      </div>

      {/* Makaralar */}
      <div className="flex justify-center gap-2 rounded-xl bg-gradient-to-b from-zinc-800 to-zinc-900 p-4">
        {reels.map((emoji, i) => (
          <div key={i}
            className={cn('flex h-24 w-20 items-center justify-center rounded-lg border-2 bg-zinc-950 text-5xl transition-colors',
              result && result.payout > 0 ? 'border-xp' : 'border-white/10',
              spinning && 'blur-[1px]')}>
            <span className={cn(spinning && 'animate-bob')}>{emoji}</span>
          </div>
        ))}
      </div>

      {/* Sonuç */}
      {result && (
        <p className={cn('text-center text-sm font-bold font-display',
          result.jackpot ? 'text-xp' : result.payout > 0 ? 'text-success' : 'text-muted')}>
          {result.jackpot ? '🎉 ' : ''}{result.label}
          {result.payout > 0 ? ` · +${result.payout} XP` : ` · -${bet} XP`}
        </p>
      )}

      <BetControl bet={bet} setBet={setBet} available={available} disabled={spinning} />

      <Button variant="xp" className="w-full" onClick={spin} disabled={spinning || available < bet || bet <= 0}>
        {spinning ? 'Dönüyor...' : available < bet ? 'Yetersiz XP' : `Çevir (${bet} XP)`}
      </Button>

      {/* Ödeme tablosu */}
      <div className="grid grid-cols-3 gap-1.5 rounded-lg border border-border bg-surface-2 p-2.5">
        {SLOT_SYMBOLS.map(s => (
          <div key={s.id} className="flex items-center justify-center gap-1 text-xs text-muted">
            <span className="text-base">{s.emoji}{s.emoji}{s.emoji}</span>
            <span className="font-semibold text-fg">{s.three}x</span>
          </div>
        ))}
      </div>
    </UICard>
  )
}
