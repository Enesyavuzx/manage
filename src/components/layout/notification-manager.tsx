'use client'
import { useEffect, useRef } from 'react'
import { useStore } from '@/hooks/useStore'
import { isHabitDueToday, todayKey } from '@/lib/store'
import { hasNotified, markNotified, pruneNotified, showAppNotification } from '@/lib/notify'
import { format } from 'date-fns'

// Dakika cinsinden fark (aynı gün içinde, negatif = saat henüz gelmedi)
function minuteDiff(now: string, target: string): number {
  const [nh, nm] = now.split(':').map(Number)
  const [th, tm] = target.split(':').map(Number)
  return (nh * 60 + nm) - (th * 60 + tm)
}

export function NotificationManager() {
  const { data, todayCompletedIds } = useStore()
  const ref = useRef({ data, todayCompletedIds })
  ref.current = { data, todayCompletedIds }

  useEffect(() => {
    if (typeof window === 'undefined' || !('Notification' in window)) return

    // Saat eşleşmesi 0-2 dakikalık pencere kullanır: tarayıcı arka planda
    // tick'leri geciktirebilir, ayrıca uygulamaya geri dönüldüğünde (visibility)
    // yeniden kontrol edilir. Kalıcı "gönderildi" seti aynı gün tekrarını önler.
    function check() {
      const { data, todayCompletedIds } = ref.current
      if (!data.profile.notificationsEnabled) return
      if (Notification.permission !== 'granted') return

      const now = format(new Date(), 'HH:mm')
      const tkey = todayKey()
      const dueHabits = data.habits.filter(h => !h.archived && isHabitDueToday(h))

      // --- Alışkanlık bazlı hatırlatıcılar ---
      for (const h of data.habits) {
        if (h.archived || !h.reminderTime || !isHabitDueToday(h)) continue
        if (todayCompletedIds.has(h.id)) continue
        const diff = minuteDiff(now, h.reminderTime)
        if (diff < 0 || diff > 2) continue
        const id = `habit:${h.id}`
        if (hasNotified(tkey, id)) continue
        markNotified(tkey, id)
        void showAppNotification(`${h.emoji} ${h.name}`, 'Bu alışkanlığın vakti geldi!', `${tkey}:${id}`)
      }

      // --- Sabah özeti ---
      const morning = data.profile.morningReminderTime
      if (morning) {
        const diff = minuteDiff(now, morning)
        const id = 'morning'
        if (diff >= 0 && diff <= 2 && !hasNotified(tkey, id)) {
          markNotified(tkey, id)
          void showAppNotification('Günaydın!', `Bugün ${dueHabits.length} alışkanlığın var. Başarılar!`, `${tkey}:${id}`)
        }
      }

      // --- Akşam özeti ---
      const evening = data.profile.eveningReminderTime
      if (evening) {
        const diff = minuteDiff(now, evening)
        const id = 'evening'
        if (diff >= 0 && diff <= 2 && !hasNotified(tkey, id)) {
          markNotified(tkey, id)
          const done = todayCompletedIds.size
          const total = dueHabits.length
          const msg = total > 0 && done >= total
            ? `Mükemmel! Bugün ${done}/${total} alışkanlığı tamamladın.`
            : `Bugün ${done}/${total} alışkanlık tamamlandı. Yarın da devam!`
          void showAppNotification('Günlük özet', msg, `${tkey}:${id}`)
        }
      }
    }

    pruneNotified(todayKey())
    check()
    const interval = setInterval(check, 30000)

    function onVisible() {
      if (document.visibilityState === 'visible') check()
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      clearInterval(interval)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  return null
}
