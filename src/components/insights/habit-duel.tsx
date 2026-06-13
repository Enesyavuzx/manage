'use client'
import { useMemo, useState } from 'react'
import { Swords } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getStreak, moodInsights } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'

interface Fighter {
  completions30: number
  streak: number
  moodLift: number | null   // ruh haline ortalama katkı (puan)
  avgHour: number | null
}

function statsFor(habitId: string, data: ReturnType<typeof useStore>['data'], lifts: Map<string, number>): Fighter {
  const since = format(subDays(new Date(), 30), 'yyyy-MM-dd')
  const mine = data.completions.filter(c => c.habitId === habitId)
  const last30 = mine.filter(c => c.date >= since)
  const hours = mine.map(c => new Date(c.completedAt).getHours())
  return {
    completions30: last30.length,
    streak: getStreak(data.completions, habitId, data.frozenDates),
    moodLift: lifts.get(habitId) ?? null,
    avgHour: hours.length ? Math.round(hours.reduce((s, h) => s + h, 0) / hours.length) : null,
  }
}

// İki alışkanlığı kendi verinle düelloya sokar: hangisi daha istikrarlı,
// hangisi ruh haline daha iyi geliyor? Veriyle oynamak veriye bakmaktan
// daha eğlenceli — ve bazen sürpriz bir kazanan çıkar.
export function HabitDuel() {
  const { data } = useStore()
  const habits = data.habits.filter(h => !h.archived)

  // Varsayılan rakipler: en çok tamamlanan iki alışkanlık
  const defaults = useMemo(() => {
    const counts = new Map<string, number>()
    for (const c of data.completions) counts.set(c.habitId, (counts.get(c.habitId) ?? 0) + 1)
    return [...habits]
      .sort((a, b) => (counts.get(b.id) ?? 0) - (counts.get(a.id) ?? 0))
      .slice(0, 2)
      .map(h => h.id)
  }, [data.completions, habits])

  const [leftId, setLeftId] = useState<string | null>(null)
  const [rightId, setRightId] = useState<string | null>(null)
  const left = habits.find(h => h.id === (leftId ?? defaults[0]))
  const right = habits.find(h => h.id === (rightId ?? defaults[1]))

  const lifts = useMemo(() => {
    const m = new Map<string, number>()
    for (const h of moodInsights(data).habits) m.set(h.habitId, h.lift)
    return m
  }, [data])

  if (habits.length < 2) return null
  if (!left || !right || left.id === right.id) return null

  const a = statsFor(left.id, data, lifts)
  const b = statsFor(right.id, data, lifts)

  const rows: { label: string; av: string; bv: string; winner: 0 | 1 | null }[] = [
    {
      label: 'Son 30 gün tamamlama',
      av: `${a.completions30}`, bv: `${b.completions30}`,
      winner: a.completions30 === b.completions30 ? null : a.completions30 > b.completions30 ? 0 : 1,
    },
    {
      label: 'Mevcut seri',
      av: `${a.streak} gün`, bv: `${b.streak} gün`,
      winner: a.streak === b.streak ? null : a.streak > b.streak ? 0 : 1,
    },
    {
      label: 'Ruh haline katkı',
      av: a.moodLift != null ? `${a.moodLift > 0 ? '+' : ''}${a.moodLift.toFixed(1)}` : '?',
      bv: b.moodLift != null ? `${b.moodLift > 0 ? '+' : ''}${b.moodLift.toFixed(1)}` : '?',
      winner: a.moodLift == null || b.moodLift == null || a.moodLift === b.moodLift
        ? null : a.moodLift > b.moodLift ? 0 : 1,
    },
    {
      label: 'Tipik saat',
      av: a.avgHour != null ? `${String(a.avgHour).padStart(2, '0')}:00` : '?',
      bv: b.avgHour != null ? `${String(b.avgHour).padStart(2, '0')}:00` : '?',
      winner: null,
    },
  ]

  const aWins = rows.filter(r => r.winner === 0).length
  const bWins = rows.filter(r => r.winner === 1).length
  const champion = aWins === bWins ? null : aWins > bWins ? left : right

  const selectCls =
    'w-full truncate rounded-lg border border-border bg-surface-2 px-2 py-1.5 text-xs text-fg outline-none focus:border-primary'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2"><Swords size={15} className="text-primary" /> Alışkanlık Düellosu</CardTitle>
        <span className="text-xs text-muted">Verin konuşsun</span>
      </CardHeader>
      <CardBody className="space-y-4">
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2">
          <select aria-label="Birinci alışkanlık" className={selectCls} value={left.id} onChange={e => setLeftId(e.target.value)}>
            {habits.map(h => <option key={h.id} value={h.id} disabled={h.id === right.id}>{h.emoji} {h.name}</option>)}
          </select>
          <span className="text-sm font-bold text-muted-2">VS</span>
          <select aria-label="İkinci alışkanlık" className={selectCls} value={right.id} onChange={e => setRightId(e.target.value)}>
            {habits.map(h => <option key={h.id} value={h.id} disabled={h.id === left.id}>{h.emoji} {h.name}</option>)}
          </select>
        </div>

        <div className="space-y-1.5">
          {rows.map(r => (
            <div key={r.label} className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 rounded-lg bg-surface-2 px-3 py-2">
              <span className={cn('text-sm font-semibold', r.winner === 0 ? 'text-primary' : 'text-fg')}>
                {r.av} {r.winner === 0 && '🏅'}
              </span>
              <span className="text-center text-[10px] uppercase tracking-wide text-muted-2">{r.label}</span>
              <span className={cn('text-right text-sm font-semibold', r.winner === 1 ? 'text-primary' : 'text-fg')}>
                {r.winner === 1 && '🏅'} {r.bv}
              </span>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted">
          {champion
            ? <>🏆 Kazanan: <span className="font-semibold text-fg">{champion.emoji} {champion.name}</span> ({Math.max(aWins, bWins)}-{Math.min(aWins, bWins)})</>
            : 'Berabere — ikisi de sağlam duruyor 🤝'}
        </p>
      </CardBody>
    </Card>
  )
}
