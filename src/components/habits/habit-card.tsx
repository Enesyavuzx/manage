'use client'
import { useState } from 'react'
import { MoreHorizontal, Pencil, Archive, Flame, Trash2, RotateCcw, ChevronDown, ListTree, ArrowUp, ArrowDown, Bell } from 'lucide-react'
import type { Habit } from '@/lib/types'
import { useStore, getStreak } from '@/hooks/useStore'
import { CATEGORY_META } from '@/lib/constants'
import { DIFFICULTY_META, xpForDifficulty } from '@/lib/gamification'
import { subtaskKey, todayKey } from '@/lib/store'
import { cn } from '@/lib/utils'
import { fireConfetti, haptic } from '@/lib/confetti'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { HabitForm } from './habit-form'
import { HabitDetail } from './habit-detail'

export function HabitCard({ habit, showCheck = false, canReorder = false }: { habit: Habit; showCheck?: boolean; canReorder?: boolean }) {
  const { data, toggleHabit, updateHabit, archiveHabit, unarchiveHabit, deleteHabit, toggleSubtask, reorderHabit, todayCompletedIds } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [detailOpen, setDetailOpen] = useState(false)
  const [burst, setBurst] = useState(false)
  const [expanded, setExpanded] = useState(false)

  const done = todayCompletedIds.has(habit.id)
  const streak = getStreak(data.completions, habit.id, data.frozenDates)
  const cat = CATEGORY_META[habit.category]
  const diff = DIFFICULTY_META[habit.difficulty]

  const subtasks = habit.subtasks ?? []
  const doneSteps = data.subtaskDone[subtaskKey(todayKey(), habit.id)] ?? []
  const stepProgress = subtasks.length ? doneSteps.filter(id => subtasks.some(s => s.id === id)).length : 0

  function handleToggle(e: React.MouseEvent) {
    if (!done) {
      setBurst(true)
      setTimeout(() => setBurst(false), 500)
      fireConfetti({ count: 60, origin: { x: e.clientX, y: e.clientY }, power: 0.9 })
      haptic([20, 40, 20])
    }
    toggleHabit(habit.id)
  }

  return (
    <>
      <div className={cn(
        'group relative overflow-hidden rounded-xl border bg-surface transition-all duration-200',
        done ? 'border-success/30 bg-success/5' : 'border-border hover:border-border-hover',
      )}>
        <div className="absolute left-0 top-0 h-full w-1" style={{ backgroundColor: habit.color }} />

        <div className="flex items-center gap-4 p-4">
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

          <button onClick={() => setDetailOpen(true)}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-xl transition-opacity hover:opacity-80"
            style={{ backgroundColor: habit.color + '22' }}>
            {habit.emoji}
          </button>

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <button onClick={() => setDetailOpen(true)}
                className={cn('truncate text-left text-sm font-medium hover:underline', done ? 'text-muted line-through' : 'text-fg')}>
                {habit.name}
              </button>
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
              {subtasks.length > 0 && (
                <button onClick={() => setExpanded(o => !o)}
                  className="flex items-center gap-1 text-xs text-muted transition-colors hover:text-fg">
                  <ListTree size={12} /> {stepProgress}/{subtasks.length} adım
                  <ChevronDown size={12} className={cn('transition-transform', expanded && 'rotate-180')} />
                </button>
              )}
              {habit.reminderTime && (
                <span className="flex items-center gap-0.5 text-xs text-muted">
                  <Bell size={11} /> {habit.reminderTime}
                </span>
              )}
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
                  {canReorder && !habit.archived && (
                    <>
                      <button onClick={() => { setMenuOpen(false); reorderHabit(habit.id, 'up') }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg">
                        <ArrowUp size={14} /> Yukarı taşı
                      </button>
                      <button onClick={() => { setMenuOpen(false); reorderHabit(habit.id, 'down') }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:bg-surface-2 hover:text-fg">
                        <ArrowDown size={14} /> Aşağı taşı
                      </button>
                    </>
                  )}
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

        {/* Subtask checklist (today) */}
        {subtasks.length > 0 && expanded && (
          <div className="space-y-1.5 border-t border-border px-4 py-3 pl-12">
            {subtasks.map(step => {
              const checked = doneSteps.includes(step.id)
              return (
                <button key={step.id} onClick={() => { toggleSubtask(habit.id, step.id); haptic(15) }}
                  className="flex w-full items-center gap-2.5 text-left">
                  <span className={cn(
                    'flex h-4 w-4 shrink-0 items-center justify-center rounded border transition-all',
                    checked ? 'border-success bg-success/20 text-success' : 'border-border-hover',
                  )}>
                    {checked && (
                      <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </span>
                  <span className={cn('text-xs', checked ? 'text-muted line-through' : 'text-fg')}>{step.text}</span>
                </button>
              )
            })}
          </div>
        )}
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Alışkanlığı düzenle">
        <HabitForm initial={habit}
          onSubmit={d => { updateHabit(habit.id, d); setEditOpen(false) }}
          onCancel={() => setEditOpen(false)} />
      </Modal>

      <Modal open={detailOpen} onClose={() => setDetailOpen(false)} title="Alışkanlık detayı">
        <HabitDetail habit={habit} />
      </Modal>
    </>
  )
}
