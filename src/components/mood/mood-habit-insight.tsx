'use client'
import { TrendingUp, TrendingDown, Sparkles } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { moodInsights } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { MOOD_META } from '@/lib/constants'
import { cn } from '@/lib/utils'

export function MoodHabitInsight() {
  const { data } = useStore()
  const { buckets, habits, hasEnoughData } = moodInsights(data)

  if (!hasEnoughData) {
    return (
      <Card>
        <CardHeader><CardTitle>Ruh hali analizi</CardTitle></CardHeader>
        <CardBody className="py-8 text-center">
          <Sparkles size={22} className="mx-auto text-muted-2" />
          <p className="mt-2 text-sm text-muted">
            Analiz için en az 5 gün ruh hali kaydı gerekiyor. Her gün işaretle, desenler ortaya çıksın.
          </p>
        </CardBody>
      </Card>
    )
  }

  const activeBuckets = buckets.filter(b => b.days > 0)
  const maxAvg = Math.max(...activeBuckets.map(b => b.avgMood), 5)

  return (
    <Card>
      <CardHeader><CardTitle>Ruh hali analizi</CardTitle></CardHeader>
      <CardBody className="space-y-6">
        {/* Mood by completion count */}
        <div>
          <p className="mb-3 text-xs font-medium text-muted font-display">Görev sayısına göre ortalama ruh hali</p>
          <div className="space-y-2">
            {activeBuckets.map(b => (
              <div key={b.label} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-muted">{b.label}</span>
                <div className="h-5 flex-1 overflow-hidden rounded-md bg-surface-2">
                  <div className="flex h-full items-center justify-end rounded-md px-2 transition-all"
                    style={{ width: `${Math.max(8, (b.avgMood / maxAvg) * 100)}%`, backgroundColor: moodColorFor(b.avgMood) }}>
                    <span className="text-[10px] font-semibold text-bg">{b.avgMood.toFixed(1)}</span>
                  </div>
                </div>
                <span className="w-10 shrink-0 text-right text-[10px] text-muted-2">{b.days}g</span>
              </div>
            ))}
          </div>
        </div>

        {/* Per-habit mood lift */}
        {habits.length > 0 && (
          <div>
            <p className="mb-1 text-xs font-medium text-muted font-display">Hangi alışkanlık modunu yükseltiyor?</p>
            <p className="mb-3 text-[11px] text-muted-2">Yaptığın günler ile yapmadığın günlerin ruh hali farkı.</p>
            <div className="space-y-2">
              {habits.slice(0, 6).map(h => {
                const habit = data.habits.find(x => x.id === h.habitId)
                if (!habit) return null
                const positive = h.lift >= 0.05
                const negative = h.lift <= -0.05
                return (
                  <div key={h.habitId} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
                    <span className="text-lg">{habit.emoji}</span>
                    <span className="min-w-0 flex-1 truncate text-sm text-fg">{habit.name}</span>
                    <span className={cn(
                      'flex shrink-0 items-center gap-1 text-xs font-semibold',
                      positive ? 'text-success' : negative ? 'text-danger' : 'text-muted',
                    )}>
                      {positive ? <TrendingUp size={13} /> : negative ? <TrendingDown size={13} /> : null}
                      {h.lift >= 0 ? '+' : ''}{h.lift.toFixed(1)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  )
}

// Map an average mood value (1-5) to the nearest mood color.
function moodColorFor(avg: number): string {
  const lvl = Math.min(5, Math.max(1, Math.round(avg))) as 1 | 2 | 3 | 4 | 5
  return MOOD_META[lvl].color
}
