'use client'
import { LevelHero } from '@/components/profile/level-hero'
import { TodayHabits } from '@/components/dashboard/today-habits'
import { StreakOverview } from '@/components/dashboard/streak-overview'
import { RecentAchievements } from '@/components/dashboard/recent-achievements'
import { CategoryBars } from '@/components/dashboard/category-bars'
import { WaterWidget } from '@/components/dashboard/water-widget'
import { MoodQuickWidget } from '@/components/dashboard/mood-quick-widget'
import { WeeklySnapshot } from '@/components/dashboard/weekly-snapshot'
import { DopamineSprites } from '@/components/dashboard/dopamine-sprites'
import { DailyRewards } from '@/components/dashboard/daily-rewards'
import { DailyQuote } from '@/components/dashboard/daily-quote'
import { BadDay } from '@/components/dashboard/bad-day'
import { ContextGreeting } from '@/components/dashboard/context-greeting'
import { RealmCard } from '@/components/realm/realm-card'
import { AdvisorCard } from '@/components/advisor/advisor-card'
import { QuestsPanel } from '@/components/quests/quests-panel'

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <ContextGreeting />
      <AdvisorCard />
      <LevelHero />
      <QuestsPanel />
      <RealmCard />
      <DailyQuote />
      <DailyRewards />
      <WeeklySnapshot />
      <TodayHabits />
      <BadDay />
      <div className="grid gap-4 sm:grid-cols-2">
        <WaterWidget />
        <MoodQuickWidget />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <StreakOverview />
        <RecentAchievements />
      </div>
      <CategoryBars />
      <DopamineSprites />
    </div>
  )
}
