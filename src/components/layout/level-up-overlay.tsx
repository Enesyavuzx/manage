'use client'
import { useEffect, useRef } from 'react'
import { useStore } from '@/hooks/useStore'
import { getLevelInfo, getRank } from '@/lib/gamification'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'

// Seviye atlama anı tam ekran kutlanır; küçük toast bu an için yetersiz.
// Aynı pakette rank bildirimi de varsa tek overlay'de birleştirilir.
export function LevelUpOverlay({ hasRankUp, onDismiss }: {
  hasRankUp: boolean
  onDismiss: () => void
}) {
  const { data } = useStore()
  const firedRef = useRef(false)

  const info = getLevelInfo(data.profile.totalXP)
  const { rank, next, levelsToNext } = getRank(info.level)

  useEffect(() => {
    if (firedRef.current) return
    firedRef.current = true
    haptic([40, 80, 40, 80])
    if (data.profile.soundEnabled !== false) playChime(6)
    fireConfetti({ count: 160, power: 1.4 })
    const t = setTimeout(() => fireConfetti({ count: 90, power: 1.0 }), 600)
    return () => clearTimeout(t)
  }, [data.profile.soundEnabled])

  return (
    <div
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-md p-6 animate-fade-in"
      onClick={onDismiss}>
      <div
        className="w-full max-w-xs rounded-3xl border border-primary/40 bg-surface p-8 text-center shadow-glow"
        onClick={e => e.stopPropagation()}>

        <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-primary/15 text-5xl animate-float">
          {hasRankUp ? rank.emoji : '🆙'}
        </div>

        <p className="mt-5 text-xs font-bold uppercase tracking-widest text-primary">
          {hasRankUp ? 'Rütbe yükseldi' : 'Seviye atladın'}
        </p>
        <h2 className="mt-1 text-4xl font-bold text-fg font-display">
          Seviye {info.level}
        </h2>
        <p className="mt-2 text-sm font-semibold" style={{ color: rank.color }}>
          {rank.emoji} {rank.label}
        </p>

        {next && (
          <p className="mt-3 text-xs text-muted">
            {next.label} rütbesine {levelsToNext} seviye kaldı
          </p>
        )}

        <button
          onClick={onDismiss}
          className="mt-6 w-full rounded-xl bg-primary py-3.5 text-sm font-bold text-bg shadow-glow transition-all hover:opacity-90">
          Devam
        </button>
      </div>
    </div>
  )
}
