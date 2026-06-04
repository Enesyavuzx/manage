'use client'
import { BatteryCharging, TrendingUp, TrendingDown } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { avgEnergyRecent, energyCompletionCorrelation } from '@/lib/insights'
import { ENERGY_META } from '@/lib/constants'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { format, subDays } from 'date-fns'
import type { MoodLevel } from '@/lib/types'

export function EnergyInsight() {
  const { data } = useStore()
  const avg7 = avgEnergyRecent(data, 7)
  const corr = energyCompletionCorrelation(data)

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i)
    const key = format(d, 'yyyy-MM-dd')
    const e = data.energyLogs.find(x => x.date === key)
    return { key, label: format(d, 'd'), energy: e }
  })

  if (data.energyLogs.length < 3) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <BatteryCharging size={15} /> Enerji analizi
            </span>
          </CardTitle>
        </CardHeader>
        <CardBody className="py-8 text-center">
          <p className="text-sm text-muted">
            En az 3 gün enerji kaydı gerekiyor. Ruh Hali sayfasından işaretlemeye devam et.
          </p>
        </CardBody>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="inline-flex items-center gap-2">
              <BatteryCharging size={15} /> Enerji analizi
            </span>
          </CardTitle>
          {avg7 !== null && (
            <span className="text-xs text-muted">son 7 gün ort. {avg7.toFixed(1)}/5</span>
          )}
        </CardHeader>
        <CardBody className="space-y-4">
          <div className="flex items-end justify-between gap-1.5">
            {days.map(d => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="aspect-square w-full rounded-md border border-border"
                  style={
                    d.energy
                      ? {
                          background: ENERGY_META[d.energy.level as MoodLevel].color,
                          borderColor: ENERGY_META[d.energy.level as MoodLevel].color,
                        }
                      : { background: 'rgb(var(--c-surface2))' }
                  }
                  title={d.energy ? ENERGY_META[d.energy.level as MoodLevel].label : 'kayıt yok'}
                />
                <span className="text-[10px] text-muted-2">{d.label}</span>
              </div>
            ))}
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {([1, 2, 3, 4, 5] as MoodLevel[]).map(lvl => (
              <span key={lvl} className="flex items-center gap-1 text-[11px] text-muted">
                <span
                  className="inline-block h-2.5 w-2.5 rounded-sm"
                  style={{ background: ENERGY_META[lvl].color }}
                />
                {ENERGY_META[lvl].label}
              </span>
            ))}
          </div>
        </CardBody>
      </Card>

      {corr && (corr.highDays > 0 || corr.lowDays > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Enerji ve tamamlama ilişkisi</CardTitle>
          </CardHeader>
          <CardBody className="space-y-3">
            {corr.highDays > 0 && (
              <div className="flex items-center gap-3">
                <TrendingUp size={15} className="shrink-0 text-success" />
                <div className="flex-1">
                  <p className="text-sm text-fg">Yüksek enerji günleri</p>
                  <p className="text-xs text-muted">{corr.highDays} gün kayıt</p>
                </div>
                <span className="text-sm font-bold text-success">
                  %{Math.round(corr.highEnergyRate * 100)}
                </span>
              </div>
            )}
            {corr.lowDays > 0 && (
              <div className="flex items-center gap-3">
                <TrendingDown size={15} className="shrink-0 text-danger" />
                <div className="flex-1">
                  <p className="text-sm text-fg">Düşük enerji günleri</p>
                  <p className="text-xs text-muted">{corr.lowDays} gün kayıt</p>
                </div>
                <span className="text-sm font-bold text-danger">
                  %{Math.round(corr.lowEnergyRate * 100)}
                </span>
              </div>
            )}
            {corr.highDays > 1 && corr.lowDays > 1 && (
              <p className="border-t border-border pt-3 text-xs text-muted">
                {corr.highEnergyRate > corr.lowEnergyRate
                  ? `Yüksek enerji günlerinde %${Math.round((corr.highEnergyRate - corr.lowEnergyRate) * 100)} daha fazla tamamlıyorsun.`
                  : 'Enerji düşük olduğunda da tutarlı kalıyorsun — bu gerçek dayanıklılık.'}
              </p>
            )}
          </CardBody>
        </Card>
      )}
    </div>
  )
}
