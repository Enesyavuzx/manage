'use client'
import { useMemo } from 'react'
import { Flame, Trophy, CheckCircle2, Target, Link2 } from 'lucide-react'
import { format, subDays, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Habit } from '@/lib/types'
import { useStore } from '@/hooks/useStore'
import { getStreak, getLongestStreak, isHabitDueOnDate, todayKey } from '@/lib/store'
import { haptic } from '@/lib/confetti'
import { CATEGORY_META } from '@/lib/constants'
import { DIFFICULTY_META, xpForDifficulty } from '@/lib/gamification'
import { cn } from '@/lib/utils'

interface Props {
  habit: Habit
}

export function HabitDetail({ habit }: Props) {
  const { data, toggleHabitOnDate } = useStore()

  const completions = data.completions.filter(c => c.habitId === habit.id)
  const completedDates = useMemo(() => new Set(completions.map(c => c.date)), [completions])
  const createdDay = habit.createdAt.slice(0, 10)
  const tkey = todayKey()

  // Bir günün geriye dönük işaretlenebilir olup olmadığı: gelecekte değil,
  // oluşturulmadan önce değil ve o gün planlı.
  function canToggle(dateStr: string): boolean {
    if (dateStr > tkey) return false
    if (dateStr < createdDay) return false
    return isHabitDueOnDate(habit, new Date(dateStr + 'T12:00:00'))
  }

  function handleDayTap(dateStr: string) {
    if (!canToggle(dateStr)) return
    haptic(15)
    toggleHabitOnDate(habit.id, dateStr)
  }
  const total = completions.length
  const streak = getStreak(data.completions, habit.id, data.frozenDates)
  const best = getLongestStreak(data.completions, habit.id)
  const totalXP = completions.reduce((s, c) => s + (c.xpAwarded ?? xpForDifficulty(habit.difficulty)), 0)

  const cat = CATEGORY_META[habit.category]
  const diff = DIFFICULTY_META[habit.difficulty]

  // Build last 35 days grid (5 weeks), starting from Monday of the week 5 weeks ago
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')
  const days = useMemo(() => {
    const result: { date: string; label: string; done: boolean; isToday: boolean; isFuture: boolean }[] = []
    for (let i = 34; i >= 0; i--) {
      const d = subDays(today, i)
      const dateStr = format(d, 'yyyy-MM-dd')
      result.push({
        date: dateStr,
        label: format(d, 'd MMM', { locale: tr }),
        done: completedDates.has(dateStr),
        isToday: dateStr === todayStr,
        isFuture: false,
      })
    }
    return result
  }, [completedDates, todayStr])

  const weekLabels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

  const stats = [
    { icon: CheckCircle2, label: 'Toplam', value: total, color: 'text-success' },
    { icon: Flame, label: 'Streak', value: streak, color: 'text-orange-400' },
    { icon: Trophy, label: 'En iyi', value: best, color: 'text-xp' },
    { icon: Target, label: 'XP', value: totalXP.toLocaleString('tr-TR'), color: 'text-primary' },
  ]

  return (
    <div className="space-y-5">
      {/* Habit header */}
      <div className="flex items-center gap-3">
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-3xl"
          style={{ backgroundColor: habit.color + '22' }}>
          {habit.emoji}
        </div>
        <div>
          <h2 className="text-base font-bold text-fg">{habit.name}</h2>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted">
            <span>{cat.emoji} {cat.label}</span>
            <span>·</span>
            <span style={{ color: diff.color }}>{diff.emoji} {diff.label}</span>
            <span>·</span>
            <span>{habit.frequency === 'daily' ? 'Her gün' : `${(habit.frequency as number[]).length} gün/hafta`}</span>
          </div>
          {habit.description && (
            <p className="mt-1 text-xs text-muted-2 leading-snug">{habit.description}</p>
          )}
          {habit.cue && (
            <p className="mt-1 flex items-center gap-1 text-xs text-primary2">
              <Link2 size={11} className="shrink-0" /> {habit.cue}
            </p>
          )}
        </div>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-4 gap-2">
        {stats.map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex flex-col items-center gap-1 rounded-lg border border-border bg-surface-2 py-3">
            <Icon size={15} className={color} />
            <span className="text-sm font-bold text-fg">{value}</span>
            <span className="text-[10px] text-muted">{label}</span>
          </div>
        ))}
      </div>

      {/* Calendar heatmap - last 35 days (tap to backfill) */}
      <div>
        <p className="mb-2 text-xs font-medium text-muted font-display">Son 35 gün · dokunarak işaretle</p>
        <div className="grid grid-cols-7 gap-1">
          {weekLabels.map(w => (
            <div key={w} className="text-center text-[9px] text-muted-2">{w}</div>
          ))}
          {/* pad to align with Monday */}
          {(() => {
            const firstDay = new Date(days[0].date + 'T12:00:00')
            const dow = (firstDay.getDay() + 6) % 7  // Mon=0
            return Array.from({ length: dow }).map((_, i) => <div key={`pad-${i}`} />)
          })()}
          {days.map(({ date, label, done, isToday }) => {
            const editable = canToggle(date)
            return (
              <button key={date} type="button"
                onClick={() => handleDayTap(date)}
                disabled={!editable}
                title={`${label}${done ? ' ✓' : ''}${editable ? '' : ' · işaretlenemez'}`}
                className={cn(
                  'aspect-square w-full rounded transition-all',
                  isToday ? 'ring-1 ring-primary ring-offset-1 ring-offset-surface' : '',
                  done ? 'opacity-100' : 'bg-surface-2',
                  editable
                    ? 'cursor-pointer hover:opacity-80 hover:ring-1 hover:ring-border-hover'
                    : 'cursor-default opacity-30',
                  !done && editable && 'opacity-60',
                )}
                style={done ? { backgroundColor: habit.color } : undefined}
              />
            )
          })}
        </div>
        <div className="mt-1.5 flex items-center justify-between text-[10px] text-muted">
          <span className="text-muted-2">Unuttuğun bir günü sonradan işaretleyebilirsin</span>
          <span className="flex items-center gap-1.5">
            <div className="h-2.5 w-2.5 rounded-sm bg-surface-2" /> Boş
            <div className="h-2.5 w-2.5 rounded-sm" style={{ backgroundColor: habit.color }} /> Tamam
          </span>
        </div>
      </div>

      {/* Streak info message */}
      {streak === 0 && total > 0 && (
        <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-xs text-muted">
          Dün veya bugün tamamlanmadığı için streak sıfırlandı. Bugün tamamla!
        </div>
      )}
      {streak > 0 && (
        <div className="rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 text-xs text-success">
          🔥 {streak} günlük seri devam ediyor! Bugün de tamamlamayı unutma.
        </div>
      )}
    </div>
  )
}
