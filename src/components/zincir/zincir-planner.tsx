'use client'
import { useState } from 'react'
import { Plus, Trash2, Play, X, ChevronDown, ChevronUp } from 'lucide-react'
import type { Zincir, ZincirStep } from '@/lib/types'
import { useStore } from '@/hooks/useStore'
import { generateId } from '@/lib/utils'
import { ZincirFlow } from './zincir-flow'
import { cn } from '@/lib/utils'

const CHAIN_EMOJIS = ['⛓️', '🔗', '🌊', '🌙', '☀️', '🌿', '⚡', '🔥', '🎯', '💎']

function StepRow({
  step, habits, index, onChange, onRemove, onMoveUp, onMoveDown, isFirst, isLast,
}: {
  step: ZincirStep
  habits: { id: string; name: string; emoji: string; color: string }[]
  index: number
  onChange: (updated: ZincirStep) => void
  onRemove: () => void
  onMoveUp: () => void
  onMoveDown: () => void
  isFirst: boolean
  isLast: boolean
}) {
  const habit = step.habitId ? habits.find(h => h.id === step.habitId) : null
  return (
    <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
      <span className="w-5 shrink-0 text-center text-xs font-bold tabular-nums text-muted">{index + 1}</span>

      <div
        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl"
        style={habit ? { backgroundColor: habit.color + '22' } : { backgroundColor: 'var(--c-surface-3, #333)' }}>
        {step.habitId === null ? '⚡' : (habit?.emoji ?? '?')}
      </div>

      <select
        value={step.habitId ?? '__wildcard__'}
        onChange={e => onChange({ ...step, habitId: e.target.value === '__wildcard__' ? null : e.target.value })}
        className="h-8 flex-1 rounded-lg border border-border bg-surface px-2 text-xs text-fg focus:border-primary focus:outline-none">
        <option value="__wildcard__">⚡ Serbest seçim</option>
        {habits.map(h => (
          <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>
        ))}
      </select>

      <div className="flex flex-col gap-0.5">
        <button onClick={onMoveUp} disabled={isFirst} className="text-muted hover:text-fg disabled:opacity-20 transition-colors">
          <ChevronUp size={13} />
        </button>
        <button onClick={onMoveDown} disabled={isLast} className="text-muted hover:text-fg disabled:opacity-20 transition-colors">
          <ChevronDown size={13} />
        </button>
      </div>

      <button onClick={onRemove} className="text-muted-2 hover:text-danger transition-colors">
        <X size={15} />
      </button>
    </div>
  )
}

function NewZincirForm({ onSave, onCancel }: { onSave: () => void; onCancel: () => void }) {
  const { data, saveZincir } = useStore()
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState('⛓️')
  const [steps, setSteps] = useState<ZincirStep[]>([
    { id: generateId(), habitId: null, durationMin: 0 },
  ])

  const habits = data.habits.filter(h => !h.archived)

  function addStep() {
    setSteps(s => [...s, { id: generateId(), habitId: null, durationMin: 0 }])
  }

  function updateStep(i: number, updated: ZincirStep) {
    setSteps(s => s.map((step, j) => j === i ? updated : step))
  }

  function removeStep(i: number) {
    setSteps(s => s.filter((_, j) => j !== i))
  }

  function moveStep(i: number, dir: 'up' | 'down') {
    const j = dir === 'up' ? i - 1 : i + 1
    if (j < 0 || j >= steps.length) return
    const next = [...steps]
    ;[next[i], next[j]] = [next[j], next[i]]
    setSteps(next)
  }

  function handleSave() {
    if (!name.trim() || steps.length === 0) return
    saveZincir({ name: name.trim(), emoji, steps })
    onSave()
  }

  return (
    <div className="space-y-4 rounded-2xl border border-primary/30 bg-surface p-4">
      {/* İsim + emoji */}
      <div className="flex gap-2">
        <select
          value={emoji}
          onChange={e => setEmoji(e.target.value)}
          className="h-10 w-16 rounded-xl border border-border bg-surface-2 px-1 text-center text-xl focus:border-primary focus:outline-none">
          {CHAIN_EMOJIS.map(em => <option key={em} value={em}>{em}</option>)}
        </select>
        <input
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Zincir adı (örn. Sabah Seti)"
          className="h-10 flex-1 rounded-xl border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none"
        />
      </div>

      {/* Adımlar */}
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted">Adımlar</p>
        {steps.map((step, i) => (
          <StepRow
            key={step.id}
            step={step}
            habits={habits}
            index={i}
            onChange={updated => updateStep(i, updated)}
            onRemove={() => removeStep(i)}
            onMoveUp={() => moveStep(i, 'up')}
            onMoveDown={() => moveStep(i, 'down')}
            isFirst={i === 0}
            isLast={i === steps.length - 1}
          />
        ))}
        <button
          onClick={addStep}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-2.5 text-xs text-muted hover:border-primary hover:text-primary transition-colors">
          <Plus size={13} /> Adım ekle
        </button>
      </div>

      {/* Kaydet / İptal */}
      <div className="flex gap-2">
        <button onClick={onCancel}
          className="flex-1 rounded-xl border border-border py-2.5 text-sm text-muted hover:text-fg transition-colors">
          İptal
        </button>
        <button
          onClick={handleSave}
          disabled={!name.trim() || steps.length === 0}
          className="flex-1 rounded-xl bg-primary py-2.5 text-sm font-bold text-bg shadow-glow hover:opacity-90 disabled:opacity-40 transition-all">
          Kaydet
        </button>
      </div>
    </div>
  )
}

function ZincirCard({ zincir, onRun, onDelete }: { zincir: Zincir; onRun: () => void; onDelete: () => void }) {
  const { data } = useStore()
  const habits = zincir.steps.map(s => s.habitId ? data.habits.find(h => h.id === s.habitId) : null)

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-surface transition-all hover:border-border-hover">
      <div className="flex items-center gap-3 px-4 py-3">
        <span className="text-2xl">{zincir.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-bold text-fg font-display">{zincir.name}</p>
          <p className="text-xs text-muted">{zincir.steps.length} adım</p>
        </div>
        <button onClick={onDelete} className="text-muted-2 hover:text-danger transition-colors p-1">
          <Trash2 size={14} />
        </button>
      </div>

      {/* Mini zincir önizleme */}
      <div className="flex items-center gap-1 overflow-x-auto px-4 pb-3 scrollbar-hide">
        {zincir.steps.map((step, i) => {
          const h = habits[i]
          return (
            <div key={step.id} className="flex items-center shrink-0">
              <div className="flex h-8 w-8 items-center justify-center rounded-full border border-border bg-surface-2 text-sm"
                style={h ? { backgroundColor: h.color + '22' } : undefined}>
                {step.habitId === null ? '⚡' : (h?.emoji ?? '?')}
              </div>
              {i < zincir.steps.length - 1 && (
                <div className="h-0.5 w-3 bg-border" />
              )}
            </div>
          )
        })}
      </div>

      <div className="border-t border-border px-4 py-2.5">
        <button
          onClick={onRun}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-primary py-2.5 text-sm font-bold text-bg shadow-glow hover:opacity-90 transition-all">
          <Play size={14} /> Zinciri Başlat
        </button>
      </div>
    </div>
  )
}

export function ZincirPlanner() {
  const { data, deleteZincir } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [running, setRunning] = useState<Zincir | null>(null)

  const zincirs = data.zincirs ?? []

  return (
    <div className="space-y-5">
      {zincirs.length === 0 && !showForm && (
        <div className="rounded-2xl border border-dashed border-border py-12 text-center">
          <p className="text-3xl">⛓️</p>
          <p className="mt-2 text-sm font-semibold text-fg">Henüz zincir yok</p>
          <p className="mt-1 text-xs text-muted">Alışkanlıkları sıralı adımlara bağla, her seferinde aynı akışı izle</p>
        </div>
      )}

      {zincirs.map(z => (
        <ZincirCard
          key={z.id}
          zincir={z}
          onRun={() => setRunning(z)}
          onDelete={() => deleteZincir(z.id)}
        />
      ))}

      {showForm ? (
        <NewZincirForm onSave={() => setShowForm(false)} onCancel={() => setShowForm(false)} />
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-border py-4 text-sm font-semibold text-muted hover:border-primary hover:text-primary transition-all">
          <Plus size={16} /> Yeni Zincir Oluştur
        </button>
      )}

      {running && (
        <ZincirFlow zincir={running} onClose={() => setRunning(null)} />
      )}
    </div>
  )
}
