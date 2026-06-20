'use client'
import dynamic from 'next/dynamic'
import { BarChart3, CalendarDays, LineChart } from 'lucide-react'
import { SkeletonCard } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Tabs } from '@/components/ui/tabs'

const WeeklySummaryCard = dynamic(() => import('@/components/stats/weekly-summary-card').then(m => ({ default: m.WeeklySummaryCard })), { loading: () => <SkeletonCard /> })
const YearInPixels      = dynamic(() => import('@/components/stats/year-in-pixels').then(m => ({ default: m.YearInPixels })), { loading: () => <SkeletonCard className="h-40" /> })
const MonthCalendar     = dynamic(() => import('@/components/stats/month-calendar').then(m => ({ default: m.MonthCalendar })), { loading: () => <SkeletonCard className="h-64" /> })
const WeekComparison    = dynamic(() => import('@/components/stats/week-comparison').then(m => ({ default: m.WeekComparison })), { loading: () => <SkeletonCard /> })
const StatsGrid         = dynamic(() => import('@/components/stats/stats-grid').then(m => ({ default: m.StatsGrid })), { loading: () => <SkeletonCard /> })
const HourAnalysis      = dynamic(() => import('@/components/stats/hour-analysis').then(m => ({ default: m.HourAnalysis })), { loading: () => <SkeletonCard className="h-40" /> })

export default function StatsPage() {
  usePageTitle('İstatistik')
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">İstatistik</h1>
        <p className="mt-0.5 text-sm text-muted">İlerlemenin zaman içindeki görünümü</p>
      </div>

      <Tabs
        tabs={[
          {
            id: 'ozet', label: 'Özet', icon: BarChart3,
            content: <div className="space-y-6"><ErrorBoundary><WeeklySummaryCard /></ErrorBoundary><ErrorBoundary><StatsGrid /></ErrorBoundary></div>,
          },
          {
            id: 'takvim', label: 'Takvim', icon: CalendarDays,
            content: <div className="space-y-6"><ErrorBoundary><MonthCalendar /></ErrorBoundary><ErrorBoundary><YearInPixels /></ErrorBoundary></div>,
          },
          {
            id: 'analiz', label: 'Analiz', icon: LineChart,
            content: <div className="space-y-6"><ErrorBoundary><WeekComparison /></ErrorBoundary><ErrorBoundary><HourAnalysis /></ErrorBoundary></div>,
          },
        ]}
      />
    </div>
  )
}
