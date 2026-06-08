'use client'
import { useState, useEffect, useCallback } from 'react'
import { Shuffle, Play, Pause, RotateCcw, Check } from 'lucide-react'
import { DOPAMINE_TIERS, pickRandom, type DopamineTierId, type DopamineTier, type DopamineItem } from '@/lib/dopamine'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'
import { cn } from '@/lib/utils'
import { Ring } from '@/components/ui/ring'

function pad(n: number) { return n.toString().padStart(2, '0') }

interface TimerProps {
  durationMin: number
  color: string
  label: string
  onDone: () => void
  onClose: () => void
}

function TimerOverlay({ durationMin, color, label, onDone, onClose }: TimerProps) {
  const total = durationMin * 60
  const [left, setLeft] = useState(total)
  const [running, setRunning] = useState(true)
  const [finished, setFinished] = useState(false)

  useEffect(() => {
    if (!running || finished) return
    const t = setInterval(() => {
      setLeft(s => {
        if (s <= 1) {
          clearInterval(t)
          setRunning(false)
          setFinished(true)
          onDone()
          return 0
        }
        return s - 1
      })
    }, 1000)
    return () => clearInterval(t)
  }, [running, finished, onDone])

  const progress = total > 0 ? (total - left) / total : 1
  const mm = Math.floor(left / 60)
  const ss = left % 60

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/80 backdrop-blur-sm p-4 sm:items-center">
      <div className="w-full max-w-sm rounded-2xl border border-border bg-surface p-6 flex flex-col items-center gap-6 shadow-2xl">
        <p className="text-center text-sm font-semibold text-fg max-w-[240px] leading-snug">{label}</p>

        <Ring progress={progress} size={200} stroke={14} color={color}>
          {finished ? (
            <Check size={48} style={{ color }} />
          ) : (
            <>
              <span className="text-4xl font-bold text-fg font-display tabular-nums leading-none">
                {pad(mm)}:{pad(ss)}
              </span>
              <span className="mt-1 text-xs text-muted">dakika kaldı</span>
            </>
          )}
        </Ring>

        {finished ? (
          <div className="flex flex-col items-center gap-3">
            <p className="text-base font-bold" style={{ color }}>Süper! Bitirdin.</p>
            <button
              onClick={onClose}
              className="rounded-xl px-8 py-3 text-sm font-bold text-bg shadow-glow transition hover:opacity-90"
              style={{ backgroundColor: color }}>
              Harika!
            </button>
          </div>
        ) : (
          <div className="flex gap-3">
            <button
              onClick={() => setRunning(r => !r)}
              className="flex items-center gap-2 rounded-xl border border-border px-5 py-2.5 text-sm font-medium text-muted hover:text-fg transition-colors">
              {running ? <Pause size={15} /> : <Play size={15} />}
              {running ? 'Duraklat' : 'Devam'}
            </button>
            <button
              onClick={() => { setLeft(total); setRunning(true) }}
              className="flex items-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm text-muted hover:text-fg transition-colors">
              <RotateCcw size={15} />
            </button>
            <button
              onClick={onClose}
              className="rounded-xl border border-border px-5 py-2.5 text-sm text-muted hover:text-fg transition-colors">
              Kapat
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

interface ActivityCardProps {
  tier: DopamineTier
  item: DopamineItem
  highlight?: boolean
  onStart: (tier: DopamineTier, item: DopamineItem) => void
}

function ActivityCard({ tier, item, highlight, onStart }: ActivityCardProps) {
  return (
    <div
      className={cn(
        'flex items-start gap-3 rounded-xl border p-3.5 transition-all',
        highlight
          ? 'border-2 shadow-md'
          : 'border-border bg-surface-2 hover:border-border-hover',
      )}
      style={highlight ? { borderColor: tier.color, backgroundColor: tier.color + '14' } : undefined}>
      <div
        className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-base"
        style={{ backgroundColor: tier.color + '22' }}>
        {tier.emoji}
      </div>
      <p className="flex-1 text-sm leading-snug text-fg">{item.label}</p>
      {tier.durationMin > 0 ? (
        <button
          onClick={() => onStart(tier, item)}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-bold text-bg transition hover:opacity-90"
          style={{ backgroundColor: tier.color }}>
          {tier.durationMin} DK
        </button>
      ) : (
        <button
          onClick={() => onStart(tier, item)}
          className="shrink-0 rounded-lg border px-3 py-1.5 text-xs font-medium text-muted hover:text-fg transition-colors border-border">
          Başla
        </button>
      )}
    </div>
  )
}

export function DopamineMenu() {
  const [activeTier, setActiveTier] = useState<DopamineTierId>('ordovr')
  const [activeTimer, setActiveTimer] = useState<{ tier: DopamineTier; item: DopamineItem } | null>(null)
  const [surprise, setSurprise] = useState<{ tier: DopamineTier; item: DopamineItem } | null>(null)

  const tier = DOPAMINE_TIERS.find(t => t.id === activeTier)!

  function handleStart(t: DopamineTier, item: DopamineItem) {
    setSurprise(null)
    setActiveTimer({ tier: t, item })
    haptic([15, 30])
  }

  function handleDone() {
    fireConfetti({ count: 80, power: 1 })
    haptic([20, 40, 20, 40, 20])
    playChime(4)
  }

  const handleSurprise = useCallback(() => {
    const pick = pickRandom()
    setSurprise(pick)
    setActiveTier(pick.tier.id)
    haptic([10, 20])
  }, [])

  return (
    <div className="space-y-5">
      {/* Sürpriz butonu */}
      <button
        onClick={handleSurprise}
        className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-border py-3.5 text-sm font-semibold text-muted transition-all hover:border-primary hover:text-primary active:scale-95">
        <Shuffle size={16} />
        Bana sürpriz yap — ne yapacağıma karar ver
      </button>

      {/* Katman sekmeleri */}
      <div className="flex gap-2 overflow-x-auto pb-0.5 scrollbar-hide">
        {DOPAMINE_TIERS.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTier(t.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-xl px-4 py-2 text-sm font-semibold transition-all',
              activeTier === t.id
                ? 'text-bg shadow-md'
                : 'bg-surface-2 text-muted hover:text-fg border border-border',
            )}
            style={activeTier === t.id ? { backgroundColor: t.color } : undefined}>
            {t.emoji} {t.title}
          </button>
        ))}
      </div>

      {/* Aktif katman başlığı */}
      <div className="rounded-xl border-l-4 py-2.5 pl-4" style={{ borderColor: tier.color, backgroundColor: tier.color + '10' }}>
        <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: tier.color }}>
          {tier.durationMin > 0 ? `${tier.durationMin} dakika` : 'Serbest süre'}
        </p>
        <p className="text-sm text-muted">{tier.tagline}</p>
      </div>

      {/* Aktivite listesi */}
      <div className="space-y-2">
        {tier.items.map(item => (
          <ActivityCard
            key={item.id}
            tier={tier}
            item={item}
            highlight={surprise?.item.id === item.id}
            onStart={handleStart}
          />
        ))}
      </div>

      {/* Zamanlayıcı overlay */}
      {activeTimer && (
        <TimerOverlay
          durationMin={activeTimer.tier.durationMin > 0 ? activeTimer.tier.durationMin : 5}
          color={activeTimer.tier.color}
          label={activeTimer.item.label}
          onDone={handleDone}
          onClose={() => setActiveTimer(null)}
        />
      )}
    </div>
  )
}
