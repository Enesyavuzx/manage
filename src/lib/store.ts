import type { StoreData, Habit, Completion } from './types'
import { DEFAULT_REWARDS } from './constants'
import { ACHIEVEMENTS } from './achievements'
import { getLevelInfo } from './gamification'
import { format } from 'date-fns'

const STORAGE_KEY = 'manage_app_data_v2'

export function defaultData(): StoreData {
  return {
    habits: [],
    completions: [],
    profile: { name: 'Kahraman', totalXP: 0, redeemedXP: 0, activeTitleId: null, theme: 'aurora' },
    rewards: DEFAULT_REWARDS.map(r => ({ ...r })),
    unlockedAchievements: {},
    unlockedTitles: {},
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
    unlockedAchievements: parsed.unlockedAchievements ?? {},
    unlockedTitles: parsed.unlockedTitles ?? {},
  }
}

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

export function getStreak(completions: Completion[], habitId: string): number {
  const dates = completions
    .filter(c => c.habitId === habitId)
    .map(c => c.date)
    .sort()
    .reverse()
  if (dates.length === 0) return 0

  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
  if (dates[0] !== today && dates[0] !== yesterday) return 0

  let streak = 0
  let check = dates[0] === today ? today : yesterday
  for (const date of dates) {
    if (date === check) {
      streak++
      const d = new Date(check + 'T12:00:00')
      d.setDate(d.getDate() - 1)
      check = format(d, 'yyyy-MM-dd')
    } else if (date < check) {
      break
    }
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
  return Math.max(0, ...data.habits.map(h => getStreak(data.completions, h.id)))
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

function categoryCompletions(data: StoreData, category: string): number {
  const ids = new Set(data.habits.filter(h => h.category === category).map(h => h.id))
  return data.completions.filter(c => ids.has(c.habitId)).length
}

function timeOfDayCount(data: StoreData, mode: 'early' | 'night'): number {
  return data.completions.filter(c => {
    const h = new Date(c.completedAt).getHours()
    return mode === 'early' ? h < 8 : h >= 22
  }).length
}

function weekendCount(data: StoreData): number {
  return data.completions.filter(c => {
    const d = new Date(c.date + 'T12:00:00').getDay()
    return d === 0 || d === 6
  }).length
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
