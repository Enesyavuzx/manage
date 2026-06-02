'use client'
import { TrendingUp, Target, Flame, Calendar, Zap, Award } from 'lucide-react'
import { useStore, getStreak } from '@/hooks/useStore'
import { getLongestStreak, perfectDayCount, maxCurrentStreak } from '@/lib/store'
import { getLevelInfo } from '@/lib/gamification'
import { CATEGORY_META } from '@/lib/constants'
import { formatXP } from '@/lib/utils'
import type { Category } from '@/lib/types'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { LineChart } from '@/components/charts/line-chart'
import { BarChart } from '@/components/charts/bar-chart'
import { Heatmap } from '@/components/charts/heatmap'

function StatCard({ icon: Icon, label, value, sub, color }: {
  icon: React.ElementType; label: string; value: string | number; sub?: string; color?: string
}) {
  return (
    <Card className="p-5" interactive>
      <div className="mb-3 flex items-center gap-2">
        <Icon size={15} style={{ color: color ?? 'rgb(var(--c-muted))' }} />
        <span className="text-xs font-medium text-muted font-display">{label}</span>
      </div>
      <p className="text-2xl font-bold text-fg font-display">{value}</p>
      {sub && <p className="mt-1 text-xs text-muted">{sub}</p>}
    </Card>
  )
}

export function StatsGrid() {
  const { data } = useStore()
  const info = getLevelInfo(data.profile.totalXP)

  const totalCompletions = data.completions.length
  const activeHabits = data.habits.filter(h => !h.archived).length
  const curStreak = maxCurrentStreak(data)
  const longestEver = Math.max(0, ...data.habits.map(h => getLongestStreak(data.completions, h.id)))
  const perfect = perfectDayCount(data)

  // counts by date
  const countsByDate = new Map<string, number>()
  for (const c of data.completions) countsByDate.set(c.date, (countsByDate.get(c.date) ?? 0) + 1)

  // last 14 days line
  const last14 = eachDayOfInterval({ start: subDays(new Date(), 13), end: new Date() })
    .map(d => ({ label: format(d, 'd/M'), value: countsByDate.get(format(d, 'yyyy-MM-dd')) ?? 0 }))

  // weekday distribution
  const dows = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt']
  const dowCounts = [0, 0, 0, 0, 0, 0, 0]
  for (const c of data.completions) dowCounts[new Date(c.date + 'T12:00:00').getDay()]++
  const weekdayData = [1, 2, 3, 4, 5, 6, 0].map(i => ({ label: dows[i], value: dowCounts[i] }))

  // category breakdown
  const catCounts: Record<string, number> = {}
  for (const c of data.completions) {
    const habit = data.habits.find(h => h.id === c.habitId)
    if (habit) catCounts[habit.category] = (catCounts[habit.category] ?? 0) + 1
  }
  const topCats = Object.entries(catCounts).sort((a, b) => b[1] - a[1])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <StatCard icon={Zap}        label="Toplam XP"    value={formatXP(data.profile.totalXP)} color="rgb(var(--c-xp))" />
        <StatCard icon={Award}      label="Seviye"       value={info.level} />
        <StatCard icon={Target}     label="Tamamlama"    value={totalCompletions} />
        <StatCard icon={Flame}      label="Streak"       value={curStreak} sub="gün" color="#fb923c" />
        <StatCard icon={TrendingUp} label="En uzun"      value={longestEver} sub="gün" />
        <StatCard icon={Calendar}   label="Kusursuz gün" value={perfect} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Son 14 Gün</CardTitle></CardHeader>
          <CardBody><LineChart data={last14} /></CardBody>
        </Card>
        <Card>
          <CardHeader><CardTitle>Haftanın Günleri</CardTitle></CardHeader>
          <CardBody><BarChart data={weekdayData} /></CardBody>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle>Aktivite Haritası (17 hafta)</CardTitle></CardHeader>
        <CardBody><Heatmap countsByDate={countsByDate} /></CardBody>
      </Card>

      {topCats.length > 0 && (
        <Card>
          <CardHeader><CardTitle>Kategori Dağılımı</CardTitle></CardHeader>
          <CardBody className="space-y-3">
            {topCats.map(([cat, count]) => {
              const meta = CATEGORY_META[cat as Category]
              const pct = Math.round((count / totalCompletions) * 100)
              return (
                <div key={cat} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-fg">{meta.emoji} {meta.label}</span>
                    <span className="text-muted">{count} ({pct}%)</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                    <div className="h-full rounded-full transition-all duration-700" style={{ width: `${pct}%`, backgroundColor: meta.color }} />
                  </div>
                </div>
              )
            })}
          </CardBody>
        </Card>
      )}

      {activeHabits > 0 && (
        <Card>
          <CardHeader><CardTitle>Alışkanlık Bazında</CardTitle></CardHeader>
          <div className="divide-y divide-border">
            {data.habits.filter(h => !h.archived).map(h => {
              const total = data.completions.filter(c => c.habitId === h.id).length
              const streak = getStreak(data.completions, h.id)
              const longest = getLongestStreak(data.completions, h.id)
              return (
                <div key={h.id} className="flex items-center gap-4 px-5 py-3">
                  <span className="shrink-0 text-lg">{h.emoji}</span>
                  <span className="min-w-0 flex-1 truncate text-sm text-fg">{h.name}</span>
                  <div className="flex shrink-0 items-center gap-4 text-xs text-muted">
                    <span className="hidden sm:block">{total} kez</span>
                    <span className={streak > 0 ? 'font-medium text-orange-400' : ''}>{streak} streak</span>
                    <span className="hidden md:block">{longest} rekor</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}
    </div>
  )
}
