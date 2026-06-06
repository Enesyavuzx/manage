'use client'
import { Smile } from 'lucide-react'
import Link from 'next/link'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { MOOD_META, MOOD_XP } from '@/lib/constants'
import { todayMood } from '@/lib/store'
import { haptic } from '@/lib/confetti'
import type { MoodLevel } from '@/lib/types'
import { cn } from '@/lib/utils'

const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5]

// Dashboard'tan tek dokunuşla ruh hali. /mood sayfasına gitmeye gerek yok.
export function MoodQuickWidget() {
  const { data, logMood } = useStore()
  const current = todayMood(data)

  function pick(level: MoodLevel) {
    haptic(15)
    logMood(level, current?.note)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle><span className="inline-flex items-center gap-2"><Smile size={15} /> Ruh hali</span></CardTitle>
        {current ? (
          <Link href="/mood" className="text-xs text-muted hover:text-fg">detay</Link>
        ) : (
          <span className="text-xs text-xp">+{MOOD_XP} XP</span>
        )}
      </CardHeader>

      <div className="p-4">
        <div className="grid grid-cols-5 gap-2">
          {LEVELS.map(level => {
            const meta = MOOD_META[level]
            const active = current?.level === level
            return (
              <button
                key={level}
                onClick={() => pick(level)}
                title={meta.label}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-xl border py-2.5 transition-all',
                  active ? 'border-2' : 'border-border bg-surface-2 hover:-translate-y-0.5 hover:border-border-hover',
                )}
                style={active ? { borderColor: meta.color, background: `${meta.color}1a` } : undefined}>
                <span className="text-2xl">{meta.emoji}</span>
              </button>
            )
          })}
        </div>
        {current && (
          <p className="mt-3 text-center text-xs text-muted">
            Bugün: <span style={{ color: MOOD_META[current.level].color }}>{MOOD_META[current.level].emoji} {MOOD_META[current.level].label}</span>
          </p>
        )}
      </div>
    </Card>
  )
}
