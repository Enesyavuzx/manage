'use client'
import { useMemo } from 'react'
import { format, subDays } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Flame } from 'lucide-react'
import { useStore, getStreak } from '@/hooks/useStore'
import { isHabitDueOnDate } from '@/lib/store'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const DAYS = 21

export function ChainBoard() {
  const { data } = useStore()

  const today = useMemo(() => new Date(), [])
  const todayStr = format(today, 'yyyy-MM-dd')

  // Son DAYS günlük tarih sütunları
  const cols = useMemo(() => {
    return Array.from({ length: DAYS }, (_, i) => {
      const d = subDays(today, DAYS - 1 - i)
      return {
        date: format(d, 'yyyy-MM-dd'),
        dayLabel: format(d, 'EE', { locale: tr }).slice(0, 2),
        isToday: format(d, 'yyyy-MM-dd') === todayStr,
      }
    })
  }, [today, todayStr])

  const colDates = cols.map(c => c.date)

  // Aktif alışkanlıkları streak uzunluğuna göre sırala
  const habits = useMemo(() => {
    return data.habits
      .filter(h => !h.archived)
      .map(h => {
        const streak = getStreak(data.completions, h.id, data.frozenDates)
        const doneSet = new Set(data.completions.filter(c => c.habitId === h.id).map(c => c.date))
        const cells = colDates.map(date => {
          const due = isHabitDueOnDate(h, new Date(date + 'T12:00:00'))
          const done = doneSet.has(date)
          const frozen = data.frozenDates.includes(date)
          return { date, due, done, frozen }
        })
        return { habit: h, streak, cells }
      })
      .sort((a, b) => b.streak - a.streak)
  }, [data, colDates])

  if (habits.length === 0) {
    return (
      <Card className="py-12 text-center">
        <p className="text-sm text-muted">Henüz alışkanlık yok. Ekle, zincirini kur!</p>
      </Card>
    )
  }

  return (
    <Card className="overflow-x-auto">
      <div className="min-w-[540px] p-4">
        {/* Sütun başlıkları */}
        <div className="mb-2 flex items-center">
          <div className="w-40 shrink-0" />
          <div className="flex flex-1 gap-0.5">
            {cols.map(c => (
              <div key={c.date}
                className={cn('flex-1 text-center text-[9px] font-medium',
                  c.isToday ? 'text-primary' : 'text-muted-2')}>
                {c.isToday ? 'B' : c.dayLabel}
              </div>
            ))}
          </div>
          <div className="w-10 shrink-0" />
        </div>

        {/* Alışkanlık satırları */}
        <div className="space-y-1">
          {habits.map(({ habit, streak, cells }) => (
            <div key={habit.id} className="flex items-center gap-0">
              {/* İsim */}
              <div className="flex w-40 shrink-0 items-center gap-1.5 pr-2">
                <span className="text-base">{habit.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-fg">{habit.name}</span>
              </div>

              {/* Günler */}
              <div className="flex flex-1 gap-0.5">
                {cells.map(({ date, due, done, frozen }) => (
                  <div key={date}
                    title={`${date}${done ? ' ✓' : due ? '' : ' ·'}`}
                    className={cn(
                      'flex-1 rounded-sm transition-all',
                      'aspect-square',
                      done
                        ? 'opacity-100'
                        : frozen
                          ? 'bg-primary/20 opacity-80'
                          : due
                            ? 'bg-surface-2 opacity-70'
                            : 'opacity-0',
                    )}
                    style={done ? { backgroundColor: habit.color } : undefined}
                  />
                ))}
              </div>

              {/* Streak sayısı */}
              <div className="flex w-10 shrink-0 items-center justify-end gap-0.5">
                {streak > 0 ? (
                  <>
                    <Flame size={11} className="text-orange-400" fill="currentColor" />
                    <span className="text-xs font-bold text-orange-400">{streak}</span>
                  </>
                ) : (
                  <span className="text-[10px] text-muted-2">—</span>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Alt açıklama */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-2">
          <span>Son {DAYS} gün</span>
          <span className="flex items-center gap-2">
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-surface-2" /> Planlanmış
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm bg-primary/20" /> Dondurulmuş
            </span>
            <span className="flex items-center gap-1">
              <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: '#22c55e' }} /> Tamamlandı
            </span>
          </span>
        </div>
      </div>
    </Card>
  )
}
