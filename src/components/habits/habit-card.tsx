'use client'
import { useState } from 'react'
import { MoreHorizontal, Pencil, Archive, Flame, Trash2, RotateCcw } from 'lucide-react'
import type { Habit } from '@/lib/types'
import { useStore, getStreak } from '@/hooks/useStore'
import { CATEGORY_META } from '@/lib/constants'
import { DIFFICULTY_META, xpForDifficulty } from '@/lib/gamification'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { HabitForm } from './habit-form'

export function HabitCard({ habit, showCheck = false }: { habit: Habit; showCheck?: boolean }) {
  const { data, toggleHabit, updateHabit, archiveHabit, unarchiveHabit, deleteHabit, todayCompletedIds } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [burst, setBurst] = useState(false)

  const done = todayCompletedIds.has(habit.id)
  const streak = getStreak(data.completions, habit.id)
  const cat = CATEGORY_META[habit.category]
  const diff = DIFFICULTY_META[habit.difficulty]

  function handleToggle() {
    if (!done) { setBurst(true); setTimeout(() => setBurst(false), 500) }
    toggleHabit(habit.id)
  }

  return (
    <>
      <div className={cn(
        'group relative flex items-center gap-4 overflow-hidden rounded-xl border bg-surface p-4 transition-all duration-200',
        done ? 'border-success/30 bg-success/5' : 'border-border hover:border-border-hover',
      )}>
        <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: habit.color }} />

        {showCheck && (
          <button onClick={handleToggle}
            className={cn(
              'relative flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
              done ? 'border-success bg-success/20 text-success' : 'border-border-hover hover:border-fg',
              burst && 'animate-pop',
            )}>
            {done && (
              <svg width="14" height="14" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
            {burst && <span className="absolute inset-0 rounded-full bg-success/40 animate-ping" />}
          </button>
        )}

        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl"
          style={{ backgroundColor: habit.color + '22' }}>
          {habit.emoji}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className={cn('truncate text-sm font-medium', done ? 'text-muted line-through' : 'text-fg')}>
              {habit.name}
            </span>
            {streak > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 text-xs font-semibold text-orange-400">
                <Flame size={12} fill="currentColor" />{streak}
              </span>
            )}
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <Badge variant="default">{cat.emoji} {cat.label}</Badge>
            <Badge variant="xp">+{xpForDifficulty(habit.difficulty)} XP</Badge>
            <span className="text-xs" style={{ color: diff.color }}>{diff.emoji} {diff.label}</span>
          </div>
        </div>

        <div className="relative">
          <button onClick={() => setMenuOpen(o => !o)}
            className="text-muted transition-colors hover:text-fg opacity-60 group-hover:opacity-100">
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-7 z-20 min-w-[150px] overflow-hidden rounded-lg border border-border bg-surface shadow-xl animate-fade-in">
                <button onClick={() => { setMenuOpen(false); setEditOpen(true) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg">
                  <Pencil size={14} /> Düzenle
                </button>
                {habit.archived ? (
                  <button onClick={() => { setMenuOpen(false); unarchiveHabit(habit.id) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg">
                    <RotateCcw size={14} /> Geri al
                  </button>
                ) : (
                  <button onClick={() => { setMenuOpen(false); archiveHabit(habit.id) }}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg">
                    <Archive size={14} /> Arşivle
                  </button>
                )}
                <button onClick={() => { setMenuOpen(false); deleteHabit(habit.id) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger hover:bg-danger/10">
                  <Trash2 size={14} /> Sil
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Alışkanlığı düzenle">
        <HabitForm initial={habit}
          onSubmit={d => { updateHabit(habit.id, d); setEditOpen(false) }}
          onCancel={() => setEditOpen(false)} />
      </Modal>
    </>
  )
}
