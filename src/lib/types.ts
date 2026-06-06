export type Category =
  | 'health' | 'productivity' | 'mindfulness'
  | 'learning' | 'fitness' | 'social' | 'creativity' | 'other'

export type Difficulty = 'trivial' | 'easy' | 'medium' | 'hard' | 'epic'

export type ThemeName = 'aurora' | 'neon' | 'pixel'

export interface HabitStep {
  id: string
  text: string
}

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
  subtasks?: HabitStep[]
  reminderTime?: string | null   // "HH:mm" or null
  cue?: string | null            // habit stacking tetikleyicisi: "kahveden sonra"
}

export interface HabitTemplate {
  name: string
  description: string
  emoji: string
  category: Category
  difficulty: Difficulty
  color: string
  steps?: string[]
}

export interface TemplatePack {
  id: string
  name: string
  emoji: string
  description: string
  habits: HabitTemplate[]
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
  notificationsEnabled?: boolean
  soundEnabled?: boolean                // tamamlama/combo sesleri (varsayılan açık)
  morningReminderTime?: string | null   // "HH:mm" — günlük özet sabah bildirimi
  eveningReminderTime?: string | null   // "HH:mm" — günlük özet akşam bildirimi
  onboarded?: boolean
  lastLoginDate?: string        // yyyy-MM-dd of last counted visit
  loginStreak?: number          // consecutive daily-visit count
  dailyClaimedDate?: string     // yyyy-MM-dd the daily login bonus was claimed
  challengeClaimedDate?: string // yyyy-MM-dd the daily challenge was claimed
  realmName?: string            // Diyar için kullanıcı tanımlı isim
  realmBanner?: string          // Diyar bayrağı rengi (hex)
  petType?: PetType             // Diyar maskotu türü
  advisorId?: string            // sabit filozof danışman (boşsa günün filozofu)
}

export type PetType = 'cat' | 'dog' | 'bird'

export interface BrainDumpItem {
  id: string
  text: string
  done: boolean
  createdAt: string             // ISO
}

export interface WaterLog {
  id: string
  date: string          // yyyy-MM-dd
  createdAt: string     // ISO
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

export interface EnergyLog {
  id: string
  date: string          // yyyy-MM-dd (one per day, latest wins)
  level: MoodLevel      // 1-5 enerji seviyesi
  createdAt: string     // ISO
}

export interface Medication {
  id: string
  name: string
  emoji: string
  time?: string | null  // "HH:mm" opsiyonel hatırlatma referansı
  createdAt: string
}

export interface MedicationDose {
  id: string
  medId: string
  date: string          // yyyy-MM-dd
  takenAt: string       // ISO
}

export interface FocusSession {
  id: string
  minutes: number
  completedAt: string   // ISO
  xpAwarded: number
}

// ---- Budget ----
export type AccountType = 'cash' | 'bank' | 'card'

export interface BudgetAccount {
  id: string
  name: string
  type: AccountType
  openingBalance: number
  color: string
  createdAt: string
}

export type TxType = 'income' | 'expense'

export interface BudgetTransaction {
  id: string
  accountId: string
  type: TxType
  amount: number
  categoryId: string
  note?: string
  date: string          // yyyy-MM-dd
  createdAt: string     // ISO
}

// ---- Budget goals ----
// 'savings' = bir hedefe doğru biriktirme (ilerleme = net varlık / hedef).
// 'limit'   = aylık harcama tavanı (opsiyonel kategori; aşılırsa uyarı).
export type BudgetGoalKind = 'savings' | 'limit'

export interface BudgetGoal {
  id: string
  kind: BudgetGoalKind
  name: string
  emoji: string
  targetAmount: number
  categoryId?: string   // sadece 'limit' için; boşsa tüm harcamalar
  color: string
  createdAt: string     // ISO
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
  | 'water_days'

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

export interface WeeklyReview {
  id: string
  weekStart: string  // YYYY-MM-DD (Monday)
  wentWell: string
  toImprove: string
  nextWeekGoal: string
  xpEarned: number
  createdAt: string
}

// Harika (Wonder): uzun vadeli gerçek bir hedef. İlgili tamamlamalar tuğla ekler;
// megastructure dolup büyür. Uzun ufku görünür kılar (DEHB için kritik).
export interface Wonder {
  id: string
  name: string
  emoji: string
  target: number
  habitId: string | null   // null = tüm tamamlamalar sayılır
  createdAt: string        // ISO (sayım bu tarihten itibaren)
}

export interface Routine {
  id: string
  name: string  // "Sabah Rutini" | "Akşam Rutini" | custom
  emoji: string
  habitIds: string[]  // ordered list of habit IDs in this routine
  createdAt: string
}

export type FutureLetterDelay = '1w' | '1m' | '3m'

export interface FutureLetter {
  id: string
  writtenAt: string   // ISO — when written
  unlockAt: string    // ISO — earliest readable date
  text: string
  opened: boolean
  openedAt?: string   // ISO
  context?: string    // optional short note: "7-gün seri", "Seviye 10" etc.
}

export interface StoreData {
  habits: Habit[]
  completions: Completion[]
  profile: UserProfile
  rewards: CustomReward[]
  moods: MoodLog[]
  energyLogs: EnergyLog[]
  medications: Medication[]
  medicationLog: MedicationDose[]
  focusSessions: FocusSession[]
  water: WaterLog[]
  budgetAccounts: BudgetAccount[]
  budgetTransactions: BudgetTransaction[]
  budgetGoals: BudgetGoal[]
  brainDump: BrainDumpItem[]
  freezeTokens: number                           // streak-freeze tokens on hand
  frozenDates: string[]                          // yyyy-MM-dd days protected from breaking streaks
  unlockedSkills: string[]                        // skill-tree node ids unlocked
  subtaskDone: Record<string, string[]>          // `${date}:${habitId}` -> done stepIds
  unlockedAchievements: Record<string, string>  // achievementId -> unlockedAt ISO
  unlockedTitles: Record<string, string>        // titleId -> unlockedAt ISO
  weeklyReviews: WeeklyReview[]
  routines: Routine[]
  savedQuotes: string[]  // quote texts that user saved
  claimedQuests: Record<string, string>  // questId -> claimedAt ISO (ödül bir kez alınır)
  wonders: Wonder[]  // uzun vadeli hedefler (megastructure)
  futureLetters: FutureLetter[]
}
