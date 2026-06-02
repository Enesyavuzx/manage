'use client'
import { MoodTracker } from '@/components/mood/mood-tracker'

export default function MoodPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Ruh Hali</h1>
        <p className="mt-0.5 text-sm text-muted">Gününü işaretle, kendini tanı</p>
      </div>
      <MoodTracker />
    </div>
  )
}
