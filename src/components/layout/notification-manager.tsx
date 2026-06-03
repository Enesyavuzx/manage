'use client'
import { useEffect, useRef } from 'react'
import { useStore } from '@/hooks/useStore'
import { isHabitDueToday, todayKey } from '@/lib/store'
import { format } from 'date-fns'

// Dakika cinsinden fark hesapla (aynı gün içinde)
function minuteDiff(a: string, b: string): number {
  const [ah, am] = a.split(':').map(Number)
  const [bh, bm] = b.split(':').map(Number)
  return (ah * 60 + am) - (bh * 60 + bm)
}

// Bildirimi güvenli gönder
function fireNotif(title: string, body: string, tag: string) {
  try { new Notification(title, { body, tag }) } catch { /* ignore */ }
}

export function NotificationManager() {
  const { data, todayCompletedIds } = useStore()
  const notified = useRef<Set<string>>(new Set())
  const ref = useRef({ data, todayCompletedIds })
  ref.current = { data, todayCompletedIds }

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    // 30 saniye interval. Tarayıcı arka planda tick'leri geciktirebilir;
    // bu yüzden reminderTime eşleşmesi strict dakika yerine 0-2 dakika
    // penceresi kullanır. notified Set'i aynı gün içinde tekrar gönderimi önler.
    const interval = setInterval(() => {
      const { data, todayCompletedIds } = ref.current
      if (!data.profile.notificationsEnabled) return
      if (Notification.permission !== 'granted') return

      const now = format(new Date(), 'HH:mm')
      const tkey = todayKey()
      const totalHabits = data.habits.filter(h => !h.archived && isHabitDueToday(h))

      // --- Alışkanlık bazlı hatırlatıcılar ---
      for (const h of data.habits) {
        if (h.archived || !h.reminderTime) continue
        if (!isHabitDueToday(h)) continue
        if (todayCompletedIds.has(h.id)) continue
        const diff = minuteDiff(now, h.reminderTime)
        if (diff < 0 || diff > 2) continue  // 0-2 dk pencere
        const key = `habit:${tkey}:${h.id}`
        if (notified.current.has(key)) continue
        notified.current.add(key)
        fireNotif(`${h.emoji} ${h.name}`, 'Bu alışkanlığın vakti geldi!', key)
      }

      // --- Sabah özeti ---
      const morningTime = data.profile.morningReminderTime
      if (morningTime) {
        const mKey = `morning:${tkey}`
        const diff = minuteDiff(now, morningTime)
        if (diff >= 0 && diff <= 2 && !notified.current.has(mKey)) {
          notified.current.add(mKey)
          const count = totalHabits.length
          fireNotif('Günaydın!', `Bugün ${count} alışkanlığın var. Başarılar!`, mKey)
        }
      }

      // --- Akşam özeti ---
      const eveningTime = data.profile.eveningReminderTime
      if (eveningTime) {
        const eKey = `evening:${tkey}`
        const diff = minuteDiff(now, eveningTime)
        if (diff >= 0 && diff <= 2 && !notified.current.has(eKey)) {
          notified.current.add(eKey)
          const done = todayCompletedIds.size
          const total = totalHabits.length
          const msg = done >= total
            ? `Mükemmel! Bugün ${done}/${total} alışkanlığı tamamladın.`
            : `Bugün ${done}/${total} alışkanlık tamamlandı. Yarın da devam!`
          fireNotif('Günlük özet', msg, eKey)
        }
      }
    }, 30000)

    return () => clearInterval(interval)
  }, [])

  return null
}
