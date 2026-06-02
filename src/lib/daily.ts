import type { StoreData } from './types'
import { WATER_GOAL } from './constants'
import { todayKey, todayWaterCount, isHabitDueToday, perfectDayCount } from './store'

// ---- Daily login bonus ----
// Reward grows with consecutive-day login streak, capped to keep it sane.
export function loginBonusXP(loginStreak: number): number {
  return Math.min(100, 20 + (loginStreak - 1) * 10)
}

export function dailyAlreadyClaimed(data: StoreData): boolean {
  return data.profile.dailyClaimedDate === todayKey()
}

// ---- Daily challenge ----
export interface DailyChallenge {
  id: string
  label: string
  emoji: string
  target: number
  xp: number
  progress: (data: StoreData) => number
}

const CHALLENGE_POOL: DailyChallenge[] = [
  {
    id: 'complete_3', label: 'Bugün 3 görev tamamla', emoji: '✅', target: 3, xp: 40,
    progress: d => completedToday(d),
  },
  {
    id: 'complete_5', label: 'Bugün 5 görev tamamla', emoji: '🔥', target: 5, xp: 70,
    progress: d => completedToday(d),
  },
  {
    id: 'log_mood', label: 'Ruh halini kaydet', emoji: '😊', target: 1, xp: 25,
    progress: d => d.moods.some(m => m.date === todayKey()) ? 1 : 0,
  },
  {
    id: 'water_goal', label: `Su hedefine ulaş (${WATER_GOAL} bardak)`, emoji: '💧', target: WATER_GOAL, xp: 35,
    progress: d => todayWaterCount(d),
  },
  {
    id: 'focus_session', label: 'Bir odak seansı tamamla', emoji: '🎯', target: 1, xp: 30,
    progress: d => d.focusSessions.filter(s => s.completedAt.slice(0, 10) === todayKey()).length,
  },
  {
    id: 'perfect_day', label: 'Tüm günlük görevleri bitir', emoji: '💠', target: 1, xp: 90,
    progress: d => isPerfectToday(d) ? 1 : 0,
  },
  {
    id: 'brain_dump', label: 'Aklındakini beyin boşaltmaya yaz', emoji: '🧠', target: 1, xp: 20,
    progress: d => d.brainDump.some(b => b.createdAt.slice(0, 10) === todayKey()) ? 1 : 0,
  },
]

function completedToday(data: StoreData): number {
  const today = todayKey()
  return data.completions.filter(c => c.date === today).length
}

function isPerfectToday(data: StoreData): boolean {
  const today = todayKey()
  const due = data.habits.filter(h => !h.archived && isHabitDueToday(h))
  if (due.length === 0) return false
  const done = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
  return due.every(h => done.has(h.id))
}

// Stable per-day pick so the challenge does not change on every render/visit.
export function challengeForToday(): DailyChallenge {
  const key = todayKey()
  let hash = 0
  for (let i = 0; i < key.length; i++) hash = (hash * 31 + key.charCodeAt(i)) >>> 0
  return CHALLENGE_POOL[hash % CHALLENGE_POOL.length]
}

export function challengeAlreadyClaimed(data: StoreData): boolean {
  return data.profile.challengeClaimedDate === todayKey()
}

// re-export so callers can avoid importing from two modules
export { perfectDayCount }
