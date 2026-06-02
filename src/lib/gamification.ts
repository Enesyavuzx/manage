import type { Difficulty, RankDef } from './types'

// ---- XP / Level curve ----
// Cumulative XP required to *reach* a given level.
// reach(1)=0, reach(2)=100, reach(3)=300, reach(4)=600, reach(5)=1000 ...
export function cumulativeXpForLevel(level: number): number {
  if (level <= 1) return 0
  return 50 * (level - 1) * level
}

export interface LevelInfo {
  level: number
  xpInLevel: number
  xpNeeded: number
  progress: number
  currentLevelXP: number
  nextLevelXP: number
}

export function getLevelInfo(totalXP: number): LevelInfo {
  let level = 1
  while (cumulativeXpForLevel(level + 1) <= totalXP) level++
  const currentLevelXP = cumulativeXpForLevel(level)
  const nextLevelXP = cumulativeXpForLevel(level + 1)
  const xpInLevel = totalXP - currentLevelXP
  const xpNeeded = nextLevelXP - currentLevelXP
  return {
    level,
    xpInLevel,
    xpNeeded,
    progress: xpNeeded > 0 ? xpInLevel / xpNeeded : 0,
    currentLevelXP,
    nextLevelXP,
  }
}

// ---- Difficulty -> XP multiplier ----
export const DIFFICULTY_META: Record<Difficulty, { label: string; xp: number; emoji: string; color: string }> = {
  trivial: { label: 'Trivial', xp: 5,  emoji: '○',  color: '#94a3b8' },
  easy:    { label: 'Easy',    xp: 10, emoji: '◔',  color: '#22c55e' },
  medium:  { label: 'Medium',  xp: 20, emoji: '◑',  color: '#3b82f6' },
  hard:    { label: 'Hard',    xp: 35, emoji: '◕',  color: '#a855f7' },
  epic:    { label: 'Epic',    xp: 60, emoji: '●',  color: '#f59e0b' },
}

export function xpForDifficulty(d: Difficulty): number {
  return DIFFICULTY_META[d].xp
}

// Streak bonus: longer streak -> small XP multiplier on completion
export function streakBonus(streak: number): number {
  if (streak >= 100) return 1.0
  if (streak >= 30) return 0.5
  if (streak >= 14) return 0.3
  if (streak >= 7) return 0.2
  if (streak >= 3) return 0.1
  return 0
}

// ---- Ranks (auto from level) ----
export const RANKS: RankDef[] = [
  { id: 'novice',      label: 'Çaylak',       emoji: '🥚', minLevel: 1,   color: '#94a3b8', glow: 'rgba(148,163,184,0.5)' },
  { id: 'apprentice',  label: 'Acemi',        emoji: '🐣', minLevel: 5,   color: '#22c55e', glow: 'rgba(34,197,94,0.5)' },
  { id: 'adept',       label: 'Çırak',        emoji: '🦅', minLevel: 10,  color: '#14b8a6', glow: 'rgba(20,184,166,0.5)' },
  { id: 'journeyman',  label: 'Kalfa',        emoji: '⚔️', minLevel: 15,  color: '#3b82f6', glow: 'rgba(59,130,246,0.5)' },
  { id: 'master',      label: 'Usta',         emoji: '🛡️', minLevel: 20,  color: '#6366f1', glow: 'rgba(99,102,241,0.5)' },
  { id: 'expert',      label: 'Uzman',        emoji: '🔮', minLevel: 30,  color: '#8b5cf6', glow: 'rgba(139,92,246,0.55)' },
  { id: 'champion',    label: 'Şampiyon',     emoji: '🏆', minLevel: 40,  color: '#a855f7', glow: 'rgba(168,85,247,0.6)' },
  { id: 'legend',      label: 'Efsane',       emoji: '🌟', minLevel: 50,  color: '#ec4899', glow: 'rgba(236,72,153,0.6)' },
  { id: 'grandmaster', label: 'Büyük Usta',   emoji: '👑', minLevel: 65,  color: '#f59e0b', glow: 'rgba(245,158,11,0.65)' },
  { id: 'hero',        label: 'Kahraman',     emoji: '⚡', minLevel: 80,  color: '#f97316', glow: 'rgba(249,115,22,0.7)' },
  { id: 'immortal',    label: 'Ölümsüz',      emoji: '🔥', minLevel: 100, color: '#ef4444', glow: 'rgba(239,68,68,0.75)' },
]

export function getRank(level: number): { rank: RankDef; next: RankDef | null; levelsToNext: number } {
  let rank = RANKS[0]
  let next: RankDef | null = null
  for (let i = 0; i < RANKS.length; i++) {
    if (level >= RANKS[i].minLevel) {
      rank = RANKS[i]
      next = RANKS[i + 1] ?? null
    }
  }
  const levelsToNext = next ? next.minLevel - level : 0
  return { rank, next, levelsToNext }
}
