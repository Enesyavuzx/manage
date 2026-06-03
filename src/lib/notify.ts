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
