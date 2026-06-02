import type { Category, RewardTier, MoodLevel } from './types'

export const CATEGORY_META: Record<Category, { label: string; color: string; emoji: string }> = {
  health:       { label: 'Sağlık',      color: '#22c55e', emoji: '🩺' },
  productivity: { label: 'Üretkenlik',  color: '#8b5cf6', emoji: '⚡' },
  mindfulness:  { label: 'Zihin',       color: '#06b6d4', emoji: '🧘' },
  learning:     { label: 'Öğrenme',     color: '#f59e0b', emoji: '📚' },
  fitness:      { label: 'Fitness',     color: '#ef4444', emoji: '💪' },
  social:       { label: 'Sosyal',      color: '#ec4899', emoji: '🫂' },
  creativity:   { label: 'Yaratıcılık', color: '#a855f7', emoji: '🎨' },
  other:        { label: 'Diğer',       color: '#64748b', emoji: '✨' },
}

export const HABIT_COLORS = [
  '#8b5cf6', '#22c55e', '#ef4444', '#06b6d4',
  '#f59e0b', '#ec4899', '#10b981', '#6366f1',
  '#f97316', '#14b8a6', '#a855f7', '#3b82f6',
]

export const HABIT_EMOJIS = [
  '💧', '🏃', '📖', '🧘', '💪', '🥗', '😴', '✍️',
  '🎯', '🎨', '🎵', '💊', '🧠', '☀️', '🌿', '🚶',
  '🍎', '📝', '💻', '🎸', '🌅', '🏋️', '🚴', '📱',
  '🦷', '🧹', '💰', '📷', '🎮', '🌙', '☕', '🔥',
]

// ---- Reward tiers ----
export const REWARD_TIER_META: Record<RewardTier, { label: string; color: string; order: number }> = {
  small:     { label: 'Küçük Keyif',  color: '#22c55e', order: 0 },
  medium:    { label: 'Orta Ödül',    color: '#38bdf8', order: 1 },
  large:     { label: 'Büyük Ödül',   color: '#a855f7', order: 2 },
  legendary: { label: 'Efsanevi',     color: '#f59e0b', order: 3 },
  mythic:    { label: 'Mitik',        color: '#ec4899', order: 4 },
}

export const REWARD_TIER_ORDER: RewardTier[] = ['small', 'medium', 'large', 'legendary', 'mythic']

export const DEFAULT_REWARDS: {
  id: string; name: string; description: string; xpCost: number; emoji: string; tier: RewardTier
}[] = [
  // Küçük keyifler
  { id: 'r_coffee',   name: 'Kahve Molası',    description: 'Sevdiğin kahveyi yap',         xpCost: 150,  emoji: '☕', tier: 'small' },
  { id: 'r_social',   name: 'Sosyal Medya',    description: '20 dakika serbest tarama',      xpCost: 120,  emoji: '📱', tier: 'small' },
  { id: 'r_snack',    name: 'Atıştırmalık',    description: 'Küçük bir ikram',               xpCost: 200,  emoji: '🍪', tier: 'small' },
  { id: 'r_episode',  name: 'Bir Bölüm',       description: 'Dizinden tek bölüm izle',       xpCost: 250,  emoji: '📺', tier: 'small' },
  // Orta ödüller
  { id: 'r_movie',    name: 'Film Gecesi',     description: 'Suçluluk duymadan film izle',   xpCost: 400,  emoji: '🎬', tier: 'medium' },
  { id: 'r_game',     name: 'Oyun Seansı',     description: '2 saat oyun keyfi',             xpCost: 450,  emoji: '🎮', tier: 'medium' },
  { id: 'r_cafe',     name: 'Dışarıda Kahve',  description: 'Kafede mola',                   xpCost: 550,  emoji: '🧋', tier: 'medium' },
  { id: 'r_book',     name: 'Yeni Kitap',      description: 'İstediğin kitabı al',           xpCost: 650,  emoji: '📚', tier: 'medium' },
  // Büyük ödüller
  { id: 'r_meal',     name: 'Kaçamak Öğün',    description: 'Sevdiğin yemeğin tadını çıkar', xpCost: 800,  emoji: '🍕', tier: 'large' },
  { id: 'r_spa',      name: 'Bakım Günü',      description: 'Kendine spa/bakım ısmarla',     xpCost: 1100, emoji: '🛁', tier: 'large' },
  { id: 'r_ticket',   name: 'Sinema/Konser',   description: 'Bir etkinlik bileti',           xpCost: 1300, emoji: '🎟️', tier: 'large' },
  { id: 'r_shop',     name: 'Küçük Alışveriş',  description: 'İstediğin bir şeyi al',         xpCost: 1500, emoji: '🛍️', tier: 'large' },
  // Efsanevi
  { id: 'r_bigshop',  name: 'Büyük Alışveriş', description: 'Uzun süredir istediğin şey',    xpCost: 2200, emoji: '🛒', tier: 'legendary' },
  { id: 'r_restday',  name: 'Tatil Günü',      description: 'Bütün gün dinlen',              xpCost: 2800, emoji: '🏖️', tier: 'legendary' },
  { id: 'r_hobby',    name: 'Hobi Ekipmanı',   description: 'Hobine yatırım yap',            xpCost: 3200, emoji: '🎸', tier: 'legendary' },
  // Mitik
  { id: 'r_getaway',  name: 'Hafta Sonu Kaçamağı', description: 'Kısa bir gezi planla',     xpCost: 5500, emoji: '✈️', tier: 'mythic' },
  { id: 'r_grand',    name: 'Büyük Hedef Ödülü',   description: 'Kendine büyük bir hediye',  xpCost: 9000, emoji: '🏆', tier: 'mythic' },
]

// ---- Mood ----
export const MOOD_META: Record<MoodLevel, { label: string; emoji: string; color: string }> = {
  1: { label: 'Çok Kötü', emoji: '😣', color: '#ef4444' },
  2: { label: 'Kötü',     emoji: '🙁', color: '#f97316' },
  3: { label: 'İdare',    emoji: '😐', color: '#facc15' },
  4: { label: 'İyi',      emoji: '🙂', color: '#22c55e' },
  5: { label: 'Harika',   emoji: '😄', color: '#06b6d4' },
}

export const MOOD_XP = 15

// ---- Focus / Pomodoro ----
export const FOCUS_PRESETS = [15, 25, 45, 60]          // minutes
export const FOCUS_XP_PER_MIN = 1                       // XP per focused minute

// ---- Mystery box ----
export const MYSTERY_BOX_COST = 300

// ---- Water ----
export const WATER_GOAL = 8        // glasses per day
export const WATER_XP = 12         // XP when daily goal is reached
