import type { Category } from './types'

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

export const DEFAULT_REWARDS = [
  { id: 'r1', name: 'Film Gecesi',     description: 'Suçluluk duymadan film izle', xpCost: 300,  emoji: '🎬' },
  { id: 'r2', name: 'Kaçamak Öğün',    description: 'Sevdiğin yemeğin tadını çıkar', xpCost: 500,  emoji: '🍕' },
  { id: 'r3', name: 'Oyun Seansı',     description: '2 saat oyun keyfi', xpCost: 400,  emoji: '🎮' },
  { id: 'r4', name: 'Spa Günü',        description: 'Kendine spa ısmarla', xpCost: 1000, emoji: '🛁' },
  { id: 'r5', name: 'Alışveriş',       description: 'İstediğin bir şeyi al', xpCost: 1500, emoji: '🛍️' },
  { id: 'r6', name: 'Tatil Günü',      description: 'Bütün gün dinlen', xpCost: 2500, emoji: '🏖️' },
]
