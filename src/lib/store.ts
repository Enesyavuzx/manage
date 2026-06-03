import type { StoreData, Habit, Completion, WeeklyReview, Routine } from './types'
import { DEFAULT_REWARDS, EXTRA_REWARDS, WATER_GOAL } from './constants'
import { ACHIEVEMENTS } from './achievements'
import { getLevelInfo } from './gamification'
import { format } from 'date-fns'

const STORAGE_KEY = 'manage_app_data_v2'

export function defaultData(): StoreData {
  return {
    habits: [],
    completions: [],
    profile: { name: 'Kahraman', totalXP: 0, redeemedXP: 0, activeTitleId: null, theme: 'aurora' },
    rewards: [...DEFAULT_REWARDS, ...EXTRA_REWARDS].map(r => ({ ...r })),
    moods: [],
    focusSessions: [],
    water: [],
    budgetAccounts: [],
    budgetTransactions: [],
    brainDump: [],
    freezeTokens: 2,
    frozenDates: [],
    unlockedSkills: [],
    subtaskDone: {},
    unlockedAchievements: {},
    unlockedTitles: {},
    weeklyReviews: [],
    routines: [],
    savedQuotes: [],
  }
}

export function loadStore(): StoreData {
  if (typeof window === 'undefined') return defaultData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return migrateLegacy() ?? defaultData()
    const parsed = JSON.parse(raw) as Partial<StoreData>
    return mergeWithDefaults(parsed)
  } catch {
    return defaultData()
  }
}

function mergeWithDefaults(parsed: Partial<StoreData>): StoreData {
  const def = defaultData()
  return {
    habits: parsed.habits ?? def.habits,
    completions: parsed.completions ?? def.completions,
    profile: { ...def.profile, ...(parsed.profile ?? {}) },
    rewards: parsed.rewards ?? def.rewards,
    moods: parsed.moods ?? def.moods,
    focusSessions: parsed.focusSessions ?? def.focusSessions,
    water: parsed.water ?? def.water,
    budgetAccounts: parsed.budgetAccounts ?? def.budgetAccounts,
    budgetTransactions: parsed.budgetTransactions ?? def.budgetTransactions,
    brainDump: parsed.brainDump ?? def.brainDump,
    freezeTokens: parsed.freezeTokens ?? def.freezeTokens,
    frozenDates: parsed.frozenDates ?? def.frozenDates,
    unlockedSkills: parsed.unlockedSkills ?? def.unlockedSkills,
    subtaskDone: parsed.subtaskDone ?? def.subtaskDone,
    unlockedAchievements: parsed.unlockedAchievements ?? {},
    unlockedTitles: parsed.unlockedTitles ?? {},
    weeklyReviews: parsed.weeklyReviews ?? [],
    routines: parsed.routines ?? [],
    savedQuotes: parsed.savedQuotes ?? [],
  }
}

// Re-export types so external files can use them via store.ts if needed.
export type { WeeklyReview, Routine }

// migrate from the v1 schema (best-effort, never throws)
function migrateLegacy(): StoreData | null {
  try {
    const raw = localStorage.getItem('manage_app_data')
    if (!raw) return null
    const old = JSON.parse(raw)
    const data = defaultData()
    if (Array.isArray(old.habits)) {
      data.habits = old.habits.map((h: Habit & { xpReward?: number }) => ({
        ...h,
        difficulty: h.difficulty ?? (h.xpReward && h.xpReward >= 35 ? 'hard' : h.xpReward && h.xpReward >= 20 ? 'medium' : 'easy'),
      }))
    }
    if (Array.isArray(old.completions)) {
      data.completions = old.completions.map((c: Completion) => ({ ...c, xpAwarded: c.xpAwarded ?? 10 }))
    }
    if (old.profile) {
      data.profile = { ...data.profile, name: old.profile.name ?? data.profile.name, totalXP: old.profile.totalXP ?? 0, redeemedXP: old.profile.redeemedXP ?? 0 }
    }
    return data
  } catch {
    return null
  }
}

export function saveStore(data: StoreData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function isHabitDueOnDate(habit: Habit, date: Date): boolean {
  if (habit.archived) return false
  if (habit.frequency === 'daily') return true
  return (habit.frequency as number[]).includes(date.getDay())
}

export function isHabitDueToday(habit: Habit): boolean {
  return isHabitDueOnDate(habit, new Date())
}

// Walk backwards from today. Completed days count; frozen days bridge the
// chain without counting; any other gap ends the streak. Not completing the
// current day yet is forgiven (we start from yesterday in that case).
export function getStreak(completions: Completion[], habitId: string, frozen?: string[]): number {
  const completed = new Set(completions.filter(c => c.habitId === habitId).map(c => c.date))
  if (completed.size === 0) return 0
  const frozenSet = frozen ? new Set(frozen) : null

  const today = format(new Date(), 'yyyy-MM-dd')
  let cursor = new Date(today + 'T12:00:00')
  // grace for the current day: if today is neither done nor frozen, start at yesterday
  if (!completed.has(today) && !(frozenSet?.has(today))) {
    cursor.setDate(cursor.getDate() - 1)
  }

  let streak = 0
  while (true) {
    const key = format(cursor, 'yyyy-MM-dd')
    if (completed.has(key)) streak++
    else if (frozenSet?.has(key)) { /* bridge, no increment */ }
    else break
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

export function getLongestStreak(completions: Completion[], habitId: string): number {
  const dateSet = new Set(completions.filter(c => c.habitId === habitId).map(c => c.date))
  const dates = Array.from(dateSet).sort()
  if (dates.length === 0) return 0
  let longest = 1, current = 1
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T12:00:00')
    const curr = new Date(dates[i] + 'T12:00:00')
    if ((curr.getTime() - prev.getTime()) / 86400000 === 1) {
      current++; longest = Math.max(longest, current)
    } else current = 1
  }
  return longest
}

export function maxCurrentStreak(data: StoreData): number {
  return Math.max(0, ...data.habits.map(h => getStreak(data.completions, h.id, data.frozenDates)))
}

// Count of days where every due habit was completed
export function perfectDayCount(data: StoreData): number {
  const byDate = new Map<string, Set<string>>()
  for (const c of data.completions) {
    if (!byDate.has(c.date)) byDate.set(c.date, new Set())
    byDate.get(c.date)!.add(c.habitId)
  }
  let perfect = 0
  for (const [date, done] of byDate) {
    const d = new Date(date + 'T12:00:00')
    const due = data.habits.filter(h => !h.archived && isHabitDueOnDate(h, d))
    if (due.length > 0 && due.every(h => done.has(h.id))) perfect++
  }
  return perfect
}

export function categoryCompletions(data: StoreData, category: string): number {
  const ids = new Set(data.habits.filter(h => h.category === category).map(h => h.id))
  return data.completions.filter(c => ids.has(c.habitId)).length
}

export function timeOfDayCount(data: StoreData, mode: 'early' | 'night'): number {
  return data.completions.filter(c => {
    const h = new Date(c.completedAt).getHours()
    return mode === 'early' ? h < 8 : h >= 22
  }).length
}

export function weekendCount(data: StoreData): number {
  return data.completions.filter(c => {
    const d = new Date(c.date + 'T12:00:00').getDay()
    return d === 0 || d === 6
  }).length
}

export function getProgressValue(data: StoreData, req: { type: string; value: number; category?: string }): number {
  switch (req.type) {
    case 'total_completions':    return data.completions.length
    case 'streak':               return maxCurrentStreak(data)
    case 'xp_earned':            return data.profile.totalXP
    case 'level':                return getLevelInfo(data.profile.totalXP).level
    case 'habits_created':       return data.habits.filter(h => !h.archived).length
    case 'rewards_redeemed':     return data.rewards.filter(r => r.redeemedAt).length
    case 'perfect_days':         return perfectDayCount(data)
    case 'category_completions': return categoryCompletions(data, req.category!)
    case 'early_bird':           return timeOfDayCount(data, 'early')
    case 'night_owl':            return timeOfDayCount(data, 'night')
    case 'weekend':              return weekendCount(data)
    case 'focus_minutes':        return focusMinutesTotal(data)
    case 'mood_logs':            return data.moods.length
    case 'water_days':           return waterGoalDays(data, WATER_GOAL)
    default:                     return 0
  }
}

export function focusMinutesTotal(data: StoreData): number {
  return data.focusSessions.reduce((sum, s) => sum + s.minutes, 0)
}

export function moodLoggedToday(data: StoreData): boolean {
  return data.moods.some(m => m.date === todayKey())
}

export function todayMood(data: StoreData) {
  return data.moods.find(m => m.date === todayKey()) ?? null
}

export function todayWaterCount(data: StoreData): number {
  const t = todayKey()
  return data.water.filter(w => w.date === t).length
}

// Number of distinct days where the daily water goal was reached.
export function waterGoalDays(data: StoreData, goal: number): number {
  const byDate = new Map<string, number>()
  for (const w of data.water) byDate.set(w.date, (byDate.get(w.date) ?? 0) + 1)
  let days = 0
  for (const count of byDate.values()) if (count >= goal) days++
  return days
}

export function subtaskKey(date: string, habitId: string): string {
  return `${date}:${habitId}`
}

// ---- Mood <-> habit correlation ----
export interface HabitMoodLift {
  habitId: string
  completedAvg: number   // avg mood (1-5) on days this habit was done
  missedAvg: number      // avg mood on mood-logged days it was not done
  lift: number           // completedAvg - missedAvg
  sample: number         // smaller of the two day counts
}

export interface MoodBucket {
  label: string
  avgMood: number
  days: number
}

export interface MoodInsights {
  buckets: MoodBucket[]
  habits: HabitMoodLift[]
  hasEnoughData: boolean
}

export function moodInsights(data: StoreData): MoodInsights {
  const moodByDate = new Map<string, number>()
  for (const m of data.moods) moodByDate.set(m.date, m.level)

  const completedByDate = new Map<string, Set<string>>()
  for (const c of data.completions) {
    if (!completedByDate.has(c.date)) completedByDate.set(c.date, new Set())
    completedByDate.get(c.date)!.add(c.habitId)
  }

  // Buckets: average mood grouped by how many habits were completed that day.
  const bucketDefs: { label: string; test: (n: number) => boolean }[] = [
    { label: '0 görev', test: n => n === 0 },
    { label: '1-2 görev', test: n => n >= 1 && n <= 2 },
    { label: '3-4 görev', test: n => n >= 3 && n <= 4 },
    { label: '5+ görev', test: n => n >= 5 },
  ]
  const buckets: MoodBucket[] = bucketDefs.map(b => {
    let sum = 0, days = 0
    for (const [date, mood] of moodByDate) {
      const n = completedByDate.get(date)?.size ?? 0
      if (b.test(n)) { sum += mood; days++ }
    }
    return { label: b.label, avgMood: days ? sum / days : 0, days }
  })

  // Per-habit mood lift.
  const habits: HabitMoodLift[] = []
  for (const h of data.habits.filter(x => !x.archived)) {
    let cSum = 0, cN = 0, mSum = 0, mN = 0
    for (const [date, mood] of moodByDate) {
      const done = completedByDate.get(date)?.has(h.id)
      if (done) { cSum += mood; cN++ } else { mSum += mood; mN++ }
    }
    if (cN < 3 || mN < 3) continue
    const completedAvg = cSum / cN
    const missedAvg = mSum / mN
    habits.push({
      habitId: h.id, completedAvg, missedAvg,
      lift: completedAvg - missedAvg, sample: Math.min(cN, mN),
    })
  }
  habits.sort((a, b) => b.lift - a.lift)

  const moodDays = moodByDate.size
  return { buckets, habits, hasEnoughData: moodDays >= 5 }
}

// ---- Budget helpers ----
export function accountBalance(data: StoreData, accountId: string): number {
  const acc = data.budgetAccounts.find(a => a.id === accountId)
  if (!acc) return 0
  return data.budgetTransactions.reduce((sum, t) => {
    if (t.accountId !== accountId) return sum
    return sum + (t.type === 'income' ? t.amount : -t.amount)
  }, acc.openingBalance)
}

export function netWorth(data: StoreData): number {
  return data.budgetAccounts.reduce((sum, a) => sum + accountBalance(data, a.id), 0)
}

// Income/expense totals for a given yyyy-MM prefix (defaults to current month).
export function monthTotals(data: StoreData, monthPrefix: string): { income: number; expense: number } {
  let income = 0, expense = 0
  for (const t of data.budgetTransactions) {
    if (!t.date.startsWith(monthPrefix)) continue
    if (t.type === 'income') income += t.amount
    else expense += t.amount
  }
  return { income, expense }
}

// Expense total per category for a given month prefix.
export function expenseByCategory(data: StoreData, monthPrefix: string): Record<string, number> {
  const out: Record<string, number> = {}
  for (const t of data.budgetTransactions) {
    if (t.type !== 'expense' || !t.date.startsWith(monthPrefix)) continue
    out[t.categoryId] = (out[t.categoryId] ?? 0) + t.amount
  }
  return out
}

export function currentMonthPrefix(): string {
  return format(new Date(), 'yyyy-MM')
}

// Returns { newlyUnlocked achievementIds, newTitles, bonusXP }
export function evaluateAchievements(data: StoreData): {
  newAchievements: string[]
  newTitles: string[]
  bonusXP: number
} {
  const level = getLevelInfo(data.profile.totalXP).level
  const totalCompletions = data.completions.length
  const streak = maxCurrentStreak(data)
  const perfect = perfectDayCount(data)
  const redeemed = data.rewards.filter(r => r.redeemedAt).length
  const habitsCreated = data.habits.filter(h => !h.archived).length
  const early = timeOfDayCount(data, 'early')
  const night = timeOfDayCount(data, 'night')
  const weekend = weekendCount(data)
  const focusMin = focusMinutesTotal(data)
  const moodLogs = data.moods.length
  const waterDays = waterGoalDays(data, WATER_GOAL)

  const newAchievements: string[] = []
  const newTitles: string[] = []
  let bonusXP = 0

  for (const a of ACHIEVEMENTS) {
    if (data.unlockedAchievements[a.id]) continue
    let val = 0
    switch (a.requirement.type) {
      case 'total_completions':    val = totalCompletions; break
      case 'streak':               val = streak; break
      case 'xp_earned':            val = data.profile.totalXP; break
      case 'level':                val = level; break
      case 'habits_created':       val = habitsCreated; break
      case 'rewards_redeemed':     val = redeemed; break
      case 'perfect_days':         val = perfect; break
      case 'category_completions': val = categoryCompletions(data, a.requirement.category!); break
      case 'early_bird':           val = early; break
      case 'night_owl':            val = night; break
      case 'weekend':              val = weekend; break
      case 'focus_minutes':        val = focusMin; break
      case 'mood_logs':            val = moodLogs; break
      case 'water_days':           val = waterDays; break
    }
    if (val >= a.requirement.value) {
      newAchievements.push(a.id)
      bonusXP += a.xpBonus
      if (a.titleReward && !data.unlockedTitles[a.titleReward] && !newTitles.includes(a.titleReward)) {
        newTitles.push(a.titleReward)
      }
    }
  }

  return { newAchievements, newTitles, bonusXP }
}
