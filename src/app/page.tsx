'use client'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { LevelHero } from '@/components/profile/level-hero'
import { TodayHabits } from '@/components/dashboard/today-habits'
import { StreakOverview } from '@/components/dashboard/streak-overview'
import { RecentAchievements } from '@/components/dashboard/recent-achievements'

export default function DashboardPage() {
  const today = format(new Date(), 'd MMMM EEEE', { locale: tr })
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Panel</h1>
        <p className="mt-0.5 text-sm text-muted">{today}</p>
      </div>
      <LevelHero />
      <TodayHabits />
      <div className="grid gap-4 sm:grid-cols-2">
        <StreakOverview />
        <RecentAchievements />
      </div>
    </div>
  )
}
