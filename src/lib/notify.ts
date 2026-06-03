// Bildirim yardımcıları. iOS PWA'da `new Notification()` desteklenmez;
// service worker registration üzerinden showNotification kullanılır.
// "gönderildi" durumu localStorage'da gün bazlı tutulur ki sayfa yenilense
// bile aynı hatırlatıcı aynı gün ikinci kez gönderilmesin.

const NOTIF_PREFIX = 'manage_notified_'

function notifKey(dateKey: string): string {
  return NOTIF_PREFIX + dateKey
}

export function hasNotified(dateKey: string, id: string): boolean {
  if (typeof localStorage === 'undefined') return false
  try {
    const raw = localStorage.getItem(notifKey(dateKey))
    if (!raw) return false
    return (JSON.parse(raw) as string[]).includes(id)
  } catch {
    return false
  }
}

export function markNotified(dateKey: string, id: string): void {
  if (typeof localStorage === 'undefined') return
  try {
    const k = notifKey(dateKey)
    const raw = localStorage.getItem(k)
    const arr = raw ? (JSON.parse(raw) as string[]) : []
    if (!arr.includes(id)) {
      arr.push(id)
      localStorage.setItem(k, JSON.stringify(arr))
    }
  } catch {
    /* ignore */
  }
}

// Bugün dışındaki eski "gönderildi" kayıtlarını temizle.
export function pruneNotified(currentDateKey: string): void {
  if (typeof localStorage === 'undefined') return
  try {
    const keep = notifKey(currentDateKey)
    const toRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(NOTIF_PREFIX) && key !== keep) toRemove.push(key)
    }
    toRemove.forEach(k => localStorage.removeItem(k))
  } catch {
    /* ignore */
  }
}

export async function showAppNotification(title: string, body: string, tag: string): Promise<void> {
  if (typeof window === 'undefined' || !('Notification' in window)) return
  if (Notification.permission !== 'granted') return

  const options: NotificationOptions = {
    body,
    tag,
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  }

  // iOS PWA dahil her yerde çalışması için önce service worker yolu denenir.
  if ('serviceWorker' in navigator) {
    try {
      const reg = await navigator.serviceWorker.ready
      await reg.showNotification(title, options)
      return
    } catch {
      /* SW yoksa aşağıdaki fallback'e düşer */
    }
  }

  try {
    new Notification(title, options)
  } catch {
    /* ignore */
  }
}

// ─── Native (Capacitor) köprüsü ────────────────────────────────────────────────
// Web bundle'a yeni paket eklemeden, yalnızca native WebView içinde enjekte edilen
// global `window.Capacitor` üzerinden LocalNotifications plugin'ine erişilir.
// Bu sayede uygulama TAMAMEN KAPALIYKEN bile OS zamanlı bildirim gönderir.
// Web'de `window.Capacitor` tanımsızdır; tüm fonksiyonlar sessizce no-op olur.

interface NativeScheduleNotif {
  id: number
  title: string
  body: string
  schedule?: { on?: { hour: number; minute: number }; allowWhileIdle?: boolean }
}

interface LocalNotificationsPlugin {
  requestPermissions: () => Promise<unknown>
  schedule: (opts: { notifications: NativeScheduleNotif[] }) => Promise<unknown>
  cancel: (opts: { notifications: { id: number }[] }) => Promise<unknown>
  getPending: () => Promise<{ notifications: { id: number }[] }>
}

interface CapacitorGlobal {
  isNativePlatform?: () => boolean
  Plugins?: { LocalNotifications?: LocalNotificationsPlugin }
}

function getCapacitor(): CapacitorGlobal | undefined {
  if (typeof window === 'undefined') return undefined
  return (window as unknown as { Capacitor?: CapacitorGlobal }).Capacitor
}

export function isNativePlatform(): boolean {
  return !!getCapacitor()?.isNativePlatform?.()
}

export interface NativeReminder {
  id: number
  title: string
  body: string
  hour: number
  minute: number
}

// Tüm günlük hatırlatıcıları native tarafta yeniden zamanlar (eskileri iptal eder).
// Native değilse veya plugin yoksa false döner; web akışı (interval) devreye girer.
export async function syncNativeReminders(items: NativeReminder[]): Promise<boolean> {
  const ln = getCapacitor()?.Plugins?.LocalNotifications
  if (!ln) return false
  try {
    await ln.requestPermissions()
    const pending = await ln.getPending()
    if (pending.notifications.length > 0) {
      await ln.cancel({ notifications: pending.notifications.map(n => ({ id: n.id })) })
    }
    if (items.length > 0) {
      await ln.schedule({
        notifications: items.map(it => ({
          id: it.id,
          title: it.title,
          body: it.body,
          schedule: { on: { hour: it.hour, minute: it.minute }, allowWhileIdle: true },
        })),
      })
    }
    return true
  } catch {
    return false
  }
}
