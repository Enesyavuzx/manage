import type { StoreData } from './types'
import { isHabitDueOnDate } from './store'
import { format, subDays } from 'date-fns'

export type ClimateType = 'sunny' | 'clear' | 'cloudy' | 'rainy' | 'stormy'

export interface ClimateState {
  type: ClimateType
  emoji: string
  label: string
  description: string
  score: number        // 0-100
  completionRate: number  // 0-1 today
  avgMood: number         // 1-5 avg last 3 days, 0 if no data
  tomorrowType: ClimateType
  tomorrowEmoji: string
  tomorrowLabel: string
  tomorrowHint: string
  habitsRemaining: number
}

function completionRateForDay(data: StoreData, dateKey: string): number {
  const date = new Date(dateKey + 'T12:00:00')
  const due = data.habits.filter(
    h => !h.archived && h.createdAt.slice(0, 10) <= dateKey && isHabitDueOnDate(h, date)
  )
  if (due.length === 0) return -1
  const doneSet = new Set(
    data.completions.filter(c => c.date === dateKey).map(c => c.habitId)
  )
  return due.filter(h => doneSet.has(h.id)).length / due.length
}

function avgMoodForDays(data: StoreData, days: number, endDate: string): number {
  const logs = data.moods
    .filter(m => m.date <= endDate)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, days)
  if (logs.length === 0) return 0
  return logs.reduce((s, m) => s + m.level, 0) / logs.length
}

function climateTypeFromScore(score: number): ClimateType {
  if (score >= 80) return 'sunny'
  if (score >= 60) return 'clear'
  if (score >= 40) return 'cloudy'
  if (score >= 20) return 'rainy'
  return 'stormy'
}

const CLIMATE_META: Record<ClimateType, { emoji: string; label: string; description: string }> = {
  sunny:  { emoji: '☀️', label: 'Parlak',    description: 'İç dünyan güneş gibi parlıyor. Diyarda çiçekler açıyor.' },
  clear:  { emoji: '⛅', label: 'Açık',      description: 'Hava güzel, moral yerinde. Devam et, yaklaşıyorsun.' },
  cloudy: { emoji: '☁️', label: 'Bulutlu',   description: 'Hafif bulanık bir gün. Bir tamamlama havayı açabilir.' },
  rainy:  { emoji: '🌧️', label: 'Yağmurlu',  description: 'Zor bir dönem. Küçük bir adım bile iklimi iyileştirir.' },
  stormy: { emoji: '⛈️', label: 'Fırtınalı', description: 'İç dünyanda fırtına var. Kendine karşı nazik ol.' },
}

export function getClimate(data: StoreData, now: Date = new Date()): ClimateState {
  const today = format(now, 'yyyy-MM-dd')

  // Completion rate: today 50%, yesterday 30%, 2 days ago 20%
  const r0 = completionRateForDay(data, today)
  const r1 = completionRateForDay(data, format(subDays(now, 1), 'yyyy-MM-dd'))
  const r2 = completionRateForDay(data, format(subDays(now, 2), 'yyyy-MM-dd'))

  const eff0 = r0 < 0 ? 0.5 : r0
  const eff1 = r1 < 0 ? 0.5 : r1
  const eff2 = r2 < 0 ? 0.5 : r2
  const rateScore = (eff0 * 50 + eff1 * 30 + eff2 * 20) * 100

  // Mood score (last 3 days), normalized 1-5 → 0-100
  const avgMood = avgMoodForDays(data, 3, today)
  const moodScore = avgMood > 0 ? ((avgMood - 1) / 4) * 100 : 50

  // 60% completion, 40% mood
  const score = Math.round(rateScore * 0.6 + moodScore * 0.4)
  const type = climateTypeFromScore(score)
  const meta = CLIMATE_META[type]

  // Today's remaining habits
  const todayDate = new Date(today + 'T12:00:00')
  const dueToday = data.habits.filter(
    h => !h.archived && h.createdAt.slice(0, 10) <= today && isHabitDueOnDate(h, todayDate)
  )
  const doneToday = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
  const habitsRemaining = dueToday.filter(h => !doneToday.has(h.id)).length

  // Tomorrow projection: if user completes all remaining today, score improves
  const tomorrowScore = Math.min(100, score + Math.round(habitsRemaining > 0 ? 20 : 5))
  const tomorrowType = climateTypeFromScore(tomorrowScore)
  const tomorrowMeta = CLIMATE_META[tomorrowType]

  let tomorrowHint: string
  if (habitsRemaining === 0 && dueToday.length > 0) {
    tomorrowHint = 'Harika! Bugün her şeyi tamamladın.'
  } else if (habitsRemaining === 1) {
    tomorrowHint = '1 alışkanlık daha tamamla — yarın hava açılır.'
  } else if (habitsRemaining <= 3) {
    tomorrowHint = `${habitsRemaining} alışkanlık daha → daha iyi bir iklim.`
  } else if (dueToday.length === 0) {
    tomorrowHint = 'Ruh halini kaydet — iklimi doğrudan etkiler.'
  } else {
    tomorrowHint = `Bugün ${habitsRemaining} alışkanlık bekliyor. Her biri iklimi güçlendirir.`
  }

  return {
    type,
    emoji: meta.emoji,
    label: meta.label,
    description: meta.description,
    score,
    completionRate: r0 < 0 ? 0 : r0,
    avgMood,
    tomorrowType,
    tomorrowEmoji: tomorrowMeta.emoji,
    tomorrowLabel: tomorrowMeta.label,
    tomorrowHint,
    habitsRemaining,
  }
}
