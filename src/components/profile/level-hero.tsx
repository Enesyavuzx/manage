'use client'
import { useStore } from '@/hooks/useStore'
import { getLevelInfo, getRank } from '@/lib/gamification'
import { titleById } from '@/lib/achievements'
import { formatXP } from '@/lib/utils'
import { Ring } from '@/components/ui/ring'
import { RankBadge } from './rank-badge'
import { Progress } from '@/components/ui/progress'

export function LevelHero() {
  const { data } = useStore()
  const { totalXP, redeemedXP } = data.profile
  const info = getLevelInfo(totalXP)
  const { rank, next, levelsToNext } = getRank(info.level)
  const title = titleById(data.profile.activeTitleId)
  const available = totalXP - redeemedXP

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-surface p-6 pixel-shadow aurora-border">
      <div className="relative z-10 flex flex-col gap-6 sm:flex-row sm:items-center">
        {/* Ring */}
        <div className="flex items-center justify-center">
          <Ring progress={info.progress} size={132} stroke={11} color={rank.color}>
            <span className="text-xs text-muted font-display">SEVİYE</span>
            <span className="text-4xl font-bold text-fg font-display leading-none" style={{ color: rank.color }}>
              {info.level}
            </span>
          </Ring>
        </div>

        {/* Info */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="text-xl font-bold text-fg font-display">{data.profile.name}</h2>
            <RankBadge rank={rank} size="md" />
          </div>

          {title && (
            <p className="text-sm text-muted">
              <span className="mr-1">{title.emoji}</span>
              <span className="text-primary font-medium">{title.label}</span>
            </p>
          )}

          <div className="space-y-1.5">
            <div className="flex items-center justify-between text-xs">
              <span className="text-muted">{info.xpInLevel} / {info.xpNeeded} XP</span>
              <span className="text-muted">{formatXP(totalXP)} toplam</span>
            </div>
            <Progress value={info.xpInLevel} max={info.xpNeeded} color="xp" size="lg" animated />
            {next && (
              <p className="text-xs text-muted">
                {levelsToNext} seviye sonra <span style={{ color: next.color }}>{next.emoji} {next.label}</span>
              </p>
            )}
          </div>
        </div>

        {/* Available XP */}
        <div className="flex flex-row gap-4 sm:flex-col sm:items-end sm:text-right">
          <div>
            <p className="text-xs text-muted font-display">HARCANABİLİR</p>
            <p className="text-2xl font-bold text-xp font-display">{formatXP(available)}</p>
          </div>
        </div>
      </div>
    </div>
  )
}
