// Veri-temelli koç motoru. Rastgele cevap YOK; her yanıt kullanıcının
// gerçek alışkanlık/tamamlama/ruh hali verisinden deterministik üretilir.
// İleride gerçek bir LLM bağlanmak istenirse coachAnswer'ın yerine async bir
// uç eklenebilir; arayüz aynı kalır.
import type { StoreData, Habit } from '@/lib/types'
import { isHabitDueToday, maxCurrentStreak, getStreak, todayEnergy } from '@/lib/store'
import { recentRate, momentum, habitReliability, bestHour, bestWeekday, energyCompletionCorrelation } from '@/lib/insights'
import { ENERGY_META } from '@/lib/constants'
import { xpForDifficulty } from '@/lib/gamification'
import { quoteForToday } from '@/lib/quotes'

export interface CoachContext {
  data: StoreData
  doneToday: Set<string>
}

function dueToday(ctx: CoachContext): Habit[] {
  return ctx.data.habits.filter(h => !h.archived && isHabitDueToday(h))
}

function incompleteToday(ctx: CoachContext): Habit[] {
  return dueToday(ctx).filter(h => !ctx.doneToday.has(h.id))
}

function pct(n: number): number {
  return Math.round(n * 100)
}

// ── Açılış brifingi ───────────────────────────────────────────────────────────
export function coachBriefing(ctx: CoachContext): string {
  const due = dueToday(ctx)
  if (due.length === 0) {
    return 'Selam! Bugün için planlı bir alışkanlığın yok. İstersen Alışkanlıklar sayfasından küçük bir tane ekleyelim, oradan başlarız. 🌱'
  }
  const left = incompleteToday(ctx)
  const done = due.length - left.length
  const parts: string[] = [`Selam! Bugün ${done}/${due.length} alışkanlık tamam.`]
  if (left.length === 0) {
    parts.push('Hepsini bitirdin, gerçekten iyi iş! 🎉')
  } else {
    const names = left.slice(0, 3).map(h => `${h.emoji} ${h.name}`).join(', ')
    parts.push(`Kalan: ${names}${left.length > 3 ? ` ve ${left.length - 3} tane daha` : ''}.`)
    const hour = bestHour(ctx.data)
    if (hour) parts.push(`En verimli saatin genelde ${String(hour.hour).padStart(2, '0')}:00 civarı.`)
  }
  const energy = todayEnergy(ctx.data)
  if (energy) {
    const meta = ENERGY_META[energy.level]
    if (energy.level <= 2) parts.push(`Enerji: ${meta.emoji} ${meta.label} — bugün hafif tut.`)
    else if (energy.level >= 4) parts.push(`Enerji: ${meta.emoji} ${meta.label} — bu ivmeyi kullan!`)
  }
  parts.push('Aşağıdaki butonlardan birine dokunabilir ya da bir şey sorabilirsin.')
  return parts.join(' ')
}

// ── Niyet bazlı yanıtlar (hepsi veriden) ───────────────────────────────────────

function answerLeftToday(ctx: CoachContext): string {
  const left = incompleteToday(ctx)
  const due = dueToday(ctx)
  if (due.length === 0) return 'Bugün için planlı alışkanlığın yok. Yeni bir tane eklemek ister misin?'
  if (left.length === 0) return 'Bugünün her şeyi tamam, hiçbir eksik yok. Mükemmel gün! 🎉'
  const list = left.map(h => `${h.emoji} ${h.name}`).join('\n• ')
  return `Bugün şu ${left.length} alışkanlık kaldı:\n• ${list}`
}

function answerWhatToDo(ctx: CoachContext): string {
  const left = incompleteToday(ctx)
  if (left.length === 0) {
    return 'Bugünün alışkanlıkları bitti. İstersen 5 dakikalık bir odak seansı, bir bardak su veya bugünün ruh halini kaydetmek iyi bir sonraki adım olabilir.'
  }
  const easiest = [...left].sort((a, b) => xpForDifficulty(a.difficulty) - xpForDifficulty(b.difficulty))[0]
  const energy = todayEnergy(ctx.data)
  if (energy && energy.level <= 2) {
    return `Enerjin ${ENERGY_META[energy.level].emoji} ${ENERGY_META[energy.level].label} — bu tamamen normal. Bugün sadece en küçük adımı at:\n\n${easiest.emoji} ${easiest.name}. 2 dakika bile sayılır.`
  }
  return `Şununla başla: ${easiest.emoji} ${easiest.name}. En küçük adımı at, 2 dakikası bile sayılır. Başlamak en zor kısım, gerisi gelir. 💪`
}

function answerEnergyStatus(ctx: CoachContext): string {
  const energy = todayEnergy(ctx.data)
  if (!energy) {
    return 'Bugün enerji kaydın yok. Ruh Hali sayfasından işaretlersen daha kişiselleştirilmiş tavsiyeler verebilirim.'
  }
  const meta = ENERGY_META[energy.level]
  const parts = [`Bugün enerjin ${meta.emoji} ${meta.label} (${energy.level}/5).`]
  if (energy.level <= 2) {
    const left = incompleteToday(ctx)
    const easiest = left.length > 0
      ? [...left].sort((a, b) => xpForDifficulty(a.difficulty) - xpForDifficulty(b.difficulty))[0]
      : null
    parts.push('Enerjin düşük — kendine karşı nazik ol, bir şeyi zorla yapman gerekmiyor.')
    if (easiest) parts.push(`En hafif seçenek: ${easiest.emoji} ${easiest.name}`)
  } else if (energy.level === 3) {
    parts.push('Orta enerji — rutin alışkanlıklara odaklan, büyük baskı hissetmeden ilerle.')
  } else {
    parts.push('Enerjin yüksek — zor alışkanlıkları halletmek için harika bir an!')
  }
  const corr = energyCompletionCorrelation(ctx.data)
  if (corr && corr.highDays > 1 && corr.lowDays > 1) {
    const diff = Math.round((corr.highEnergyRate - corr.lowEnergyRate) * 100)
    if (diff > 10) parts.push(`Verilerine göre yüksek enerji günlerinde %${diff} daha fazla tamamlıyorsun.`)
  }
  return parts.join('\n\n')
}

function answerAtRisk(ctx: CoachContext): string {
  const risk = habitReliability(ctx.data, 30).filter(r => r.rate < 0.4)
  if (risk.length === 0) {
    return 'Şu an geride kalan alışkanlığın yok, tutarlılığın iyi durumda. 👏'
  }
  const list = risk.slice(0, 3).map(r => `${r.habit.emoji} ${r.habit.name} (son 30 günde %${pct(r.rate)})`).join('\n• ')
  return `Son 30 günde geride kalanlar:\n• ${list}\n\nBunlardan birini bugün küçük bir adımla yeniden başlatmayı dene. Tek bir gün bile seriyi yeniden kurar.`
}

function answerProgress(ctx: CoachContext): string {
  const r = recentRate(ctx.data, 30)
  const m = momentum(ctx.data)
  const streak = maxCurrentStreak(ctx.data)
  const delta = pct(m.delta)
  const trend = delta >= 0
    ? 'Momentum seninle. 🔥'
    : 'Bu hafta biraz düştü ama küçük bir adımla tekrar yükselir.'
  return `Son 30 günde planlı görevlerinin %${pct(r.rate)}'ini tamamladın (${r.done}/${r.due}). Bu hafta geçen haftaya göre ${delta >= 0 ? '+' : ''}${delta} puan. En uzun aktif serin ${streak} gün. ${trend}`
}

function answerBestTime(ctx: CoachContext): string {
  const day = bestWeekday(ctx.data)
  const hour = bestHour(ctx.data)
  if (!day && !hour) {
    return 'Henüz desen çıkaracak kadar veri yok. Birkaç gün daha işaretleyince en verimli gün ve saatini söyleyebilirim.'
  }
  const parts: string[] = []
  if (hour) parts.push(`Günün en verimli saati genelde ${String(hour.hour).padStart(2, '0')}:00 civarı.`)
  if (day) parts.push(`En verimli günün ${day.label}.`)
  parts.push('Zor alışkanlıkları bu pencereye koymayı dene.')
  return parts.join(' ')
}

function answerStreak(ctx: CoachContext): string {
  const best = ctx.data.habits
    .filter(h => !h.archived)
    .map(h => ({ h, s: getStreak(ctx.data.completions, h.id, ctx.data.frozenDates) }))
    .sort((a, b) => b.s - a.s)[0]
  if (!best || best.s === 0) {
    return 'Şu an aktif bir serin yok. Bugün bir alışkanlığı tamamla, seri yeniden başlasın. Sıfırdan bir güne geçmek en değerli adım.'
  }
  return `En uzun aktif serin: ${best.h.emoji} ${best.h.name}, ${best.s} gün. 🔥 Bugün de işaretleyip seriyi koru.`
}

function answerMotivation(ctx: CoachContext): string {
  const q = quoteForToday()
  const left = incompleteToday(ctx)
  const nudge = left.length > 0
    ? `Bugün ${left.length} küçük adım seni bekliyor. Birini seç, sadece başla.`
    : 'Bugünü zaten tamamladın, bu ivmeyi yarına taşı.'
  return `"${q.text}" - ${q.author}\n\n${nudge}`
}

function answerXP(ctx: CoachContext): string {
  const { totalXP, redeemedXP } = ctx.data.profile
  const available = totalXP - redeemedXP
  const active = ctx.data.habits.filter(h => !h.archived)
  const due = dueToday(ctx)
  const left = incompleteToday(ctx)
  const parts = [`Toplam XP: ${totalXP.toLocaleString('tr-TR')} • Harcanabilir: ${available.toLocaleString('tr-TR')} XP.`]
  if (left.length > 0) {
    const potentialXP = left.reduce((sum, h) => {
      const base = { trivial: 10, easy: 20, medium: 40, hard: 70, epic: 120 }[h.difficulty] ?? 20
      return sum + base
    }, 0)
    parts.push(`Bugün kalan ${left.length} alışkanlığı tamamlarsan ~${potentialXP} XP daha kazanırsın.`)
  }
  if (active.length > 0) parts.push(`Toplam ${active.length} aktif alışkanlığın var, ${due.length} tanesi bugün planlı.`)
  return parts.join('\n\n')
}

function answerHabitCount(ctx: CoachContext): string {
  const active = ctx.data.habits.filter(h => !h.archived)
  const archived = ctx.data.habits.filter(h => h.archived)
  const due = dueToday(ctx)
  const done = due.filter(h => ctx.doneToday.has(h.id))
  if (active.length === 0) {
    return 'Henüz alışkanlığın yok. Alışkanlıklar sayfasından küçük bir tane ekleyebilirsin.'
  }
  const lines = [
    `${active.length} aktif alışkanlığın var${archived.length > 0 ? ` (${archived.length} arşivde)` : ''}.`,
    `Bugün planlı: ${due.length} • Tamamlanan: ${done.length}.`,
  ]
  if (done.length === due.length && due.length > 0) lines.push('Bugün mükemmel gidiyorsun! 🎉')
  return lines.join('\n')
}

function answerFocus(ctx: CoachContext): string {
  const sessions = ctx.data.focusSessions ?? []
  if (sessions.length === 0) {
    return 'Henüz odak seansın yok. Odak sayfasından bir Pomodoro başlatabilirsin — 25 dakika bile büyük fark yaratır.'
  }
  const today = new Date().toISOString().slice(0, 10)
  const todayMins = sessions
    .filter(s => s.completedAt?.startsWith(today))
    .reduce((sum, s) => sum + (s.minutes ?? 0), 0)
  const totalMins = sessions.reduce((sum, s) => sum + (s.minutes ?? 0), 0)
  return `Bugün ${todayMins} dakika odaklandın. Toplam odak süren: ${totalMins} dakika (${Math.floor(totalMins / 60)} saat ${totalMins % 60} dakika).`
}

function answerHelp(_ctx: CoachContext): string {
  return `Sana şunları yanıtlayabilirim:\n\n• Bugün ne eksik?\n• Ne yapabilirim? (öneri)\n• Hangi alışkanlık geride?\n• Nasıl gidiyorum? (özet)\n• Enerjim nasıl?\n• En verimli zamanım\n• Serim kaç gün?\n• XP durumum\n• Kaç alışkanlığım var?\n• Odak sürelerim\n• Motivasyon\n\nAşağıdaki butonları da kullanabilirsin.`
}

const FALLBACK =
  'Bunu tam anlayamadım, ama "yardım" yazarsan neler sorabileceğini gösterebilirim. Ya da aşağıdaki butonlardan birini seçebilirsin.'

interface Intent {
  test: RegExp
  answer: (ctx: CoachContext) => string
}

const INTENTS: Intent[] = [
  { test: /eksik|kaldı|kalan|bugün ne|yapmam gereken|todo|to-do|liste/i, answer: answerLeftToday },
  { test: /ne yap|öneri|öner|nereden başla|başlayayım|next|sıradaki|tavsiye/i, answer: answerWhatToDo },
  { test: /geride|risk|zayıf|aksayan|ihmal|kötü giden/i, answer: answerAtRisk },
  { test: /nasıl gidiyor|durum|özet|ilerleme|istatistik|performans|gidişat/i, answer: answerProgress },
  { test: /en verimli|ne zaman|hangi saat|hangi gün|verimli zaman/i, answer: answerBestTime },
  { test: /streak|seri|zincir/i, answer: answerStreak },
  { test: /enerjim|enerji nasıl|enerji durumu|bugünkü enerji|enerji kaç/i, answer: answerEnergyStatus },
  { test: /motivasyon|moral|isteksiz|enerji yok|hevesim|söz|alıntı/i, answer: answerMotivation },
  { test: /xp|puan|ödül|kaç xp|ne kadar xp/i, answer: answerXP },
  { test: /kaç alışkanlık|alışkanlık sayısı|kaç tane alışkanlık/i, answer: answerHabitCount },
  { test: /odak|pomodoro|focus|kaç dakika|ne kadar odak/i, answer: answerFocus },
  { test: /yardım|help|ne sorabilir|ne sorabilirim|ne yaparsın|neler yapabilirsin/i, answer: answerHelp },
  { test: /merhaba|selam|hey|naber|nasılsın/i, answer: coachBriefing },
]

export function coachAnswer(ctx: CoachContext, input: string): string {
  const text = input.trim()
  if (!text) return FALLBACK
  for (const intent of INTENTS) {
    if (intent.test.test(text)) return intent.answer(ctx)
  }
  return FALLBACK
}

export interface CoachAction {
  label: string
  query: string
}

export const COACH_ACTIONS: CoachAction[] = [
  { label: 'Bugün ne eksik?',        query: 'bugün ne eksik' },
  { label: 'Ne yapabilirim?',         query: 'ne yapabilirim' },
  { label: 'Hangi alışkanlık geride?', query: 'hangi alışkanlık geride' },
  { label: 'Nasıl gidiyorum?',        query: 'nasıl gidiyorum' },
  { label: 'XP durumum',             query: 'xp durumum' },
  { label: 'Enerji durumum',          query: 'enerjim nasıl' },
  { label: 'En verimli zamanım',      query: 'en verimli zamanım' },
  { label: 'Motivasyon',              query: 'motivasyon' },
  { label: 'Serim',                   query: 'serim kaç gün' },
]
