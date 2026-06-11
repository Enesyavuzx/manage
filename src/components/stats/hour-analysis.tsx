'use client'
import { BarChart, Bar, Cell, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { ChartTooltip, CHART, AXIS_TICK } from '@/components/ui/chart'

const PERIOD = [
  { label: 'Gece', range: [0, 5],   emoji: '🌑' },
  { label: 'Sabah', range: [6, 11],  emoji: '🌅' },
  { label: 'Öğle',  range: [12, 17], emoji: '☀️' },
  { label: 'Akşam', range: [18, 23], emoji: '🌙' },
]

export function HourAnalysis() {
  const { data } = useStore()
  if (data.completions.length === 0) return null

  const hourCounts = Array(24).fill(0)
  for (const c of data.completions) {
    const h = new Date(c.completedAt).getHours()
    hourCounts[h]++
  }

  const peakHour = hourCounts.indexOf(Math.max(...hourCounts))
  const chartData = hourCounts.map((count, h) => ({ hour: `${h}`, Görev: count }))

  const periodTotals = PERIOD.map(p => ({
    ...p,
    count: hourCounts.slice(p.range[0], p.range[1] + 1).reduce((s, v) => s + v, 0),
  })).sort((a, b) => b.count - a.count)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Günün En Aktif Saati</CardTitle>
        <span className="text-xs text-muted">Saat {peakHour}:00 zirvesi</span>
      </CardHeader>
      <CardBody className="space-y-4">
        <ResponsiveContainer width="100%" height={110}>
          <BarChart data={chartData} margin={{ top: 4, right: 0, bottom: 0, left: 0 }} barCategoryGap={1}>
            <XAxis
              dataKey="hour"
              tick={AXIS_TICK}
              tickLine={false}
              axisLine={false}
              interval={5}
              tickFormatter={h => `${h.padStart(2, '0')}:00`}
            />
            <YAxis hide />
            <Tooltip
              content={<ChartTooltip />}
              cursor={{ fill: CHART.primarySoft }}
              labelFormatter={h => `${String(h).padStart(2, '0')}:00`}
            />
            <Bar dataKey="Görev" radius={[3, 3, 0, 0]} minPointSize={2}>
              {chartData.map((_, h) => (
                <Cell key={h} fill={h === peakHour ? CHART.xp : CHART.primary} fillOpacity={h === peakHour ? 1 : 0.7} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {periodTotals.map((p, i) => (
            <div key={p.label} className="rounded-lg border border-border bg-surface-2 p-2.5 text-center">
              <p className="text-base">{p.emoji}</p>
              <p className="mt-0.5 text-xs font-medium text-fg">{p.label}</p>
              <p className="text-xs text-muted">{p.count} görev</p>
              {i === 0 && <p className="mt-0.5 text-[10px] text-primary">En aktif</p>}
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  )
}
