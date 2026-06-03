'use client'
import { BatteryCharging } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { ENERGY_META } from '@/lib/constants'
import { todayEnergy } from '@/lib/store'
import type { MoodLevel } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'

const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5]

export function EnergyTracker() {
  const { data, logEnergy } = useStore()
  const current = todayEnergy(data)

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i)
    const key = format(d, 'yyyy-MM-dd')
    const e = data.energyLogs.find(x => x.date === key)
    return { key, label: format(d, 'd'), energy: e }
  })

  const avg = data.energyLogs.length
    ? data.energyLogs.reduce((s, e) => s + e.level, 0) / data.energyLogs.length
    : 0

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle><span className="inline-flex items-center gap-2"><BatteryCharging size={15} /> Enerjin nasıl?</span></CardTitle>
        </CardHeader>
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-5 gap-2">
            {LEVELS.map(level => {
              const meta = ENERGY_META[level]
              const active = current?.level === level
              return (
                <button
                  key={level}
                  onClick={() => logEnergy(level)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all',
                    active ? 'border-2' : 'border-border bg-surface-2 hover:-translate-y-0.5 hover:border-border-hover',
                  )}
                  style={active ? { borderColor: meta.color, background: `${meta.color}1a` } : undefined}
                >
                  <span className="text-2xl">{meta.emoji}</span>
                  <span className="text-[11px] font-medium text-muted">{meta.label}</span>
                </button>
              )
            })}
          </div>
          {current && (
            <p className="text-xs text-muted">
              Bugün: <span style={{ color: ENERGY_META[current.level].color }}>{ENERGY_META[current.level].emoji} {ENERGY_META[current.level].label}</span>
            </p>
          )}
        </div>
      </Card>

      {data.energyLogs.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Son 14 Gün Enerji</CardTitle>
            {avg > 0 && <span className="text-xs text-muted">ort. {avg.toFixed(1)} / 5</span>}
          </CardHeader>
          <div className="p-5">
            <div className="flex items-end justify-between gap-1.5">
              {days.map(d => (
                <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                  <div
                    className="aspect-square w-full rounded-md border border-border"
                    style={d.energy ? { background: ENERGY_META[d.energy.level].color, borderColor: ENERGY_META[d.energy.level].color } : { background: 'rgb(var(--c-surface2))' }}
                    title={d.energy ? ENERGY_META[d.energy.level].label : 'kayıt yok'}
                  />
                  <span className="text-[10px] text-muted-2">{d.label}</span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      )}
    </div>
  )
}
