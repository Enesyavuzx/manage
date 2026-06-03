'use client'
import { useEffect, useRef } from 'react'
import { useStore } from '@/hooks/useStore'
import { isHabitDueToday, todayKey } from '@/lib/store'
import { hasNotified, markNotified, pruneNotified, showAppNotification, isNativePlatform, syncNativeReminders, type NativeReminder } from '@/lib/notify'
import { format } from 'date-fns'

// Dakika cinsinden fark (aynı gün içinde, negatif = saat henüz gelmedi)
function minuteDiff(now: string, target: string): number {
  const [nh, nm] = now.split(':').map(Number)
  const [th, tm] = target.split(':').map(Number)
  return (nh * 60 + nm) - (th * 60 + tm)
}

// "HH:mm" -> { hour, minute }
function parseTime(t: string): { hour: number; minute: number } {
  const [h, m] = t.split(':').map(Number)
  return { hour: h, minute: m }
}

// Habit id'sinden kararlı pozitif sayı (native notification id'si için)
function numericId(seed: string): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) & 0x7fffffff
  return h % 2000000 + 1000
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

  // Native (Capacitor) platformda: hatırlatıcıları OS'a kaydet. Bu sayede uygulama
  // tamamen kapalıyken de bildirim gelir. Web'de bu effect no-op'tur.
  // İlgili alanlar değişince yeniden zamanlanır.
  const reminderSignature = JSON.stringify({
    enabled: data.profile.notificationsEnabled,
    morning: data.profile.morningReminderTime,
    evening: data.profile.eveningReminderTime,
    habits: data.habits.filter(h => !h.archived && h.reminderTime).map(h => [h.id, h.name, h.emoji, h.reminderTime]),
  })

  useEffect(() => {
    if (!isNativePlatform()) return
    if (!data.profile.notificationsEnabled) {
      void syncNativeReminders([])
      return
    }
    const items: NativeReminder[] = []
    for (const h of data.habits) {
      if (h.archived || !h.reminderTime) continue
      const { hour, minute } = parseTime(h.reminderTime)
      items.push({ id: numericId(h.id), title: `${h.emoji} ${h.name}`, body: 'Bu alışkanlığın vakti geldi!', hour, minute })
    }
    if (data.profile.morningReminderTime) {
      const { hour, minute } = parseTime(data.profile.morningReminderTime)
      items.push({ id: 900001, title: 'Günaydın!', body: 'Bugünün alışkanlıklarına göz at.', hour, minute })
    }
    if (data.profile.eveningReminderTime) {
      const { hour, minute } = parseTime(data.profile.eveningReminderTime)
      items.push({ id: 900002, title: 'Günlük özet', body: 'Bugün nasıl gitti? Eksik kalanları işaretle.', hour, minute })
    }
    void syncNativeReminders(items)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reminderSignature])

  return null
}
