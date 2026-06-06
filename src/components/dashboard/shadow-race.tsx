'use client'
import { useMemo } from 'react'
import { useStore } from '@/hooks/useStore'
import { getShadow } from '@/lib/shadow'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function ShadowRace() {
  const { data } = useStore()
  const shadow = useMemo(() => getShadow(data), [data])

  // Don't show until user has habits
  if (shadow.playerTotal === 0) return null

  const playerPct = shadow.playerTotal > 0 ? Math.round(shadow.playerRate * 100) : 0
  const ghostPct  = shadow.ghostTotal  > 0 ? Math.round(shadow.ghostRate  * 100) : 0

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <span className="text-base">👻</span> Gölge Yarışı
          </span>
        </CardTitle>
        <span className="text-xs text-muted">gölge benliğinle deterministik rekabet</span>
      </CardHeader>

      <div className="space-y-3 px-4 pb-4">
        {/* Player bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fg">Sen</span>
            <span className="tabular-nums text-xs font-bold text-primary">
              {shadow.playerScore}/{shadow.playerTotal}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className="h-full rounded-full bg-primary transition-all duration-700"
              style={{ width: `${playerPct}%` }}
            />
          </div>
        </div>

        {/* Ghost bar */}
        <div className="space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted">Gölge</span>
            <span className="tabular-nums text-xs text-muted">
              {shadow.ghostScore}/{shadow.ghostTotal}
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-surface-2">
            <div
              className={cn(
                'h-full rounded-full transition-all duration-700',
                shadow.leading === 'ghost' ? 'bg-danger' : 'bg-muted-2',
              )}
              style={{ width: `${ghostPct}%` }}
            />
          </div>
        </div>

        {/* Status message */}
        <p className={cn(
          'rounded-lg px-3 py-1.5 text-center text-xs font-medium',
          shadow.leading === 'player' ? 'bg-success/10 text-success' :
          shadow.leading === 'ghost'  ? 'bg-danger/10 text-danger'   :
          'bg-surface-2 text-muted',
        )}>
          {shadow.message}
        </p>

        {shadow.winStreakDays >= 2 && (
          <p className="text-center text-xs text-muted">
            🔥 {shadow.winStreakDays} gündür gölgeni geçiyorsun!
          </p>
        )}
      </div>
    </Card>
  )
}
