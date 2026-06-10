'use client'
import { useState, useMemo } from 'react'
import { Play, Flame } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { todayKey } from '@/lib/store'
import { RoutineFlow } from '@/components/routines/routine-flow'
import type { Routine } from '@/lib/types'

function currentSlot(): NonNullable<Routine['timeOfDay']> {
  const h = new Date().getHours()
  if (h >= 5 && h < 12) return 'morning'
  if (h >= 12 && h < 17) return 'afternoon'
  if (h >= 17 && h < 23) return 'evening'
  return 'anytime'
}

const SLOT_LABEL: Record<string, string> = {
  morning: '🌅 Sabah rutinin hazır',
  afternoon: '☀️ Öğle rutinin hazır',
  evening: '🌙 Akşam rutinin hazır',
  anytime: '⚡ Rutinin hazır',
}

// Günün saatine uyan, bugün henüz tamamlanmamış rutini önerir.
// Rutinler kendi sayfasında saklı kalmasın; doğru anda görünsün.
export function RoutineSuggestion() {
  const { data, todayCompletedIds } = useStore()
  const [flowRoutine, setFlowRoutine] = useState<Routine | null>(null)

  const suggestion = useMemo(() => {
    const slot = currentSlot()
    const today = todayKey()

    const candidates = data.routines.filter(r => {
      if (r.lastCompletedDate === today) return false
      const habits = r.habitIds
        .map(id => data.habits.find(h => h.id === id))
        .filter(h => h != null && !h.archived)
      if (habits.length === 0) return false
      // Tüm alışkanlıkları zaten tek tek bitmişse önermeye gerek yok
      return habits.some(h => !todayCompletedIds.has(h!.id))
    })

    // Önce mevcut zaman dilimine uyan, sonra 'anytime'
    return (
      candidates.find(r => (r.timeOfDay ?? 'anytime') === slot) ??
      candidates.find(r => (r.timeOfDay ?? 'anytime') === 'anytime') ??
      null
    )
  }, [data.routines, data.habits, todayCompletedIds])

  if (!suggestion) return null

  const habitCount = suggestion.habitIds
    .map(id => data.habits.find(h => h.id === id))
    .filter(h => h != null && !h.archived).length
  const slot = suggestion.timeOfDay ?? 'anytime'
  const streak = suggestion.completionStreak ?? 0

  return (
    <>
      <div className="flex items-center gap-3 rounded-xl border border-primary/30 bg-primary/5 px-3 py-2.5">
        <span className="text-xl">{suggestion.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-primary">{SLOT_LABEL[slot]}</p>
          <p className="flex items-center gap-2 truncate text-sm font-medium text-fg">
            {suggestion.name}
            <span className="text-xs text-muted">· {habitCount} adım</span>
            {streak > 0 && (
              <span className="flex items-center gap-0.5 text-xs text-xp">
                <Flame size={10} /> {streak}
              </span>
            )}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setFlowRoutine(suggestion)}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-bg shadow-glow transition-opacity hover:opacity-90"
          aria-label={`${suggestion.name} rutinini başlat`}
        >
          <Play size={12} fill="currentColor" /> Başlat
        </button>
      </div>

      {flowRoutine && <RoutineFlow routine={flowRoutine} onClose={() => setFlowRoutine(null)} />}
    </>
  )
}
