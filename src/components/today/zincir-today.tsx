'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Play, ChevronRight } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { ZincirFlow } from '@/components/zincir/zincir-flow'
import { Card } from '@/components/ui/card'
import type { Zincir } from '@/lib/types'

export function ZincirToday() {
  const { data } = useStore()
  const [running, setRunning] = useState<Zincir | null>(null)
  const zincirs = data.zincirs ?? []

  if (zincirs.length === 0) return null

  return (
    <>
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <span className="text-base">⛓️</span>
          <span className="text-sm font-bold text-fg font-display">Zincirlerim</span>
          <Link
            href="/zincir"
            className="ml-auto flex items-center gap-0.5 text-xs text-muted transition-colors hover:text-fg">
            Tümü <ChevronRight size={12} />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {zincirs.slice(0, 3).map(z => {
            const habits = z.steps.map(s => s.habitId ? data.habits.find(h => h.id === s.habitId) : null)
            return (
              <div key={z.id} className="flex items-center gap-3 px-4 py-2.5">
                <span className="text-xl">{z.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{z.name}</p>
                  <div className="mt-0.5 flex items-center gap-0.5">
                    {z.steps.map((step, i) => {
                      const h = habits[i]
                      return (
                        <span key={step.id} className="text-xs" title={h?.name ?? 'Hobi'}>
                          {h?.emoji ?? '⚡'}
                        </span>
                      )
                    })}
                  </div>
                </div>
                <button
                  onClick={() => setRunning(z)}
                  className="flex shrink-0 items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-bg shadow-glow transition-all hover:opacity-90">
                  <Play size={11} /> Başlat
                </button>
              </div>
            )
          })}
        </div>
      </Card>

      {running && <ZincirFlow zincir={running} onClose={() => setRunning(null)} />}
    </>
  )
}
