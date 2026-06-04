'use client'
import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { Blackjack } from '@/components/casino/blackjack'
import { SlotMachine } from '@/components/casino/slot-machine'
import { CoinFlip } from '@/components/casino/coin-flip'
import { Wheel } from '@/components/casino/wheel'
import { cn } from '@/lib/utils'

type Game = 'slot' | 'blackjack' | 'wheel' | 'coin'

const GAMES: { id: Game; emoji: string; label: string }[] = [
  { id: 'slot',      emoji: '🎰', label: 'Slot' },
  { id: 'blackjack', emoji: '🃏', label: 'Blackjack' },
  { id: 'wheel',     emoji: '🎡', label: 'Çark' },
  { id: 'coin',      emoji: '🪙', label: 'Yazı Tura' },
]

export default function CasinoPage() {
  const { data } = useStore()
  const available = data.profile.totalXP - data.profile.redeemedXP
  const [game, setGame] = useState<Game>('slot')

  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-2xl font-bold text-fg text-gradient">Casino</h1>
          <p className="mt-0.5 text-sm text-muted">XP&apos;ni ortaya koy, şansını dene</p>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-xp font-display tabular-nums">{available.toLocaleString('tr-TR')}</p>
          <p className="text-xs text-muted">kullanılabilir XP</p>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-1.5">
        {GAMES.map(g => (
          <button key={g.id} onClick={() => setGame(g.id)}
            className={cn('flex flex-col items-center gap-1 rounded-xl border py-2.5 text-xs font-medium transition-all',
              game === g.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
            <span className="text-xl">{g.emoji}</span>
            {g.label}
          </button>
        ))}
      </div>

      {game === 'slot' && <SlotMachine />}
      {game === 'blackjack' && <Blackjack />}
      {game === 'wheel' && <Wheel />}
      {game === 'coin' && <CoinFlip />}

      <p className="text-center text-xs text-muted-2">
        Bahisler kullanılabilir XP&apos;den düşer. Kazançların seviyene sayılır ama harcanabilir XP&apos;ni de büyütür. Sorumlu oyna, bu sadece dopamin için.
      </p>
    </div>
  )
}
