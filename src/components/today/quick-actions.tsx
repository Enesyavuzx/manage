'use client'
import Link from 'next/link'
import { Droplet, Smile, Target } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { todayKey } from '@/lib/store'
import { WATER_GOAL } from '@/lib/constants'

// Tek dokunuş hızlı aksiyonlar: su, ruh hali, odak. "Şimdi" ekranından
// ayrılmadan en sık yapılanlar.
export function QuickActions() {
  const { data, addWater } = useStore()
  const today = todayKey()
  const water = data.water.filter(w => w.date === today).length

  return (
    <div className="grid grid-cols-3 gap-2">
      <button onClick={addWater}
        className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface py-3 text-xs font-medium text-fg transition-colors hover:border-border-hover">
        <Droplet size={18} className="text-sky-400" />
        Su <span className="text-muted-2 tabular-nums">{water}/{WATER_GOAL}</span>
      </button>
      <Link href="/mood"
        className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface py-3 text-xs font-medium text-fg transition-colors hover:border-border-hover">
        <Smile size={18} className="text-amber-400" />
        Ruh hali
      </Link>
      <Link href="/focus"
        className="flex flex-col items-center gap-1 rounded-xl border border-border bg-surface py-3 text-xs font-medium text-fg transition-colors hover:border-border-hover">
        <Target size={18} className="text-rose-400" />
        Odak
      </Link>
    </div>
  )
}
