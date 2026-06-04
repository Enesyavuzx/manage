'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getRealmEvents, type RealmEvent } from '@/lib/events'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const TONE: Record<RealmEvent['tone'], string> = {
  warn: 'border-danger/40 bg-danger/10',
  good: 'border-success/40 bg-success/10',
  info: 'border-border bg-surface-2',
}

export function EventsCard() {
  const { data, addWater } = useStore()
  const events = useMemo(() => getRealmEvents(data), [data])

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="text-base">📣</span>
        <span className="text-sm font-bold text-fg font-display">Diyar Olayları</span>
      </div>
      <div className="space-y-2 p-4">
        {events.length === 0 ? (
          <p className="text-sm text-muted">Şu an aktif bir olay yok. Diyar sakin.</p>
        ) : (
          events.map(ev => (
            <div key={ev.id} className={cn('flex items-start gap-3 rounded-xl border p-3', TONE[ev.tone])}>
              <span className="text-2xl">{ev.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-fg">{ev.title}</p>
                <p className="mt-0.5 text-xs text-muted">{ev.desc}</p>
              </div>
              {ev.kind === 'drought' ? (
                <button onClick={addWater} className="shrink-0 self-center rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-bg hover:brightness-110">
                  Su ekle
                </button>
              ) : ev.href ? (
                <Link href={ev.href} className="flex shrink-0 items-center gap-0.5 self-center rounded-lg border border-border bg-surface px-2.5 py-1.5 text-xs font-medium text-muted hover:text-fg">
                  {ev.actionLabel ?? 'Git'} <ChevronRight size={13} />
                </Link>
              ) : null}
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
