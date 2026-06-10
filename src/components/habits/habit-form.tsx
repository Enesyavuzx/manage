'use client'
import { useState } from 'react'
import { Plus, X, ChevronDown } from 'lucide-react'
import type { Habit, Category, Difficulty, HabitStep } from '@/lib/types'
import { CATEGORY_META, HABIT_COLORS, HABIT_EMOJIS } from '@/lib/constants'
import { DIFFICULTY_META } from '@/lib/gamification'
import { Button } from '@/components/ui/button'
import { cn, generateId } from '@/lib/utils'

const DAYS = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']

const CATEGORY_EMOJIS: Record<Category, string[]> = {
  health:       ['💊', '🥗', '😴', '🍎', '🦷', '🧹'],
  productivity: ['🎯', '📝', '💻', '📱', '💰', '📷'],
  mindfulness:  ['🧘', '🌿', '🌅', '🌙', '☕', '✍️'],
  learning:     ['📖', '🧠', '🎵', '🎸', '📚', '🎨'],
  fitness:      ['🏃', '💪', '🏋️', '🚴', '🚶', '🔥'],
  social:       ['🫂', '🌊', '🎮', '🎉', '💬', '🌸'],
  creativity:   ['🎨', '✍️', '🎵', '📷', '🎸', '🖼️'],
  other:        ['⭐', '✨', '💡', '🌈', '🎯', '🔮'],
}

interface HabitFormProps {
  initial?: Partial<Habit>
  onSubmit: (data: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void
  onCancel: () => void
}

export function HabitForm({ initial, onSubmit, onCancel }: HabitFormProps) {
  const [name, setName]         = useState(initial?.name ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'productivity')
  const [emoji, setEmoji]       = useState(initial?.emoji ?? CATEGORY_EMOJIS[initial?.category ?? 'productivity'][0])
  const [freqDaily, setFreqDaily] = useState(initial?.frequency === 'daily' || !initial?.frequency)
  const [selectedDays, setDays] = useState<number[]>(
    Array.isArray(initial?.frequency) ? (initial.frequency as number[]) : [1, 2, 3, 4, 5]
  )
  const [showDetails, setShowDetails] = useState(false)

  // detail fields
  const [color, setColor]       = useState(initial?.color ?? CATEGORY_META[initial?.category ?? 'productivity'].color)
  const [difficulty, setDiff]   = useState<Difficulty>(initial?.difficulty ?? 'medium')
  const [description, setDesc]  = useState(initial?.description ?? '')
  const [subtasks, setSubtasks] = useState<HabitStep[]>(initial?.subtasks ?? [])
  const [reminderTime, setReminderTime] = useState<string>(initial?.reminderTime ?? '')
  const [cue, setCue] = useState<string>(initial?.cue ?? '')

  function handleCategoryChange(cat: Category) {
    setCategory(cat)
    setColor(CATEGORY_META[cat].color)
    const emojis = CATEGORY_EMOJIS[cat]
    if (!emojis.includes(emoji)) setEmoji(emojis[0])
  }

  function cycleEmoji() {
    const pool = CATEGORY_EMOJIS[category]
    const idx = pool.indexOf(emoji)
    setEmoji(pool[(idx + 1) % pool.length])
  }

  function toggleDay(d: number) {
    setDays(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">

      {/* === HIZLI BÖLÜM === */}

      {/* Emoji + İsim */}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={cycleEmoji}
          title="Tıkla: emoji değiştir"
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface-2 text-2xl transition-all hover:border-border-hover hover:scale-105 active:scale-95">
          {emoji}
        </button>
        <input
          autoFocus
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Alışkanlık adı"
          className="h-12 flex-1 rounded-xl border border-border bg-surface-2 px-4 text-base font-medium text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
        />
      </div>

      {/* Kategori */}
      <div className="flex flex-wrap gap-1.5">
        {(Object.keys(CATEGORY_META) as Category[]).map(cat => (
          <button
            key={cat}
            type="button"
            onClick={() => handleCategoryChange(cat)}
            className={cn(
              'flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              category === cat
                ? 'border-transparent text-bg'
                : 'border-border bg-surface-2 text-muted hover:text-fg',
            )}
            style={category === cat ? { backgroundColor: CATEGORY_META[cat].color } : undefined}>
            {CATEGORY_META[cat].emoji} {CATEGORY_META[cat].label}
          </button>
        ))}
      </div>

      {/* Sıklık */}
      <div className="space-y-2">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setFreqDaily(true)}
            className={cn(
              'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all',
              freqDaily
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface-2 text-muted hover:text-fg',
            )}>
            Her gün
          </button>
          <button
            type="button"
            onClick={() => setFreqDaily(false)}
            className={cn(
              'flex-1 rounded-xl border py-2.5 text-sm font-semibold transition-all',
              !freqDaily
                ? 'border-primary bg-primary/10 text-primary'
                : 'border-border bg-surface-2 text-muted hover:text-fg',
            )}>
            Belirli günler
          </button>
        </div>
        {!freqDaily && (
          <div className="flex gap-1">
            {DAYS.map((d, i) => (
              <button
                key={d}
                type="button"
                onClick={() => toggleDay(i)}
                className={cn(
                  'flex-1 rounded-lg border py-2 text-xs font-semibold transition-all',
                  selectedDays.includes(i)
                    ? 'border-transparent bg-primary text-bg'
                    : 'border-border bg-surface-2 text-muted hover:text-fg',
                )}>
                {d}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Ana buton (hızlı ekleme için yeterli) */}
      {!showDetails && (
        <div className="flex gap-2 pt-1">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">İptal</Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim()}>
            {initial?.name ? 'Kaydet' : 'Ekle'}
          </Button>
        </div>
      )}

      {/* === DETAYLAR AKORDEONU === */}
      <button
        type="button"
        onClick={() => setShowDetails(o => !o)}
        className="flex w-full items-center justify-between rounded-xl border border-dashed border-border px-4 py-2.5 text-xs font-semibold text-muted transition-colors hover:border-border-hover hover:text-fg">
        <span>Detayları özelleştir</span>
        <ChevronDown size={14} className={cn('transition-transform', showDetails && 'rotate-180')} />
      </button>

      {showDetails && (
        <div className="space-y-4 rounded-xl border border-border bg-surface-2/50 p-4">

          {/* Zorluk */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Zorluk (XP belirler)</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.keys(DIFFICULTY_META) as Difficulty[]).map(d => {
                const m = DIFFICULTY_META[d]
                return (
                  <button key={d} type="button" onClick={() => setDiff(d)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border py-2 transition-all',
                      difficulty === d ? 'border-primary bg-primary/10' : 'border-border bg-surface hover:border-border-hover',
                    )}>
                    <span className="text-base" style={{ color: m.color }}>{m.emoji}</span>
                    <span className="text-[10px] text-fg">{m.label}</span>
                    <span className="text-[10px] text-xp">+{m.xp}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Renk */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Renk</label>
            <div className="flex flex-wrap gap-2">
              {HABIT_COLORS.map(col => (
                <button key={col} type="button" onClick={() => setColor(col)}
                  className={cn('h-6 w-6 rounded-full transition-all', color === col && 'ring-2 ring-offset-2 ring-offset-surface ring-fg')}
                  style={{ backgroundColor: col }} />
              ))}
            </div>
          </div>

          {/* Tüm ikonlar */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">İkon</label>
            <div className="flex flex-wrap gap-1.5">
              {HABIT_EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-md text-base transition-all',
                    emoji === e ? 'bg-primary/20 ring-1 ring-primary' : 'bg-surface hover:bg-border',
                  )}>
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Tetikleyici */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Tetikleyici</label>
            <input
              value={cue}
              onChange={e => setCue(e.target.value)}
              placeholder="örn. kahvemi içtikten sonra"
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Hatırlatıcı */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Hatırlatıcı saati</label>
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={reminderTime}
                onChange={e => setReminderTime(e.target.value)}
                className="h-10 rounded-lg border border-border bg-surface px-3 text-sm text-fg focus:border-primary focus:outline-none"
              />
              {reminderTime && (
                <button type="button" onClick={() => setReminderTime('')} className="text-xs text-muted hover:text-fg">
                  Temizle
                </button>
              )}
            </div>
          </div>

          {/* Adımlar */}
          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="block text-xs font-semibold text-muted">Adımlar</label>
              <button type="button" onClick={addSubtask} className="flex items-center gap-1 text-xs text-primary hover:underline">
                <Plus size={12} /> Ekle
              </button>
            </div>
            <div className="space-y-2">
              {subtasks.map((s, i) => (
                <div key={s.id} className="flex items-center gap-2">
                  <span className="w-4 shrink-0 text-center text-xs text-muted-2">{i + 1}</span>
                  <input
                    value={s.text}
                    onChange={e => updateSubtask(s.id, e.target.value)}
                    placeholder="örn. spor kıyafetini giy"
                    className="h-9 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
                  />
                  <button type="button" onClick={() => removeSubtask(s.id)} className="text-muted hover:text-danger">
                    <X size={15} />
                  </button>
                </div>
              ))}
              {subtasks.length === 0 && (
                <p className="text-xs text-muted-2">Büyük işi küçük adımlara bölmek başlamayı kolaylaştırır.</p>
              )}
            </div>
          </div>

          {/* Not */}
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-muted">Not</label>
            <textarea
              value={description}
              onChange={e => setDesc(e.target.value)}
              rows={2}
              placeholder="Bu alışkanlık neden önemli..."
              className="w-full resize-none rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
            />
          </div>
        </div>
      )}

      {/* Butonlar (detaylar açıkken) */}
      {showDetails && (
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel} className="flex-1">İptal</Button>
          <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim()}>
            {initial?.name ? 'Kaydet' : 'Ekle'}
          </Button>
        </div>
      )}
    </form>
  )
}
