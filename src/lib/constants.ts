import type { Achievement, Category } from './types'

export const CATEGORY_META: Record<Category, { label: string; color: string; emoji: string }> = {
  health:        { label: 'Health',        color: '#16a34a', emoji: '🩺' },
  productivity:  { label: 'Productivity',  color: '#7c3aed', emoji: '⚡' },
  mindfulness:   { label: 'Mindfulness',   color: '#0891b2', emoji: '🧘' },
  learning:      { label: 'Learning',      color: '#d97706', emoji: '📚' },
  fitness:       { label: 'Fitness',       color: '#dc2626', emoji: '💪' },
  other:         { label: 'Other',         color: '#6b7280', emoji: '✨' },
}

export const HABIT_COLORS = [
  '#7c3aed', '#16a34a', '#dc2626', '#0891b2',
  '#d97706', '#db2777', '#059669', '#4f46e5',
]

export const HABIT_EMOJIS = [
  '💧', '🏃', '📖', '🧘', '💪', '🥗', '😴', '✍️',
  '🎯', '🎨', '🎵', '💊', '🧠', '☀️', '🌿', '🚶',
  '🍎', '🧘', '📝', '💻', '🎸', '🌅', '🏋️', '🚴',
]

export const XP_PER_LEVEL = 500

export function getLevel(xp: number): { level: number; progress: number; xpInLevel: number; xpNeeded: number } {
  const level = Math.floor(xp / XP_PER_LEVEL) + 1
  const xpInLevel = xp % XP_PER_LEVEL
  const xpNeeded = XP_PER_LEVEL
  const progress = xpInLevel / xpNeeded
  return { level, progress, xpInLevel, xpNeeded }
}

export const DEFAULT_ACHIEVEMENTS: Achievement[] = [
  {
    id: 'first_step',
    name: 'First Step',
    description: 'Complete your first habit',
    emoji: '👣',
    xpBonus: 50,
    requirement: { type: 'total_completions', value: 1 },
  },
  {
    id: 'week_warrior',
    name: 'Week Warrior',
    description: 'Complete 7 days in a row',
    emoji: '🔥',
    xpBonus: 200,
    requirement: { type: 'streak', value: 7 },
  },
  {
    id: 'month_master',
    name: 'Month Master',
    description: 'Complete 30 days in a row',
    emoji: '🏆',
    xpBonus: 1000,
    requirement: { type: 'streak', value: 30 },
  },
  {
    id: 'centurion',
    name: 'Centurion',
    description: 'Complete 100 habits total',
    emoji: '💯',
    xpBonus: 500,
    requirement: { type: 'total_completions', value: 100 },
  },
  {
    id: 'xp_collector',
    name: 'XP Collector',
    description: 'Earn 1000 XP',
    emoji: '⭐',
    xpBonus: 100,
    requirement: { type: 'xp_earned', value: 1000 },
  },
  {
    id: 'habit_builder',
    name: 'Habit Builder',
    description: 'Create 5 habits',
    emoji: '🏗️',
    xpBonus: 150,
    requirement: { type: 'habits_created', value: 5 },
  },
  {
    id: 'streak_10',
    name: 'On Fire',
    description: '10-day streak',
    emoji: '🌟',
    xpBonus: 300,
    requirement: { type: 'streak', value: 10 },
  },
  {
    id: 'completions_50',
    name: 'Half Century',
    description: 'Complete 50 habits',
    emoji: '🎖️',
    xpBonus: 250,
    requirement: { type: 'total_completions', value: 50 },
  },
]

export const DEFAULT_REWARDS = [
  { id: 'r1', name: 'Movie Night',    description: 'Watch a movie guilt-free',  xpCost: 300,  emoji: '🎬' },
  { id: 'r2', name: 'Cheat Meal',     description: 'Enjoy your favorite food',  xpCost: 500,  emoji: '🍕' },
  { id: 'r3', name: 'Gaming Session', description: '2 hours of gaming',         xpCost: 400,  emoji: '🎮' },
  { id: 'r4', name: 'Spa Day',        description: 'Treat yourself to a spa',   xpCost: 1000, emoji: '🛁' },
  { id: 'r5', name: 'Shopping Trip',  description: 'Buy something you want',    xpCost: 1500, emoji: '🛍️' },
]
