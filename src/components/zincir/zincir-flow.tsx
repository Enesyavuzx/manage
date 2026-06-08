'use client'
import { useState, useRef, useEffect } from 'react'
import { X, Check, ChevronRight, Zap } from 'lucide-react'
import type { Zincir } from '@/lib/types'
import { useStore } from '@/hooks/useStore'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'
import { cn } from '@/lib/utils'

interface Props {
  zincir: Zincir
  onClose: () => void
}

export function ZincirFlow({ zincir, onClose }: Props) {
  const { data, toggleHabit, todayCompletedIds, awardZincirXP } = useStore()
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState<Set<number>>(new Set())
  const [wildcard, setWildcard] = useState<Record<number, string>>({})
  const [finished, setFinished] = useState(false)
  const chainRef = useRef<HTMLDivElement>(null)

  const steps = zincir.steps
  const total = steps.length
  const currentStep = steps[idx] ?? null

  const resolvedHabitId = currentStep
    ? (currentStep.habitId ?? wildcard[idx] ?? null)
    : null
  const habit = resolvedHabitId
    ? (data.habits.find(h => h.id === resolvedHabitId) ?? null)
    : null

  useEffect(() => {
    const el = chainRef.current?.querySelector(`[data-step="${idx}"]`) as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [idx])

  function handleComplete(e: React.MouseEvent) {
    if (!currentStep) return
    if (resolvedHabitId && !todayCompletedIds.has(resolvedHabitId)) {
      toggleHabit(resolvedHabitId)
    }
    fireConfetti({ count: 50, origin: { x: e.clientX, y: e.clientY }, power: 0.8 })
    haptic([20, 40, 20])
    playChime(done.size + 1)
    const newDone = new Set(done)
    newDone.add(idx)
    setDone(newDone)
    advance(newDone)
  }

  function handleSkip() {
    advance(done)
  }

  function advance(d: Set<number>) {
    const next = idx + 1
    if (next >= total) {
      setFinished(true)
      awardZincirXP(d.size)
      fireConfetti({ count: 120, power: 1.1 })
      haptic([30, 60, 30])
    } else {
      setIdx(next)
    }
  }

  const isWildcard = currentStep?.habitId === null
  const availableHabits = data.habits.filter(h => !h.archived)

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-sm p-4 sm:items-center"
      onClick={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">

        {/* Başlık */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="text-lg">{zincir.emoji}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-fg font-display">{zincir.name}</span>
          <span className="text-xs text-muted tabular-nums">{done.size}/{total}</span>
          <button onClick={onClose} className="text-muted-2 hover:text-fg transition-colors">
            <X size={17} />
          </button>
        </div>

        {/* İlerleme */}
        <div className="h-1 bg-surface-2">
          <div className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(done.size / total) * 100}%` }} />
        </div>

        {/* Zincir önizleme */}
        <div ref={chainRef} className="flex items-center overflow-x-auto px-4 py-3 scrollbar-hide">
          {steps.map((step, i) => {
            const h = step.habitId ? data.habits.find(x => x.id === step.habitId) : null
            const isActive = i === idx && !finished
            const isDone = done.has(i)
            return (
              <div key={step.id} className="flex shrink-0 items-center">
                <button
                  onClick={() => !finished && setIdx(i)}
                  data-step={i}
                  className={cn(
                    'flex h-10 w-10 items-center justify-center rounded-full border-2 text-base transition-all',
                    isDone && 'border-success bg-success/15',
                    isActive && !isDone && 'scale-110 border-primary bg-primary/15 shadow-glow',
                    !isDone && !isActive && 'border-border bg-surface-2 opacity-60',
                  )}>
                  {isDone ? <Check size={14} className="text-success" /> : (h?.emoji ?? '⚡')}
                </button>
                {i < total - 1 && (
                  <div className={cn('h-0.5 w-5 transition-all', done.has(i) ? 'bg-success' : 'bg-border')} />
                )}
              </div>
            )
          })}
        </div>

        {finished ? (
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="text-5xl">🏆</div>
            <p className="text-xl font-bold text-fg font-display">Zincir tamamlandı!</p>
            <p className="text-sm text-muted">{done.size} adım · {zincir.name}</p>
            <button onClick={onClose}
              className="mt-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-bg shadow-glow hover:opacity-90">
              Muhteşem!
            </button>
          </div>
        ) : currentStep ? (
          <div className="flex flex-col items-center gap-5 px-6 pb-8 pt-5">
            {/* Wildcard seçici */}
            {isWildcard && !wildcard[idx] && (
              <div className="w-full">
                <p className="mb-2 text-center text-xs font-semibold text-muted">Hangi alışkanlığı yapacaksın?</p>
                <select
                  value={wildcard[idx] ?? ''}
                  onChange={e => setWildcard(w => ({ ...w, [idx]: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg focus:border-primary focus:outline-none">
                  <option value="">Seç...</option>
                  {availableHabits.map(h => (
                    <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Habit gösterimi */}
            {habit ? (
              <div
                className="flex h-28 w-28 items-center justify-center rounded-3xl text-6xl"
                style={{ backgroundColor: habit.color + '22' }}>
                {habit.emoji}
              </div>
            ) : (
              <div className="flex h-28 w-28 items-center justify-center rounded-3xl bg-surface-2">
                <Zap size={48} className="text-primary" />
              </div>
            )}

            <div className="text-center">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted">
                Adım {idx + 1} / {total}
              </p>
              <h2 className="mt-1 text-2xl font-bold text-fg">
                {habit?.name ?? (isWildcard ? 'Serbest' : `Adım ${idx + 1}`)}
              </h2>
              {habit?.description && (
                <p className="mt-1 text-sm text-muted">{habit.description}</p>
              )}
            </div>

            {/* Aksiyon butonları */}
            <div className="flex w-full gap-2">
              <button onClick={handleSkip}
                className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3.5 text-sm text-muted transition-colors hover:text-fg">
                Atla <ChevronRight size={14} />
              </button>
              <button
                onClick={handleComplete}
                disabled={isWildcard && !wildcard[idx]}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3.5 text-sm font-bold text-bg shadow-glow transition-all hover:opacity-90 disabled:opacity-40">
                <Check size={16} /> Tamamlandı
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
