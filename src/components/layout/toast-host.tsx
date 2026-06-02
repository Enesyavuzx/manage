'use client'
import { useStore } from '@/hooks/useStore'
import { cn } from '@/lib/utils'
import type { GameNotification } from '@/hooks/useStore'

const KIND_STYLE: Record<GameNotification['kind'], string> = {
  xp:          'border-xp/40 bg-xp/10',
  levelup:     'border-primary/50 bg-primary/15',
  achievement: 'border-primary/50 bg-primary/10',
  title:       'border-primary-2/50 bg-primary-2/10',
  rank:        'border-xp/50 bg-xp/15',
  reward:      'border-success/40 bg-success/10',
}

export function ToastHost() {
  const { notifications, dismissNotification } = useStore()

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-[min(92vw,340px)] flex-col gap-2">
      {notifications.map(n => (
        <button
          key={n.id}
          onClick={() => dismissNotification(n.id)}
          className={cn(
            'pointer-events-auto flex items-center gap-3 rounded-xl border px-4 py-3 text-left shadow-glow backdrop-blur-md animate-toast-in',
            KIND_STYLE[n.kind],
          )}
        >
          <span className="text-2xl shrink-0">{n.emoji}</span>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-fg font-display truncate">{n.title}</p>
            {n.subtitle && <p className="text-xs text-muted truncate">{n.subtitle}</p>}
          </div>
        </button>
      ))}
    </div>
  )
}
