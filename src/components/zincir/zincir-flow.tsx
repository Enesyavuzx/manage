'use client'
import { useState, useEffect, useRef } from 'react'
import { X, Play, Pause, RotateCcw, Check, ChevronRight, Zap } from 'lucide-react'
import type { Zincir, ZincirStep, Habit } from '@/lib/types'
import { useStore } from '@/hooks/useStore'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'
import { cn } from '@/lib/utils'

function pad(n: number) { return n.toString().padStart(2, '0') }

interface Props {
  zincir: Zincir
  onClose: () => void
}

export function ZincirFlow({ zincir, onClose }: Props) {
  const { data, toggleHabit, todayCompletedIds, awardZincirXP } = useStore()
  const [idx, setIdx] = useState(0)
  const [done, setDone] = useState<Set<number>>(new Set())
  const [wildcard, setWildcard] = useState<Record<number, string>>({})   // stepIndex -> habitId
  const [timerLeft, setTimerLeft] = useState<number | null>(null)
  const [timerRunning, setTimerRunning] = useState(false)
  const [finished, setFinished] = useState(false)
  const chainRef = useRef<HTMLDivElement>(null)

  const steps = zincir.steps
  const total = steps.length
  const currentStep = steps[idx] ?? null

  // Aktif adımın habit'i
  const resolvedHabitId = currentStep
    ? (currentStep.habitId ?? wildcard[idx] ?? null)
    : null
  const habit = resolvedHabitId
    ? (data.habits.find(h => h.id === resolvedHabitId) ?? null)
    : null

  // Zamanlayıcı tick
  useEffect(() => {
    if (!timerRunning || timerLeft === null) return
    if (timerLeft <= 0) { setTimerRunning(false); return }
    const t = setInterval(() => setTimerLeft(s => (s !== null && s > 0 ? s - 1 : 0)), 1000)
    return () => clearInterval(t)
  }, [timerRunning, timerLeft])

  // Aktif node'u chain scroll'a getir
  useEffect(() => {
    const el = chainRef.current?.querySelector(`[data-step="${idx}"]`) as HTMLElement | null
    el?.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' })
  }, [idx])

  function startTimer(step: ZincirStep) {
    const secs = step.durationMin * 60
    setTimerLeft(secs)
    setTimerRunning(true)
  }

  function handleComplete(e: React.MouseEvent) {
    if (!currentStep) return
    // toggleHabit varsa
    if (resolvedHabitId && !todayCompletedIds.has(resolvedHabitId)) {
      toggleHabit(resolvedHabitId)
    }
    fireConfetti({ count: 50, origin: { x: e.clientX, y: e.clientY }, power: 0.8 })
    haptic([20, 40, 20])
    playChime(done.size + 1)
    setTimerRunning(false)
    setTimerLeft(null)
    const newDone = new Set(done)
    newDone.add(idx)
    setDone(newDone)
    advance(newDone)
  }

  function handleSkip() {
    setTimerRunning(false)
    setTimerLeft(null)
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
  const wildcardHabit = isWildcard && wildcard[idx]
    ? data.habits.find(h => h.id === wildcard[idx]) ?? null
    : null
  const availableHabits = data.habits.filter(h => !h.archived)

  const mm = timerLeft !== null ? Math.floor(timerLeft / 60) : 0
  const ss = timerLeft !== null ? timerLeft % 60 : 0
  const timerTotal = currentStep?.durationMin ? currentStep.durationMin * 60 : 0
  const timerProgress = timerTotal > 0 && timerLeft !== null
    ? (timerTotal - timerLeft) / timerTotal
    : 0

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

        {/* İlerleme çubuğu */}
        <div className="h-1 bg-surface-2">
          <div className="h-full bg-primary transition-all duration-500"
            style={{ width: `${(done.size / total) * 100}%` }} />
        </div>

        {/* Yatay zincir */}
        <div ref={chainRef} className="flex items-center gap-0 overflow-x-auto px-4 py-3 scrollbar-hide">
          {steps.map((step, i) => {
            const h = step.habitId ? data.habits.find(x => x.id === step.habitId) : null
            const isActive = i === idx && !finished
            const isDone = done.has(i)
            return (
              <div key={step.id} className="flex items-center shrink-0">
                <button
                  onClick={() => !finished && setIdx(i)}
                  data-step={i}
                  className={cn(
                    'flex h-10 w-10 flex-col items-center justify-center rounded-full border-2 text-base transition-all',
                    isDone && 'border-success bg-success/15',
                    isActive && !isDone && 'border-primary bg-primary/15 shadow-glow scale-110',
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
          <div className="flex flex-col items-center gap-5 px-6 pb-8 pt-4">
            {/* Wildcard seçici */}
            {isWildcard && !wildcardHabit && (
              <div className="w-full">
                <p className="mb-2 text-center text-xs font-semibold text-muted">Hobi adımı — alışkanlık seç</p>
                <select
                  value={wildcard[idx] ?? ''}
                  onChange={e => setWildcard(w => ({ ...w, [idx]: e.target.value }))}
                  className="h-10 w-full rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg focus:border-primary focus:outline-none">
                  <option value="">+ Hobi seç</option>
                  {availableHabits.map(h => (
                    <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Habit gösterimi */}
            {habit ? (
              <div
                className="flex h-24 w-24 items-center justify-center rounded-2xl text-5xl"
                style={{ backgroundColor: habit.color + '22' }}>
                {habit.emoji}
              </div>
            ) : (
              <div className="flex h-24 w-24 items-center justify-center rounded-2xl bg-surface-2 text-5xl">
                <Zap size={40} className="text-primary" />
              </div>
            )}

            <div className="text-center">
              <h2 className="text-xl font-bold text-fg">
                {habit?.name ?? (isWildcard ? 'Hobi Adımı' : 'Adım ' + (idx + 1))}
              </h2>
              {habit?.description && (
                <p className="mt-1 text-sm text-muted">{habit.description}</p>
              )}
            </div>

            {/* Zamanlayıcı */}
            {currentStep.durationMin > 0 && (
              <div className="flex w-full items-center gap-3 rounded-xl border border-border bg-surface-2 px-4 py-3">
                <div className="flex-1">
                  <div className="h-2 overflow-hidden rounded-full bg-border">
                    <div className="h-full rounded-full bg-primary transition-all duration-1000"
                      style={{ width: `${timerProgress * 100}%` }} />
                  </div>
                </div>
                <span className="tabular-nums text-sm font-bold text-fg font-display">
                  {pad(mm)}:{pad(ss)}
                </span>
                {timerLeft === null ? (
                  <button onClick={() => startTimer(currentStep)}
                    className="rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-bg shadow-glow hover:opacity-90">
                    Başlat
                  </button>
                ) : (
                  <button onClick={() => setTimerRunning(r => !r)}
                    className="rounded-lg border border-border px-3 py-1.5 text-xs text-muted hover:text-fg transition-colors">
                    {timerRunning ? <Pause size={13} /> : <Play size={13} />}
                  </button>
                )}
              </div>
            )}

            {/* Aksiyon butonları */}
            <div className="flex w-full gap-2">
              <button onClick={handleSkip}
                className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3 text-sm text-muted hover:text-fg transition-colors">
                Atla <ChevronRight size={14} />
              </button>
              <button
                onClick={handleComplete}
                disabled={isWildcard && !wildcard[idx]}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-primary py-3 text-sm font-bold text-bg shadow-glow hover:opacity-90 disabled:opacity-40 transition-all">
                <Check size={16} /> Tamamla
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
