'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { Target, ChevronRight } from 'lucide-react'
import { format, startOfWeek, subWeeks } from 'date-fns'
import { useStore } from '@/hooks/useStore'

// Geçen haftanın retrospektifinde yazılan "gelecek hafta hedefim" bu hafta
// boyunca burada görünür. Hedefi görünür kılmak DEHB için kritik: yazılıp
// unutulan hedef, hiç konulmamış hedef gibidir.
export function WeeklyGoalCard() {
  const { data } = useStore()

  const goal = useMemo(() => {
    const thisMonday = startOfWeek(new Date(), { weekStartsOn: 1 })
    const lastMonday = format(subWeeks(thisMonday, 1), 'yyyy-MM-dd')
    const lastReview = data.weeklyReviews.find(r => r.weekStart === lastMonday)
    return lastReview?.nextWeekGoal?.trim() || null
  }, [data.weeklyReviews])

  if (!goal) return null

  return (
    <Link
      href="/weekly-review"
      className="flex items-center gap-3 rounded-xl border border-xp/30 bg-xp/5 px-3 py-2.5 transition-colors hover:bg-xp/10"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-xp/15">
        <Target size={15} className="text-xp" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-xp">Bu haftanın hedefi</p>
        <p className="truncate text-sm font-medium text-fg">{goal}</p>
      </div>
      <ChevronRight size={15} className="shrink-0 text-muted" />
    </Link>
  )
}
