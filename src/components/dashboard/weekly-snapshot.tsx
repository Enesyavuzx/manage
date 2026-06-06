'use client'
import { useMemo } from 'react'
import { TrendingUp, TrendingDown, Minus, Zap, Flame, CheckCircle2 } from 'lucide-react'
import { startOfWeek, subDays, eachDayOfInterval, addDays, format } from 'date-fns'
import { useStore, getStreak } from '@/hooks/useStore'
import { isHabitDueOnDate } from '@/lib/store'
import type { StoreData, Completion } from '@/lib/types'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

function rateForRange(
  data: StoreData,
  days: Date[],
): { done: number; due: number; rate: number } {
  const doneByDate = new Map<string, Set<string>>()
  for (const c of data.completions) {
    if (!doneByDate.has(c.date)) doneByDate.set(c.date, new Set())
    doneByDate.get(c.date)!.add(c.habitId)
  }
  let due = 0
  let done = 0
  for (const d of days) {
    const key = format(d, 'yyyy-MM-dd')
    const dueHabits = data.habits.filter(
      h => !h.archived && h.createdAt.slice(0, 10) <= key && isHabitDueOnDate(h, d)
    )
    due += dueHabits.length
    const doneSet = doneByDate.get(key)
    if (doneSet) done += dueHabits.filter(h => doneSet.has(h.id)).length
  }
  return { done, due, rate: due > 0 ? done / due : 0 }
}

function xpForRange(
  completions: Completion[],
  days: Date[],
): number {
  const keys = new Set(days.map(d => format(d, 'yyyy-MM-dd')))
  return completions
    .filter(c => keys.has(c.date))
    .reduce((s, c) => s + (c.xpAwarded ?? 0), 0)
}

function perfectDaysInRange(
  data: StoreData,
  days: Date[],
): number {
  const doneByDate = new Map<string, Set<string>>()
  for (const c of data.completions) {
    if (!doneByDate.has(c.date)) doneByDate.set(c.date, new Set())
    doneByDate.get(c.date)!.add(c.habitId)
  }
  let count = 0
  for (const d of days) {
    const key = format(d, 'yyyy-MM-dd')
    const due = data.habits.filter(h => !h.archived && h.createdAt.slice(0, 10) <= key && isHabitDueOnDate(h, d))
    if (due.length === 0) continue
    const doneSet = doneByDate.get(key) ?? new Set()
    if (due.every(h => doneSet.has(h.id))) count++
  }
  return count
}

function Delta({ curr, prev, unit = '' }: { curr: number; prev: number; unit?: string }) {
  const diff = curr - prev
  if (diff === 0) return <span className="flex items-center gap-0.5 text-[10px] text-muted"><Minus size={9} /> aynı</span>
  const up = diff > 0
  return (
    <span className={cn('flex items-center gap-0.5 text-[10px]', up ? 'text-success' : 'text-danger')}>
      {up ? <TrendingUp size={9} /> : <TrendingDown size={9} />}
      {up ? '+' : ''}{Math.round(diff)}{unit}
    </span>
  )
}

export function WeeklySnapshot() {
  const { data } = useStore()

  const { thisWeek, lastWeek, topStreak, thisWeekXP, lastWeekXP, thisWeekPerfect, lastWeekPerfect } = useMemo(() => {
    const now = new Date()
    const weekStart = startOfWeek(now, { weekStartsOn: 1 })
    const lastWeekStart = subDays(weekStart, 7)

    const thisWeekDays = eachDayOfInterval({ start: weekStart, end: now })
    const lastWeekDays = eachDayOfInterval({ start: lastWeekStart, end: addDays(lastWeekStart, 6) })

    const thisWeek = rateForRange(data, thisWeekDays)
    const lastWeek = rateForRange(data, lastWeekDays)

    const thisWeekXP = xpForRange(data.completions, thisWeekDays)
    const lastWeekXP = xpForRange(data.completions, lastWeekDays)

    const thisWeekPerfect = perfectDaysInRange(data, thisWeekDays)
    const lastWeekPerfect = perfectDaysInRange(data, lastWeekDays)

    const topStreak = data.habits
      .filter(h => !h.archived)
      .map(h => ({ habit: h, streak: getStreak(data.completions, h.id, data.frozenDates) }))
      .sort((a, b) => b.streak - a.streak)[0] ?? null

    return { thisWeek, lastWeek, topStreak, thisWeekXP, lastWeekXP, thisWeekPerfect, lastWeekPerfect }
  }, [data])

  if (thisWeek.due === 0 && lastWeek.due === 0) return null

  const thisRate = Math.round(thisWeek.rate * 100)
  const lastRate = Math.round(lastWeek.rate * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <span className="inline-flex items-center gap-2">
            <TrendingUp size={15} className="text-primary" /> Bu Hafta
          </span>
        </CardTitle>
        <span className="text-xs text-muted">geçen haftayla kıyasla</span>
      </CardHeader>

      <div className="grid grid-cols-3 divide-x divide-border border-t border-border">
        {/* Tamamlama oranı */}
        <div className="flex flex-col items-center gap-1 p-4">
          <CheckCircle2 size={15} className="text-success mb-0.5" />
          <span className="text-2xl font-bold text-fg font-display">{thisRate}%</span>
          <span className="text-[10px] text-muted-2">tamamlama</span>
          <Delta curr={thisRate} prev={lastRate} unit="%" />
        </div>

        {/* XP */}
        <div className="flex flex-col items-center gap-1 p-4">
          <Zap size={15} className="text-xp mb-0.5" fill="currentColor" />
          <span className="text-2xl font-bold text-fg font-display">{thisWeekXP}</span>
          <span className="text-[10px] text-muted-2">XP kazandı</span>
          <Delta curr={thisWeekXP} prev={lastWeekXP} />
        </div>

        {/* Mükemmel günler */}
        <div className="flex flex-col items-center gap-1 p-4">
          <span className="text-sm mb-0.5">🏆</span>
          <span className="text-2xl font-bold text-fg font-display">{thisWeekPerfect}</span>
          <span className="text-[10px] text-muted-2">kusursuz gün</span>
          <Delta curr={thisWeekPerfect} prev={lastWeekPerfect} />
        </div>
      </div>

      {/* En yüksek streak */}
      {topStreak && topStreak.streak >= 3 && (
        <div className="flex items-center gap-2.5 border-t border-border px-4 py-2.5">
          <Flame size={13} className="shrink-0 text-orange-400" fill="currentColor" />
          <span className="min-w-0 flex-1 truncate text-xs text-muted">
            En uzun seri: <span className="font-semibold text-fg">{topStreak.habit.emoji} {topStreak.habit.name}</span>
          </span>
          <span className="shrink-0 text-sm font-bold text-orange-400">{topStreak.streak} 🔥</span>
        </div>
      )}
    </Card>
  )
}
