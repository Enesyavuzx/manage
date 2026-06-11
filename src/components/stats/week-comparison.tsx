'use client'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { ChartTooltip, CHART, AXIS_TICK } from '@/components/ui/chart'
import { format, subDays, startOfWeek } from 'date-fns'
import { tr } from 'date-fns/locale'

function weekRange(offset: number): { start: string; end: string } {
  const monday = startOfWeek(subDays(new Date(), offset * 7), { weekStartsOn: 1 })
  const sunday = subDays(new Date(monday.getTime() + 6 * 86400000), 0)
  return {
    start: format(monday, 'yyyy-MM-dd'),
    end: format(sunday, 'yyyy-MM-dd'),
  }
}

function countInRange(completions: { date: string }[], start: string, end: string): number {
  return completions.filter(c => c.date >= start && c.date <= end).length
}

function xpInRange(completions: { date: string; xpAwarded: number }[], start: string, end: string): number {
  return completions.filter(c => c.date >= start && c.date <= end).reduce((s, c) => s + c.xpAwarded, 0)
}

export function WeekComparison() {
  const { data } = useStore()
  const thisWeek = weekRange(0)
  const lastWeek = weekRange(1)

  const thisCount = countInRange(data.completions, thisWeek.start, thisWeek.end)
  const lastCount = countInRange(data.completions, lastWeek.start, lastWeek.end)
  const thisXP = xpInRange(data.completions, thisWeek.start, thisWeek.end)
  const lastXP = xpInRange(data.completions, lastWeek.start, lastWeek.end)

  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday.getTime() + i * 86400000)
    const key = format(d, 'yyyy-MM-dd')
    const count = data.completions.filter(c => c.date === key).length
    const lastKey = format(subDays(d, 7), 'yyyy-MM-dd')
    const lastCount = data.completions.filter(c => c.date === lastKey).length
    return { label: format(d, 'EEE', { locale: tr }), key, count, lastCount }
  })

  function Delta({ cur, prev }: { cur: number; prev: number }) {
    if (prev === 0 && cur === 0) return <span className="text-muted-2">-</span>
    const diff = cur - prev
    const pct = prev > 0 ? Math.round((diff / prev) * 100) : 100
    if (diff > 0) return <span className="inline-flex items-center gap-0.5 text-success"><TrendingUp size={12} />+{pct}%</span>
    if (diff < 0) return <span className="inline-flex items-center gap-0.5 text-danger"><TrendingDown size={12} />{pct}%</span>
    return <span className="inline-flex items-center gap-0.5 text-muted"><Minus size={12} />Aynı</span>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bu Hafta vs Geçen Hafta</CardTitle>
      </CardHeader>
      <CardBody className="space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <p className="text-xs text-muted font-display">Tamamlama</p>
            <p className="mt-1 text-2xl font-bold text-fg font-display">{thisCount}</p>
            <p className="mt-0.5 text-xs"><Delta cur={thisCount} prev={lastCount} /> geçen haftaya göre</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 p-3">
            <p className="text-xs text-muted font-display">XP Kazanıldı</p>
            <p className="mt-1 text-2xl font-bold text-xp font-display">{thisXP}</p>
            <p className="mt-0.5 text-xs"><Delta cur={thisXP} prev={lastXP} /> geçen haftaya göre</p>
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs text-muted-2">Günlük tamamlama</p>
          <ResponsiveContainer width="100%" height={130}>
            <BarChart
              data={days.map(d => ({ label: d.label, 'Bu hafta': d.count, 'Geçen hafta': d.lastCount }))}
              margin={{ top: 4, right: 0, bottom: 0, left: -32 }}
              barGap={2}
            >
              <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} className="capitalize" />
              <YAxis allowDecimals={false} tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <Tooltip content={<ChartTooltip />} cursor={{ fill: CHART.primarySoft }} />
              <Legend wrapperStyle={{ fontSize: 11 }} iconType="circle" iconSize={7} />
              <Bar dataKey="Geçen hafta" fill={CHART.primary} fillOpacity={0.25} radius={[3, 3, 0, 0]} />
              <Bar dataKey="Bu hafta" fill={CHART.primary} radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  )
}
