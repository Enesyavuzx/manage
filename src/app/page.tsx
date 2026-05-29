import { TodayHabits } from '@/components/dashboard/today-habits'
import { XpBanner } from '@/components/dashboard/xp-banner'
import { StreakOverview } from '@/components/dashboard/streak-overview'
import { RecentAchievements } from '@/components/dashboard/recent-achievements'
import { format } from 'date-fns'

export default function DashboardPage() {
  const today = format(new Date(), 'EEEE, MMMM d')
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="text-sm text-muted mt-0.5">{today}</p>
      </div>

      <XpBanner />

      <TodayHabits />

      <div className="grid gap-4 sm:grid-cols-2">
        <StreakOverview />
        <RecentAchievements />
      </div>
    </div>
  )
}
