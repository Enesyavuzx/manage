export type Category = 'health' | 'productivity' | 'mindfulness' | 'learning' | 'fitness' | 'other'

export interface Habit {
  id: string
  name: string
  description: string
  category: Category
  frequency: 'daily' | number[]
  xpReward: number
  emoji: string
  color: string
  createdAt: string
  archived: boolean
}

export interface Completion {
  id: string
  habitId: string
  date: string
  completedAt: string
}

export interface UserProfile {
  name: string
  totalXP: number
  redeemedXP: number
}

export interface CustomReward {
  id: string
  name: string
  description: string
  xpCost: number
  emoji: string
  redeemedAt?: string
}

export type AchievementType = 'streak' | 'total_completions' | 'xp_earned' | 'habits_created'

export interface Achievement {
  id: string
  name: string
  description: string
  emoji: string
  xpBonus: number
  requirement: {
    type: AchievementType
    value: number
  }
  unlockedAt?: string
}

export interface StoreData {
  habits: Habit[]
  completions: Completion[]
  profile: UserProfile
  rewards: CustomReward[]
  achievements: Achievement[]
}
