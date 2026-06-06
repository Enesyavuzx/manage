import type { StoreData } from './types'
import { isHabitDueOnDate } from './store'
import { format, subDays } from 'date-fns'

export interface ShadowState {
  playerScore: number
  playerTotal: number
  playerRate: number     // 0-1
  ghostScore: number
  ghostTotal: number
  ghostRate: number      // 0-1
  leading: 'player' | 'ghost' | 'tied'
  gap: number            // positive = player ahead
  winStreakDays: number  // consecutive days player beat ghost
  message: string
}

// Linear congruential generator — deterministic, no import needed
function seededRng(seed: number) {
  let s = (seed % 2147483647 + 2147483647) % 2147483647 || 1
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

function habitSeed(habitId: string, date: string): number {
  let h = 0
  const str = date + habitId
  for (let i = 0; i < str.length; i++) {
    h = ((h << 5) - h + str.charCodeAt(i)) | 0
  }
  return Math.abs(h)
}

// Ghost completes ~40% of easy/trivial habits, ~30% of medium/hard/epic
function ghostDoesHabit(habitId: string, date: string, difficulty: string): boolean {
  const rate = difficulty === 'trivial' || difficulty === 'easy' ? 0.45 : 0.32
  return seededRng(habitSeed(habitId, date))() < rate
}

function calcDayResult(data: StoreData, date: string, now: Date): { player: number; ghost: number; total: number } {
  const dayDate = new Date(date + 'T12:00:00')
  const due = data.habits.filter(
    h => !h.archived && h.createdAt.slice(0, 10) <= date && isHabitDueOnDate(h, dayDate)
  )
  if (due.length === 0) return { player: 0, ghost: 0, total: 0 }

  const playerDone = new Set(data.completions.filter(c => c.date === date).map(c => c.habitId))
  const player = due.filter(h => playerDone.has(h.id)).length
  const ghost = due.filter(h => ghostDoesHabit(h.id, date, h.difficulty)).length

  return { player, ghost, total: due.length }
}

export function getShadow(data: StoreData, now: Date = new Date()): ShadowState {
  const today = format(now, 'yyyy-MM-dd')
  const { player: playerScore, ghost: ghostScore, total: playerTotal } = calcDayResult(data, today, now)
  const ghostTotal = playerTotal

  const playerRate = playerTotal > 0 ? playerScore / playerTotal : 0
  const ghostRate = ghostTotal > 0 ? ghostScore / ghostTotal : 0
  const gap = playerScore - ghostScore
  const leading: ShadowState['leading'] = gap > 0 ? 'player' : gap < 0 ? 'ghost' : 'tied'

  // Win streak: consecutive past days player beat ghost
  let winStreakDays = 0
  for (let i = 1; i <= 30; i++) {
    const dk = format(subDays(now, i), 'yyyy-MM-dd')
    const r = calcDayResult(data, dk, new Date(dk + 'T12:00:00'))
    if (r.total === 0) continue
    if (r.player > r.ghost) winStreakDays++
    else break
  }

  let message: string
  if (playerTotal === 0) {
    message = 'Gölge Benlik bugün bekliyor...'
  } else if (leading === 'player') {
    message = gap >= 3 ? `${gap} adım öndesin! Gölge yetişemiyor.` : `${gap} adım önde. Bırakma!`
  } else if (leading === 'ghost') {
    message = Math.abs(gap) >= 3 ? `Gölge ${Math.abs(gap)} adım önde! Hızlan.` : `Gölge ${Math.abs(gap)} adım önde.`
  } else {
    message = 'Berabersiniz. Bir tane daha yap!'
  }

  return {
    playerScore,
    playerTotal,
    playerRate,
    ghostScore,
    ghostTotal,
    ghostRate,
    leading,
    gap,
    winStreakDays,
    message,
  }
}
