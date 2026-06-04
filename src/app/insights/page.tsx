'use client'
import { InsightHighlights } from '@/components/insights/insight-highlights'
import { YearHeatmap } from '@/components/insights/year-heatmap'
import { CompletionRateTrend } from '@/components/insights/completion-rate-trend'
import { HabitReliability } from '@/components/insights/habit-reliability'
import { EnergyInsight } from '@/components/insights/energy-insight'
import { MoodHabitInsight } from '@/components/mood/mood-habit-insight'

export default function InsightsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">İçgörüler</h1>
        <p className="mt-0.5 text-sm text-muted">Verinin sana ne söylediği, eyleme dönüşür halde</p>
      </div>
      <InsightHighlights />
      <YearHeatmap />
      <CompletionRateTrend />
      <HabitReliability />
      <EnergyInsight />
      <MoodHabitInsight />
    </div>
  )
}
