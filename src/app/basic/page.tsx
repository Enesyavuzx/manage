'use client'
import { useState, useEffect } from 'react'
import { Check, Play } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { ZincirFlow } from '@/components/zincir/zincir-flow'
import type { Zincir } from '@/lib/types'
import { todayKey } from '@/lib/store'
import { cn } from '@/lib/utils'

const BASICS = [
  { id: 0, emoji: '☀️', label: 'Uyandım ve yataktan kalktım' },
  { id: 1, emoji: '💧', label: 'İlk su bardağımı içtim' },
  { id: 2, emoji: '🏃', label: 'Vücudumu hareket ettirdim' },
  { id: 3, emoji: '🧹', label: 'Bir alanı düzenledim' },
  { id: 4, emoji: '✅', label: 'Bugünün tek önemli işine başladım' },
  { id: 5, emoji: '📵', label: 'Telefonsuz zaman geçirdim (30 dk)' },
  { id: 6, emoji: '🌙', label: 'Gece rutinime başladım' },
]

const STORAGE_KEY = () => `basic_checks_${todayKey()}`

export default function BasicPage() {
  const { data } = useStore()
  const [checked, setChecked] = useState<Set<number>>(new Set())
  const [running, setRunning] = useState<Zincir | null>(null)

  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY())
      if (saved) setChecked(new Set(JSON.parse(saved)))
    } catch {}
  }, [])

  function toggle(id: number) {
    setChecked(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      try { localStorage.setItem(STORAGE_KEY(), JSON.stringify([...next])) } catch {}
      return next
    })
  }

  const zincirs = data.zincirs ?? []
  const done = checked.size

  return (
    <div className="mx-auto max-w-sm space-y-6 px-2 py-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-fg font-display">Temel Mod</h1>
        <p className="mt-1 text-sm text-muted">Sadece en önemli şeyler · {done}/7</p>
        {done === 7 && (
          <p className="mt-2 text-sm font-semibold text-success">Bugün harika! 🎉</p>
        )}
      </div>

      {/* 7 basics */}
      <div className="space-y-2">
        {BASICS.map(item => {
          const isChecked = checked.has(item.id)
          return (
            <button
              key={item.id}
              onClick={() => toggle(item.id)}
              className={cn(
                'flex w-full items-center gap-4 rounded-2xl border-2 px-4 py-4 text-left transition-all active:scale-[0.98]',
                isChecked
                  ? 'border-success/40 bg-success/10'
                  : 'border-border bg-surface hover:border-border-hover',
              )}>
              <span className="text-2xl">{item.emoji}</span>
              <span className={cn(
                'flex-1 text-sm font-medium',
                isChecked ? 'text-muted line-through' : 'text-fg',
              )}>
                {item.label}
              </span>
              <div className={cn(
                'flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                isChecked
                  ? 'border-success bg-success'
                  : 'border-border',
              )}>
                {isChecked && <Check size={14} className="text-bg" strokeWidth={3} />}
              </div>
            </button>
          )
        })}
      </div>

      {/* Zincirler */}
      {zincirs.length > 0 && (
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">Zincirlerim</p>
          <div className="space-y-2">
            {zincirs.map(z => (
              <div key={z.id}
                className="flex items-center gap-3 rounded-2xl border border-border bg-surface px-4 py-3">
                <span className="text-xl">{z.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-semibold text-fg">{z.name}</p>
                  <p className="text-xs text-muted">{z.steps.length} adım</p>
                </div>
                <button
                  onClick={() => setRunning(z)}
                  className="flex shrink-0 items-center gap-1.5 rounded-xl bg-primary px-4 py-2 text-xs font-bold text-bg shadow-glow transition-all hover:opacity-90">
                  <Play size={12} /> Başlat
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {running && <ZincirFlow zincir={running} onClose={() => setRunning(null)} />}
    </div>
  )
}
