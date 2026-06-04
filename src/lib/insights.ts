// Aksiyon alınabilir analitik hesaplamaları. Stats sayfası ham sayımları
// gösterir; burada "tamamlama oranı", "tutarlılık", "momentum" ve "en verimli
// zaman" gibi yorumlanmış metrikler üretilir.
import type { StoreData, Habit } from '@/lib/types'
import { isHabitDueOnDate } from '@/lib/store'
import { format, subDays, startOfWeek, addDays, eachDayOfInterval } from 'date-fns'

const DAY_KEY = 'yyyy-MM-dd'

function createdKey(habit: Habit): string {
  return habit.createdAt ? habit.createdAt.slice(0, 10) : '0000-00-00'
}

// Belirli bir günde "sayılan" aktif alışkanlıklar: arşivli değil, o günde
// planlı ve o günden önce/o gün oluşturulmuş.
function dueHabitsOnDate(data: StoreData, date: Date): Habit[] {
  const key = format(date, DAY_KEY)
  return data.habits.filter(
    h => !h.archived && createdKey(h) <= key && isHabitDueOnDate(h, date),
  )
}

export interface RateResult {
  due: number
  done: number
  rate: number // 0..1
}

function rateForDays(data: StoreData, days: Date[]): RateResult {
  const doneByDate = new Map<string, Set<string>>()
  for (const c of data.completions) {
    if (!doneByDate.has(c.date)) doneByDate.set(c.date, new Set())
    doneByDate.get(c.date)!.add(c.habitId)
  }
  let due = 0
  let done = 0
  for (const d of days) {
    const key = format(d, DAY_KEY)
    const dueHabits = dueHabitsOnDate(data, d)
    due += dueHabits.length
    const doneSet = doneByDate.get(key)
    if (doneSet) done += dueHabits.filter(h => doneSet.has(h.id)).length
  }
  return { due, done, rate: due > 0 ? done / due : 0 }
}

export function recentRate(data: StoreData, days: number): RateResult {
  const today = new Date()
  const range = eachDayOfInterval({ start: subDays(today, days - 1), end: today })
  return rateForDays(data, range)
}

export interface WeeklyRate {
  label: string
  rate: number
  done: number
  due: number
}

export function weeklyRates(data: StoreData, weeks: number): WeeklyRate[] {
  const out: WeeklyRate[] = []
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  for (let i = weeks - 1; i >= 0; i--) {
    const start = subDays(thisWeekStart, i * 7)
    const days = eachDayOfInterval({ start, end: addDays(start, 6) })
      .filter(d => d <= new Date())
    const r = rateForDays(data, days)
    out.push({ label: format(start, 'd/M'), rate: r.rate, done: r.done, due: r.due })
  }
  return out
}

export interface HabitReliability {
  habit: Habit
  due: number
  done: number
  rate: number
}

export function habitReliability(data: StoreData, days: number): HabitReliability[] {
  const today = new Date()
  const range = eachDayOfInterval({ start: subDays(today, days - 1), end: today })
  const doneByDate = new Map<string, Set<string>>()
  for (const c of data.completions) {
    if (!doneByDate.has(c.date)) doneByDate.set(c.date, new Set())
    doneByDate.get(c.date)!.add(c.habitId)
  }
  const out: HabitReliability[] = []
  for (const h of data.habits.filter(x => !x.archived)) {
    let due = 0
    let done = 0
    for (const d of range) {
      const key = format(d, DAY_KEY)
      if (createdKey(h) > key) continue
      if (!isHabitDueOnDate(h, d)) continue
      due++
      if (doneByDate.get(key)?.has(h.id)) done++
    }
    if (due === 0) continue
    out.push({ habit: h, due, done, rate: done / due })
  }
  return out.sort((a, b) => b.rate - a.rate)
}

const WEEKDAYS = ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']

export interface BestWeekday {
  index: number
  label: string
  count: number
}

export function bestWeekday(data: StoreData): BestWeekday | null {
  if (data.completions.length === 0) return null
  const counts = [0, 0, 0, 0, 0, 0, 0]
  for (const c of data.completions) {
    counts[new Date(c.date + 'T12:00:00').getDay()]++
  }
  let best = 0
  for (let i = 1; i < 7; i++) if (counts[i] > counts[best]) best = i
  if (counts[best] === 0) return null
  return { index: best, label: WEEKDAYS[best], count: counts[best] }
}

export interface BestHour {
  hour: number
  count: number
}

export function bestHour(data: StoreData): BestHour | null {
  if (data.completions.length === 0) return null
  const counts = Array(24).fill(0)
  for (const c of data.completions) counts[new Date(c.completedAt).getHours()]++
  let best = 0
  for (let i = 1; i < 24; i++) if (counts[i] > counts[best]) best = i
  if (counts[best] === 0) return null
  return { hour: best, count: counts[best] }
}

export interface Momentum {
  thisRate: number
  lastRate: number
  delta: number
}

export function momentum(data: StoreData): Momentum {
  const thisWeekStart = startOfWeek(new Date(), { weekStartsOn: 1 })
  const lastWeekStart = subDays(thisWeekStart, 7)
  const thisDays = eachDayOfInterval({ start: thisWeekStart, end: addDays(thisWeekStart, 6) })
    .filter(d => d <= new Date())
  const lastDays = eachDayOfInterval({ start: lastWeekStart, end: addDays(lastWeekStart, 6) })
  const thisRate = rateForDays(data, thisDays).rate
  const lastRate = rateForDays(data, lastDays).rate
  return { thisRate, lastRate, delta: thisRate - lastRate }
}

export function avgEnergyRecent(data: StoreData, days: number): number | null {
  const cutoff = format(subDays(new Date(), days - 1), DAY_KEY)
  const recent = data.energyLogs.filter(e => e.date >= cutoff)
  if (recent.length === 0) return null
  return recent.reduce((s, e) => s + e.level, 0) / recent.length
}

export interface EnergyCorrelation {
  highEnergyRate: number
  lowEnergyRate: number
  highDays: number
  lowDays: number
}

export function energyCompletionCorrelation(data: StoreData): EnergyCorrelation | null {
  if (data.energyLogs.length < 5) return null

  const energyByDate = new Map<string, number>()
  for (const e of data.energyLogs) energyByDate.set(e.date, e.level)

  const doneByDate = new Map<string, Set<string>>()
  for (const c of data.completions) {
    if (!doneByDate.has(c.date)) doneByDate.set(c.date, new Set())
    doneByDate.get(c.date)!.add(c.habitId)
  }

  let highDue = 0, highDone = 0, highDays = 0
  let lowDue = 0, lowDone = 0, lowDays = 0

  for (const [date, level] of energyByDate) {
    const d = new Date(date + 'T12:00:00')
    const due = dueHabitsOnDate(data, d)
    if (due.length === 0) continue
    const doneSet = doneByDate.get(date)
    const done = doneSet ? due.filter(h => doneSet.has(h.id)).length : 0
    if (level >= 4) {
      highDue += due.length; highDone += done; highDays++
    } else if (level <= 2) {
      lowDue += due.length; lowDone += done; lowDays++
    }
  }

  if (highDays === 0 && lowDays === 0) return null
  return {
    highEnergyRate: highDue > 0 ? highDone / highDue : 0,
    lowEnergyRate: lowDue > 0 ? lowDone / lowDue : 0,
    highDays,
    lowDays,
  }
}
