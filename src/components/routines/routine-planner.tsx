'use client'

import { useState } from 'react'
import { Plus, Trash2, ChevronUp, ChevronDown, Play, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { todayKey } from '@/lib/store'
import type { Routine } from '@/lib/types'
import { RoutineFlow } from './routine-flow'
import { cn } from '@/lib/utils'

const EMOJI_OPTIONS = ['🌅', '🌙', '⚡', '💪', '🎯'] as const

interface NewRoutineForm {
  emoji: string
  name: string
  habitIds: string[]
}

const EMPTY_FORM: NewRoutineForm = {
  emoji: '🌅',
  name: '',
  habitIds: [],
}

function RoutineCard({ routine }: { routine: Routine }) {
  const { data, deleteRoutine, reorderRoutineHabits, todayCompletedIds } = useStore()
  const [flowOpen, setFlowOpen] = useState(false)

  const habits = routine.habitIds
    .map(id => data.habits.find(h => h.id === id))
    .filter((h): h is NonNullable<typeof h> => h != null && !h.archived)

  const completedCount = habits.filter(h => todayCompletedIds.has(h.id)).length
  const totalCount = habits.length
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
  const allDone = totalCount > 0 && completedCount === totalCount

  function handleDelete() {
    if (window.confirm(`"${routine.name}" rutinini silmek istediğinden emin misin?`)) {
      deleteRoutine(routine.id)
    }
  }

  function moveHabit(index: number, direction: 'up' | 'down') {
    const ids = [...routine.habitIds]
    const target = direction === 'up' ? index - 1 : index + 1
    if (target < 0 || target >= ids.length) return
    ;[ids[index], ids[target]] = [ids[target], ids[index]]
    reorderRoutineHabits(routine.id, ids)
  }

  return (
    <>
      <div className={cn(
        'rounded-xl border bg-surface p-4 space-y-3 transition-colors',
        allDone ? 'border-success/30 bg-success/5' : 'border-border',
      )}>
        <div className="flex items-center gap-2">
          <span className="text-xl">{routine.emoji}</span>
          <h3 className="min-w-0 flex-1 truncate text-sm font-semibold text-fg">{routine.name}</h3>
          {allDone && <CheckCircle2 size={15} className="shrink-0 text-success" />}
          {/* Başlat butonu */}
          {totalCount > 0 && !allDone && (
            <button
              type="button"
              onClick={() => setFlowOpen(true)}
              className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-bg shadow-glow hover:opacity-90 transition-opacity"
            >
              <Play size={12} fill="currentColor" /> Başlat
            </button>
          )}
          <button
            type="button"
            onClick={handleDelete}
            className="shrink-0 rounded-md p-1.5 text-muted hover:text-fg hover:bg-surface-2 transition-colors"
            aria-label="Rutini sil"
          >
            <Trash2 size={14} />
          </button>
        </div>

        {totalCount > 0 && (
          <>
            <div className="space-y-0.5">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted">{completedCount}/{totalCount} tamamlandı</span>
                <span className={cn('text-xs font-medium', allDone ? 'text-success' : 'text-muted')}>{pct}%</span>
              </div>
              <div className="h-1.5 w-full rounded-full bg-surface-2 overflow-hidden">
                <div
                  className={cn('h-full rounded-full transition-all', allDone ? 'bg-success' : 'bg-primary')}
                  style={{ width: `${pct}%` }}
                />
              </div>
            </div>

            <ul className="space-y-0.5">
              {habits.map((habit, idx) => {
                const done = todayCompletedIds.has(habit.id)
                return (
                  <li
                    key={habit.id}
                    className="flex items-center gap-2 rounded-md px-2 py-1.5 hover:bg-surface-2 group"
                  >
                    <span className="text-base leading-none">{habit.emoji}</span>
                    <span className={cn('flex-1 text-xs', done ? 'text-muted line-through' : 'text-fg')}>
                      {habit.name}
                    </span>
                    {done && <span className="text-success text-xs">✓</span>}
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        type="button"
                        onClick={() => moveHabit(idx, 'up')}
                        disabled={idx === 0}
                        className="rounded p-0.5 text-muted hover:text-fg disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Yukarı taşı"
                      >
                        <ChevronUp size={12} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveHabit(idx, 'down')}
                        disabled={idx === habits.length - 1}
                        className="rounded p-0.5 text-muted hover:text-fg disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Aşağı taşı"
                      >
                        <ChevronDown size={12} />
                      </button>
                    </div>
                  </li>
                )
              })}
            </ul>
          </>
        )}

        {totalCount === 0 && (
          <p className="text-xs text-muted italic">Bu rutinde henüz alışkanlık yok. Düzenle butonuyla ekle.</p>
        )}
      </div>

      {flowOpen && (
        <RoutineFlow routine={routine} onClose={() => setFlowOpen(false)} />
      )}
    </>
  )
}

interface NewRoutineFormPanelProps {
  onCancel: () => void
}

function NewRoutineFormPanel({ onCancel }: NewRoutineFormPanelProps) {
  const { data, saveRoutine } = useStore()
  const [form, setForm] = useState<NewRoutineForm>(EMPTY_FORM)

  const activeHabits = data.habits.filter(h => !h.archived)

  function toggleHabitInForm(id: string) {
    setForm(f => ({
      ...f,
      habitIds: f.habitIds.includes(id)
        ? f.habitIds.filter(hid => hid !== id)
        : [...f.habitIds, id],
    }))
  }

  function handleSubmit() {
    const name = form.name.trim()
    if (!name) return
    saveRoutine({ emoji: form.emoji, name, habitIds: form.habitIds })
    onCancel()
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
      <p className="text-xs font-semibold text-muted uppercase tracking-wider">Yeni Rutin</p>

      <div className="flex gap-2">
        {EMOJI_OPTIONS.map(em => (
          <button
            key={em}
            type="button"
            onClick={() => setForm(f => ({ ...f, emoji: em }))}
            className={cn(
              'rounded-lg border px-3 py-2 text-lg transition-colors',
              form.emoji === em
                ? 'border-primary bg-primary/10 text-fg'
                : 'border-border bg-surface-2 text-fg hover:border-primary',
            )}
          >
            {em}
          </button>
        ))}
      </div>

      <input
        type="text"
        value={form.name}
        onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
        placeholder="Rutin adı..."
        className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none"
      />

      {activeHabits.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs text-muted">Alışkanlıklar</p>
          <div className="max-h-48 overflow-y-auto space-y-0.5 rounded-lg border border-border bg-surface-2 p-2">
            {activeHabits.map(h => {
              const selected = form.habitIds.includes(h.id)
              return (
                <button
                  key={h.id}
                  type="button"
                  onClick={() => toggleHabitInForm(h.id)}
                  className={cn(
                    'flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-xs transition-colors',
                    selected ? 'bg-primary/10 text-fg' : 'text-muted hover:bg-surface hover:text-fg',
                  )}
                >
                  <span>{h.emoji}</span>
                  <span className="flex-1">{h.name}</span>
                  {selected && <span className="text-primary">✓</span>}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {activeHabits.length === 0 && (
        <p className="text-xs text-muted">Henüz alışkanlık eklemedin.</p>
      )}

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted hover:text-fg transition-colors"
        >
          İptal
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!form.name.trim()}
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm font-semibold text-fg hover:bg-primary hover:text-bg hover:border-primary disabled:pointer-events-none disabled:opacity-40 transition-colors"
        >
          Kaydet
        </button>
      </div>
    </div>
  )
}

export function RoutinePlanner() {
  const { data, saveRoutine } = useStore()
  const [showForm, setShowForm] = useState(false)

  const routines = data.routines

  function quickCreate(preset: { emoji: string; name: string }) {
    saveRoutine({ emoji: preset.emoji, name: preset.name, habitIds: [] })
  }

  if (routines.length === 0 && !showForm) {
    return (
      <div className="rounded-xl border border-border bg-surface p-6 space-y-4 text-center">
        <p className="text-sm text-muted">Henüz bir rutin oluşturmadın.</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={() => quickCreate({ emoji: '🌅', name: 'Sabah Rutini' })}
            className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium text-fg hover:bg-primary hover:text-bg hover:border-primary transition-colors"
          >
            🌅 Sabah Rutini Oluştur
          </button>
          <button
            type="button"
            onClick={() => quickCreate({ emoji: '🌙', name: 'Akşam Rutini' })}
            className="rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-medium text-fg hover:bg-primary hover:text-bg hover:border-primary transition-colors"
          >
            🌙 Akşam Rutini Oluştur
          </button>
        </div>
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex items-center gap-1.5 mx-auto text-xs text-muted hover:text-fg transition-colors"
        >
          <Plus size={13} />
          Özel rutin
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {routines.map(r => (
        <RoutineCard key={r.id} routine={r} />
      ))}

      {showForm ? (
        <NewRoutineFormPanel onCancel={() => setShowForm(false)} />
      ) : (
        <button
          type="button"
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted hover:border-primary hover:text-fg transition-colors"
        >
          <Plus size={15} />
          Yeni Rutin
        </button>
      )}
    </div>
  )
}
