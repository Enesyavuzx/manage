'use client'

import { useState, useEffect, useCallback, createContext, useContext } from 'react'
import type { StoreData, Habit, CustomReward, Achievement } from '@/lib/types'
import {
  loadStore, saveStore, todayKey,
  isHabitDueToday, getStreak, checkAchievements,
} from '@/lib/store'
import { generateId } from '@/lib/utils'
import React from 'react'

interface StoreContext {
  data: StoreData
  todayCompletedIds: Set<string>
  toggleHabit: (habitId: string) => Achievement[]
  addHabit: (h: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => void
  updateHabit: (id: string, updates: Partial<Habit>) => void
  archiveHabit: (id: string) => void
  deleteReward: (id: string) => void
  addReward: (r: Omit<CustomReward, 'id'>) => void
  redeemReward: (id: string) => boolean
  updateProfileName: (name: string) => void
  habitsToday: Habit[]
}

const Ctx = createContext<StoreContext | null>(null)

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [data, setData] = useState<StoreData>(() => loadStore())

  useEffect(() => {
    saveStore(data)
  }, [data])

  const todayCompletedIds = new Set(
    data.completions.filter(c => c.date === todayKey()).map(c => c.habitId)
  )

  const habitsToday = data.habits.filter(isHabitDueToday)

  const toggleHabit = useCallback((habitId: string): Achievement[] => {
    const today = todayKey()
    const alreadyDone = data.completions.some(c => c.habitId === habitId && c.date === today)

    let newData: StoreData
    if (alreadyDone) {
      newData = {
        ...data,
        completions: data.completions.filter(c => !(c.habitId === habitId && c.date === today)),
        profile: {
          ...data.profile,
          totalXP: Math.max(0, data.profile.totalXP - (data.habits.find(h => h.id === habitId)?.xpReward ?? 0)),
        },
      }
      setData(newData)
      return []
    } else {
      const habit = data.habits.find(h => h.id === habitId)
      if (!habit) return []

      const completion = {
        id: generateId(),
        habitId,
        date: today,
        completedAt: new Date().toISOString(),
      }

      const newCompletions = [...data.completions, completion]
      const newDataWithCompletion: StoreData = {
        ...data,
        completions: newCompletions,
        profile: { ...data.profile, totalXP: data.profile.totalXP + habit.xpReward },
      }

      const { data: checkedData, unlocked } = checkAchievements(newDataWithCompletion, newCompletions)
      setData(checkedData)
      return unlocked
    }
  }, [data])

  const addHabit = useCallback((h: Omit<Habit, 'id' | 'createdAt' | 'archived'>) => {
    const habit: Habit = { ...h, id: generateId(), createdAt: new Date().toISOString(), archived: false }
    setData(d => ({ ...d, habits: [...d.habits, habit] }))
  }, [])

  const updateHabit = useCallback((id: string, updates: Partial<Habit>) => {
    setData(d => ({
      ...d,
      habits: d.habits.map(h => h.id === id ? { ...h, ...updates } : h),
    }))
  }, [])

  const archiveHabit = useCallback((id: string) => {
    setData(d => ({
      ...d,
      habits: d.habits.map(h => h.id === id ? { ...h, archived: true } : h),
    }))
  }, [])

  const addReward = useCallback((r: Omit<CustomReward, 'id'>) => {
    setData(d => ({ ...d, rewards: [...d.rewards, { ...r, id: generateId() }] }))
  }, [])

  const deleteReward = useCallback((id: string) => {
    setData(d => ({ ...d, rewards: d.rewards.filter(r => r.id !== id) }))
  }, [])

  const redeemReward = useCallback((id: string): boolean => {
    const reward = data.rewards.find(r => r.id === id)
    if (!reward || reward.redeemedAt) return false
    const available = data.profile.totalXP - data.profile.redeemedXP
    if (available < reward.xpCost) return false
    setData(d => ({
      ...d,
      rewards: d.rewards.map(r => r.id === id ? { ...r, redeemedAt: new Date().toISOString() } : r),
      profile: { ...d.profile, redeemedXP: d.profile.redeemedXP + reward.xpCost },
    }))
    return true
  }, [data])

  const updateProfileName = useCallback((name: string) => {
    setData(d => ({ ...d, profile: { ...d.profile, name } }))
  }, [])

  return React.createElement(Ctx.Provider, {
    value: {
      data, todayCompletedIds, toggleHabit, addHabit, updateHabit,
      archiveHabit, deleteReward, addReward, redeemReward,
      updateProfileName, habitsToday,
    },
  }, children)
}

export function useStore(): StoreContext {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useStore must be used inside StoreProvider')
  return ctx
}

export { getStreak }
