// Veri-temelli koç motoru. Rastgele cevap YOK; her yanıt kullanıcının
// gerçek alışkanlık/tamamlama/ruh hali verisinden deterministik üretilir.
// İleride gerçek bir LLM bağlanmak istenirse coachAnswer'ın yerine async bir
// uç eklenebilir; arayüz aynı kalır.
import type { StoreData, Habit } from '@/lib/types'
import { isHabitDueToday, maxCurrentStreak, getStreak } from '@/lib/store'
import { recentRate, momentum, habitReliability, bestHour, bestWeekday } from '@/lib/insights'
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
  return `Şununla başla: ${easiest.emoji} ${easiest.name}. En küçük adımı at, 2 dakikası bile sayılır. Başlamak en zor kısım, gerisi gelir. 💪`
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

const FALLBACK =
  'Bunu tam çözemedim, ama verinden şunları yanıtlayabilirim: bugün ne eksik, ne yapabilirim, hangi alışkanlık geride, nasıl gidiyorum, en verimli zamanım, serim ve motivasyon. Aşağıdaki butonları da kullanabilirsin.'

interface Intent {
  test: RegExp
  answer: (ctx: CoachContext) => string
}

const INTENTS: Intent[] = [
  { test: /eksik|kaldı|kalan|bugün ne|yapmam gereken|todo|to-do|liste/i, answer: answerLeftToday },
  { test: /ne yap|öneri|öner|nereden başla|başlayayım|next|sıradaki|tavsiye/i, answer: answerWhatToDo },
  { test: /geride|risk|zayıf|aksayan|ihmal|düşük|kötü giden/i, answer: answerAtRisk },
  { test: /nasıl gidiyor|durum|özet|ilerleme|istatistik|performans|gidişat/i, answer: answerProgress },
  { test: /en verimli|ne zaman|hangi saat|hangi gün|verimli zaman/i, answer: answerBestTime },
  { test: /streak|seri|zincir/i, answer: answerStreak },
  { test: /motivasyon|moral|isteksiz|enerji yok|hevesim|söz|alıntı/i, answer: answerMotivation },
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
  { label: 'Bugün ne eksik?', query: 'bugün ne eksik' },
  { label: 'Ne yapabilirim?', query: 'ne yapabilirim' },
  { label: 'Hangi alışkanlık geride?', query: 'hangi alışkanlık geride' },
  { label: 'Nasıl gidiyorum?', query: 'nasıl gidiyorum' },
  { label: 'En verimli zamanım', query: 'en verimli zamanım' },
  { label: 'Motivasyon', query: 'motivasyon' },
]
