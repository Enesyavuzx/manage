'use client'
import { Gift, Check, Target, Flame } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardBody } from '@/components/ui/card'
import { loginBonusXP, challengeForToday } from '@/lib/daily'
import { todayKey } from '@/lib/store'
import { fireConfetti, haptic } from '@/lib/confetti'
import { cn } from '@/lib/utils'

export function DailyRewards() {
  const { data, claimDailyBonus, claimChallenge } = useStore()

  const today = todayKey()
  const loginStreak = data.profile.loginStreak ?? 1
  const dailyClaimed = data.profile.dailyClaimedDate === today
  const bonusXP = loginBonusXP(loginStreak)

  const ch = challengeForToday()
  const progress = Math.min(ch.progress(data), ch.target)
  const challengeClaimed = data.profile.challengeClaimedDate === today
  const challengeReady = progress >= ch.target && !challengeClaimed
  const pct = Math.round((progress / ch.target) * 100)

  function onClaimDaily(e: React.MouseEvent) {
    if (dailyClaimed) return
    fireConfetti({ count: 50, origin: { x: e.clientX, y: e.clientY }, power: 0.9 })
    haptic([20, 40, 20])
    claimDailyBonus()
  }

  function onClaimChallenge(e: React.MouseEvent) {
    if (!challengeReady) return
    fireConfetti({ count: 60, origin: { x: e.clientX, y: e.clientY }, power: 1 })
    haptic([20, 40, 20])
    claimChallenge()
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {/* Daily login bonus */}
      <Card>
        <CardBody className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary/12 text-xl">
            🎁
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-fg">Günlük giriş</p>
            <p className="flex items-center gap-1 text-xs text-muted">
              <Flame size={11} className="text-orange-400" /> {loginStreak} gün · +{bonusXP} XP
            </p>
          </div>
          <button onClick={onClaimDaily} disabled={dailyClaimed}
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-all',
              dailyClaimed ? 'bg-surface-2 text-muted' : 'bg-primary text-bg hover:opacity-90',
            )}>
            {dailyClaimed ? <><Check size={13} /> Alındı</> : <><Gift size={13} /> Al</>}
          </button>
        </CardBody>
      </Card>

      {/* Daily challenge */}
      <Card>
        <CardBody className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-xp/12 text-xl">
            {ch.emoji}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-fg">{ch.label}</p>
            <div className="mt-1 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-xp transition-all" style={{ width: `${pct}%` }} />
              </div>
              <span className="text-[11px] text-muted">{progress}/{ch.target}</span>
            </div>
          </div>
          <button onClick={onClaimChallenge} disabled={!challengeReady}
            className={cn(
              'flex shrink-0 items-center gap-1 rounded-lg px-3 py-2 text-xs font-medium transition-all',
              challengeClaimed ? 'bg-surface-2 text-muted'
                : challengeReady ? 'bg-xp text-bg hover:opacity-90'
                : 'bg-surface-2 text-muted-2',
            )}>
            {challengeClaimed ? <><Check size={13} /> +{ch.xp}</> : <><Target size={13} /> {ch.xp} XP</>}
          </button>
        </CardBody>
      </Card>
    </div>
  )
}
