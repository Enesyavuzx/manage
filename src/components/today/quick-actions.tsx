'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Droplet, Target, Plus, Minus } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { todayKey } from '@/lib/store'
import type { MoodLevel } from '@/lib/types'
import { WATER_GOAL } from '@/lib/constants'
import { haptic } from '@/lib/confetti'
import { cn } from '@/lib/utils'

const MOODS: { level: MoodLevel; emoji: string; label: string }[] = [
  { level: 1, emoji: '😞', label: 'Kötü' },
  { level: 2, emoji: '😕', label: 'Zor' },
  { level: 3, emoji: '😐', label: 'Orta' },
  { level: 4, emoji: '🙂', label: 'İyi' },
  { level: 5, emoji: '😄', label: 'Harika' },
]

export function QuickActions() {
  const { data, addWater, logMood } = useStore()
  const [moodOpen, setMoodOpen] = useState(false)
  const today = todayKey()
  const water = data.water.filter(w => w.date === today).length
  const todayMood = data.moods.find(m => m.date === today)

  function handleMood(level: MoodLevel) {
    logMood(level)
    haptic([15, 30])
    setMoodOpen(false)
  }

  function handleWaterAdd() {
    addWater()
    haptic([10, 20])
  }

  return (
    <div className="space-y-2">
      {/* Su satırı */}
      <div className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3">
        <Droplet size={18} className="shrink-0 text-sky-400" fill="currentColor" />
        <span className="flex-1 text-sm font-semibold text-fg">Su</span>
        <div className="flex items-center gap-2">
          <span className="tabular-nums text-sm font-bold text-fg">
            {water}
            <span className="font-normal text-muted">/{WATER_GOAL}</span>
          </span>
          {/* progress dots */}
          <div className="flex gap-0.5">
            {Array.from({ length: WATER_GOAL }).map((_, i) => (
              <div key={i} className={cn(
                'h-2 w-2 rounded-full transition-all',
                i < water ? 'bg-sky-400' : 'bg-border',
              )} />
            ))}
          </div>
          <button
            onClick={handleWaterAdd}
            disabled={water >= WATER_GOAL}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-400/15 text-sky-400 transition-all hover:bg-sky-400/25 disabled:opacity-30">
            <Plus size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Ruh hali satırı */}
      <div className="overflow-hidden rounded-2xl border border-border bg-surface">
        <button
          onClick={() => setMoodOpen(o => !o)}
          className="flex w-full items-center gap-2 px-4 py-3">
          <span className="text-lg">
            {todayMood ? MOODS[todayMood.level - 1]?.emoji : '😐'}
          </span>
          <span className="flex-1 text-left text-sm font-semibold text-fg">Ruh hali</span>
          <span className="text-xs text-muted">
            {todayMood ? MOODS[todayMood.level - 1]?.label : 'Henüz kaydedilmedi'}
          </span>
        </button>

        {moodOpen && (
          <div className="flex justify-around border-t border-border px-2 py-3">
            {MOODS.map(m => (
              <button
                key={m.level}
                onClick={() => handleMood(m.level)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl px-3 py-2 transition-all',
                  todayMood?.level === m.level
                    ? 'bg-primary/15 ring-1 ring-primary/40'
                    : 'hover:bg-surface-2',
                )}>
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-[10px] font-medium text-muted">{m.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Odak bağlantısı */}
      <Link
        href="/focus"
        className="flex items-center gap-2 rounded-2xl border border-border bg-surface px-4 py-3 transition-colors hover:border-border-hover">
        <Target size={18} className="shrink-0 text-rose-400" />
        <span className="flex-1 text-sm font-semibold text-fg">Odak Seansı</span>
        <span className="text-xs text-muted">Başlat →</span>
      </Link>
    </div>
  )
}
