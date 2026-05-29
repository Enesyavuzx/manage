import { AchievementGrid } from '@/components/rewards/achievement-grid'
import { RewardShop } from '@/components/rewards/reward-shop'

export default function RewardsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Rewards</h1>
        <p className="text-sm text-muted mt-0.5">Earn XP, unlock achievements, redeem rewards</p>
      </div>
      <AchievementGrid />
      <RewardShop />
    </div>
  )
}
