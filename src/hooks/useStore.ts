'use client'

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import type { StoreData, Habit, CustomReward, ThemeName, MoodLevel, MoodLog, EnergyLog, Medication, MedicationDose, FocusSession, WaterLog, BudgetAccount, BudgetTransaction, TemplatePack, WeeklyReview, Routine } from '@/lib/types'
import {
  loadStore, saveStore, todayKey, isHabitDueToday, isHabitDueOnDate,
  getStreak, evaluateAchievements, subtaskKey,
} from '@/lib/store'
import { loginBonusXP, challengeForToday } from '@/lib/daily'
import { skillXpMultiplier, skillStreakBonus, canUnlockSkill, SKILL_TREE } from '@/lib/skills'
import { getLevelInfo, getRank, xpForDifficulty, streakBonus } from '@/lib/gamification'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { TITLES } from '@/lib/achievements'
import { MOOD_META, MOOD_XP, FOCUS_XP_PER_MIN, MYSTERY_BOX_COST, WATER_GOAL, WATER_XP } from '@/lib/constants'
import { isSupabaseConfigured, cloudLoad, cloudSaveDebounced } from '@/lib/supabase'
import { generateId } from '@/lib/utils'
import { format } from 'date-fns'

export interface GameNotification {
  id: string
  kind: 'xp' | 'levelup' | 'achievement' | 'title' | 'rank' | 'reward'
  title: string
  subtitle?: string
  emoji: string
}

interface StoreContextType {
  data: StoreData
  ready: boolean
  cloud: boolean
  todayCompletedIds: Set<string>
  habitsToday: Habit[]
  notifications: GameNotification[]
  dismissNotification: (id: string) => void
  toggleHabit: (habitId: string) => void
  toggleHabitOnDate: (habitId: string, dateKey: string) => void
  addHabit: (h: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void
  addTemplatePack: (pack: TemplatePack) => number
  updateHabit: (id: string, updates: Partial<Habit>) => void
  archiveHabit: (id: string) => void
  unarchiveHabit: (id: string) => void
  deleteHabit: (id: string) => void
  addReward: (r: Omit<CustomReward, 'id'>) => void
  deleteReward: (id: string) => void
  redeemReward: (id: string) => boolean
  openMysteryBox: () => { reward: number; label: string } | null
  logMood: (level: MoodLevel, note?: string) => void
  logEnergy: (level: MoodLevel) => void
  addMedication: (name: string, emoji: string, time?: string | null) => void
  deleteMedication: (id: string) => void
  toggleMedicationDose: (medId: string) => void
  addFocusSession: (minutes: number) => void
  addWater: () => void
  removeWater: () => void
  toggleSubtask: (habitId: string, stepId: string) => void
  setNotificationsEnabled: (enabled: boolean) => void
  setMorningReminder: (time: string | null) => void
  setEveningReminder: (time: string | null) => void
  addAccount: (a: Omit<BudgetAccount, 'id' | 'createdAt'>) => void
  deleteAccount: (id: string) => void
  addTransaction: (t: Omit<BudgetTransaction, 'id' | 'createdAt'>) => void
  deleteTransaction: (id: string) => void
  addBrainDumpItem: (text: string) => void
  toggleBrainDumpItem: (id: string) => void
  deleteBrainDumpItem: (id: string) => void
  clearDoneBrainDump: () => void
  claimDailyBonus: () => void
  claimChallenge: () => boolean
  completeOnboarding: () => void
  useFreezeToken: (date: string) => boolean
  reorderHabit: (id: string, direction: 'up' | 'down') => void
  unlockSkill: (id: string) => boolean
  setProfileName: (name: string) => void
  setActiveTitle: (id: string | null) => void
  setTheme: (t: ThemeName) => void
  saveWeeklyReview: (review: Omit<WeeklyReview, 'id' | 'xpEarned' | 'createdAt'>) => WeeklyReview
  saveRoutine: (routine: Omit<Routine, 'id' | 'createdAt'>) => void
  deleteRoutine: (id: string) => void
  reorderRoutineHabits: (routineId: string, habitIds: string[]) => void
  toggleSaveQuote: (text: string) => void
}

// Roll a weighted random Mystery Box outcome (slightly +EV vs cost to stay fun).
function rollMystery(): { reward: number; label: string } {
  const roll = Math.random()
  if (roll < 0.04) return { reward: 1500, label: 'JACKPOT!' }
  if (roll < 0.10) return { reward: 600,  label: 'Büyük vurgun' }
  if (roll < 0.30) return { reward: 380,  label: 'Güzel kâr' }
  if (roll < 0.60) return { reward: 280,  label: 'Ufak kâr' }
  return { reward: 150, label: 'Teselli ödülü' }
}

// Apply achievement unlocks + level/rank notifications onto a freshly built next state.
function withRewardsAndLevels(
  prev: StoreData,
  nextBase: StoreData,
  baseNotes: GameNotification[],
): { data: StoreData; notes: GameNotification[] } {
  const beforeLevel = getLevelInfo(prev.profile.totalXP).level
  const beforeRank = getRank(beforeLevel).rank.id
  let next = nextBase
  const notes = [...baseNotes]

  const { newAchievements, newTitles, bonusXP } = evaluateAchievements(next)
  if (newAchievements.length || newTitles.length) {
    const ua = { ...next.unlockedAchievements }
    const ut = { ...next.unlockedTitles }
    const now = new Date().toISOString()
    newAchievements.forEach(id => { ua[id] = now })
    newTitles.forEach(id => { ut[id] = now })
    next = {
      ...next,
      unlockedAchievements: ua,
      unlockedTitles: ut,
      profile: { ...next.profile, totalXP: next.profile.totalXP + bonusXP },
    }
    newAchievements.forEach(id => {
      const a = ACHIEVEMENTS.find(x => x.id === id)
      if (a) notes.push({ id: generateId(), kind: 'achievement', emoji: a.emoji, title: 'Başarım açıldı!', subtitle: `${a.name} · +${a.xpBonus} XP` })
    })
    newTitles.forEach(id => {
      const t = TITLES.find(x => x.id === id)
      if (t) notes.push({ id: generateId(), kind: 'title', emoji: t.emoji, title: 'Yeni ünvan!', subtitle: t.label })
    })
  }

  const afterLevel = getLevelInfo(next.profile.totalXP).level
  if (afterLevel > beforeLevel) {
    notes.push({ id: generateId(), kind: 'levelup', emoji: '🆙', title: `Seviye ${afterLevel}!`, subtitle: 'Yeni seviyeye ulaştın' })
    const afterRank = getRank(afterLevel).rank
    if (afterRank.id !== beforeRank) {
      notes.push({ id: generateId(), kind: 'rank', emoji: afterRank.emoji, title: 'Rütbe yükseldi!', subtitle: afterRank.label })
    }
  }

  return { data: next, notes }
}

const Ctx = createContext<StoreContextType | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StoreData>(() => loadStore())
  const [ready, setReady] = useState(false)
  const [notifications, setNotifications] = useState<GameNotification[]>([])
  const dataRef = useRef(data)
  dataRef.current = data

  // initial cloud hydration
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (isSupabaseConfigured) {
        const cloud = await cloudLoad()
        if (!cancelled && cloud) setData(prev => mergeRemote(prev, cloud))
      }
      if (!cancelled) setReady(true)
    })()
    return () => { cancelled = true }
  }, [])

  // persist on every change
  useEffect(() => {
    saveStore(data)
    cloudSaveDebounced(data)
  }, [data])

  // Update the daily-visit streak once per calendar day (first render of the day).
  // Every 7th consecutive day also grants a streak-freeze token.
  useEffect(() => {
    setData(d => {
      const today = todayKey()
      if (d.profile.lastLoginDate === today) return d
      const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')
      const streak = d.profile.lastLoginDate === yesterday ? (d.profile.loginStreak ?? 0) + 1 : 1
      const earnedToken = streak > 0 && streak % 7 === 0
      return {
        ...d,
        freezeTokens: d.freezeTokens + (earnedToken ? 1 : 0),
        profile: { ...d.profile, lastLoginDate: today, loginStreak: streak },
      }
    })
  }, [])

  const pushNotifications = useCallback((items: GameNotification[]) => {
    if (items.length === 0) return
    setNotifications(prev => [...prev, ...items])
    items.forEach(it => {
      setTimeout(() => {
        setNotifications(prev => prev.filter(n => n.id !== it.id))
      }, 4500)
    })
  }, [])

  const dismissNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }, [])

  const todayCompletedIds = new Set(
    data.completions.filter(c => c.date === todayKey()).map(c => c.habitId)
  )
  const habitsToday = data.habits.filter(isHabitDueToday)

  const toggleHabit = useCallback((habitId: string) => {
    const today = todayKey()
    const cur = dataRef.current
    const habit = cur.habits.find(h => h.id === habitId)
    if (!habit) return
    const already = cur.completions.some(c => c.habitId === habitId && c.date === today)

    if (already) {
      const comp = cur.completions.find(c => c.habitId === habitId && c.date === today)
      const xp = comp?.xpAwarded ?? xpForDifficulty(habit.difficulty)
      setData({
        ...cur,
        completions: cur.completions.filter(c => !(c.habitId === habitId && c.date === today)),
        profile: { ...cur.profile, totalXP: Math.max(0, cur.profile.totalXP - xp) },
      })
      return
    }

    const beforeLevel = getLevelInfo(cur.profile.totalXP).level
    const beforeRank = getRank(beforeLevel).rank.id

    const streak = getStreak(cur.completions, habitId, cur.frozenDates)
    const base = xpForDifficulty(habit.difficulty)
    const bonus = Math.round(base * (streakBonus(streak + 1) + skillStreakBonus(cur.unlockedSkills)))
    const xp = Math.round((base + bonus) * skillXpMultiplier(cur.unlockedSkills))

    const completion = {
      id: generateId(), habitId, date: today,
      completedAt: new Date().toISOString(), xpAwarded: xp,
    }
    let next: StoreData = {
      ...cur,
      completions: [...cur.completions, completion],
      profile: { ...cur.profile, totalXP: cur.profile.totalXP + xp },
    }

    const notes: GameNotification[] = [{
      id: generateId(), kind: 'xp', emoji: habit.emoji,
      title: `+${xp} XP`, subtitle: bonus > 0 ? `${habit.name} · +${bonus} streak bonusu` : habit.name,
    }]

    const { newAchievements, newTitles, bonusXP } = evaluateAchievements(next)
    if (newAchievements.length || newTitles.length) {
      const ua = { ...next.unlockedAchievements }
      const ut = { ...next.unlockedTitles }
      const now = new Date().toISOString()
      newAchievements.forEach(id => { ua[id] = now })
      newTitles.forEach(id => { ut[id] = now })
      next = {
        ...next,
        unlockedAchievements: ua,
        unlockedTitles: ut,
        profile: { ...next.profile, totalXP: next.profile.totalXP + bonusXP },
      }
      newAchievements.forEach(id => {
        const a = ACHIEVEMENTS.find(x => x.id === id)
        if (a) notes.push({ id: generateId(), kind: 'achievement', emoji: a.emoji, title: 'Başarım açıldı!', subtitle: `${a.name} · +${a.xpBonus} XP` })
      })
      newTitles.forEach(id => {
        const t = TITLES.find(x => x.id === id)
        if (t) notes.push({ id: generateId(), kind: 'title', emoji: t.emoji, title: 'Yeni ünvan!', subtitle: t.label })
      })
    }

    const afterLevel = getLevelInfo(next.profile.totalXP).level
    if (afterLevel > beforeLevel) {
      notes.push({ id: generateId(), kind: 'levelup', emoji: '🆙', title: `Seviye ${afterLevel}!`, subtitle: 'Yeni seviyeye ulaştın' })
      const afterRank = getRank(afterLevel).rank
      if (afterRank.id !== beforeRank) {
        notes.push({ id: generateId(), kind: 'rank', emoji: afterRank.emoji, title: 'Rütbe yükseldi!', subtitle: afterRank.label })
      }
    }

    setData(next)
    pushNotifications(notes)
  }, [pushNotifications])

  // Geçmiş bir günü işaretle/kaldır. Bugünden ileri tarihe, alışkanlığın
  // oluşturulmasından önceki tarihe veya o gün planlı olmadığı tarihe izin yok.
  // Geçmiş işaretlemede streak bonusu hesaplanmaz, sadece taban XP verilir
  // (geriye dönük seri bonusu suistimale açık olurdu).
  const toggleHabitOnDate = useCallback((habitId: string, dateKey: string) => {
    const cur = dataRef.current
    const today = todayKey()
    if (dateKey > today) return
    const habit = cur.habits.find(h => h.id === habitId)
    if (!habit) return
    const created = habit.createdAt.slice(0, 10)
    if (dateKey < created) return
    const dateObj = new Date(dateKey + 'T12:00:00')
    if (!isHabitDueOnDate(habit, dateObj)) return

    if (dateKey === today) { toggleHabit(habitId); return }

    const existing = cur.completions.find(c => c.habitId === habitId && c.date === dateKey)
    if (existing) {
      const xp = existing.xpAwarded ?? xpForDifficulty(habit.difficulty)
      setData({
        ...cur,
        completions: cur.completions.filter(c => !(c.habitId === habitId && c.date === dateKey)),
        profile: { ...cur.profile, totalXP: Math.max(0, cur.profile.totalXP - xp) },
      })
      return
    }

    const xp = xpForDifficulty(habit.difficulty)
    const completion = {
      id: generateId(), habitId, date: dateKey,
      completedAt: dateObj.toISOString(), xpAwarded: xp,
    }
    const base: StoreData = {
      ...cur,
      completions: [...cur.completions, completion],
      profile: { ...cur.profile, totalXP: cur.profile.totalXP + xp },
    }
    const baseNotes: GameNotification[] = [{
      id: generateId(), kind: 'xp', emoji: habit.emoji,
      title: `+${xp} XP`, subtitle: `${habit.name} · geçmiş gün işaretlendi`,
    }]
    const { data: next, notes } = withRewardsAndLevels(cur, base, baseNotes)
    setData(next)
    pushNotifications(notes)
  }, [toggleHabit, pushNotifications])

  const addHabit = useCallback((h: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
    const habit: Habit = { ...h, id: generateId(), createdAt: new Date().toISOString(), archived: false }
    setData(d => {
      const next = { ...d, habits: [...d.habits, habit] }
      const { newAchievements, newTitles, bonusXP } = evaluateAchievements(next)
      if (newAchievements.length) {
        const ua = { ...next.unlockedAchievements }, ut = { ...next.unlockedTitles }
        const now = new Date().toISOString()
        newAchievements.forEach(id => { ua[id] = now })
        newTitles.forEach(id => { ut[id] = now })
        return { ...next, unlockedAchievements: ua, unlockedTitles: ut, profile: { ...next.profile, totalXP: next.profile.totalXP + bonusXP } }
      }
      return next
    })
  }, [])

  // Add every habit in a template pack at once. Returns how many were added.
  const addTemplatePack = useCallback((pack: TemplatePack): number => {
    const now = new Date().toISOString()
    const newHabits: Habit[] = pack.habits.map(t => ({
      id: generateId(),
      name: t.name,
      description: t.description,
      category: t.category,
      difficulty: t.difficulty,
      frequency: 'daily',
      emoji: t.emoji,
      color: t.color,
      createdAt: now,
      archived: false,
      subtasks: t.steps?.map(text => ({ id: generateId(), text })) ?? [],
      reminderTime: null,
    }))
    setData(d => {
      const next = { ...d, habits: [...d.habits, ...newHabits] }
      const { newAchievements, newTitles, bonusXP } = evaluateAchievements(next)
      if (newAchievements.length) {
        const ua = { ...next.unlockedAchievements }, ut = { ...next.unlockedTitles }
        const ts = new Date().toISOString()
        newAchievements.forEach(id => { ua[id] = ts })
        newTitles.forEach(id => { ut[id] = ts })
        return { ...next, unlockedAchievements: ua, unlockedTitles: ut, profile: { ...next.profile, totalXP: next.profile.totalXP + bonusXP } }
      }
      return next
    })
    pushNotifications([{ id: generateId(), kind: 'reward', emoji: pack.emoji, title: `${pack.name} eklendi`, subtitle: `${newHabits.length} alışkanlık` }])
    return newHabits.length
  }, [pushNotifications])

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setData(d => ({ ...d, habits: d.habits.map(h => h.id === id ? { ...h, ...updates } : h) }))
  }, [])

  const archiveHabit = useCallback((id: string) => {
    setData(d => ({ ...d, habits: d.habits.map(h => h.id === id ? { ...h, archived: true } : h) }))
  }, [])

  const unarchiveHabit = useCallback((id: string) => {
    setData(d => ({ ...d, habits: d.habits.map(h => h.id === id ? { ...h, archived: false } : h) }))
  }, [])

  const deleteHabit = useCallback((id: string) => {
    setData(d => ({
      ...d,
      habits: d.habits.filter(h => h.id !== id),
      completions: d.completions.filter(c => c.habitId !== id),
    }))
  }, [])

  const addReward = useCallback((r: Omit<CustomReward, 'id'>) => {
    setData(d => ({ ...d, rewards: [...d.rewards, { ...r, id: generateId() }] }))
  }, [])

  const deleteReward = useCallback((id: string) => {
    setData(d => ({ ...d, rewards: d.rewards.filter(r => r.id !== id) }))
  }, [])

  const redeemReward = useCallback((id: string): boolean => {
    const cur = dataRef.current
    const reward = cur.rewards.find(r => r.id === id)
    if (!reward || reward.redeemedAt) return false
    const available = cur.profile.totalXP - cur.profile.redeemedXP
    if (available < reward.xpCost) return false
    let next: StoreData = {
      ...cur,
      rewards: cur.rewards.map(r => r.id === id ? { ...r, redeemedAt: new Date().toISOString() } : r),
      profile: { ...cur.profile, redeemedXP: cur.profile.redeemedXP + reward.xpCost },
    }
    const notes: GameNotification[] = [{ id: generateId(), kind: 'reward', emoji: reward.emoji, title: 'Ödül alındı!', subtitle: `${reward.name} · -${reward.xpCost} XP` }]
    const { newAchievements, newTitles, bonusXP } = evaluateAchievements(next)
    if (newAchievements.length) {
      const ua = { ...next.unlockedAchievements }, ut = { ...next.unlockedTitles }
      const now = new Date().toISOString()
      newAchievements.forEach(aid => { ua[aid] = now })
      newTitles.forEach(tid => { ut[tid] = now })
      next = { ...next, unlockedAchievements: ua, unlockedTitles: ut, profile: { ...next.profile, totalXP: next.profile.totalXP + bonusXP } }
      newAchievements.forEach(aid => {
        const a = ACHIEVEMENTS.find(x => x.id === aid)
        if (a) notes.push({ id: generateId(), kind: 'achievement', emoji: a.emoji, title: 'Başarım açıldı!', subtitle: `${a.name} · +${a.xpBonus} XP` })
      })
    }
    setData(next)
    pushNotifications(notes)
    return true
  }, [pushNotifications])

  const openMysteryBox = useCallback((): { reward: number; label: string } | null => {
    const cur = dataRef.current
    const available = cur.profile.totalXP - cur.profile.redeemedXP
    if (available < MYSTERY_BOX_COST) return null
    const outcome = rollMystery()
    const base: StoreData = {
      ...cur,
      profile: {
        ...cur.profile,
        redeemedXP: cur.profile.redeemedXP + MYSTERY_BOX_COST,
        totalXP: cur.profile.totalXP + outcome.reward,
      },
    }
    const baseNotes: GameNotification[] = [{
      id: generateId(), kind: 'reward', emoji: '🎁',
      title: outcome.label === 'JACKPOT!' ? '🎉 JACKPOT!' : 'Sürpriz Kutu!',
      subtitle: `${outcome.label} · +${outcome.reward} XP`,
    }]
    const { data: next, notes } = withRewardsAndLevels(cur, base, baseNotes)
    setData(next)
    pushNotifications(notes)
    return outcome
  }, [pushNotifications])

  const logMood = useCallback((level: MoodLevel, note?: string) => {
    const cur = dataRef.current
    const today = todayKey()
    const existing = cur.moods.find(m => m.date === today)
    const firstToday = !existing
    const xp = firstToday ? MOOD_XP : 0
    const entry: MoodLog = {
      id: existing?.id ?? generateId(),
      date: today, level, note,
      createdAt: new Date().toISOString(),
      xpAwarded: existing?.xpAwarded ?? xp,
    }
    const moods = existing
      ? cur.moods.map(m => m.date === today ? entry : m)
      : [...cur.moods, entry]
    const base: StoreData = { ...cur, moods, profile: { ...cur.profile, totalXP: cur.profile.totalXP + xp } }
    const baseNotes: GameNotification[] = [{
      id: generateId(), kind: 'xp', emoji: MOOD_META[level].emoji,
      title: firstToday ? `+${xp} XP` : 'Ruh hali güncellendi',
      subtitle: MOOD_META[level].label,
    }]
    const { data: next, notes } = withRewardsAndLevels(cur, base, baseNotes)
    setData(next)
    pushNotifications(notes)
  }, [pushNotifications])

  const addFocusSession = useCallback((minutes: number) => {
    const cur = dataRef.current
    const xp = Math.round(minutes * FOCUS_XP_PER_MIN)
    const session: FocusSession = {
      id: generateId(), minutes,
      completedAt: new Date().toISOString(), xpAwarded: xp,
    }
    const base: StoreData = {
      ...cur,
      focusSessions: [...cur.focusSessions, session],
      profile: { ...cur.profile, totalXP: cur.profile.totalXP + xp },
    }
    const baseNotes: GameNotification[] = [{
      id: generateId(), kind: 'xp', emoji: '🎯',
      title: `+${xp} XP`, subtitle: `${minutes} dk odak tamamlandı`,
    }]
    const { data: next, notes } = withRewardsAndLevels(cur, base, baseNotes)
    setData(next)
    pushNotifications(notes)
  }, [pushNotifications])

  const addWater = useCallback(() => {
    const cur = dataRef.current
    const today = todayKey()
    const before = cur.water.filter(w => w.date === today).length
    const crossed = before < WATER_GOAL && before + 1 >= WATER_GOAL
    const entry: WaterLog = { id: generateId(), date: today, createdAt: new Date().toISOString() }
    const base: StoreData = {
      ...cur,
      water: [...cur.water, entry],
      profile: { ...cur.profile, totalXP: cur.profile.totalXP + (crossed ? WATER_XP : 0) },
    }
    if (crossed) {
      const baseNotes: GameNotification[] = [{
        id: generateId(), kind: 'xp', emoji: '💧',
        title: `+${WATER_XP} XP`, subtitle: 'Günlük su hedefi tamam!',
      }]
      const { data: next, notes } = withRewardsAndLevels(cur, base, baseNotes)
      setData(next)
      pushNotifications(notes)
    } else {
      setData(base)
    }
  }, [pushNotifications])

  const removeWater = useCallback(() => {
    setData(d => {
      const today = todayKey()
      let realIdx = -1
      for (let i = d.water.length - 1; i >= 0; i--) {
        if (d.water[i].date === today) { realIdx = i; break }
      }
      if (realIdx === -1) return d
      return { ...d, water: d.water.filter((_, i) => i !== realIdx) }
    })
  }, [])

  const toggleSubtask = useCallback((habitId: string, stepId: string) => {
    setData(d => {
      const key = subtaskKey(todayKey(), habitId)
      const cur = d.subtaskDone[key] ?? []
      const next = cur.includes(stepId) ? cur.filter(s => s !== stepId) : [...cur, stepId]
      return { ...d, subtaskDone: { ...d.subtaskDone, [key]: next } }
    })
  }, [])

  const setNotificationsEnabled = useCallback((enabled: boolean) => {
    setData(d => ({ ...d, profile: { ...d.profile, notificationsEnabled: enabled } }))
  }, [])

  const setMorningReminder = useCallback((time: string | null) => {
    setData(d => ({ ...d, profile: { ...d.profile, morningReminderTime: time } }))
  }, [])

  const setEveningReminder = useCallback((time: string | null) => {
    setData(d => ({ ...d, profile: { ...d.profile, eveningReminderTime: time } }))
  }, [])

  const addAccount = useCallback((a: Omit<BudgetAccount, 'id' | 'createdAt'>) => {
    const account: BudgetAccount = { ...a, id: generateId(), createdAt: new Date().toISOString() }
    setData(d => ({ ...d, budgetAccounts: [...d.budgetAccounts, account] }))
  }, [])

  const deleteAccount = useCallback((id: string) => {
    setData(d => ({
      ...d,
      budgetAccounts: d.budgetAccounts.filter(a => a.id !== id),
      budgetTransactions: d.budgetTransactions.filter(t => t.accountId !== id),
    }))
  }, [])

  const addTransaction = useCallback((t: Omit<BudgetTransaction, 'id' | 'createdAt'>) => {
    const tx: BudgetTransaction = { ...t, id: generateId(), createdAt: new Date().toISOString() }
    setData(d => ({ ...d, budgetTransactions: [...d.budgetTransactions, tx] }))
  }, [])

  const deleteTransaction = useCallback((id: string) => {
    setData(d => ({ ...d, budgetTransactions: d.budgetTransactions.filter(t => t.id !== id) }))
  }, [])

  const logEnergy = useCallback((level: MoodLevel) => {
    setData(d => {
      const today = todayKey()
      const existing = d.energyLogs.find(e => e.date === today)
      const entry: EnergyLog = {
        id: existing?.id ?? generateId(),
        date: today, level,
        createdAt: new Date().toISOString(),
      }
      const energyLogs = existing
        ? d.energyLogs.map(e => e.date === today ? entry : e)
        : [...d.energyLogs, entry]
      return { ...d, energyLogs }
    })
  }, [])

  const addMedication = useCallback((name: string, emoji: string, time?: string | null) => {
    const n = name.trim()
    if (!n) return
    const med: Medication = { id: generateId(), name: n, emoji: emoji || '💊', time: time ?? null, createdAt: new Date().toISOString() }
    setData(d => ({ ...d, medications: [...d.medications, med] }))
  }, [])

  const deleteMedication = useCallback((id: string) => {
    setData(d => ({
      ...d,
      medications: d.medications.filter(m => m.id !== id),
      medicationLog: d.medicationLog.filter(dose => dose.medId !== id),
    }))
  }, [])

  const toggleMedicationDose = useCallback((medId: string) => {
    setData(d => {
      const today = todayKey()
      const taken = d.medicationLog.some(dose => dose.medId === medId && dose.date === today)
      const medicationLog = taken
        ? d.medicationLog.filter(dose => !(dose.medId === medId && dose.date === today))
        : [...d.medicationLog, { id: generateId(), medId, date: today, takenAt: new Date().toISOString() }]
      return { ...d, medicationLog }
    })
  }, [])

  const addBrainDumpItem = useCallback((text: string) => {
    const t = text.trim()
    if (!t) return
    setData(d => ({
      ...d,
      brainDump: [{ id: generateId(), text: t, done: false, createdAt: new Date().toISOString() }, ...d.brainDump],
    }))
  }, [])

  const toggleBrainDumpItem = useCallback((id: string) => {
    setData(d => ({ ...d, brainDump: d.brainDump.map(b => b.id === id ? { ...b, done: !b.done } : b) }))
  }, [])

  const deleteBrainDumpItem = useCallback((id: string) => {
    setData(d => ({ ...d, brainDump: d.brainDump.filter(b => b.id !== id) }))
  }, [])

  const clearDoneBrainDump = useCallback(() => {
    setData(d => ({ ...d, brainDump: d.brainDump.filter(b => !b.done) }))
  }, [])

  const claimDailyBonus = useCallback(() => {
    const cur = dataRef.current
    if (cur.profile.dailyClaimedDate === todayKey()) return
    const streak = cur.profile.loginStreak ?? 1
    const xp = loginBonusXP(streak)
    const base: StoreData = {
      ...cur,
      profile: { ...cur.profile, dailyClaimedDate: todayKey(), totalXP: cur.profile.totalXP + xp },
    }
    const baseNotes: GameNotification[] = [{
      id: generateId(), kind: 'reward', emoji: '🎁',
      title: `+${xp} XP`, subtitle: `${streak} günlük giriş serisi`,
    }]
    const { data: next, notes } = withRewardsAndLevels(cur, base, baseNotes)
    setData(next)
    pushNotifications(notes)
  }, [pushNotifications])

  const claimChallenge = useCallback((): boolean => {
    const cur = dataRef.current
    if (cur.profile.challengeClaimedDate === todayKey()) return false
    const ch = challengeForToday()
    if (ch.progress(cur) < ch.target) return false
    const base: StoreData = {
      ...cur,
      profile: { ...cur.profile, challengeClaimedDate: todayKey(), totalXP: cur.profile.totalXP + ch.xp },
    }
    const baseNotes: GameNotification[] = [{
      id: generateId(), kind: 'reward', emoji: ch.emoji,
      title: `+${ch.xp} XP`, subtitle: 'Günlük görev tamamlandı!',
    }]
    const { data: next, notes } = withRewardsAndLevels(cur, base, baseNotes)
    setData(next)
    pushNotifications(notes)
    return true
  }, [pushNotifications])

  const completeOnboarding = useCallback(() => {
    setData(d => ({ ...d, profile: { ...d.profile, onboarded: true } }))
  }, [])

  // Spend one freeze token to protect a given day from breaking streaks.
  const useFreezeToken = useCallback((date: string): boolean => {
    const cur = dataRef.current
    if (cur.freezeTokens <= 0 || cur.frozenDates.includes(date)) return false
    setData(d => ({
      ...d,
      freezeTokens: d.freezeTokens - 1,
      frozenDates: [...d.frozenDates, date],
    }))
    pushNotifications([{ id: generateId(), kind: 'reward', emoji: '🧊', title: 'Seri donduruldu', subtitle: 'O gün serini bozmayacak' }])
    return true
  }, [pushNotifications])

  const unlockSkill = useCallback((id: string): boolean => {
    const cur = dataRef.current
    const node = SKILL_TREE.find(n => n.id === id)
    if (!node) return false
    const level = getLevelInfo(cur.profile.totalXP).level
    if (!canUnlockSkill(node, level, cur.unlockedSkills)) return false
    setData(d => ({ ...d, unlockedSkills: [...d.unlockedSkills, id] }))
    pushNotifications([{ id: generateId(), kind: 'reward', emoji: node.emoji, title: 'Beceri açıldı!', subtitle: `${node.name} · ${node.description}` }])
    return true
  }, [pushNotifications])

  const reorderHabit = useCallback((id: string, direction: 'up' | 'down') => {
    setData(d => {
      const active = d.habits.filter(h => !h.archived)
      const idx = active.findIndex(h => h.id === id)
      if (idx === -1) return d
      const swap = direction === 'up' ? idx - 1 : idx + 1
      if (swap < 0 || swap >= active.length) return d
      const reordered = [...active]
      ;[reordered[idx], reordered[swap]] = [reordered[swap], reordered[idx]]
      // rebuild full list preserving archived habits at the end
      return { ...d, habits: [...reordered, ...d.habits.filter(h => h.archived)] }
    })
  }, [])

  const setProfileName = useCallback((name: string) => {
    setData(d => ({ ...d, profile: { ...d.profile, name } }))
  }, [])

  const setActiveTitle = useCallback((id: string | null) => {
    setData(d => ({ ...d, profile: { ...d.profile, activeTitleId: id } }))
  }, [])

  const setTheme = useCallback((t: ThemeName) => {
    setData(d => ({ ...d, profile: { ...d.profile, theme: t } }))
  }, [])

  const saveWeeklyReview = useCallback((review: Omit<WeeklyReview, 'id' | 'xpEarned' | 'createdAt'>): WeeklyReview => {
    const REVIEW_XP = 50
    const saved: WeeklyReview = {
      ...review,
      id: crypto.randomUUID(),
      xpEarned: REVIEW_XP,
      createdAt: new Date().toISOString(),
    }
    setData(d => ({
      ...d,
      weeklyReviews: [...d.weeklyReviews, saved],
      profile: { ...d.profile, totalXP: d.profile.totalXP + REVIEW_XP },
    }))
    pushNotifications([{ id: generateId(), kind: 'xp', emoji: '📋', title: `+${REVIEW_XP} XP`, subtitle: 'Haftalık retrospektif tamamlandı' }])
    return saved
  }, [pushNotifications])

  const saveRoutine = useCallback((routine: Omit<Routine, 'id' | 'createdAt'>) => {
    const newRoutine: Routine = {
      ...routine,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    }
    setData(d => ({ ...d, routines: [...d.routines, newRoutine] }))
  }, [])

  const deleteRoutine = useCallback((id: string) => {
    setData(d => ({ ...d, routines: d.routines.filter(r => r.id !== id) }))
  }, [])

  const reorderRoutineHabits = useCallback((routineId: string, habitIds: string[]) => {
    setData(d => ({
      ...d,
      routines: d.routines.map(r => r.id === routineId ? { ...r, habitIds } : r),
    }))
  }, [])

  const toggleSaveQuote = useCallback((text: string) => {
    setData(d => {
      const already = d.savedQuotes.includes(text)
      return {
        ...d,
        savedQuotes: already
          ? d.savedQuotes.filter(q => q !== text)
          : [...d.savedQuotes, text],
      }
    })
  }, [])

  const value: StoreContextType = {
    data, ready, cloud: isSupabaseConfigured,
    todayCompletedIds, habitsToday, notifications, dismissNotification,
    toggleHabit, toggleHabitOnDate, addHabit, addTemplatePack, updateHabit, archiveHabit, unarchiveHabit, deleteHabit,
    addReward, deleteReward, redeemReward,
    openMysteryBox, logMood, logEnergy, addMedication, deleteMedication, toggleMedicationDose, addFocusSession,
    addWater, removeWater, toggleSubtask, setNotificationsEnabled, setMorningReminder, setEveningReminder,
    addAccount, deleteAccount, addTransaction, deleteTransaction,
    addBrainDumpItem, toggleBrainDumpItem, deleteBrainDumpItem, clearDoneBrainDump,
    claimDailyBonus, claimChallenge, completeOnboarding,
    useFreezeToken, reorderHabit, unlockSkill,
    setProfileName, setActiveTitle, setTheme,
    saveWeeklyReview, saveRoutine, deleteRoutine, reorderRoutineHabits,
    toggleSaveQuote,
  }

  return React.createElement(Ctx.Provider, { value }, children)
}

// Remote wins for profile/xp if it has more progress; merge unlocks.
function mergeRemote(local: StoreData, remote: StoreData): StoreData {
  const remoteXP = remote.profile?.totalXP ?? 0
  const localXP = local.profile?.totalXP ?? 0
  const base = remoteXP >= localXP ? remote : local
  return {
    ...base,
    unlockedAchievements: { ...local.unlockedAchievements, ...remote.unlockedAchievements },
    unlockedTitles: { ...local.unlockedTitles, ...remote.unlockedTitles },
  }
}

export function useStore(): StoreContextType {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

export { getStreak }
