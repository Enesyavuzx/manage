'use client'
import { WeeklyReview } from '@/components/review/weekly-review'

export default function WeeklyReviewPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Haftalık Retrospektif</h1>
        <p className="mt-0.5 text-sm text-muted">Haftanı değerlendir, bir sonrakini planla</p>
      </div>
      <WeeklyReview />
    </div>
  )
}
