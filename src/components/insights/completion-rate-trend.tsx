'use client'
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useStore } from '@/hooks/useStore'
import { weeklyRates } from '@/lib/insights'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { ChartTooltip, CHART, AXIS_TICK } from '@/components/ui/chart'

export function CompletionRateTrend() {
  const { data } = useStore()
  const weeks = weeklyRates(data, 8)
  const hasAny = weeks.some(w => w.due > 0)

  const chartData = weeks.map(w => ({
    label: w.label,
    Oran: w.due > 0 ? Math.round(w.rate * 100) : 0,
  }))

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tamamlama oranı trendi</CardTitle>
        <span className="text-xs text-muted">Son 8 hafta</span>
      </CardHeader>
      <CardBody>
        {!hasAny ? (
          <p className="py-6 text-center text-sm text-muted">Trend için yeterli veri yok.</p>
        ) : (
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={chartData} margin={{ top: 8, right: 4, bottom: 0, left: -24 }}>
              <defs>
                <linearGradient id="trendFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={CHART.primary} stopOpacity={0.45} />
                  <stop offset="100%" stopColor={CHART.primary} stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid stroke={CHART.grid} strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="label" tick={AXIS_TICK} tickLine={false} axisLine={false} />
              <YAxis domain={[0, 100]} tick={AXIS_TICK} tickLine={false} axisLine={false} tickFormatter={v => `%${v}`} />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: CHART.grid }} />
              <Area
                type="monotone"
                dataKey="Oran"
                stroke={CHART.primary}
                strokeWidth={2}
                fill="url(#trendFill)"
                dot={{ r: 2.5, fill: CHART.primary, strokeWidth: 0 }}
                activeDot={{ r: 4 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardBody>
    </Card>
  )
}
