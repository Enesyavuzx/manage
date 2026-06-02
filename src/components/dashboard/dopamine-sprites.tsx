'use client'
import { useState, useCallback } from 'react'
import { PixelSprite } from '@/components/decor/pixel-sprite'
import { fireConfetti, haptic } from '@/lib/confetti'
import { generateId } from '@/lib/utils'

interface Pop {
  id: string
  x: number
  y: number
  text: string
}

const SPRITES = [
  { name: 'star',  delay: '0s' },
  { name: 'heart', delay: '0.4s' },
  { name: 'gem',   delay: '0.8s' },
  { name: 'coin',  delay: '1.2s' },
  { name: 'potion',delay: '1.6s' },
  { name: 'sword', delay: '0.2s' },
  { name: 'star',  delay: '1.0s' },
  { name: 'gem',   delay: '0.6s' },
] as const

const REACTIONS = ['✨', '💫', '+1', '⭐', '🌟', '💎', 'nice!', 'pop!']

export function DopamineSprites() {
  const [pops, setPops] = useState<Pop[]>([])

  const handleClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top
    const text = REACTIONS[Math.floor(Math.random() * REACTIONS.length)]
    const pop: Pop = { id: generateId(), x, y, text }
    setPops(prev => [...prev, pop])
    haptic(15)
    fireConfetti({ count: 18, power: 0.6, origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight } })
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== pop.id)), 900)
  }, [])

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface-2 px-4 py-3">
      <p className="mb-3 text-center text-xs text-muted-2">Sprite&apos;lara tıkla!</p>
      <div className="flex flex-wrap items-center justify-center gap-3">
        {SPRITES.map((s, i) => (
          <button
            key={i}
            onClick={handleClick}
            className="relative flex items-center justify-center rounded-lg p-2 transition-all hover:bg-primary/10 active:scale-95"
            style={{ animationDelay: s.delay }}
          >
            <PixelSprite name={s.name} pixel={3} className="pixelated animate-float" style={{ animationDelay: s.delay }} />
          </button>
        ))}
      </div>
      {pops.map(pop => (
        <span
          key={pop.id}
          className="pointer-events-none absolute text-xs font-bold text-xp animate-pop"
          style={{ left: pop.x, top: pop.y, transform: 'translate(-50%,-100%)' }}
        >
          {pop.text}
        </span>
      ))}
    </div>
  )
}
