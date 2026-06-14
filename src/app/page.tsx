'use client'
import dynamic from 'next/dynamic'
import { LevelHero } from '@/components/profile/level-hero'
import { TodayHabits } from '@/components/dashboard/today-habits'
import { BrixHero } from '@/components/dashboard/brix-hero'
import { BrixComputer } from '@/components/dashboard/brix-computer'
import { FeatureCarousel } from '@/components/dashboard/feature-carousel'
import { AdvisorCard } from '@/components/advisor/advisor-card'
import { DailyRewards } from '@/components/dashboard/daily-rewards'
import { SkeletonCard } from '@/components/ui/skeleton'

// Above-the-fold bileşenler direkt import edilir.
// Fold altındakiler lazy load ile yüklenir — ilk render'da JS bundle'ı küçültür.

const QuestsPanel      = dynamic(() => import('@/components/quests/quests-panel').then(m => ({ default: m.QuestsPanel })), { loading: () => <SkeletonCard /> })
const RealmCard        = dynamic(() => import('@/components/realm/realm-card').then(m => ({ default: m.RealmCard })), { loading: () => <SkeletonCard /> })
const DailyQuote       = dynamic(() => import('@/components/dashboard/daily-quote').then(m => ({ default: m.DailyQuote })), { loading: () => <SkeletonCard className="h-20" /> })
const WeeklySnapshot   = dynamic(() => import('@/components/dashboard/weekly-snapshot').then(m => ({ default: m.WeeklySnapshot })), { loading: () => <SkeletonCard /> })
const ShadowRace       = dynamic(() => import('@/components/dashboard/shadow-race').then(m => ({ default: m.ShadowRace })), { loading: () => <SkeletonCard /> })
const BadDay           = dynamic(() => import('@/components/dashboard/bad-day').then(m => ({ default: m.BadDay })), { ssr: false })
const WaterWidget      = dynamic(() => import('@/components/dashboard/water-widget').then(m => ({ default: m.WaterWidget })), { loading: () => <SkeletonCard /> })
const MoodQuickWidget  = dynamic(() => import('@/components/dashboard/mood-quick-widget').then(m => ({ default: m.MoodQuickWidget })), { loading: () => <SkeletonCard /> })
const ClimateWidget    = dynamic(() => import('@/components/dashboard/climate-widget').then(m => ({ default: m.ClimateWidget })), { loading: () => <SkeletonCard className="h-24" /> })
const FutureSelfBadge  = dynamic(() => import('@/components/dashboard/future-self-badge').then(m => ({ default: m.FutureSelfBadge })), { loading: () => <SkeletonCard /> })
const StreakOverview   = dynamic(() => import('@/components/dashboard/streak-overview').then(m => ({ default: m.StreakOverview })), { loading: () => <SkeletonCard /> })
const RecentAchievements = dynamic(() => import('@/components/dashboard/recent-achievements').then(m => ({ default: m.RecentAchievements })), { loading: () => <SkeletonCard /> })
const CategoryBars     = dynamic(() => import('@/components/dashboard/category-bars').then(m => ({ default: m.CategoryBars })), { loading: () => <SkeletonCard /> })
const DopamineSprites  = dynamic(() => import('@/components/dashboard/dopamine-sprites').then(m => ({ default: m.DopamineSprites })), { ssr: false })

export default function DashboardPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <BrixHero />
      <BrixComputer />
      <FeatureCarousel />
      <AdvisorCard />
      <LevelHero />
      <QuestsPanel />
      <RealmCard />
      <DailyQuote />
      <DailyRewards />
      <WeeklySnapshot />
      <ShadowRace />
      <TodayHabits />
      <BadDay />
      <div className="grid gap-4 sm:grid-cols-2">
        <WaterWidget />
        <MoodQuickWidget />
      </div>
      <ClimateWidget />
      <FutureSelfBadge />
      <div className="grid gap-4 sm:grid-cols-2">
        <StreakOverview />
        <RecentAchievements />
      </div>
      <CategoryBars />
      <DopamineSprites />
    </div>
  )
}
