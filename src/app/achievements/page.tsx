'use client'
import { AchievementGrid } from '@/components/rewards/achievement-grid'

export default function AchievementsPage() {
  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Başarımlar</h1>
        <p className="mt-0.5 text-sm text-muted">80 başarım, 5 kademe. Hepsini topla.</p>
      </div>
      <AchievementGrid />
    </div>
  )
}
