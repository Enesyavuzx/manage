'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useStore } from '@/hooks/useStore'

export function FutureSelfBadge() {
  const { data } = useStore()

  const { unread, total } = useMemo(() => {
    const now = new Date().toISOString()
    const ready = data.futureLetters.filter(l => l.unlockAt <= now)
    const unread = ready.filter(l => !l.opened).length
    return { unread, total: data.futureLetters.length }
  }, [data.futureLetters])

  if (total === 0) return null

  return (
    <Link
      href="/gelecek"
      className="flex items-center gap-3 rounded-xl border border-border bg-surface px-4 py-3 transition-colors hover:bg-surface-2"
    >
      <span className="text-2xl leading-none">{unread > 0 ? '✉️' : '📬'}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-fg">
          {unread > 0 ? `${unread} mektup geldi!` : 'Gelecek Benliğine Mektuplar'}
        </p>
        <p className="text-xs text-muted">
          {unread > 0
            ? 'Geçmişteki senin sözlerin seni bekliyor'
            : `${total} mektup yazıldı · daha kilit altında`}
        </p>
      </div>
      {unread > 0 && (
        <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-bg">
          {unread}
        </span>
      )}
      <ChevronRight size={16} className="shrink-0 text-muted" />
    </Link>
  )
}
