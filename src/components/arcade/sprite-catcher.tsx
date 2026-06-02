'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn, generateId } from '@/lib/utils'
import { Card, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const SPRITES = ['🌟', '⭐', '💫', '✨', '💎', '🔥', '⚡', '🎯']
const SPRITE_LIFETIME = 1800 // ms
const WAVE_INTERVAL = 2000  // ms
const SPRITES_PER_WAVE = 3
const HI_KEY = 'arcade_hi'

interface Sprite {
  id: string
  emoji: string
  x: number // % from left
  y: number // % from top
  born: number
  caught: boolean
}

interface FloatText {
  id: string
  x: number
  y: number
}

export function SpriteCatcher() {
  const [score, setScore] = useState(0)
  const [hi, setHi] = useState<number>(() => {
    if (typeof window === 'undefined') return 0
    return Number(localStorage.getItem(HI_KEY) ?? 0)
  })
  const [sprites, setSprites] = useState<Sprite[]>([])
  const [floats, setFloats] = useState<FloatText[]>([])
  const [paused, setPaused] = useState(false)
  const [wave, setWave] = useState(0)

  const pausedRef = useRef(paused)
  useEffect(() => { pausedRef.current = paused }, [paused])

  // Spawn a new wave
  const spawnWave = useCallback(() => {
    if (pausedRef.current) return
    const now = Date.now()
    const newSprites: Sprite[] = Array.from({ length: SPRITES_PER_WAVE }, () => ({
      id: generateId(),
      emoji: SPRITES[Math.floor(Math.random() * SPRITES.length)],
      x: 5 + Math.random() * 80, // keep away from edges
      y: 5 + Math.random() * 80,
      born: now,
      caught: false,
    }))
    setSprites(prev => [...prev, ...newSprites])
    setWave(w => w + 1)
  }, [])

  // Wave timer
  useEffect(() => {
    if (paused) return
    spawnWave()
    const id = setInterval(spawnWave, WAVE_INTERVAL)
    return () => clearInterval(id)
  }, [paused, spawnWave])

  // Expire uncaught sprites
  useEffect(() => {
    if (paused) return
    const id = setInterval(() => {
      const now = Date.now()
      setSprites(prev => prev.filter(s => s.caught || now - s.born < SPRITE_LIFETIME))
    }, 100)
    return () => clearInterval(id)
  }, [paused])

  const catchSprite = useCallback((sprite: Sprite, ev: React.MouseEvent | React.TouchEvent) => {
    ev.stopPropagation()
    if (sprite.caught) return

    // Mark caught
    setSprites(prev => prev.map(s => s.id === sprite.id ? { ...s, caught: true } : s))

    // Floating +1
    const floatId = generateId()
    setFloats(prev => [...prev, { id: floatId, x: sprite.x, y: sprite.y }])
    setTimeout(() => setFloats(prev => prev.filter(f => f.id !== floatId)), 700)

    // Remove sprite after pop animation
    setTimeout(() => setSprites(prev => prev.filter(s => s.id !== sprite.id)), 260)

    setScore(prev => {
      const next = prev + 1
      setHi(h => {
        const newHi = Math.max(h, next)
        localStorage.setItem(HI_KEY, String(newHi))
        return newHi
      })
      return next
    })
  }, [])

  const handleReset = () => {
    setScore(0)
    setSprites([])
    setFloats([])
    setWave(0)
    setPaused(false)
  }

  return (
    <Card glow>
      <CardBody className="space-y-4">
        {/* Score row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-lg border border-border bg-surface-2 px-3 py-1.5">
              <span className="text-xs text-muted font-display">SKOR</span>
              <p className="text-2xl font-bold text-primary font-display leading-none mt-0.5">{score}</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 px-3 py-1.5">
              <span className="text-xs text-muted font-display">EN İYİ</span>
              <p className="text-2xl font-bold text-xp font-display leading-none mt-0.5">{hi}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setPaused(p => !p)}
            >
              {paused ? '▶ Devam' : '⏸ Dur'}
            </Button>
            <Button size="sm" variant="ghost" onClick={handleReset}>
              ↺
            </Button>
          </div>
        </div>

        {/* Game board */}
        <div
          className={cn(
            'relative rounded-xl border border-border bg-surface-2 overflow-hidden select-none',
            paused && 'opacity-50',
          )}
          style={{ height: 360 }}
        >
          {paused && (
            <div className="absolute inset-0 z-10 flex items-center justify-center">
              <span className="text-lg font-bold text-fg font-display">DURAKLADI</span>
            </div>
          )}

          {/* Sprites */}
          {sprites.map(sprite => {
            const age = Date.now() - sprite.born
            const lifeRatio = Math.min(age / SPRITE_LIFETIME, 1)
            return (
              <button
                key={sprite.id}
                onClick={e => catchSprite(sprite, e)}
                onTouchStart={e => catchSprite(sprite, e as unknown as React.TouchEvent)}
                className={cn(
                  'absolute -translate-x-1/2 -translate-y-1/2 text-2xl leading-none cursor-pointer',
                  'transition-all duration-150',
                  'hover:scale-125 active:scale-90',
                  sprite.caught
                    ? 'animate-sprite-pop'
                    : 'animate-sprite-in',
                )}
                style={{
                  left: `${sprite.x}%`,
                  top: `${sprite.y}%`,
                  opacity: sprite.caught ? 0 : Math.max(0.3, 1 - lifeRatio * 0.6),
                  filter: sprite.caught ? 'brightness(2)' : undefined,
                }}
                aria-label={`Yakala: ${sprite.emoji}`}
              >
                {sprite.emoji}
              </button>
            )
          })}

          {/* Float +1 texts */}
          {floats.map(f => (
            <span
              key={f.id}
              className="pointer-events-none absolute -translate-x-1/2 text-sm font-bold text-primary font-display animate-float-up"
              style={{ left: `${f.x}%`, top: `${f.y}%` }}
            >
              +1
            </span>
          ))}
        </div>

        {/* Stats footer */}
        <div className="flex items-center justify-between text-xs text-muted">
          <span>Dalga: <span className="text-fg font-medium">{wave}</span></span>
          <span>Aktif sprite: <span className="text-fg font-medium">{sprites.filter(s => !s.caught).length}</span></span>
          <span className="text-muted-2">Kaçırmak ceza değil 🙂</span>
        </div>
      </CardBody>
    </Card>
  )
}
