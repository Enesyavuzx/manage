import type { StoreData } from './types'
import { getStreak } from './store'
import { WATER_GOAL } from './constants'
import { format } from 'date-fns'

// Filozof danışman: "Şimdi ne yapmalıyım?" sorusunu veriye dayalı yanıtlar.
// Öneri sıralaması tamamen senin geçmişinden hesaplanır (offline, AI yok);
// filozof yalnızca öğüdü kendi sesiyle çerçeveler. DEHB'de en büyük engel
// karar felcidir; bu modül tek ve net bir sonraki adımı gösterir.

export interface Philosopher {
  id: string
  name: string
  emoji: string
  era: string
  lines: string[]
}

export const PHILOSOPHERS: Philosopher[] = [
  {
    id: 'aristoteles', name: 'Aristoteles', emoji: '🦉', era: 'Antik Yunan',
    lines: [
      'Biz tekrar ettiğimiz şeyiz; mükemmellik bir eylem değil, alışkanlıktır.',
      'İyi bir başlangıç, işin yarısıdır.',
      'Mutluluk, kendimize bağlı olan şeylerde saklıdır.',
    ],
  },
  {
    id: 'aurelius', name: 'Marcus Aurelius', emoji: '⚔️', era: 'Roma · Stoa',
    lines: [
      'Elinde olan tek şey şu andır. Onu iyi kullan.',
      'Eylemin önündeki engel, eylemi ilerletir. Yola çıkan, yolu bulur.',
      'Yarının ne getireceğini bırak; bugünün işini yap.',
    ],
  },
  {
    id: 'sokrates', name: 'Sokrates', emoji: '🏛️', era: 'Antik Yunan',
    lines: [
      'Bilgelik, ne yapman gerektiğini bilip onu yapmaktır.',
      'Kendini tanı; bugün hangi adım sana yakışır?',
      'Büyük karakter, küçük ve doğru seçimlerle kurulur.',
    ],
  },
  {
    id: 'seneca', name: 'Seneca', emoji: '⏳', era: 'Roma · Stoa',
    lines: [
      'Vaktimiz az değil, çoğunu israf ediyoruz.',
      'Her yeni gün, yeni bir hayattır. Bugünü sahiplen.',
      'Şans, hazırlığın fırsatla buluşmasıdır.',
    ],
  },
  {
    id: 'epiktetos', name: 'Epiktetos', emoji: '🔗', era: 'Roma · Stoa',
    lines: [
      'Elinde olana odaklan, gerisini bırak.',
      'Önce ne olmak istediğine karar ver, sonra yapılması gerekeni yap.',
      'Seni olaylar değil, onlara verdiğin tepki belirler.',
    ],
  },
  {
    id: 'platon', name: 'Platon', emoji: '📜', era: 'Antik Yunan',
    lines: [
      'İyi olan, düzenli olandır.',
      'Kendine hâkim olan, gerçekten özgürdür.',
      'Başlamak, işin en önemli kısmıdır.',
    ],
  },
  {
    id: 'diyojen', name: 'Diyojen', emoji: '🏺', era: 'Kinik',
    lines: [
      'Bahane değil, eylem.',
      'Sadeleş: gereksizi at, gerekli olanı yap.',
      'En zoru başlamaktır; gerisi gelir.',
    ],
  },
  {
    id: 'konfucyus', name: 'Konfüçyüs', emoji: '🎋', era: 'Çin',
    lines: [
      'En uzun yolculuk tek bir adımla başlar.',
      'Yavaş gitmen önemli değil, durmaman önemli.',
      'Yaptığın işi sev, ömrün boyunca çalışmamış olursun.',
    ],
  },
]

function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getFullYear(), 0, 0)
  const now = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((now - start) / 86400000)
}

export function philosopherOf(data: StoreData, now: Date = new Date()): Philosopher {
  const chosen = data.profile.advisorId
  if (chosen) {
    const found = PHILOSOPHERS.find(p => p.id === chosen)
    if (found) return found
  }
  return PHILOSOPHERS[dayOfYear(now) % PHILOSOPHERS.length]
}

export function philosopherLine(p: Philosopher, now: Date = new Date()): string {
  return p.lines[dayOfYear(now) % p.lines.length]
}

// Günün dersi: filozofun alışkanlık/disiplin üzerine kısa bir öğüdü.
const LESSONS: Record<string, string> = {
  aristoteles: 'Karakter, tek tek seçimlerin birikimidir. Bugün küçük ve doğru olanı yaparsan, yarın o seçim seni yapar. Mükemmellik bir an değil, tekrar eden bir yöndür.',
  aurelius: 'Geçmiş gitti, gelecek henüz yok; elinde yalnızca şu an var. Bu anı küçük bir işle dolu tut, gün kendiliğinden iyi geçsin. Engel çıkınca ondan kaçma, içinden geç.',
  sokrates: 'Kendine dürüst bir soru sor: bugün hangi tek adım beni olmak istediğim kişiye yaklaştırır? Cevabı biliyorsan, gerisi yalnızca onu yapmaktır.',
  seneca: 'Zaman, farkında olmadan akıp giden tek servetimiz. Onu küçük ve anlamlı işlerle harca; ertelediğin her şey aslında çalınmış bir ömürdür. Bugünü tam yaşa.',
  epiktetos: 'Bazı şeyler elinde, bazıları değil. Sonucu bırak, yalnızca bugünkü çabaya odaklan. Huzur, yapabildiğini yapıp gerisini bırakmaktan doğar.',
  platon: 'Düzen, ruhun sağlığıdır. Gününü küçük ve düzenli adımlarla kurarsan kaos dağılır. Kendine hâkim olmak, en büyük özgürlüktür.',
  diyojen: 'Fazlalığı at. Mutluluk daha çok şeyde değil, daha az ihtiyaçta. Bahaneleri bırak, yalnızca gerekli olanı yap; gerisi gürültüdür.',
  konfucyus: 'Dağı taşıyan, küçük taşları taşımakla başlar. Hızlı olman gerekmez, durmaman yeter. Her gün bir adım, bir yılda uzun bir yol eder.',
}

export function philosopherLesson(p: Philosopher): string {
  return LESSONS[p.id] ?? p.lines[0]
}

// Haftalık tema: gün gün değişen filozof sözünün aksine, hafta boyunca sabit
// kalan bir felsefi odak. Haftayı bir niyetle çerçeveler.
export interface WeeklyTheme {
  id: string
  emoji: string
  title: string
  desc: string
}

const THEMES: WeeklyTheme[] = [
  { id: 'discipline', emoji: '🛡️', title: 'Disiplin', desc: 'Bu hafta küçük sözlerini tut. Disiplin, gelecekteki sana verdiğin bir armağandır.' },
  { id: 'patience', emoji: '⏳', title: 'Sabır', desc: 'Acele etme. Kalıcı şeyler yavaş büyür; bugün bir tuğla koy, yeter.' },
  { id: 'courage', emoji: '🔥', title: 'Cesaret', desc: 'En zor işi önce yap. Korktuğun şey çoğu zaman seni en çok büyüten şeydir.' },
  { id: 'simplicity', emoji: '🌿', title: 'Sadelik', desc: 'Fazlalığı at. Az ama düzenli, çok ama dağınıktan daima iyidir.' },
  { id: 'gratitude', emoji: '🙏', title: 'Şükran', desc: 'Elindekine bak. Şükran, sahip olduklarını yeterli kılan bakıştır.' },
  { id: 'focus', emoji: '🎯', title: 'Odak', desc: 'Tek bir şeye derinlemesine dal. Dağınık dikkat hiçbir yere varmaz.' },
  { id: 'resilience', emoji: '🪨', title: 'Dayanıklılık', desc: 'Düşersen kalk. Önemli olan kaç kez düştüğün değil, kaç kez kalktığın.' },
  { id: 'beginning', emoji: '🌱', title: 'Başlangıç', desc: 'Bekleme. En iyi an şimdi; küçük başla, akış kendiliğinden gelir.' },
]

function weekIndex(date: Date): number {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor(utc / 86400000 / 7)
}

export function getWeeklyTheme(now: Date = new Date()): WeeklyTheme {
  return THEMES[weekIndex(now) % THEMES.length]
}

export type AdviceTone = 'morning' | 'midday' | 'evening' | 'night'

export function adviceTone(hour: number): AdviceTone {
  if (hour >= 5 && hour < 12) return 'morning'
  if (hour >= 12 && hour < 17) return 'midday'
  if (hour >= 17 && hour < 22) return 'evening'
  return 'night'
}

export type AdviceKind = 'habit' | 'mood' | 'water' | 'focus' | 'rest' | 'celebrate'

export interface Advice {
  id: string
  kind: AdviceKind
  emoji: string
  title: string
  reason: string
  habitId?: string
  href?: string
  urgency: number       // 0-100, sıralama için
}

const DIFFICULTY_COST: Record<string, number> = { trivial: 1, easy: 2, medium: 3, hard: 4, epic: 5 }

export function getAdvice(data: StoreData, now: Date = new Date()): Advice[] {
  const today = format(now, 'yyyy-MM-dd')
  const hour = now.getHours()
  const tone = adviceTone(hour)
  const out: Advice[] = []

  const activeHabits = data.habits.filter(h => !h.archived)
  const dueHabits = activeHabits.filter(h => h.frequency === 'daily' || (h.frequency as number[]).includes(now.getDay()))
  const doneToday = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
  const undone = dueHabits.filter(h => !doneToday.has(h.id))

  const energyToday = data.energyLogs.find(e => e.date === today)?.level ?? null
  const moodToday = data.moods.find(m => m.date === today)
  const waterToday = data.water.filter(w => w.date === today).length
  const focusToday = data.focusSessions.filter(f => f.completedAt.slice(0, 10) === today).length

  // Tüm günlük işler bitti: kutla.
  if (dueHabits.length > 0 && undone.length === 0) {
    const celebReason = tone === 'morning'
      ? 'Sabahı nasıl da tamamladın. Diyarın seninle gurur duyuyor.'
      : (tone === 'evening' || tone === 'night')
      ? 'Bugünü tamamladın. Dinlenme vakti; yarın yine burada olacaksın.'
      : 'Diyarın çiçek açıyor. Hak ettin: biraz dinlen ya da diyarında gez.'
    out.push({
      id: 'celebrate', kind: 'celebrate', emoji: '🎉',
      title: 'Bugünü tamamladın',
      reason: celebReason,
      href: '/diyar', urgency: 100,
    })
  }

  // Alışkanlıklar: seri koruması + enerjiye uyum + sabah/akşam tonu.
  for (const h of undone) {
    const streak = getStreak(data.completions, h.id, data.frozenDates)
    let urgency = 30
    let reason = tone === 'morning'
      ? 'Güne temiz başla: küçük adım, büyük momentum.'
      : tone === 'night'
      ? 'Gece bitmeden, küçük bir adım yeter.'
      : 'Küçük bir adım, momentumu başlatır.'

    if (streak >= 2) {
      urgency = 55 + Math.min(streak, 30)
      if (tone === 'morning') {
        reason = `${streak} günlük serin var. Sabah rutinin zaten bu; devam et.`
      } else if (tone === 'evening' || tone === 'night') {
        urgency += 22
        reason = `${streak} günlük seri bu gece kopabilir. Hemen koru.`
      } else {
        reason = `${streak} günlük serin sürüyor. Bugün yapmazsan kopar, koru.`
      }
    } else {
      if (tone === 'morning') urgency += 8
      else if (tone === 'night') urgency -= 10
    }

    if (energyToday != null) {
      const cost = DIFFICULTY_COST[h.difficulty] ?? 3
      if (energyToday <= 2) {
        if (cost <= 2) { urgency += 12; if (streak < 2) reason = 'Enerjin düşük; bu küçük iş tam sana göre.' }
        else if (cost >= 4) urgency -= 10
      } else if (energyToday >= 4 && cost >= 4) {
        urgency += 12
        if (streak < 2) reason = tone === 'morning'
          ? 'Enerjin yüksek; sabahın başında zor işi devir.'
          : 'Enerjin yüksek; zor işi şimdi devir.'
      }
    }
    out.push({ id: `habit:${h.id}`, kind: 'habit', emoji: h.emoji, title: h.name, reason, habitId: h.id, urgency })
  }

  // Ruh hali kaydı.
  if (!moodToday) {
    out.push({
      id: 'mood', kind: 'mood', emoji: '🙂',
      title: 'Ruh halini kaydet',
      reason: tone === 'morning'
        ? 'Sabah ruh halini kaydet; günü nasıl geçireceğini önceden hisset.'
        : tone === 'evening'
        ? 'Günü kapatmadan: bugünü nasıl geçirdin?'
        : 'Bugünü nasıl geçirdiğini işaretle; desenlerin netleşsin.',
      href: '/mood', urgency: tone === 'evening' ? 52 : 42,
    })
  }

  // Su.
  if (waterToday < WATER_GOAL) {
    out.push({
      id: 'water', kind: 'water', emoji: '💧',
      title: `Su iç (${waterToday}/${WATER_GOAL})`,
      reason: tone === 'morning'
        ? 'Güne bir bardak su ile başla; en kolay enerji kaynağı.'
        : 'Bir bardak su, odağı ve enerjiyi en ucuz yoldan toplar.',
      urgency: 30 + Math.min(16, (WATER_GOAL - waterToday) * 2),
    })
  }

  // Odak seansı.
  if (focusToday === 0 && (energyToday == null || energyToday >= 3) && hour >= 8 && hour <= 22) {
    out.push({
      id: 'focus', kind: 'focus', emoji: '🎯',
      title: 'Kısa bir odak seansı',
      reason: tone === 'morning'
        ? 'Sabahın ilk saatlerinde odak seansı, günün geri kalanını belirler.'
        : '25 dakikalık tek bir blok, en zor başlangıcı kırar.',
      href: '/focus', urgency: tone === 'morning' ? 54 : 44,
    })
  }

  // Düşük enerji + bir şeyler yapılmışsa: dinlenmeye izin.
  if (energyToday != null && energyToday <= 2 && doneToday.size > 0 && undone.length > 0) {
    out.push({
      id: 'rest', kind: 'rest', emoji: '🌙',
      title: tone === 'night' ? 'Yatma vakti' : 'Kendine nazik ol',
      reason: tone === 'night'
        ? 'Gece oldu, bir şeyler yaptın. Dinlen; yarın için enerji biriktir.'
        : 'Enerjin düşük ve bugün bir şeyler yaptın. En küçük işi seç, gerisini bırak.',
      urgency: tone === 'night' ? 65 : tone === 'evening' ? 38 : 25,
    })
  }

  out.sort((a, b) => b.urgency - a.urgency)
  return out
}
