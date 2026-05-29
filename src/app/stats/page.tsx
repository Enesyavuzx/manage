import { StatsGrid } from '@/components/stats/stats-grid'

export default function StatsPage() {
  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Stats</h1>
        <p className="text-sm text-muted mt-0.5">Your progress over time</p>
      </div>
      <StatsGrid />
    </div>
  )
}
