'use client'
import { useState, useRef, useEffect } from 'react'
import { useStore } from '@/hooks/useStore'
import { spinWheel, WHEEL_SLICES, type WheelSlice } from '@/lib/casino'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'
import { Card as UICard } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BetControl } from './bet-control'
import { cn } from '@/lib/utils'

const N = WHEEL_SLICES.length
const SEG = 360 / N

export function Wheel() {
  const { data, placeBet, payout } = useStore()
  const available = data.profile.totalXP - data.profile.redeemedXP

  const [bet, setBet] = useState(50)
  const [angle, setAngle] = useState(0)
  const [spinning, setSpinning] = useState(false)
  const [result, setResult] = useState<WheelSlice | null>(null)
  const to = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (to.current) clearTimeout(to.current) }, [])

  // Konik gradyan ile dilimli çark.
  const gradient = `conic-gradient(${WHEEL_SLICES.map((s, i) =>
    `${s.color} ${i * SEG}deg ${(i + 1) * SEG}deg`).join(',')})`

  function spin() {
    if (spinning || !placeBet(bet)) return
    setSpinning(true); setResult(null)
    const slice = spinWheel()
    const idx = WHEEL_SLICES.findIndex(s => s.id === slice.id)
    // Seçilen dilimin merkezini üstteki işaretçiye (0deg) hizala.
    const targetCenter = idx * SEG + SEG / 2
    const spins = 5
    const final = spins * 360 + (360 - targetCenter)
    setAngle(prev => prev - (prev % 360) + final)

    to.current = setTimeout(() => {
      setSpinning(false)
      setResult(slice)
      const win = Math.round(bet * slice.multiplier)
      if (win > 0) {
        payout(win)
        fireConfetti({ count: slice.multiplier >= 5 ? 130 : 55, power: slice.multiplier >= 5 ? 1.3 : 1 })
        playChime(slice.multiplier >= 5 ? 4 : 2); haptic(30)
      } else {
        haptic(12)
      }
    }, 4200)
  }

  return (
    <UICard className="space-y-4 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg font-display">🎡 Şans Çarkı</h2>
        <span className="text-xs text-muted">10x&apos;e kadar</span>
      </div>

      <div className="relative mx-auto h-56 w-56">
        {/* İşaretçi */}
        <div className="absolute left-1/2 top-[-4px] z-10 h-0 w-0 -translate-x-1/2 border-l-8 border-r-8 border-t-[14px] border-l-transparent border-r-transparent border-t-fg" />
        <div
          className="h-full w-full rounded-full border-4 border-border shadow-lg"
          style={{
            background: gradient,
            transform: `rotate(${angle}deg)`,
            transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.18,0.99)' : 'none',
          }}
        />
        {/* Etiketler */}
        {WHEEL_SLICES.map((s, i) => {
          const a = (i * SEG + SEG / 2) * (Math.PI / 180)
          const r = 38
          const x = 50 + r * Math.sin(a)
          const y = 50 - r * Math.cos(a)
          return (
            <span key={s.id}
              className="pointer-events-none absolute text-[10px] font-bold text-white drop-shadow"
              style={{ left: `${x}%`, top: `${y}%`, transform: `translate(-50%,-50%) rotate(${angle}deg)`, transition: spinning ? 'transform 4s cubic-bezier(0.17,0.67,0.18,0.99)' : 'none' }}>
              {s.label}
            </span>
          )
        })}
        {/* Merkez */}
        <div className="absolute left-1/2 top-1/2 h-8 w-8 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-fg bg-surface" />
      </div>

      {result && (
        <p className={cn('text-center text-sm font-bold font-display',
          result.multiplier === 0 ? 'text-danger' : result.multiplier >= 5 ? 'text-xp' : 'text-success')}>
          {result.label}{result.multiplier > 0 ? ` · +${Math.round(bet * result.multiplier)} XP` : ` · -${bet} XP`}
        </p>
      )}

      <BetControl bet={bet} setBet={setBet} available={available} disabled={spinning} />

      <Button variant="xp" className="w-full" onClick={spin} disabled={spinning || available < bet || bet <= 0}>
        {spinning ? 'Dönüyor...' : available < bet ? 'Yetersiz XP' : `Çevir (${bet} XP)`}
      </Button>
    </UICard>
  )
}
