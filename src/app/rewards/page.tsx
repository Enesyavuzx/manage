'use client'
import { RewardShop } from '@/components/rewards/reward-shop'
import { LevelHero } from '@/components/profile/level-hero'

export default function RewardsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Ödüller</h1>
        <p className="mt-0.5 text-sm text-muted">XP'ni harca, kendini ödüllendir</p>
      </div>
      <LevelHero />
      <RewardShop />
    </div>
  )
}
