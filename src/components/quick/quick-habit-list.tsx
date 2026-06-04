'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { xpForDifficulty } from '@/lib/gamification'
import { fireConfetti } from '@/lib/confetti'
import { cn } from '@/lib/utils'

export function QuickHabitList() {
  const { habitsToday, todayCompletedIds, toggleHabit } = useStore()
  const [bursting, setBursting] = useState<Set<string>>(new Set())

  const completedCount = habitsToday.filter(h => todayCompletedIds.has(h.id)).length
  const total = habitsToday.length
  const allDone = total > 0 && completedCount === total

  function handleTap(e: React.MouseEvent, habitId: string) {
    if (todayCompletedIds.has(habitId)) {
      toggleHabit(habitId)
      return
    }
    setBursting(prev => new Set([...prev, habitId]))
    fireConfetti({
      count: 45,
      origin: { x: e.clientX / window.innerWidth, y: e.clientY / window.innerHeight },
      power: 0.75,
    })
    toggleHabit(habitId)
    setTimeout(() => {
      setBursting(prev => { const n = new Set(prev); n.delete(habitId); return n })
    }, 400)
  }

  if (total === 0) {
    return (
      <div className="py-24 text-center">
        <p className="text-6xl">🎯</p>
        <p className="mt-4 text-base font-semibold text-fg">Bugün planlanmış alışkanlık yok</p>
        <Link href="/habits" className="mt-2 inline-block text-sm text-primary hover:underline">
          Alışkanlık ekle
        </Link>
      </div>
    )
  }

  if (allDone) {
    return (
      <div className="py-24 text-center">
        <p className="text-6xl">🏆</p>
        <p className="mt-4 text-xl font-bold text-fg font-display">Hepsi tamam!</p>
        <p className="mt-1 text-sm text-muted">
          Bugünkü {total} alışkanlığı tamamladın. Harika iş.
        </p>
        <Link href="/" className="mt-4 inline-block text-sm text-primary hover:underline">
          Ana sayfaya dön
        </Link>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-success transition-all duration-500"
            style={{ width: `${total > 0 ? (completedCount / total) * 100 : 0}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-muted font-display shrink-0">
          {completedCount}/{total}
        </span>
      </div>

      {/* Habit tap targets */}
      {habitsToday.map(habit => {
        const done = todayCompletedIds.has(habit.id)
        const burst = bursting.has(habit.id)
        return (
          <button
            key={habit.id}
            onClick={e => handleTap(e, habit.id)}
            className={cn(
              'relative flex w-full items-center gap-4 overflow-hidden rounded-xl border px-5 py-4 text-left',
              'transition-all duration-200 select-none',
              done
                ? 'border-success/30 bg-success/5 opacity-60'
                : 'border-border bg-surface active:scale-[0.98]',
              burst && 'scale-[0.97]',
            )}
          >
            {/* color accent strip */}
            <div className="absolute left-0 top-0 h-full w-1.5 rounded-l-xl" style={{ backgroundColor: habit.color }} />

            {/* emoji */}
            <span
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl"
              style={{ backgroundColor: habit.color + '22' }}
            >
              {habit.emoji}
            </span>

            {/* text */}
            <div className="min-w-0 flex-1">
              <p className={cn('text-base font-semibold leading-snug', done ? 'text-muted line-through' : 'text-fg')}>
                {habit.name}
              </p>
              {!done && (
                <p className="mt-0.5 text-xs text-muted">+{xpForDifficulty(habit.difficulty)} XP</p>
              )}
              {habit.cue && !done && (
                <p className="mt-0.5 truncate text-xs text-muted-2">🔗 {habit.cue}</p>
              )}
            </div>

            {/* check ring */}
            <div className={cn(
              'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 transition-all',
              done ? 'border-success bg-success/20 text-success' : 'border-border-hover',
            )}>
              {done && (
                <svg width="16" height="16" viewBox="0 0 12 12" fill="none">
                  <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          </button>
        )
      })}

      {/* Add habit shortcut */}
      <Link
        href="/habits"
        className="flex items-center justify-center gap-1.5 rounded-xl border border-dashed border-border py-3 text-sm text-muted hover:border-border-hover hover:text-fg transition-colors"
      >
        <Plus size={14} /> Yeni alışkanlık ekle
      </Link>
    </div>
  )
}
