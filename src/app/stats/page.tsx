'use client'
import { StatsGrid } from '@/components/stats/stats-grid'
import { WeekComparison } from '@/components/stats/week-comparison'
import { HourAnalysis } from '@/components/stats/hour-analysis'
import { WeeklySummaryCard } from '@/components/stats/weekly-summary-card'
import { YearInPixels } from '@/components/stats/year-in-pixels'
import { MonthCalendar } from '@/components/stats/month-calendar'

export default function StatsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">İstatistik</h1>
        <p className="mt-0.5 text-sm text-muted">İlerlemenin zaman içindeki görünümü</p>
      </div>
      <WeeklySummaryCard />
      <YearInPixels />
      <MonthCalendar />
      <WeekComparison />
      <StatsGrid />
      <HourAnalysis />
    </div>
  )
}
