// Skill tree: a progression layer separate from achievements. You earn 1 skill
// point (SP) per level and spend them on nodes that grant passive bonuses
// (global XP multiplier, extra streak bonus). Nodes unlock along branches.

export type SkillBranch = 'discipline' | 'resilience' | 'focus' | 'fortune'

export interface SkillNode {
  id: string
  name: string
  emoji: string
  description: string
  cost: number          // SP cost
  branch: SkillBranch
  requires?: string      // parent node id (must be unlocked first)
  xpBonus?: number       // additive to global XP multiplier (0.05 = +5%)
  streakBonus?: number   // additive to streak-bonus multiplier
}

export const BRANCH_META: Record<SkillBranch, { label: string; emoji: string; color: string }> = {
  discipline: { label: 'Disiplin',     emoji: '🔥', color: '#f97316' },
  resilience: { label: 'Dayanıklılık', emoji: '🌳', color: '#22c55e' },
  focus:      { label: 'Odak',         emoji: '🎯', color: '#3b82f6' },
  fortune:    { label: 'Talih',        emoji: '🍀', color: '#a855f7' },
}

export const SKILL_TREE: SkillNode[] = [
  // Discipline -> raw XP
  { id: 'd1', branch: 'discipline', name: 'Kıvılcım', emoji: '✨', description: 'Tüm görev XP +5%', cost: 1, xpBonus: 0.05 },
  { id: 'd2', branch: 'discipline', name: 'Alev',     emoji: '🔥', description: 'Tüm görev XP +7%', cost: 2, requires: 'd1', xpBonus: 0.07 },
  { id: 'd3', branch: 'discipline', name: 'Meşale',   emoji: '🕯️', description: 'Tüm görev XP +10%', cost: 3, requires: 'd2', xpBonus: 0.10 },
  { id: 'd4', branch: 'discipline', name: 'Yangın',   emoji: '🌋', description: 'Tüm görev XP +15%', cost: 4, requires: 'd3', xpBonus: 0.15 },

  // Resilience -> streak bonus
  { id: 'r1', branch: 'resilience', name: 'Kök',    emoji: '🌱', description: 'Streak bonusu +10%', cost: 1, streakBonus: 0.10 },
  { id: 'r2', branch: 'resilience', name: 'Gövde',  emoji: '🌿', description: 'Streak bonusu +15%', cost: 2, requires: 'r1', streakBonus: 0.15 },
  { id: 'r3', branch: 'resilience', name: 'Meşe',   emoji: '🌳', description: 'Streak bonusu +25%', cost: 3, requires: 'r2', streakBonus: 0.25 },

  // Focus -> XP, themed
  { id: 'f1', branch: 'focus', name: 'Odak',     emoji: '🎯', description: 'Tüm görev XP +5%', cost: 1, xpBonus: 0.05 },
  { id: 'f2', branch: 'focus', name: 'Akış',     emoji: '🌊', description: 'Tüm görev XP +8%', cost: 2, requires: 'f1', xpBonus: 0.08 },
  { id: 'f3', branch: 'focus', name: 'Derin İş', emoji: '🧠', description: 'Tüm görev XP +12%', cost: 3, requires: 'f2', xpBonus: 0.12 },

  // Fortune -> mixed
  { id: 'l1', branch: 'fortune', name: 'Şans',  emoji: '🍀', description: 'Tüm görev XP +5%', cost: 1, xpBonus: 0.05 },
  { id: 'l2', branch: 'fortune', name: 'Talih', emoji: '🎲', description: 'XP +5%, streak +5%', cost: 2, requires: 'l1', xpBonus: 0.05, streakBonus: 0.05 },
  { id: 'l3', branch: 'fortune', name: 'Kader', emoji: '⭐', description: 'XP +10%, streak +10%', cost: 4, requires: 'l2', xpBonus: 0.10, streakBonus: 0.10 },
]

export function skillPointsEarned(level: number): number {
  return Math.max(0, level - 1)
}

export function skillPointsSpent(unlocked: string[]): number {
  const set = new Set(unlocked)
  return SKILL_TREE.filter(n => set.has(n.id)).reduce((s, n) => s + n.cost, 0)
}

export function skillPointsAvailable(level: number, unlocked: string[]): number {
  return skillPointsEarned(level) - skillPointsSpent(unlocked)
}

// Global XP multiplier from unlocked nodes (1.0 = no bonus).
export function skillXpMultiplier(unlocked: string[]): number {
  const set = new Set(unlocked)
  return 1 + SKILL_TREE.filter(n => set.has(n.id)).reduce((s, n) => s + (n.xpBonus ?? 0), 0)
}

// Extra streak-bonus multiplier added on top of the base streak bonus.
export function skillStreakBonus(unlocked: string[]): number {
  const set = new Set(unlocked)
  return SKILL_TREE.filter(n => set.has(n.id)).reduce((s, n) => s + (n.streakBonus ?? 0), 0)
}

export function canUnlockSkill(node: SkillNode, level: number, unlocked: string[]): boolean {
  if (unlocked.includes(node.id)) return false
  if (node.requires && !unlocked.includes(node.requires)) return false
  return skillPointsAvailable(level, unlocked) >= node.cost
}
