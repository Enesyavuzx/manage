'use client'
import { useEffect, useRef } from 'react'
import { useStore } from '@/hooks/useStore'
import { isHabitDueToday, todayKey } from '@/lib/store'
import { format } from 'date-fns'

// Serverless reminders: while the app is open, fire a browser Notification
// when a habit's reminder time arrives and it is not yet completed today.
export function NotificationManager() {
  const { data, todayCompletedIds } = useStore()
  const notified = useRef<Set<string>>(new Set())
  const ref = useRef({ data, todayCompletedIds })
  ref.current = { data, todayCompletedIds }

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return
    const interval = setInterval(() => {
      const { data, todayCompletedIds } = ref.current
      if (!data.profile.notificationsEnabled) return
      if (Notification.permission !== 'granted') return
      const now = format(new Date(), 'HH:mm')
      const tkey = todayKey()
      for (const h of data.habits) {
        if (h.archived || !h.reminderTime) continue
        if (h.reminderTime !== now) continue
        if (!isHabitDueToday(h)) continue
        if (todayCompletedIds.has(h.id)) continue
        const key = `${tkey}:${h.id}`
        if (notified.current.has(key)) continue
        notified.current.add(key)
        try {
          new Notification(`${h.emoji} ${h.name}`, { body: 'Bu alışkanlığın vakti geldi!', tag: key })
        } catch { /* ignore */ }
      }
    }, 20000)
    return () => clearInterval(interval)
  }, [])

  return null
}
