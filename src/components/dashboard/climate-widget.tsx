'use client'
import { useMemo } from 'react'
import { Wind } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getClimate, type ClimateType } from '@/lib/climate'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const BAR_COLOR: Record<ClimateType, string> = {
  sunny:  'bg-yellow-400',
  clear:  'bg-sky-400',
  cloudy: 'bg-slate-400',
  rainy:  'bg-blue-500',
  stormy: 'bg-violet-700',
}

export function ClimateWidget() {
  const { data } = useStore()
  const climate = useMemo(() => getClimate(data), [data])

  // Only show once there is some data to base the climate on
  if (data.moods.length === 0 && data.completions.length === 0) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Wind size={15} className="text-primary" /> İç Dünya İklimi
          </span>
        </CardTitle>
        <span className="text-xs text-muted">ruh hali + alışkanlık verisinden türetilir</span>
      </CardHeader>

      <div className="space-y-3 px-4 pb-4">
        {/* Current state */}
        <div className="flex items-center gap-3">
          <span className="text-3xl leading-none">{climate.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-fg">{climate.label}</p>
            <p className="text-xs leading-snug text-muted">{climate.description}</p>
          </div>
          <span className="shrink-0 font-display text-2xl font-bold tabular-nums text-fg">
            {climate.score}
          </span>
        </div>

        {/* Score bar */}
        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div
            className={cn('h-full rounded-full transition-all duration-700', BAR_COLOR[climate.type])}
            style={{ width: `${climate.score}%` }}
          />
        </div>

        {/* Tomorrow forecast */}
        <div className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2">
          <span className="text-lg leading-none">{climate.tomorrowEmoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-semibold text-fg">
              Yarın tahmin: {climate.tomorrowLabel}
            </p>
            <p className="text-[11px] leading-snug text-muted">{climate.tomorrowHint}</p>
          </div>
        </div>
      </div>
    </Card>
  )
}
