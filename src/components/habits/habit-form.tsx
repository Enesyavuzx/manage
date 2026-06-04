'use client'
import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import type { Habit, Category, Difficulty, HabitStep } from '@/lib/types'
import { CATEGORY_META, HABIT_COLORS, HABIT_EMOJIS } from '@/lib/constants'
import { DIFFICULTY_META } from '@/lib/gamification'
import { Button } from '@/components/ui/button'
import { cn, generateId } from '@/lib/utils'

const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

interface HabitFormProps {
  initial?: Partial<Habit>
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void
  onCancel: () => void
}

export function HabitForm({ initial, onSubmit, onCancel }: HabitFormProps) {
  const [name, setName]         = useState(initial?.name ?? '')
  const [description, setDesc]  = useState(initial?.description ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'productivity')
  const [emoji, setEmoji]       = useState(initial?.emoji ?? '🎯')
  const [color, setColor]       = useState(initial?.color ?? HABIT_COLORS[0])
  const [difficulty, setDiff]   = useState<Difficulty>(initial?.difficulty ?? 'medium')
  const [freqDaily, setFreqDaily] = useState(initial?.frequency === 'daily' || !initial?.frequency)
  const [selectedDays, setDays] = useState<number[]>(
    Array.isArray(initial?.frequency) ? (initial.frequency as number[]) : [1, 2, 3, 4, 5]
  )
  const [subtasks, setSubtasks] = useState<HabitStep[]>(initial?.subtasks ?? [])
  const [reminderTime, setReminderTime] = useState<string>(initial?.reminderTime ?? '')
  const [cue, setCue] = useState<string>(initial?.cue ?? '')

  function addSubtask() {
    setSubtasks(prev => [...prev, { id: generateId(), text: '' }])
  }
  function updateSubtask(id: string, text: string) {
    setSubtasks(prev => prev.map(s => s.id === id ? { ...s, text } : s))
  }
  function removeSubtask(id: string) {
    setSubtasks(prev => prev.filter(s => s.id !== id))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    onSubmit({
      name: name.trim(), description: description.trim(),
      category, emoji, color, difficulty,
      frequency: freqDaily ? 'daily' : selectedDays.sort(),
      subtasks: subtasks.map(s => ({ ...s, text: s.text.trim() })).filter(s => s.text),
      reminderTime: reminderTime || null,
      cue: cue.trim() || null,
    })
  }

  function toggleDay(d: number) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted font-display">Alışkanlık adı</label>
        <div className="flex gap-2">
          <button type="button"
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface-2 text-lg hover:border-border-hover"
            onClick={() => setEmoji(HABIT_EMOJIS[Math.floor(Math.random() * HABIT_EMOJIS.length)])}>
            {emoji}
          </button>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="örn. Sabah koşusu"
            className="h-10 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted font-display">İkon</label>
        <div className="flex flex-wrap gap-1.5">
          {HABIT_EMOJIS.slice(0, 24).map(e => (
            <button key={e} type="button" onClick={() => setEmoji(e)}
              className={cn('flex h-8 w-8 items-center justify-center rounded-md text-base transition-all',
                emoji === e ? 'bg-primary/20 ring-1 ring-primary' : 'bg-surface-2 hover:bg-border')}>
              {e}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted font-display">Kategori</label>
        <div className="flex flex-wrap gap-1.5">
          {(Object.keys(CATEGORY_META) as Category[]).map(cat => (
            <button key={cat} type="button" onClick={() => setCategory(cat)}
              className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-all',
                category === cat ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
              <span>{CATEGORY_META[cat].emoji}</span>{CATEGORY_META[cat].label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted font-display">Zorluk (XP belirler)</label>
        <div className="grid grid-cols-5 gap-1.5">
          {(Object.keys(DIFFICULTY_META) as Difficulty[]).map(d => {
            const m = DIFFICULTY_META[d]
            return (
              <button key={d} type="button" onClick={() => setDiff(d)}
                className={cn('flex flex-col items-center gap-1 rounded-lg border py-2 transition-all',
                  difficulty === d ? 'border-primary bg-primary/10' : 'border-border bg-surface-2 hover:border-border-hover')}>
                <span className="text-base" style={{ color: m.color }}>{m.emoji}</span>
                <span className="text-xs text-fg">{m.label}</span>
                <span className="text-xs text-xp">+{m.xp}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted font-display">Renk</label>
        <div className="flex flex-wrap gap-2">
          {HABIT_COLORS.map(col => (
            <button key={col} type="button" onClick={() => setColor(col)}
              className={cn('h-6 w-6 rounded-full transition-all', color === col && 'ring-2 ring-offset-2 ring-offset-surface ring-fg')}
              style={{ backgroundColor: col }} />
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted font-display">Sıklık</label>
        <div className="mb-3 flex gap-2">
          <button type="button" onClick={() => setFreqDaily(true)}
            className={cn('flex-1 rounded-lg border py-2 text-xs font-medium transition-all',
              freqDaily ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
            Her gün
          </button>
          <button type="button" onClick={() => setFreqDaily(false)}
            className={cn('flex-1 rounded-lg border py-2 text-xs font-medium transition-all',
              !freqDaily ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
            Belirli günler
          </button>
        </div>
        {!freqDaily && (
          <div className="flex gap-1.5">
            {DAYS.map((d, i) => (
              <button key={d} type="button" onClick={() => toggleDay(i)}
                className={cn('flex-1 rounded-md border py-1.5 text-xs font-medium transition-all',
                  selectedDays.includes(i) ? 'border-transparent bg-primary text-bg' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      <div>
        <div className="mb-1.5 flex items-center justify-between">
          <label className="block text-xs font-medium text-muted font-display">Adımlar (parçalara böl)</label>
          <button type="button" onClick={addSubtask} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus size={12} /> Adım ekle
          </button>
        </div>
        {subtasks.length === 0 && (
          <p className="text-xs text-muted-2">Büyük bir işi küçük adımlara bölmek başlamayı kolaylaştırır.</p>
        )}
        <div className="space-y-2">
          {subtasks.map((s, i) => (
            <div key={s.id} className="flex items-center gap-2">
              <span className="text-xs text-muted-2 w-4 text-center">{i + 1}</span>
              <input value={s.text} onChange={e => updateSubtask(s.id, e.target.value)} placeholder="örn. spor kıyafetini giy"
                className="h-9 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />
              <button type="button" onClick={() => removeSubtask(s.id)} className="text-muted hover:text-danger">
                <X size={15} />
              </button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted font-display">Tetikleyici (opsiyonel)</label>
        <input value={cue} onChange={e => setCue(e.target.value)} placeholder="örn. sabah kahvemi içtikten sonra"
          className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />
        <p className="mt-1 text-xs text-muted-2">Var olan bir alışkanlığa bağla, hatırlaması kolaylaşsın: &quot;[tetikleyici], sonra bunu yap&quot;.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted font-display">Hatırlatıcı saati (opsiyonel)</label>
        <div className="flex items-center gap-2">
          <input type="time" value={reminderTime} onChange={e => setReminderTime(e.target.value)}
            className="h-10 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg focus:border-primary focus:outline-none" />
          {reminderTime && (
            <button type="button" onClick={() => setReminderTime('')} className="text-xs text-muted hover:text-fg">Temizle</button>
          )}
        </div>
        <p className="mt-1 text-xs text-muted-2">Uygulama açıkken bu saatte tarayıcı bildirimi gönderir.</p>
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-muted font-display">Not (opsiyonel)</label>
        <textarea value={description} onChange={e => setDesc(e.target.value)} rows={2}
          className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
          placeholder="Bu alışkanlık neden önemli..." />
      </div>

      <div className="flex gap-2 pt-1">
        <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">İptal</Button>
        <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim()}>
          {initial?.name ? 'Kaydet' : 'Ekle'}
        </Button>
      </div>
    </form>
  )
}
