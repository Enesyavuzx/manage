'use client'
import { useState } from 'react'
import { MoreHorizontal, Pencil, Archive, Flame } from 'lucide-react'
import type { Habit } from '@/lib/types'
import { useStore, getStreak } from '@/hooks/useStore'
import { CATEGORY_META } from '@/lib/constants'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Modal } from '@/components/ui/modal'
import { HabitForm } from './habit-form'

interface HabitCardProps {
  habit: Habit
  showCheck?: boolean
}

export function HabitCard({ habit, showCheck = false }: HabitCardProps) {
  const { data, toggleHabit, updateHabit, archiveHabit, todayCompletedIds } = useStore()
  const [menuOpen, setMenuOpen] = useState(false)
  const [editOpen, setEditOpen] = useState(false)
  const [completing, setCompleting] = useState(false)

  const done = todayCompletedIds.has(habit.id)
  const streak = getStreak(data.completions, habit.id)
  const cat = CATEGORY_META[habit.category]

  function handleToggle() {
    if (completing) return
    setCompleting(true)
    setTimeout(() => {
      toggleHabit(habit.id)
      setCompleting(false)
    }, 150)
  }

  return (
    <>
      <div className={cn(
        'group relative flex items-center gap-4 rounded-xl border bg-surface p-4 transition-all duration-200',
        done ? 'border-success/20 bg-success/5' : 'border-border hover:border-border-hover',
      )}>
        {/* Color indicator */}
        <div className="h-full w-0.5 absolute left-0 top-0 rounded-l-xl" style={{ backgroundColor: habit.color, height: '100%' }} />

        {showCheck && (
          <button
            onClick={handleToggle}
            className={cn(
              'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition-all duration-200',
              done
                ? 'border-success-light bg-success/20 text-success-light'
                : 'border-border-hover hover:border-white',
              completing && 'animate-pop',
            )}
          >
            {done && (
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        )}

        {/* Emoji */}
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-xl"
          style={{ backgroundColor: habit.color + '22' }}>
          {habit.emoji}
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className={cn('text-sm font-medium truncate', done ? 'text-muted line-through' : 'text-white')}>
              {habit.name}
            </span>
            {streak > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-orange-400 font-medium shrink-0">
                <Flame size={12} fill="currentColor" />
                {streak}
              </span>
            )}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <Badge variant="default">{cat.emoji} {cat.label}</Badge>
            <Badge variant="xp">+{habit.xpReward} XP</Badge>
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setMenuOpen(o => !o)}
            className="text-muted hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <MoreHorizontal size={16} />
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-6 z-20 min-w-[140px] rounded-lg border border-border bg-surface shadow-xl animate-fade-in">
                <button
                  onClick={() => { setMenuOpen(false); setEditOpen(true) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:text-white hover:bg-surface-2"
                >
                  <Pencil size={14} /> Edit
                </button>
                <button
                  onClick={() => { setMenuOpen(false); archiveHabit(habit.id) }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-muted hover:text-white hover:bg-surface-2"
                >
                  <Archive size={14} /> Archive
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit habit">
        <HabitForm
          initial={habit}
          onSubmit={(d) => { updateHabit(habit.id, d); setEditOpen(false) }}
          onCancel={() => setEditOpen(false)}
        />
      </Modal>
    </>
  )
}
