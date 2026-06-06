'use client'
import { useMemo, useState, useEffect } from 'react'
import { Clock, Check } from 'lucide-react'
import type { Habit } from '@/lib/types'
import { useStore } from '@/hooks/useStore'
import { todayKey, isHabitDueToday } from '@/lib/store'
import { fireConfetti, haptic } from '@/lib/confetti'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SlotHabit {
  habit: Habit
  minutes: number | null  // dakika cinsinden gün içi zaman; null = zamansız
  done: boolean
}

function timeToMinutes(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + (m || 0)
}

// Saat çizelgesi: zamanı olan alışkanlıkları sırala, zamansızları sona koy.
export function DayTimeline() {
  const { data, toggleHabit } = useStore()
  const [nowMin, setNowMin] = useState(() => {
    const n = new Date()
    return n.getHours() * 60 + n.getMinutes()
  })

  // Her dakika "şimdi" çizgisini güncelle
  useEffect(() => {
    const t = setInterval(() => {
      const n = new Date()
      setNowMin(n.getHours() * 60 + n.getMinutes())
    }, 60000)
    return () => clearInterval(t)
  }, [])

  const { timed, untimed } = useMemo(() => {
    const today = todayKey()
    const doneSet = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
    const due = data.habits.filter(h => !h.archived && isHabitDueToday(h))

    const slots: SlotHabit[] = due.map(h => ({
      habit: h,
      minutes: h.reminderTime ? timeToMinutes(h.reminderTime) : null,
      done: doneSet.has(h.id),
    }))

    const timed = slots
      .filter(s => s.minutes !== null)
      .sort((a, b) => (a.minutes! - b.minutes!))
    const untimed = slots.filter(s => s.minutes === null)

    return { timed, untimed }
  }, [data])

  // En az 2 zamanlı alışkanlık yoksa çizelge anlamsız
  if (timed.length < 2) return null

  function handleToggle(e: React.MouseEvent, id: string, done: boolean) {
    if (!done) {
      fireConfetti({ count: 40, origin: { x: e.clientX, y: e.clientY }, power: 0.8 })
      haptic([15, 30, 15])
    }
    toggleHabit(id)
  }

  function fmtTime(min: number): string {
    const h = Math.floor(min / 60)
    const m = min % 60
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
  }

  // "Şimdi" çizgisinin nereye gireceğini bul: ilk gelecek zamanlı slottan önce
  const nextIdx = timed.findIndex(s => s.minutes! > nowMin)

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Clock size={15} className="text-primary" />
        <span className="text-sm font-bold text-fg font-display">Günün akışı</span>
        <span className="text-xs text-muted">{fmtTime(nowMin)}</span>
      </div>

      <div className="p-4">
        <div className="relative">
          {/* Dikey çizgi */}
          <div className="absolute left-[39px] top-2 bottom-2 w-px bg-border" />

          <div className="space-y-1">
            {timed.map((s, i) => {
              const isPast = s.minutes! <= nowMin
              const showNow = i === nextIdx
              return (
                <div key={s.habit.id}>
                  {/* Şimdi göstergesi */}
                  {showNow && (
                    <div className="flex items-center gap-2 py-1.5">
                      <span className="w-[34px] shrink-0 text-right text-[10px] font-bold text-danger tabular-nums">{fmtTime(nowMin)}</span>
                      <span className="relative flex h-2.5 w-2.5 shrink-0 items-center justify-center">
                        <span className="absolute h-2.5 w-2.5 rounded-full bg-danger/30 animate-ping" />
                        <span className="h-1.5 w-1.5 rounded-full bg-danger" />
                      </span>
                      <span className="h-px flex-1 bg-danger/30" />
                      <span className="text-[10px] font-medium text-danger">şimdi</span>
                    </div>
                  )}

                  <button
                    onClick={e => handleToggle(e, s.habit.id, s.done)}
                    className={cn(
                      'group flex w-full items-center gap-2 rounded-lg py-1.5 pr-2 text-left transition-colors hover:bg-surface-2',
                      isPast && !s.done && 'opacity-60',
                    )}>
                    {/* Saat */}
                    <span className={cn(
                      'w-[34px] shrink-0 text-right text-[11px] font-medium tabular-nums',
                      s.done ? 'text-muted-2' : isPast ? 'text-danger/70' : 'text-muted',
                    )}>
                      {fmtTime(s.minutes!)}
                    </span>

                    {/* Nokta */}
                    <span className={cn(
                      'relative z-10 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 transition-all',
                      s.done
                        ? 'border-success bg-success/20 text-success'
                        : 'border-border-hover bg-surface group-hover:border-primary',
                    )}>
                      {s.done && (
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                          <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      )}
                    </span>

                    {/* İçerik */}
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-base" style={{ backgroundColor: s.habit.color + '22' }}>
                      {s.habit.emoji}
                    </span>
                    <span className={cn('min-w-0 flex-1 truncate text-sm', s.done ? 'text-muted line-through' : 'text-fg font-medium')}>
                      {s.habit.name}
                    </span>
                  </button>
                </div>
              )
            })}

            {/* Tüm zamanlı işler geçmişteyse şimdi çizgisini sona ekle */}
            {nextIdx === -1 && (
              <div className="flex items-center gap-2 py-1.5">
                <span className="w-[34px] shrink-0 text-right text-[10px] font-bold text-danger tabular-nums">{fmtTime(nowMin)}</span>
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-danger ml-[5px]" />
                <span className="h-px flex-1 bg-danger/30" />
                <span className="text-[10px] font-medium text-danger">şimdi</span>
              </div>
            )}
          </div>
        </div>

        {/* Zamansız alışkanlıklar */}
        {untimed.length > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-2">Zamansız</p>
            <div className="flex flex-wrap gap-1.5">
              {untimed.map(s => (
                <button
                  key={s.habit.id}
                  onClick={e => handleToggle(e, s.habit.id, s.done)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs transition-colors',
                    s.done
                      ? 'border-success/30 bg-success/5 text-muted line-through'
                      : 'border-border bg-surface-2 text-fg hover:border-primary',
                  )}>
                  <span>{s.habit.emoji}</span>
                  <span className="max-w-[120px] truncate font-medium">{s.habit.name}</span>
                  {s.done && <Check size={11} className="text-success" />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}
