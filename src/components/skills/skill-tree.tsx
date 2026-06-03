'use client'
import { Lock, Check, Sparkles, TrendingUp } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getLevelInfo } from '@/lib/gamification'
import {
  SKILL_TREE, BRANCH_META, type SkillBranch,
  skillPointsAvailable, skillPointsEarned, skillXpMultiplier, skillStreakBonus, canUnlockSkill,
} from '@/lib/skills'
import { Card, CardBody } from '@/components/ui/card'
import { fireConfetti, haptic } from '@/lib/confetti'
import { cn } from '@/lib/utils'

const BRANCHES: SkillBranch[] = ['discipline', 'resilience', 'focus', 'fortune']

export function SkillTree() {
  const { data, unlockSkill } = useStore()
  const level = getLevelInfo(data.profile.totalXP).level
  const unlocked = data.unlockedSkills
  const available = skillPointsAvailable(level, unlocked)
  const earned = skillPointsEarned(level)
  const xpMult = skillXpMultiplier(unlocked)
  const streakPlus = skillStreakBonus(unlocked)

  function handleUnlock(id: string, emoji: string, e: React.MouseEvent) {
    if (unlockSkill(id)) {
      fireConfetti({ count: 45, origin: { x: e.clientX, y: e.clientY }, power: 0.9 })
      haptic([20, 40, 20])
    }
  }

  return (
    <div className="space-y-5">
      {/* Summary */}
      <Card>
        <CardBody className="grid grid-cols-3 gap-3 text-center">
          <div>
            <p className="text-xl font-bold text-primary">{available}</p>
            <p className="text-[11px] text-muted">Harcanabilir SP</p>
            <p className="text-[10px] text-muted-2">{earned} kazanıldı</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-1 text-xl font-bold text-xp">
              <Sparkles size={15} /> +{Math.round((xpMult - 1) * 100)}%
            </p>
            <p className="text-[11px] text-muted">XP bonusu</p>
          </div>
          <div>
            <p className="flex items-center justify-center gap-1 text-xl font-bold text-success">
              <TrendingUp size={15} /> +{Math.round(streakPlus * 100)}%
            </p>
            <p className="text-[11px] text-muted">Streak bonusu</p>
          </div>
        </CardBody>
      </Card>

      <p className="text-center text-xs text-muted-2">
        Her seviye 1 beceri puanı (SP) verir. Bir dalda ilerlemek için önceki düğümü açman gerekir.
      </p>

      {/* Branches */}
      <div className="grid gap-4 sm:grid-cols-2">
        {BRANCHES.map(branch => {
          const meta = BRANCH_META[branch]
          const nodes = SKILL_TREE.filter(n => n.branch === branch)
          return (
            <Card key={branch}>
              <CardBody className="space-y-2">
                <div className="flex items-center gap-2 pb-1">
                  <span className="text-lg">{meta.emoji}</span>
                  <span className="text-sm font-semibold text-fg font-display" style={{ color: meta.color }}>{meta.label}</span>
                </div>
                {nodes.map((node, i) => {
                  const isUnlocked = unlocked.includes(node.id)
                  const unlockable = canUnlockSkill(node, level, unlocked)
                  const locked = !isUnlocked && !unlockable
                  return (
                    <div key={node.id} className="relative">
                      {i > 0 && <div className="absolute -top-2 left-[18px] h-2 w-px bg-border" />}
                      <button
                        onClick={e => unlockable && handleUnlock(node.id, node.emoji, e)}
                        disabled={!unlockable}
                        className={cn(
                          'flex w-full items-center gap-3 rounded-lg border p-2.5 text-left transition-all',
                          isUnlocked ? 'border-transparent' : unlockable ? 'border-border bg-surface-2 hover:border-border-hover' : 'border-border bg-surface opacity-55',
                        )}
                        style={isUnlocked ? { backgroundColor: meta.color + '1a', borderColor: meta.color + '55' } : undefined}>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-lg"
                          style={{ backgroundColor: isUnlocked ? meta.color + '33' : 'rgb(var(--c-surface2))' }}>
                          {isUnlocked ? node.emoji : locked ? <Lock size={15} className="text-muted-2" /> : node.emoji}
                        </span>
                        <span className="min-w-0 flex-1">
                          <span className="block text-sm font-medium text-fg">{node.name}</span>
                          <span className="block text-[11px] text-muted">{node.description}</span>
                        </span>
                        <span className="shrink-0 text-xs font-semibold">
                          {isUnlocked ? <Check size={15} className="text-success" /> : <span className="text-primary">{node.cost} SP</span>}
                        </span>
                      </button>
                    </div>
                  )
                })}
              </CardBody>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
