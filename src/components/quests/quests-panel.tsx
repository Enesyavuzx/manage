'use client'
import { useMemo } from 'react'
import { Gift, Check } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getQuests, type Quest } from '@/lib/quests'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export function QuestsPanel() {
  const { data, claimQuest } = useStore()
  const quests = useMemo(() => getQuests(data), [data])
  const daily = quests.filter(q => q.scope === 'daily')
  const themeBonus = quests.filter(q => q.scope === 'weekly' && q.themeBonus)
  const weekly = quests.filter(q => q.scope === 'weekly' && !q.themeBonus)

  if (quests.length === 0) return null

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Gift size={15} className="text-primary" />
        <span className="text-sm font-bold text-fg font-display">Görevler</span>
        <span className="text-xs text-muted">tamamla, ödülü topla</span>
      </div>
      <div className="space-y-4 p-4">
        {daily.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Bugün</p>
            <div className="space-y-2">
              {daily.map(q => <QuestRow key={q.id} quest={q} onClaim={() => claimQuest(q.id)} />)}
            </div>
          </div>
        )}
        {themeBonus.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-xp/70">Tema Görevi</p>
            <div className="space-y-2">
              {themeBonus.map(q => <QuestRow key={q.id} quest={q} onClaim={() => claimQuest(q.id)} />)}
            </div>
          </div>
        )}
        {weekly.length > 0 && (
          <div>
            <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Bu hafta</p>
            <div className="space-y-2">
              {weekly.map(q => <QuestRow key={q.id} quest={q} onClaim={() => claimQuest(q.id)} />)}
            </div>
          </div>
        )}
      </div>
    </Card>
  )
}

function QuestRow({ quest, onClaim }: { quest: Quest; onClaim: () => void }) {
  const pct = quest.target > 0 ? Math.min(100, Math.round((quest.progress / quest.target) * 100)) : 0
  return (
    <div className={cn(
      'rounded-xl border p-3 transition-colors',
      quest.claimed ? 'border-border bg-surface-2/40' :
      quest.themeBonus ? 'border-xp/30 bg-xp/5' : 'border-border bg-surface-2',
    )}>
      <div className="flex items-center gap-2.5">
        <span className="text-lg">{quest.emoji}</span>
        <div className="min-w-0 flex-1">
          <p className={cn('truncate text-sm font-medium', quest.claimed ? 'text-muted line-through' : quest.themeBonus ? 'text-fg font-semibold' : 'text-fg')}>{quest.title}</p>
          <p className={cn('text-[11px]', quest.themeBonus ? 'text-xp/70' : 'text-muted-2')}>🎁 {quest.reward} · +{quest.xp} XP</p>
        </div>
        {quest.claimed ? (
          <span className="flex shrink-0 items-center gap-1 text-xs font-medium text-success"><Check size={13} /> Alındı</span>
        ) : quest.done ? (
          <button onClick={onClaim} className="shrink-0 rounded-lg bg-xp px-3 py-1.5 text-xs font-bold text-bg shadow-glow-xp hover:brightness-110">
            Ödülü al
          </button>
        ) : (
          <span className={cn('shrink-0 text-xs font-semibold tabular-nums', quest.themeBonus ? 'text-xp/70' : 'text-muted')}>{quest.progress}/{quest.target}</span>
        )}
      </div>
      {!quest.claimed && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-surface">
          <div className={cn('h-full rounded-full transition-all duration-500', quest.done ? 'bg-xp' : quest.themeBonus ? 'bg-xp/60' : 'bg-primary')} style={{ width: `${pct}%` }} />
        </div>
      )}
    </div>
  )
}
