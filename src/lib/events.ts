import type { StoreData } from './types'
import { getStreak, getLongestStreak } from './store'
import { format } from 'date-fns'

// Diyar Olayları: süreli, veriye dayalı dünya olayları. Kayıp-kaçınma ve kutlama
// ile nazik aciliyet yaratır. Hepsi saf hesaplanır (offline). Olumlu olaylar
// kutlar, uyarı olayları somut bir eyleme yönlendirir.

export type EventTone = 'good' | 'warn' | 'info'
export type EventKind = 'festival' | 'victory' | 'drought' | 'storm' | 'fullmoon'

export interface RealmEvent {
  id: string
  kind: EventKind
  tone: EventTone
  emoji: string
  title: string
  desc: string
  actionLabel?: string
  href?: string
}

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 0)
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((now - start) / 86400000)
}

export function getRealmEvents(data: StoreData, now: Date = new Date()): RealmEvent[] {
  const today = format(now, 'yyyy-MM-dd')
  const yesterday = format(new Date(now.getTime() - 86400000), 'yyyy-MM-dd')
  const out: RealmEvent[] = []

  const active = data.habits.filter(h => !h.archived)
  const dueToday = active.filter(h => h.frequency === 'daily' || (h.frequency as number[]).includes(now.getDay()))
  const doneToday = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
  const perfectDay = dueToday.length > 0 && dueToday.every(h => doneToday.has(h.id))

  const damaged = active.filter(h => getLongestStreak(data.completions, h.id) >= 3 && getStreak(data.completions, h.id, data.frozenDates) === 0).length
  const waterToday = data.water.filter(w => w.date === today).length
  const waterYesterday = data.water.filter(w => w.date === yesterday).length
  const usesWater = data.water.length > 0

  // Fırtına: çok sayıda yıkık yapı (kopan seriler).
  if (damaged >= 2) {
    out.push({
      id: 'storm', kind: 'storm', tone: 'warn', emoji: '⛈️',
      title: 'Fırtına Sonrası',
      desc: `${damaged} ev yıkık. İlgili alışkanlıkları tamamla, diyarı onar.`,
      actionLabel: 'Diyarı onar', href: '/diyar',
    })
  }

  // Kuraklık: iki gündür hiç su yok.
  if (usesWater && waterToday === 0 && waterYesterday === 0) {
    out.push({
      id: 'drought', kind: 'drought', tone: 'warn', emoji: '🏜️',
      title: 'Kuraklık Tehlikesi',
      desc: 'İki gündür su içmedin, nehir kuruyor. Bugün bir bardak su iç.',
      actionLabel: 'Su ekle', href: '/',
    })
  }

  // Zafer Şenliği: bugün tüm işler bitti.
  if (perfectDay) {
    out.push({
      id: 'victory', kind: 'victory', tone: 'good', emoji: '🎆',
      title: 'Zafer Şenliği',
      desc: 'Bugünü kusursuz tamamladın! Diyar havai fişeklerle kutluyor.',
      actionLabel: 'Diyara git', href: '/diyar',
    })
  } else if (now.getDay() === 0 || now.getDay() === 6) {
    // Hafta sonu festivali.
    out.push({
      id: 'festival', kind: 'festival', tone: 'good', emoji: '🎪',
      title: 'Hafta Sonu Festivali',
      desc: 'Diyarda şenlik havası var. Bir alışkanlık tamamla, kutlamaya katıl.',
      actionLabel: 'Diyara git', href: '/diyar',
    })
  }

  // Dolunay: yaklaşık ayda bir, gece güzel görünür.
  if (dayOfYear(now) % 30 === 0) {
    out.push({
      id: 'fullmoon', kind: 'fullmoon', tone: 'info', emoji: '🌕',
      title: 'Dolunay',
      desc: 'Bu gece dolunay var; diyarın geceleri olağanüstü görünüyor.',
      actionLabel: 'Diyara git', href: '/diyar',
    })
  }

  const order: Record<EventTone, number> = { warn: 0, good: 1, info: 2 }
  out.sort((a, b) => order[a.tone] - order[b.tone])
  return out
}
