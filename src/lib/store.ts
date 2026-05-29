import type { StoreData, Habit, Completion, CustomReward, Achievement } from './types'
import { DEFAULT_ACHIEVEMENTS, DEFAULT_REWARDS } from './constants'
import { format } from 'date-fns'

const STORAGE_KEY = 'manage_app_data'

function defaultData(): StoreData {
  return {
    habits: [],
    completions: [],
    profile: { name: 'You', totalXP: 0, redeemedXP: 0 },
    rewards: DEFAULT_REWARDS.map(r => ({ ...r, redeemedAt: undefined })),
    achievements: DEFAULT_ACHIEVEMENTS.map(a => ({ ...a, unlockedAt: undefined })),
  }
}

export function loadStore(): StoreData {
  if (typeof window === 'undefined') return defaultData()
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return defaultData()
    const parsed = JSON.parse(raw) as Partial<StoreData>
    const def = defaultData()
    // Merge achievements so new ones added in code appear
    const existingAchievementIds = new Set((parsed.achievements ?? []).map(a => a.id))
    const mergedAchievements = [
      ...(parsed.achievements ?? []),
      ...def.achievements.filter(a => !existingAchievementIds.has(a.id)),
    ]
    return {
      habits:       parsed.habits       ?? def.habits,
      completions:  parsed.completions  ?? def.completions,
      profile:      parsed.profile      ?? def.profile,
      rewards:      parsed.rewards      ?? def.rewards,
      achievements: mergedAchievements,
    }
  } catch {
    return defaultData()
  }
}

export function saveStore(data: StoreData): void {
  if (typeof window === 'undefined') return
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
}

export function todayKey(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

export function getCompletionsForDate(completions: Completion[], date: string): Completion[] {
  return completions.filter(c => c.date === date)
}

export function isHabitDueToday(habit: Habit): boolean {
  if (habit.archived) return false
  if (habit.frequency === 'daily') return true
  const dow = new Date().getDay()
  return (habit.frequency as number[]).includes(dow)
}

export function getStreak(completions: Completion[], habitId: string): number {
  const dates = completions
    .filter(c => c.habitId === habitId)
    .map(c => c.date)
    .sort()
    .reverse()

  if (dates.length === 0) return 0

  let streak = 0
  const today = format(new Date(), 'yyyy-MM-dd')
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')

  if (dates[0] !== today && dates[0] !== yesterday) return 0

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

  let longest = 1
  let current = 1

  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1] + 'T12:00:00')
    const curr = new Date(dates[i] + 'T12:00:00')
    const diff = (curr.getTime() - prev.getTime()) / 86400000
    if (diff === 1) {
      current++
      longest = Math.max(longest, current)
    } else {
      current = 1
    }
  }
  return longest
}

export function checkAchievements(
  data: StoreData,
  newCompletions: Completion[],
): { data: StoreData; unlocked: Achievement[] } {
  const updatedAchievements = [...data.achievements]
  const unlocked: Achievement[] = []

  const totalCompletions = newCompletions.length
  const maxStreak = Math.max(0, ...data.habits.map(h => getStreak(newCompletions, h.id)))
  const activeHabits = data.habits.filter(h => !h.archived).length

  for (let i = 0; i < updatedAchievements.length; i++) {
    const a = updatedAchievements[i]
    if (a.unlockedAt) continue

    let met = false
    switch (a.requirement.type) {
      case 'total_completions': met = totalCompletions >= a.requirement.value; break
      case 'streak':            met = maxStreak >= a.requirement.value;        break
      case 'xp_earned':         met = data.profile.totalXP >= a.requirement.value; break
      case 'habits_created':    met = activeHabits >= a.requirement.value;     break
    }

    if (met) {
      updatedAchievements[i] = { ...a, unlockedAt: new Date().toISOString() }
      unlocked.push(updatedAchievements[i])
    }
  }

  const bonusXP = unlocked.reduce((sum, a) => sum + a.xpBonus, 0)

  return {
    data: {
      ...data,
      achievements: updatedAchievements,
      profile: { ...data.profile, totalXP: data.profile.totalXP + bonusXP },
    },
    unlocked,
  }
}
