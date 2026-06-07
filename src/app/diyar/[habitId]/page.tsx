'use client'
import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Check } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { buildRealm } from '@/lib/realm'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const STAGE_LABEL: Record<number, string> = {
  0: 'Boş arsa', 1: 'Kulübe', 2: 'Küçük ev', 3: 'Ev', 4: 'Kule', 5: 'Kale',
}
const STAGE_NEXT = [5, 15, 40, 100]
const STAGE_PREV = [0, 5, 15, 40]

function getDays(n: number): string[] {
  const days: string[] = []
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    days.push(d.toISOString().slice(0, 10))
  }
  return days
}

export default function HabitRealmPage() {
  const params = useParams()
  const habitId = Array.isArray(params.habitId) ? params.habitId[0] : params.habitId ?? ''

  const { data, toggleHabit } = useStore()
  const world = useMemo(() => buildRealm(data), [data])
  const structure = world.structures.find(s => s.habitId === habitId)

  if (!structure) {
    return (
      <div className="mx-auto max-w-xl py-20 text-center">
        <p className="text-muted">Yapı bulunamadı.</p>
        <Link href="/diyar" className="mt-3 inline-block text-sm text-primary">← Diyara dön</Link>
      </div>
    )
  }

  const completedDates = new Set(
    data.completions.filter(c => c.habitId === habitId).map(c => c.date)
  )
  const last35 = getDays(35)
  const today = last35[last35.length - 1]

  const stageIdx = structure.stage - 1
  const nextTarget = STAGE_NEXT[stageIdx]
  const prevTarget = STAGE_PREV[stageIdx] ?? 0
  const pct = nextTarget
    ? Math.min(100, Math.max(0, ((structure.completions - prevTarget) / (nextTarget - prevTarget)) * 100))
    : 100

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-center gap-3">
        <Link href="/diyar"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-border text-muted hover:text-fg">
          <ArrowLeft size={16} />
        </Link>
        <div className="min-w-0">
          <p className="text-[10px] font-medium uppercase tracking-wide text-muted">Diyar</p>
          <h1 className="truncate text-lg font-bold text-fg">{structure.name}</h1>
        </div>
      </div>

      {/* Building hero */}
      <div className="flex items-center gap-5 rounded-2xl border-2 p-5"
        style={{
          backgroundColor: structure.color + '18',
          borderColor: structure.doneToday ? structure.color + 'cc' : structure.color + '44',
        }}>
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl text-5xl"
          style={{ backgroundColor: structure.color + '28' }}>
          {structure.emoji}
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div>
            <p className="text-xl font-bold" style={{ color: structure.color }}>{STAGE_LABEL[structure.stage]}</p>
            <p className="text-xs text-muted">{structure.completions} toplam tamamlama</p>
          </div>
          {structure.streak > 0 && (
            <p className="text-sm font-semibold">🔥 {structure.streak} günlük seri</p>
          )}
          {structure.stage > 0 && structure.stage < 5 && (
            <div>
              <div className="h-2 overflow-hidden rounded-full" style={{ backgroundColor: structure.color + '22' }}>
                <div className="h-full rounded-full transition-all duration-500"
                  style={{ backgroundColor: structure.color, width: `${pct}%` }} />
              </div>
              <p className="mt-0.5 text-[11px] text-muted">
                {Math.max(0, (nextTarget ?? 0) - structure.completions)} tamamlama daha → {STAGE_LABEL[structure.stage + 1] ?? ''}
              </p>
            </div>
          )}
          {structure.stage === 5 && (
            <p className="text-sm font-bold" style={{ color: structure.color }}>👑 Maksimum seviye!</p>
          )}
        </div>
      </div>

      {/* Quick complete */}
      {structure.doneToday ? (
        <div className="flex items-center justify-center gap-2 rounded-xl border border-success/30 bg-success/10 py-4">
          <Check size={18} className="text-success" />
          <span className="text-sm font-semibold text-success">Bugün tamamlandı</span>
        </div>
      ) : (
        <Button variant="primary" className="w-full h-12" onClick={() => toggleHabit(habitId)}>
          Bugün tamamla → bina büyüsün
        </Button>
      )}

      {/* 35-day calendar (5×7) */}
      <div>
        <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted">Son 35 gün</p>
        <div className="grid grid-cols-7 gap-1.5">
          {last35.map(date => {
            const done = completedDates.has(date)
            const isToday = date === today
            return (
              <div key={date} title={date}
                className={cn('aspect-square rounded-md', isToday && 'ring-2 ring-primary ring-offset-1')}
                style={{ backgroundColor: done ? structure.color + 'dd' : structure.color + '1a' }} />
            )
          })}
        </div>
        <p className="mt-1.5 text-[11px] text-muted-2">
          {last35.filter(d => completedDates.has(d)).length} / 35 gün tamamlandı
        </p>
      </div>

      {/* Status badges */}
      {structure.isLandmark && (
        <div className="flex items-center gap-2 rounded-xl border border-xp/30 bg-xp/10 px-3 py-2.5">
          <span className="text-lg">👑</span>
          <p className="text-xs font-semibold text-xp">Kale seviyesine ulaştı. Diyarının simgesi!</p>
        </div>
      )}
      {structure.damaged && (
        <div className="flex items-center gap-2 rounded-xl border border-danger/30 bg-danger/10 px-3 py-2.5">
          <span className="text-lg">🛠</span>
          <p className="text-xs text-muted">Seri koptu. Bugün tamamla ve binayı onar.</p>
        </div>
      )}
      {structure.hasFlag && !structure.isLandmark && (
        <div className="flex items-center gap-2 rounded-xl border border-border bg-surface-2 px-3 py-2.5">
          <span className="text-lg">🚩</span>
          <p className="text-xs text-muted">3+ gün seri var. Bayrak dalgalanıyor!</p>
        </div>
      )}
    </div>
  )
}
