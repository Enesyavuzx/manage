'use client'
import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { freshDeck, handValue, isBlackjack, type Card } from '@/lib/casino'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'
import { Card as UICard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { PlayingCard } from './playing-card'
import { BetControl } from './bet-control'
import { cn } from '@/lib/utils'

type Phase = 'bet' | 'player' | 'dealer' | 'done'
type Outcome = 'win' | 'lose' | 'push' | 'blackjack' | null

export function Blackjack() {
  const { data, placeBet, payout } = useStore()
  const available = data.profile.totalXP - data.profile.redeemedXP

  const [bet, setBet] = useState(50)
  const [phase, setPhase] = useState<Phase>('bet')
  const [deck, setDeck] = useState<Card[]>([])
  const [player, setPlayer] = useState<Card[]>([])
  const [dealer, setDealer] = useState<Card[]>([])
  const [outcome, setOutcome] = useState<Outcome>(null)
  const [message, setMessage] = useState('')

  const pv = handValue(player).total
  const dv = handValue(dealer).total

  function deal() {
    const placed = placeBet(bet)
    if (!placed) return
    const d = freshDeck()
    const p = [d.pop()!, d.pop()!]
    const dl = [d.pop()!, d.pop()!]
    setDeck(d); setPlayer(p); setDealer(dl); setOutcome(null); setMessage('')

    if (isBlackjack(p)) {
      // Anında blackjack: 2.5x öde (bahis + 1.5x kazanç)
      const win = Math.round(bet * 2.5)
      finish('blackjack', `Blackjack! +${win} XP`, win, dl)
      setPhase('done')
    } else {
      setPhase('player')
    }
  }

  function hit() {
    if (phase !== 'player') return
    const d = [...deck]
    const next = [...player, d.pop()!]
    setDeck(d); setPlayer(next)
    if (handValue(next).total > 21) {
      finish('lose', 'Battın! Kasaya gitti', 0, dealer)
      setPhase('done')
    }
  }

  function stand() {
    if (phase !== 'player') return
    setPhase('dealer')
    const d = [...deck]
    const dl = [...dealer]
    while (handValue(dl).total < 17) dl.push(d.pop()!)
    setDeck(d); setDealer(dl)

    const ptot = handValue(player).total
    const dtot = handValue(dl).total
    if (dtot > 21 || ptot > dtot) {
      const win = bet * 2
      finish('win', `Kazandın! +${win} XP`, win, dl)
    } else if (ptot === dtot) {
      finish('push', 'Berabere, bahis iade', bet, dl)
    } else {
      finish('lose', 'Kasa kazandı', 0, dl)
    }
    setPhase('done')
  }

  function finish(o: Outcome, msg: string, win: number, _dl: Card[]) {
    setOutcome(o)
    setMessage(msg)
    if (win > 0) payout(win)
    if (o === 'win' || o === 'blackjack') {
      fireConfetti({ count: o === 'blackjack' ? 90 : 50 })
      playChime(o === 'blackjack' ? 3 : 2)
      haptic(o === 'blackjack' ? [30, 40, 30] : 30)
    } else if (o === 'lose') {
      haptic(15)
    }
  }

  function reset() {
    setPhase('bet'); setPlayer([]); setDealer([]); setOutcome(null); setMessage('')
  }

  const hideHole = phase === 'player'

  return (
    <UICard className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg font-display">🃏 Blackjack</h2>
        <span className="text-xs text-muted">21&apos;e en yakın kasayı yener</span>
      </div>

      {/* Masa */}
      <div className="rounded-xl bg-gradient-to-b from-emerald-900/40 to-emerald-950/40 p-4">
        {/* Kasa */}
        <div className="mb-4">
          <p className="mb-1.5 text-xs font-medium text-white/60">
            Kasa {phase !== 'bet' && !hideHole && <span className="tabular-nums">· {dv}</span>}
          </p>
          <div className="flex gap-1.5">
            {dealer.length === 0 ? (
              <>
                <div className="h-24 w-16 rounded-lg border-2 border-dashed border-white/10" />
                <div className="h-24 w-16 rounded-lg border-2 border-dashed border-white/10" />
              </>
            ) : (
              dealer.map((c, i) => <PlayingCard key={i} card={c} hidden={i === 1 && hideHole} />)
            )}
          </div>
        </div>

        {/* Oyuncu */}
        <div>
          <p className="mb-1.5 text-xs font-medium text-white/60">
            Sen {phase !== 'bet' && <span className="tabular-nums">· {pv}</span>}
          </p>
          <div className="flex flex-wrap gap-1.5">
            {player.length === 0 ? (
              <>
                <div className="h-24 w-16 rounded-lg border-2 border-dashed border-white/10" />
                <div className="h-24 w-16 rounded-lg border-2 border-dashed border-white/10" />
              </>
            ) : (
              player.map((c, i) => <PlayingCard key={i} card={c} />)
            )}
          </div>
        </div>
      </div>

      {/* Sonuç mesajı */}
      {message && (
        <p className={cn('text-center text-sm font-bold font-display',
          outcome === 'lose' ? 'text-danger' : outcome === 'push' ? 'text-muted' : 'text-success')}>
          {message}
        </p>
      )}

      {/* Kontroller */}
      {phase === 'bet' && (
        <div className="space-y-3">
          <BetControl bet={bet} setBet={setBet} available={available} />
          <Button variant="xp" className="w-full" onClick={deal} disabled={available < bet || bet <= 0}>
            {available < bet ? 'Yetersiz XP' : `Dağıt (${bet} XP)`}
          </Button>
        </div>
      )}

      {phase === 'player' && (
        <div className="flex gap-2">
          <Button variant="primary" className="flex-1" onClick={hit}>Kart Çek</Button>
          <Button variant="secondary" className="flex-1" onClick={stand}>Dur</Button>
        </div>
      )}

      {phase === 'done' && (
        <Button variant="primary" className="w-full" onClick={reset}>Tekrar Oyna</Button>
      )}
    </UICard>
  )
}
