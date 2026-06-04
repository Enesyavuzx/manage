import type { StoreData, Habit } from './types'
import { WATER_GOAL } from './constants'
import { format } from 'date-fns'

// Görevler: kendi verinden otomatik üretilen, küçük ve net günlük/haftalık
// hedefler. Her görevin XP ödülü ve Diyar'da somut bir karşılığı var. DEHB için
// net hedef + görünür ilerleme + tamamlamada dopamin. Görev kimlikleri döneme
// (gün/hafta) sabitlenir; ilerleme veriden, ödül talebi claimedQuests'ten gelir.

export type QuestScope = 'daily' | 'weekly'

export interface Quest {
  id: string
  scope: QuestScope
  emoji: string
  title: string
  reward: string
  xp: number
  target: number
  progress: number
  done: boolean
  claimed: boolean
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 0)
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((now - start) / 86400000)
}

function mondayKey(now: Date): string {
  const d = new Date(now)
  const offset = (d.getDay() + 6) % 7 // Pazartesi = 0
  d.setDate(d.getDate() - offset)
  return format(d, 'yyyy-MM-dd')
}

function weekDates(now: Date): string[] {
  const d = new Date(now)
  const offset = (d.getDay() + 6) % 7
  d.setDate(d.getDate() - offset)
  const out: string[] = []
  for (let i = 0; i <= offset; i++) {
    out.push(format(d, 'yyyy-MM-dd'))
    d.setDate(d.getDate() + 1)
  }
  return out
}

function dueOn(habits: Habit[], date: Date): Habit[] {
  return habits.filter(h => h.frequency === 'daily' || (h.frequency as number[]).includes(date.getDay()))
}

// Tohumlu deterministik sıralama anahtarı.
function hash(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619) }
  return (h >>> 0) / 4294967295
}

interface Ctx {
  today: string
  dueTodayCount: number
  doneTodayCount: number
  focusToday: number
  moodToday: boolean
  waterToday: number
  weekCompletions: number
  weekFocus: number
  perfectDaysThisWeek: number
}

function buildCtx(data: StoreData, now: Date): Ctx {
  const today = format(now, 'yyyy-MM-dd')
  const active = data.habits.filter(h => !h.archived)
  const dueToday = dueOn(active, now)
  const doneSet = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
  const week = weekDates(now)
  const weekSet = new Set(week)

  let perfect = 0
  for (const date of week) {
    const d = new Date(date + 'T12:00:00')
    const due = dueOn(active, d)
    if (due.length === 0) continue
    const doneThat = new Set(data.completions.filter(c => c.date === date).map(c => c.habitId))
    if (due.every(h => doneThat.has(h.id))) perfect++
  }

  return {
    today,
    dueTodayCount: dueToday.length,
    doneTodayCount: dueToday.filter(h => doneSet.has(h.id)).length,
    focusToday: data.focusSessions.filter(f => f.completedAt.slice(0, 10) === today).length,
    moodToday: data.moods.some(m => m.date === today),
    waterToday: data.water.filter(w => w.date === today).length,
    weekCompletions: data.completions.filter(c => weekSet.has(c.date)).length,
    weekFocus: data.focusSessions.filter(f => weekSet.has(f.completedAt.slice(0, 10))).length,
    perfectDaysThisWeek: perfect,
  }
}

interface Template {
  key: string
  emoji: string
  title: (c: Ctx) => string
  reward: string
  xp: number
  target: (c: Ctx) => number
  progress: (c: Ctx) => number
}

const DAILY: Template[] = [
  { key: 'complete3', emoji: '✅', title: c => `${Math.min(3, c.dueTodayCount)} alışkanlık tamamla`, reward: 'Diyara yeni ağaç', xp: 40, target: c => Math.min(3, c.dueTodayCount), progress: c => c.doneTodayCount },
  { key: 'focus1', emoji: '🎯', title: () => 'Bir odak seansı yap', reward: 'Saat kulesine çan', xp: 30, target: () => 1, progress: c => c.focusToday },
  { key: 'mood', emoji: '🙂', title: () => 'Ruh halini kaydet', reward: 'Berrak gökyüzü', xp: 20, target: () => 1, progress: c => (c.moodToday ? 1 : 0) },
  { key: 'water', emoji: '💧', title: c => `Su iç (${Math.ceil(WATER_GOAL / 2)} bardak)`, reward: 'Nehir kabarır', xp: 25, target: () => Math.ceil(WATER_GOAL / 2), progress: c => Math.min(c.waterToday, Math.ceil(WATER_GOAL / 2)) },
  { key: 'perfect', emoji: '💠', title: () => 'Bugünü kusursuz bitir', reward: 'Havai fişek', xp: 60, target: c => c.dueTodayCount, progress: c => c.doneTodayCount },
]

const WEEKLY: Template[] = [
  { key: 'comp15', emoji: '🏗️', title: () => 'Bu hafta 15 tamamlama', reward: 'Diyar nüfusu coşar', xp: 80, target: () => 15, progress: c => c.weekCompletions },
  { key: 'focus3', emoji: '⏱️', title: () => 'Bu hafta 3 odak seansı', reward: 'Saat kulesi büyür', xp: 70, target: () => 3, progress: c => c.weekFocus },
  { key: 'perfect2', emoji: '🎆', title: () => '2 kusursuz gün geçir', reward: 'Festival ışıkları', xp: 90, target: () => 2, progress: c => c.perfectDaysThisWeek },
]

function pick(templates: Template[], ctx: Ctx, seed: string, n: number): Template[] {
  return templates
    .filter(t => t.target(ctx) > 0)
    .map(t => ({ t, k: hash(seed + t.key) }))
    .sort((a, b) => a.k - b.k)
    .slice(0, n)
    .map(x => x.t)
}

export function getQuests(data: StoreData, now: Date = new Date()): Quest[] {
  const ctx = buildCtx(data, now)
  const dKey = `${dayOfYear(now)}`
  const wKey = mondayKey(now)
  const claimed = data.claimedQuests ?? {}

  const make = (t: Template, scope: QuestScope, period: string): Quest => {
    const target = t.target(ctx)
    const progress = Math.min(target, t.progress(ctx))
    const id = `${scope === 'daily' ? 'd' : 'w'}:${period}:${t.key}`
    return {
      id, scope, emoji: t.emoji, title: t.title(ctx), reward: t.reward, xp: t.xp,
      target, progress, done: progress >= target, claimed: !!claimed[id],
    }
  }

  const daily = pick(DAILY, ctx, dKey, 3).map(t => make(t, 'daily', ctx.today))
  const weekly = pick(WEEKLY, ctx, wKey, 2).map(t => make(t, 'weekly', wKey))
  return [...daily, ...weekly]
}
