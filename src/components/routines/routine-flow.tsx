'use client'
import { useState, useEffect } from 'react'
import { X, ChevronRight } from 'lucide-react'
import type { Routine, Habit } from '@/lib/types'
import { useStore } from '@/hooks/useStore'
import { todayKey } from '@/lib/store'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'
import { Ring } from '@/components/ui/ring'
import { cn } from '@/lib/utils'

interface Props {
  routine: Routine
  onClose: () => void
}

export function RoutineFlow({ routine, onClose }: Props) {
  const { data, toggleHabit, todayCompletedIds } = useStore()

  // Rutindeki aktif alışkanlıklar
  const habits: Habit[] = routine.habitIds
    .map(id => data.habits.find(h => h.id === id))
    .filter((h): h is Habit => h != null && !h.archived)

  // Başlangıç indeksi: zaten yapılmış olanları geç
  const firstUndone = habits.findIndex(h => !todayCompletedIds.has(h.id))
  const [idx, setIdx] = useState(Math.max(0, firstUndone === -1 ? habits.length : firstUndone))
  const [done, setDone] = useState<Set<string>>(() => new Set(
    habits.filter(h => todayCompletedIds.has(h.id)).map(h => h.id)
  ))
  const [burst, setBurst] = useState(false)
  const [finished, setFinished] = useState(firstUndone === -1)

  const habit = habits[idx] ?? null
  const total = habits.length
  const doneCount = done.size
  const progress = total > 0 ? doneCount / total : 0

  // Dışarıya tıklayınca kapat
  function handleBackdrop(e: React.MouseEvent<HTMLDivElement>) {
    if (e.target === e.currentTarget) onClose()
  }

  function handleComplete(e: React.MouseEvent) {
    if (!habit) return
    if (!done.has(habit.id)) {
      toggleHabit(habit.id)
      const newDone = new Set(done)
      newDone.add(habit.id)
      setDone(newDone)
      setBurst(true)
      setTimeout(() => setBurst(false), 600)
      fireConfetti({ count: 50, origin: { x: e.clientX, y: e.clientY }, power: 0.85 })
      haptic([20, 40, 20])
      playChime(newDone.size)
    }
    advance()
  }

  function handleSkip() {
    advance()
  }

  function advance() {
    const next = idx + 1
    if (next >= total) {
      setFinished(true)
      fireConfetti({ count: 100, power: 1 })
      haptic([30, 60, 30])
    } else {
      setIdx(next)
    }
  }

  const isDone = habit ? done.has(habit.id) : false

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={handleBackdrop}>
      <div className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Üst bar */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <span className="text-lg">{routine.emoji}</span>
          <span className="min-w-0 flex-1 truncate text-sm font-bold text-fg font-display">{routine.name}</span>
          <span className="text-xs text-muted tabular-nums">{doneCount}/{total}</span>
          <button onClick={onClose} className="text-muted-2 hover:text-fg">
            <X size={17} />
          </button>
        </div>

        {/* İlerleme çubuğu */}
        <div className="h-1 w-full bg-surface-2">
          <div
            className="h-full bg-primary transition-all duration-500"
            style={{ width: `${progress * 100}%` }}
          />
        </div>

        {finished ? (
          /* Tamamlanma ekranı */
          <div className="flex flex-col items-center gap-4 px-6 py-10 text-center">
            <div className="text-5xl">🏅</div>
            <div>
              <p className="text-xl font-bold text-fg font-display">Rutin tamam!</p>
              <p className="mt-1 text-sm text-muted">
                {routine.name} · {doneCount} alışkanlık tamamlandı
              </p>
            </div>
            <button
              onClick={onClose}
              className="mt-2 rounded-xl bg-primary px-8 py-3 text-sm font-bold text-bg shadow-glow hover:opacity-90">
              Harika!
            </button>
          </div>
        ) : habit ? (
          /* Aktif alışkanlık */
          <div className="flex flex-col items-center gap-5 px-6 py-8">
            {/* Alışkanlık ikononu büyük göster */}
            <div
              className={cn(
                'flex h-24 w-24 items-center justify-center rounded-2xl text-5xl transition-all duration-200',
                burst && 'scale-110',
              )}
              style={{ backgroundColor: habit.color + '22' }}>
              {habit.emoji}
            </div>

            <div className="text-center">
              <h2 className="text-xl font-bold text-fg">{habit.name}</h2>
              {habit.description && (
                <p className="mt-1 text-sm text-muted">{habit.description}</p>
              )}
              {habit.cue && (
                <p className="mt-2 rounded-lg bg-surface-2 px-3 py-1.5 text-xs text-primary">
                  🔗 {habit.cue}
                </p>
              )}
            </div>

            {/* İlerleme halkası */}
            <div className="flex items-center gap-6">
              {habits.map((h, i) => (
                <div
                  key={h.id}
                  className={cn(
                    'h-2 flex-1 rounded-full transition-all',
                    done.has(h.id)
                      ? 'bg-success'
                      : i === idx
                        ? 'bg-primary'
                        : 'bg-surface-2',
                  )}
                />
              ))}
            </div>

            {/* Butonlar */}
            <div className="flex w-full gap-2">
              <button
                onClick={handleSkip}
                className="flex items-center gap-1.5 rounded-xl border border-border px-4 py-3 text-sm text-muted hover:text-fg transition-colors">
                Atla <ChevronRight size={14} />
              </button>
              <button
                onClick={handleComplete}
                disabled={isDone}
                className={cn(
                  'flex flex-1 items-center justify-center gap-2 rounded-xl py-3 text-sm font-bold transition-all',
                  isDone
                    ? 'border border-success/30 bg-success/10 text-success'
                    : 'bg-primary text-bg shadow-glow hover:opacity-90',
                )}>
                {isDone ? '✓ Yapıldı' : 'Tamamla'}
              </button>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  )
}
