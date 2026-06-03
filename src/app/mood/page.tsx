'use client'
import { MoodTracker } from '@/components/mood/mood-tracker'
import { EnergyTracker } from '@/components/mood/energy-tracker'
import { MedicationTracker } from '@/components/mood/medication-tracker'
import { MoodHabitInsight } from '@/components/mood/mood-habit-insight'
import { MoodJournal } from '@/components/mood/mood-journal'

export default function MoodPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Ruh Hali & Enerji</h1>
        <p className="mt-0.5 text-sm text-muted">Gününü işaretle, kendini tanı</p>
      </div>
      <MoodTracker />
      <EnergyTracker />
      <MedicationTracker />
      <MoodHabitInsight />
      <MoodJournal />
    </div>
  )
}
