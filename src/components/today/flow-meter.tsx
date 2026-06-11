'use client'
import { useMemo } from 'react'
import { useStore } from '@/hooks/useStore'
import { todayMood, todayEnergy, maxCurrentStreak } from '@/lib/store'

interface FlowResult {
  score: number          // 0-100
  label: string
  emoji: string
  tip: string | null     // skoru yükseltecek en etkili sonraki adım
}

// Anlık momentum skoru: tamamlama oranı + güne göre tempo + streak + ruh
// hali + enerji. DEHB'de "şu an nasıl gidiyorum?" sorusuna tek bakışta
// cevap vermek, soyut ilerleme hissini somutlaştırır.
function computeFlow(args: {
  done: number
  due: number
  streak: number
  mood: number | null    // 1-5
  energy: number | null  // 1-5
  hour: number
}): FlowResult {
  const { done, due, streak, mood, energy, hour } = args

  const completion = due > 0 ? done / due : 0
  // Tempo: günün geçen kısmına göre beklenen ilerlemenin önünde misin?
  // 08:00'de %0 normaldir; 21:00'de %0 değildir.
  const dayProgress = Math.min(1, Math.max(0, (hour - 7) / 15)) // 07:00-22:00 aralığı
  const pace = due > 0 ? Math.min(1, completion + Math.max(0, completion - dayProgress)) : 0
  const streakFactor = Math.min(1, streak / 7)
  const moodFactor = mood != null ? (mood - 1) / 4 : 0.5
  const energyFactor = energy != null ? (energy - 1) / 4 : 0.5

  const score = Math.round(
    completion * 45 + pace * 10 + streakFactor * 15 + moodFactor * 15 + energyFactor * 15,
  )

  let label: string, emoji: string
  if (score >= 85)      { label = 'Alev aldın';      emoji = '🔥' }
  else if (score >= 60) { label = 'Akıştasın';        emoji = '🌊' }
  else if (score >= 30) { label = 'Ritim geliyor';    emoji = '🎵' }
  else                  { label = 'Isınıyorsun';      emoji = '🌱' }

  // En düşük katkıyı veren alana yönelik tek bir öneri
  let tip: string | null = null
  if (due > 0 && done < due) tip = `${due - done} görev kaldı — bir tanesini şimdi bitir`
  else if (mood == null) tip = 'Ruh halini kaydet, skorun netleşsin'
  else if (energy == null) tip = 'Enerji seviyeni işaretle'
  else if (due === 0) tip = 'Bugüne görev ekle, akış ölçülsün'

  return { score, label, emoji, tip }
}

export function FlowMeter() {
  const { data, habitsToday, todayCompletedIds } = useStore()

  const flow = useMemo(() => {
    const due = habitsToday.length
    const done = habitsToday.filter(h => todayCompletedIds.has(h.id)).length
    return computeFlow({
      done,
      due,
      streak: maxCurrentStreak(data),
      mood: todayMood(data)?.level ?? null,
      energy: todayEnergy(data)?.level ?? null,
      hour: new Date().getHours(),
    })
  }, [data, habitsToday, todayCompletedIds])

  // SVG yay: 270 derecelik gösterge
  const R = 34
  const CIRC = 2 * Math.PI * R
  const arc = CIRC * 0.75
  const filled = arc * (flow.score / 100)

  return (
    <div className="flex items-center gap-4 rounded-xl border border-border bg-surface p-4">
      <div className="relative h-20 w-20 shrink-0">
        <svg viewBox="0 0 80 80" className="h-full w-full -rotate-[135deg]">
          <circle
            cx="40" cy="40" r={R} fill="none"
            stroke="rgb(var(--c-surface2))" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${arc} ${CIRC}`}
          />
          <circle
            cx="40" cy="40" r={R} fill="none"
            stroke="rgb(var(--c-primary))" strokeWidth="7" strokeLinecap="round"
            strokeDasharray={`${filled} ${CIRC}`}
            className="transition-all duration-700 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-bold text-fg font-display">{flow.score}</span>
          <span className="text-[9px] uppercase tracking-wider text-muted-2">akış</span>
        </div>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">
          {flow.emoji} {flow.label}
        </p>
        {flow.tip && <p className="mt-0.5 text-xs text-muted">{flow.tip}</p>}
      </div>
    </div>
  )
}
