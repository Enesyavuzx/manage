'use client'
import { RewardShop } from '@/components/rewards/reward-shop'
import { MysteryBox } from '@/components/rewards/mystery-box'
import { LevelHero } from '@/components/profile/level-hero'

export default function RewardsPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Ödüller</h1>
        <p className="mt-0.5 text-sm text-muted">XP&apos;ni harca, kendini ödüllendir</p>
      </div>
      <LevelHero />
      <div className="grid gap-4 lg:grid-cols-[1fr_320px]">
        <div className="order-2 lg:order-1"><RewardShop /></div>
        <div className="order-1 lg:order-2"><MysteryBox /></div>
      </div>
    </div>
  )
}
