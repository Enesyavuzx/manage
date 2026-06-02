'use client'

import React, { useState, useEffect, useCallback, useRef, createContext, useContext } from 'react'
import type { StoreData, Habit, CustomReward, ThemeName, MoodLevel, MoodLog, FocusSession } from '@/lib/types'
import {
  loadStore, saveStore, todayKey, isHabitDueToday,
  getStreak, evaluateAchievements,
} from '@/lib/store'
import { getLevelInfo, getRank, xpForDifficulty, streakBonus } from '@/lib/gamification'
import { ACHIEVEMENTS } from '@/lib/achievements'
import { TITLES } from '@/lib/achievements'
import { MOOD_META, MOOD_XP, FOCUS_XP_PER_MIN, MYSTERY_BOX_COST } from '@/lib/constants'
import { isSupabaseConfigured, cloudLoad, cloudSaveDebounced } from '@/lib/supabase'
import { generateId } from '@/lib/utils'

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
  addHabit: (h: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  archiveHabit: (id: string) => void
  unarchiveHabit: (id: string) => void
  deleteHabit: (id: string) => void
  addReward: (r: Omit<CustomReward, 'id'>) => void
  deleteReward: (id: string) => void
  redeemReward: (id: string) => boolean
  openMysteryBox: () => { reward: number; label: string } | null
  logMood: (level: MoodLevel, note?: string) => void
  addFocusSession: (minutes: number) => void
  setProfileName: (name: string) => void
  setActiveTitle: (id: string | null) => void
  setTheme: (t: ThemeName) => void
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

    const streak = getStreak(cur.completions, habitId)
    const base = xpForDifficulty(habit.difficulty)
    const bonus = Math.round(base * streakBonus(streak + 1))
    const xp = base + bonus

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

  const setProfileName = useCallback((name: string) => {
    setData(d => ({ ...d, profile: { ...d.profile, name } }))
  }, [])

  const setActiveTitle = useCallback((id: string | null) => {
    setData(d => ({ ...d, profile: { ...d.profile, activeTitleId: id } }))
  }, [])

  const setTheme = useCallback((t: ThemeName) => {
    setData(d => ({ ...d, profile: { ...d.profile, theme: t } }))
  }, [])

  const value: StoreContextType = {
    data, ready, cloud: isSupabaseConfigured,
    todayCompletedIds, habitsToday, notifications, dismissNotification,
    toggleHabit, addHabit, updateHabit, archiveHabit, unarchiveHabit, deleteHabit,
    addReward, deleteReward, redeemReward,
    openMysteryBox, logMood, addFocusSession,
    setProfileName, setActiveTitle, setTheme,
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
