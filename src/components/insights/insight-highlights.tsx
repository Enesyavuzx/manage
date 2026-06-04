'use client'
import { Sun, Clock, TrendingUp, TrendingDown, Target, BatteryCharging } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { bestWeekday, bestHour, momentum, recentRate, avgEnergyRecent } from '@/lib/insights'
import { ENERGY_META } from '@/lib/constants'
import { Card } from '@/components/ui/card'
import type { MoodLevel } from '@/lib/types'

function HighlightCard({ icon: Icon, label, value, sub }: {
  icon: React.ElementType; label: string; value: string; sub: string
}) {
  return (
    <Card className="p-4" interactive>
      <div className="mb-2 flex items-center gap-2">
        <Icon size={15} className="text-muted" />
        <span className="text-xs font-medium text-muted font-display">{label}</span>
      </div>
      <p className="text-lg font-bold text-fg font-display">{value}</p>
      <p className="mt-0.5 text-xs text-muted">{sub}</p>
    </Card>
  )
}

export function InsightHighlights() {
  const { data } = useStore()
  const day = bestWeekday(data)
  const hour = bestHour(data)
  const mom = momentum(data)
  const r30 = recentRate(data, 30)
  const avgEnergy = avgEnergyRecent(data, 7)

  const deltaPts = Math.round(mom.delta * 100)
  const momLabel = deltaPts > 0 ? `+${deltaPts} puan` : `${deltaPts} puan`

  const energyMeta = avgEnergy !== null
    ? ENERGY_META[Math.min(5, Math.max(1, Math.round(avgEnergy))) as MoodLevel]
    : null

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-5">
      <HighlightCard
        icon={Target}
        label="30 günlük tutarlılık"
        value={`%${Math.round(r30.rate * 100)}`}
        sub={`${r30.done}/${r30.due} planlı görev`}
      />
      <HighlightCard
        icon={day ? Sun : Target}
        label="En verimli gün"
        value={day ? day.label : '—'}
        sub={day ? `${day.count} tamamlama` : 'Veri birikiyor'}
      />
      <HighlightCard
        icon={Clock}
        label="En verimli saat"
        value={hour ? `${String(hour.hour).padStart(2, '0')}:00` : '—'}
        sub={hour ? `${hour.count} tamamlama` : 'Veri birikiyor'}
      />
      <Card className="p-4" interactive>
        <div className="mb-2 flex items-center gap-2">
          {mom.delta >= 0 ? <TrendingUp size={15} className="text-success" /> : <TrendingDown size={15} className="text-danger" />}
          <span className="text-xs font-medium text-muted font-display">Bu hafta momentum</span>
        </div>
        <p className="text-lg font-bold text-fg font-display">%{Math.round(mom.thisRate * 100)}</p>
        <p className={'mt-0.5 text-xs ' + (mom.delta >= 0 ? 'text-success' : 'text-danger')}>
          Geçen haftaya göre {momLabel}
        </p>
      </Card>
      <Card className="p-4" interactive>
        <div className="mb-2 flex items-center gap-2">
          <BatteryCharging size={15} className="text-muted" />
          <span className="text-xs font-medium text-muted font-display">7 günlük enerji</span>
        </div>
        <p className="text-lg font-bold text-fg font-display">
          {energyMeta ? `${energyMeta.emoji} ${avgEnergy!.toFixed(1)}` : '—'}
        </p>
        <p className="mt-0.5 text-xs text-muted">
          {energyMeta ? energyMeta.label : 'Veri birikiyor'}
        </p>
      </Card>
    </div>
  )
}
