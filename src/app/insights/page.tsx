'use client'
import dynamic from 'next/dynamic'
import { SkeletonCard } from '@/components/ui/skeleton'
import { ErrorBoundary } from '@/components/ui/error-boundary'
import { usePageTitle } from '@/hooks/usePageTitle'

const InsightHighlights  = dynamic(() => import('@/components/insights/insight-highlights').then(m => ({ default: m.InsightHighlights })), { loading: () => <SkeletonCard /> })
const YearHeatmap        = dynamic(() => import('@/components/insights/year-heatmap').then(m => ({ default: m.YearHeatmap })), { loading: () => <SkeletonCard className="h-48" /> })
const CompletionRateTrend = dynamic(() => import('@/components/insights/completion-rate-trend').then(m => ({ default: m.CompletionRateTrend })), { loading: () => <SkeletonCard className="h-40" /> })
const HabitReliability   = dynamic(() => import('@/components/insights/habit-reliability').then(m => ({ default: m.HabitReliability })), { loading: () => <SkeletonCard /> })
const EnergyInsight      = dynamic(() => import('@/components/insights/energy-insight').then(m => ({ default: m.EnergyInsight })), { loading: () => <SkeletonCard /> })
const MoodHabitInsight   = dynamic(() => import('@/components/mood/mood-habit-insight').then(m => ({ default: m.MoodHabitInsight })), { loading: () => <SkeletonCard /> })

export default function InsightsPage() {
  usePageTitle('İçgörüler')
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">İçgörüler</h1>
        <p className="mt-0.5 text-sm text-muted">Verinin sana ne söylediği, eyleme dönüşür halde</p>
      </div>
      <ErrorBoundary><InsightHighlights /></ErrorBoundary>
      <ErrorBoundary><YearHeatmap /></ErrorBoundary>
      <ErrorBoundary><CompletionRateTrend /></ErrorBoundary>
      <ErrorBoundary><HabitReliability /></ErrorBoundary>
      <ErrorBoundary><EnergyInsight /></ErrorBoundary>
      <ErrorBoundary><MoodHabitInsight /></ErrorBoundary>
    </div>
  )
}
