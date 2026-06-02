'use client'
import Link from 'next/link'
import { Trophy, ChevronRight } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { ACHIEVEMENTS, TIER_META } from '@/lib/achievements'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export function RecentAchievements() {
  const { data } = useStore()
  const recent = Object.entries(data.unlockedAchievements)
    .sort((a, b) => new Date(b[1]).getTime() - new Date(a[1]).getTime())
    .slice(0, 4)
    .map(([id]) => ACHIEVEMENTS.find(a => a.id === id))
    .filter(Boolean)

  const total = ACHIEVEMENTS.length
  const unlocked = Object.keys(data.unlockedAchievements).length

  return (
    <Card>
      <CardHeader>
        <CardTitle><span className="inline-flex items-center gap-2"><Trophy size={15} className="text-xp" /> Başarımlar</span></CardTitle>
        <Link href="/achievements" className="flex items-center gap-0.5 text-xs text-muted hover:text-fg">
          {unlocked}/{total} <ChevronRight size={13} />
        </Link>
      </CardHeader>
      <div className="space-y-3 p-4">
        {recent.length === 0 && <p className="py-4 text-center text-sm text-muted">Henüz başarım yok. İlk görevini tamamla!</p>}
        {recent.map(a => a && (
          <div key={a.id} className="flex items-center gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-xl"
              style={{ backgroundColor: TIER_META[a.tier].ring }}>
              {a.emoji}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-fg">{a.name}</p>
              <p className="truncate text-xs text-muted">{a.description}</p>
            </div>
            <span className="shrink-0 text-xs font-medium text-xp">+{a.xpBonus}</span>
          </div>
        ))}
      </div>
    </Card>
  )
}
