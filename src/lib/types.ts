export type Category =
  | 'health' | 'productivity' | 'mindfulness'
  | 'learning' | 'fitness' | 'social' | 'creativity' | 'other'

export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'epic'

export type ThemeName = 'aurora' | 'neon' | 'pixel'

export interface Habit {
  id: string
  name: string
  description: string
  category: Category
  difficulty: Difficulty
  frequency: 'daily' | number[]
  emoji: string
  color: string
  createdAt: string
  archived: boolean
}

export interface Completion {
  id: string
  habitId: string
  date: string          // yyyy-MM-dd
  completedAt: string   // ISO
  xpAwarded: number
}

export interface UserProfile {
  name: string
  totalXP: number
  redeemedXP: number
  activeTitleId: string | null
  theme: ThemeName
}

export type RewardTier = 'small' | 'medium' | 'large' | 'legendary' | 'mythic'

export interface CustomReward {
  id: string
  name: string
  description: string
  xpCost: number
  emoji: string
  tier?: RewardTier
  redeemedAt?: string
}

export type MoodLevel = 1 | 2 | 3 | 4 | 5

export interface MoodLog {
  id: string
  date: string          // yyyy-MM-dd (one per day, latest wins)
  level: MoodLevel
  note?: string
  createdAt: string     // ISO
  xpAwarded: number
}

export interface FocusSession {
  id: string
  minutes: number
  completedAt: string   // ISO
  xpAwarded: number
}

export type AchievementType =
  | 'total_completions'
  | 'streak'
  | 'xp_earned'
  | 'level'
  | 'habits_created'
  | 'rewards_redeemed'
  | 'perfect_days'
  | 'category_completions'
  | 'early_bird'
  | 'night_owl'
  | 'weekend'
  | 'focus_minutes'
  | 'mood_logs'

export interface AchievementDef {
  id: string
  name: string
  description: string
  emoji: string
  xpBonus: number
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond'
  requirement: {
    type: AchievementType
    value: number
    category?: Category
  }
  titleReward?: string   // title id unlocked with this achievement
}

export interface TitleDef {
  id: string
  label: string
  emoji: string
}

export interface RankDef {
  id: string
  label: string
  emoji: string
  minLevel: number
  color: string
  glow: string
}

export interface StoreData {
  habits: Habit[]
  completions: Completion[]
  profile: UserProfile
  rewards: CustomReward[]
  moods: MoodLog[]
  focusSessions: FocusSession[]
  unlockedAchievements: Record<string, string>  // achievementId -> unlockedAt ISO
  unlockedTitles: Record<string, string>        // titleId -> unlockedAt ISO
}
