'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getRealmEvents } from '@/lib/events'
import { TodayHeader } from '@/components/today/today-header'
import { AtRiskStreaks } from '@/components/today/at-risk-streaks'
import { RemainingToday } from '@/components/today/remaining-today'
import { QuickCapture } from '@/components/today/quick-capture'
import { QuickActions } from '@/components/today/quick-actions'
import { AdvisorCard } from '@/components/advisor/advisor-card'
import { cn } from '@/lib/utils'

const TONE: Record<'good' | 'warn' | 'info', string> = {
  warn: 'border-danger/40 bg-danger/10',
  good: 'border-success/40 bg-success/10',
  info: 'border-border bg-surface-2',
}

export default function BugunPage() {
  const { data } = useStore()
  const topEvent = useMemo(() => getRealmEvents(data)[0] ?? null, [data])

  return (
    <div className="mx-auto max-w-xl space-y-4">
      <TodayHeader />

      {topEvent && (
        <Link href={topEvent.href ?? '/seferler'} className={cn('flex items-center gap-3 rounded-xl border px-3 py-2.5 transition-colors', TONE[topEvent.tone])}>
          <span className="text-xl">{topEvent.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-fg">{topEvent.title}</p>
            <p className="truncate text-xs text-muted">{topEvent.desc}</p>
          </div>
          <ChevronRight size={16} className="shrink-0 text-muted" />
        </Link>
      )}

      <AdvisorCard />
      <AtRiskStreaks />
      <RemainingToday />
      <QuickActions />
      <QuickCapture />
    </div>
  )
}
