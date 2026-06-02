'use client'
import { useStore } from '@/hooks/useStore'
import { TITLES } from '@/lib/achievements'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Lock, Check } from 'lucide-react'

export function TitlesPanel() {
  const { data, setActiveTitle } = useStore()
  const active = data.profile.activeTitleId

  return (
    <Card>
      <CardHeader>
        <CardTitle>Ünvanlar</CardTitle>
        <span className="text-xs text-muted">{Object.keys(data.unlockedTitles).length}/{TITLES.length}</span>
      </CardHeader>
      <div className="grid grid-cols-1 gap-2 p-4 sm:grid-cols-2">
        <button
          onClick={() => setActiveTitle(null)}
          className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all',
            active === null ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
          <span className="text-base">🚫</span> Ünvan yok
          {active === null && <Check size={14} className="ml-auto" />}
        </button>
        {TITLES.map(t => {
          const unlocked = Boolean(data.unlockedTitles[t.id])
          const isActive = active === t.id
          return (
            <button key={t.id} disabled={!unlocked} onClick={() => setActiveTitle(t.id)}
              className={cn('flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all',
                !unlocked ? 'border-border bg-surface opacity-50 cursor-not-allowed' :
                isActive ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-fg hover:border-border-hover')}>
              <span className="text-base">{unlocked ? t.emoji : <Lock size={14} className="text-muted-2" />}</span>
              <span className="truncate">{t.label}</span>
              {isActive && <Check size={14} className="ml-auto shrink-0" />}
            </button>
          )
        })}
      </div>
    </Card>
  )
}
