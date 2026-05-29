'use client'
import { useState } from 'react'
import type { Habit, Category } from '@/lib/types'
import { CATEGORY_META, HABIT_COLORS, HABIT_EMOJIS } from '@/lib/constants'
import { Button } from '@/components/ui/button'

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

interface HabitFormProps {
  initial?: Partial<Habit>
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void
  onCancel: () => void
}

export function HabitForm({ initial, onSubmit, onCancel }: HabitFormProps) {
  const [name, setName]           = useState(initial?.name ?? '')
  const [description, setDesc]    = useState(initial?.description ?? '')
  const [category, setCategory]   = useState<Category>(initial?.category ?? 'productivity')
  const [emoji, setEmoji]         = useState(initial?.emoji ?? '🎯')
  const [color, setColor]         = useState(initial?.color ?? HABIT_COLORS[0])
  const [xpReward, setXp]         = useState(initial?.xpReward ?? 10)
  const [freqDaily, setFreqDaily] = useState(initial?.frequency === 'daily' || !initial?.frequency)
  const [selectedDays, setDays]   = useState<number[]>(
    Array.isArray(initial?.frequency) ? (initial.frequency as number[]) : [1, 2, 3, 4, 5]
  )

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(),
      description: description.trim(),
      category,
      emoji,
      color,
      xpReward,
      frequency: freqDaily ? 'daily' : selectedDays,
    })
  }

  function toggleDay(d: number) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Name */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Habit name</label>
        <div className="flex gap-2">
          <button
            type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-lg hover:border-border-hover"
            onClick={() => setEmoji(HABIT_EMOJIS[Math.floor(Math.random() * HABIT_EMOJIS.length)])}
          >
            {emoji}
          </button>
          <input
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="e.g. Morning run"
            className="h-10 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
          />
        </div>
      </div>

      {/* Emoji picker */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Icon</label>
        <div className="flex flex-wrap gap-1.5">
          {HABIT_EMOJIS.slice(0, 16).map(e => (
            <button
              key={e}
              type="button"
              onClick={() => setEmoji(e)}
              className={`flex h-8 w-8 items-center justify-center rounded-md text-base transition-all ${emoji === e ? 'bg-accent/20 ring-1 ring-accent' : 'bg-surface-2 hover:bg-border'}`}
            >
              {e}
            </button>
          ))}
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Category</label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_META) as Category[]).map(cat => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-all border ${category === cat ? 'border-accent bg-accent/10 text-accent-light' : 'border-border bg-surface-2 text-muted hover:text-white'}`}
            >
              <span>{CATEGORY_META[cat].emoji}</span>
              {CATEGORY_META[cat].label}
            </button>
          ))}
        </div>
      </div>

      {/* Color */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Color</label>
        <div className="flex gap-2">
          {HABIT_COLORS.map(c => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`h-6 w-6 rounded-full transition-all ${color === c ? 'ring-2 ring-offset-2 ring-offset-surface ring-white' : ''}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      {/* XP Reward */}
      <div>
        <label className="mb-1.5 flex items-center justify-between text-xs font-medium text-muted">
          <span>XP per completion</span>
          <span className="text-xp font-semibold">+{xpReward} XP</span>
        </label>
        <input
          type="range"
          min="5" max="50" step="5"
          value={xpReward}
          onChange={e => setXp(Number(e.target.value))}
          className="w-full accent-amber-500"
        />
        <div className="mt-1 flex justify-between text-xs text-muted">
          <span>5 XP</span><span>50 XP</span>
        </div>
      </div>

      {/* Frequency */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Frequency</label>
        <div className="flex gap-2 mb-3">
          <button
            type="button"
            onClick={() => setFreqDaily(true)}
            className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${freqDaily ? 'border-accent bg-accent/10 text-accent-light' : 'border-border bg-surface-2 text-muted hover:text-white'}`}
          >
            Every day
          </button>
          <button
            type="button"
            onClick={() => setFreqDaily(false)}
            className={`flex-1 rounded-lg border py-2 text-xs font-medium transition-all ${!freqDaily ? 'border-accent bg-accent/10 text-accent-light' : 'border-border bg-surface-2 text-muted hover:text-white'}`}
          >
            Specific days
          </button>
        </div>
        {!freqDaily && (
          <div className="flex gap-1.5">
            {DAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(i)}
                className={`flex-1 rounded-md py-1.5 text-xs font-medium transition-all ${selectedDays.includes(i) ? 'bg-accent text-white' : 'bg-surface-2 text-muted hover:text-white border border-border'}`}
              >
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted">Note (optional)</label>
        <textarea
          value={description}
          onChange={e => setDesc(e.target.value)}
          rows={2}
          className="w-full rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none resize-none"
          placeholder="Why this habit matters..."
        />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">Cancel</Button>
        <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim()}>
          {initial?.name ? 'Save changes' : 'Add habit'}
        </Button>
      </div>
    </form>
  )
}
