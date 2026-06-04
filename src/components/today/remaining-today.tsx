'use client'
import { useMemo } from 'react'
import { Check } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { todayKey, isHabitDueToday, getStreak } from '@/lib/store'
import { Card } from '@/components/ui/card'

// Bugün kalanlar: risk altındaki seriler hariç, henüz yapılmamış işler.
// Tek dokunuşla tamamlanır. Hepsi bitince kutlama.
export function RemainingToday() {
  const { data, toggleHabit } = useStore()

  const { remaining, allDone, hasDue } = useMemo(() => {
    const today = todayKey()
    const done = new Set(data.completions.filter(c => c.date === today).map(c => c.habitId))
    const due = data.habits.filter(h => !h.archived && isHabitDueToday(h))
    const undone = due.filter(h => !done.has(h.id))
    const rem = undone.filter(h => getStreak(data.completions, h.id, data.frozenDates) < 2)
    return { remaining: rem, allDone: due.length > 0 && undone.length === 0, hasDue: due.length > 0 }
  }, [data])

  if (!hasDue) return null

  if (allDone) {
    return (
      <Card className="p-5 text-center">
        <p className="text-2xl">🎉</p>
        <p className="mt-1 text-sm font-semibold text-fg">Bugünün işlerini bitirdin</p>
        <p className="mt-0.5 text-xs text-muted">Diyarın çiçek açıyor. Kendinle gurur duy.</p>
      </Card>
    )
  }

  if (remaining.length === 0) return null

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="text-base">📋</span>
        <span className="text-sm font-bold text-fg font-display">Bugün kalanlar</span>
        <span className="text-xs text-muted">{remaining.length} iş</span>
      </div>
      <div className="divide-y divide-border">
        {remaining.map(h => (
          <button key={h.id} onClick={() => toggleHabit(h.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors hover:bg-surface-2">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg" style={{ backgroundColor: h.color + '22' }}>{h.emoji}</span>
            <span className="min-w-0 flex-1 truncate text-sm font-medium text-fg">{h.name}</span>
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-border text-muted-2 transition-colors hover:border-primary hover:text-primary">
              <Check size={14} />
            </span>
          </button>
        ))}
      </div>
    </Card>
  )
}
