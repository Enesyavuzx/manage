'use client'
import { BarChart3 } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { StatBar } from '@/components/ui/stat-bar'
import { CATEGORY_META } from '@/lib/constants'
import type { Category } from '@/lib/types'

export function CategoryBars() {
  const { data } = useStore()

  const habitCat = new Map(data.habits.map(h => [h.id, h.category]))
  const counts = new Map<Category, number>()
  for (const c of data.completions) {
    const cat = habitCat.get(c.habitId)
    if (!cat) continue
    counts.set(cat, (counts.get(cat) ?? 0) + 1)
  }

  const rows = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
  const max = Math.max(1, ...rows.map(r => r[1]))

  return (
    <Card>
      <CardHeader>
        <CardTitle><span className="inline-flex items-center gap-2"><BarChart3 size={15} /> Kategori Dağılımı</span></CardTitle>
      </CardHeader>
      <div className="space-y-3.5 p-5">
        {rows.length === 0 && (
          <p className="py-4 text-center text-sm text-muted">Henüz tamamlanmış görev yok.</p>
        )}
        {rows.map(([cat, count]) => {
          const meta = CATEGORY_META[cat]
          return (
            <StatBar
              key={cat}
              label={meta.label}
              emoji={meta.emoji}
              value={count}
              max={max}
              valueLabel={`${count}`}
              color={meta.color}
            />
          )
        })}
      </div>
    </Card>
  )
}
