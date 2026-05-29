'use client'
import { Zap } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getLevel } from '@/lib/constants'
import { formatXP } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

export function XpBanner() {
  const { data } = useStore()
  const { level, progress, xpInLevel, xpNeeded } = getLevel(data.profile.totalXP)
  const available = data.profile.totalXP - data.profile.redeemedXP

  return (
    <div className="rounded-xl border border-xp/20 bg-xp/5 p-5">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-xp/20">
            <Zap size={16} className="text-xp" fill="currentColor" />
          </div>
          <div>
            <p className="text-xs text-muted">Current level</p>
            <p className="text-lg font-bold text-white">Level {level}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted">Available XP</p>
          <p className="text-xl font-bold text-xp">{formatXP(available)}</p>
        </div>
      </div>
      <Progress value={xpInLevel} max={xpNeeded} color="xp" />
      <p className="mt-1.5 text-xs text-muted">{xpInLevel} / {xpNeeded} XP to level {level + 1}</p>
    </div>
  )
}
