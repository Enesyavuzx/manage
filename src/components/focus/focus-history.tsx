'use client'
import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Target, Flame } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DAYS_SHOWN = 7

// Hedef dakika/gün — basit sabit (ileride ayarlanabilir)
const DAILY_GOAL_MIN = 60

export function FocusHistory() {
  const { data } = useStore()

  const { days, focusStreak } = useMemo(() => {
    const today = new Date()

    const days = Array.from({ length: DAYS_SHOWN }, (_, i) => {
      const d = subDays(today, DAYS_SHOWN - 1 - i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const sessions = data.focusSessions.filter(s => s.completedAt.slice(0, 10) === dateStr)
      const minutes = sessions.reduce((s, f) => s + f.minutes, 0)
      const isToday = i === DAYS_SHOWN - 1
      return {
        dateStr,
        label: isToday ? 'Bugün' : format(d, 'EE d', { locale: tr }),
        minutes,
        sessions: sessions.length,
        goalMet: minutes >= DAILY_GOAL_MIN,
        isToday,
      }
    })

    // Focus streak: today backwards, consecutive days with any session
    let streak = 0
    for (let i = DAYS_SHOWN - 1; i >= 0; i--) {
      if (days[i].minutes > 0) streak++
      else break
    }

    return { days, focusStreak: streak }
  }, [data])

  const recentSessions = useMemo(() => {
    return [...data.focusSessions]
      .sort((a, b) => b.completedAt.localeCompare(a.completedAt))
      .slice(0, 10)
  }, [data.focusSessions])

  const maxMin = Math.max(DAILY_GOAL_MIN, ...days.map(d => d.minutes))

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <Target size={15} className="text-primary" /> Odak Geçmişi
          </span>
        </CardTitle>
        {focusStreak > 0 && (
          <span className="flex items-center gap-1 text-xs font-medium text-orange-400">
            <Flame size={12} fill="currentColor" /> {focusStreak} gün seri
          </span>
        )}
      </CardHeader>

      <div className="p-4 space-y-4">
        {/* Bar chart - son 7 gün */}
        <div>
          <p className="mb-3 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Son 7 gün</p>
          <div className="flex items-end gap-1.5 h-20">
            {days.map(d => {
              const pct = maxMin > 0 ? (d.minutes / maxMin) * 100 : 0
              const goalPct = (DAILY_GOAL_MIN / maxMin) * 100
              return (
                <div key={d.dateStr} className="flex flex-1 flex-col items-center gap-1">
                  <div className="relative flex w-full flex-1 items-end">
                    {/* Hedef çizgisi */}
                    <div
                      className="absolute left-0 right-0 border-t border-dashed border-muted-2/40"
                      style={{ bottom: `${goalPct}%` }}
                    />
                    {/* Bar */}
                    <div
                      className={cn(
                        'w-full rounded-t transition-all duration-500',
                        d.goalMet ? 'bg-primary' : d.minutes > 0 ? 'bg-primary/40' : 'bg-surface-2',
                        d.isToday && 'ring-1 ring-primary ring-offset-1 ring-offset-surface',
                      )}
                      style={{ height: `${Math.max(pct, d.minutes > 0 ? 8 : 4)}%` }}
                    />
                  </div>
                  <span className={cn('text-[9px] text-muted-2 text-center leading-tight', d.isToday && 'text-primary font-semibold')}>
                    {d.label}
                  </span>
                  {d.minutes > 0 && (
                    <span className="text-[9px] text-muted tabular-nums">{d.minutes}dk</span>
                  )}
                </div>
              )
            })}
          </div>
          <p className="mt-2 text-[10px] text-muted-2 text-right">Hedef: {DAILY_GOAL_MIN} dk/gün</p>
        </div>

        {/* Son seanslar listesi */}
        {recentSessions.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Son seanslar</p>
            <div className="space-y-1.5">
              {recentSessions.map(s => {
                const dateStr = s.completedAt.slice(0, 10)
                const today = format(new Date(), 'yyyy-MM-dd')
                const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
                const label = dateStr === today
                  ? 'Bugün'
                  : dateStr === yesterday
                    ? 'Dün'
                    : format(new Date(dateStr + 'T12:00:00'), 'd MMM', { locale: tr })
                const timeStr = format(new Date(s.completedAt), 'HH:mm')
                return (
                  <div key={s.id} className="flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Target size={13} />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium text-fg">{s.minutes} dakika odak</p>
                      <p className="text-[10px] text-muted-2">{label} · {timeStr}</p>
                    </div>
                    <span className="text-xs font-semibold text-xp">+{s.xpAwarded} XP</span>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {recentSessions.length === 0 && (
          <p className="py-4 text-center text-sm text-muted">Henüz odak seansı yok. İlkini başlat!</p>
        )}
      </div>
    </Card>
  )
}
