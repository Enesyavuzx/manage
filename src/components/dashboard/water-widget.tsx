'use client'
import { Droplet, Plus, Minus } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { WATER_GOAL, WATER_XP } from '@/lib/constants'
import { todayWaterCount } from '@/lib/store'
import { haptic } from '@/lib/confetti'
import { cn } from '@/lib/utils'

export function WaterWidget() {
  const { data, addWater, removeWater } = useStore()
  const count = todayWaterCount(data)
  const reached = count >= WATER_GOAL
  const pct = Math.min(100, (count / WATER_GOAL) * 100)

  return (
    <Card>
      <CardHeader>
        <CardTitle><span className="inline-flex items-center gap-2"><Droplet size={15} /> Su Takibi</span></CardTitle>
        <span className={cn('text-xs font-medium', reached ? 'text-success' : 'text-muted')}>
          {count} / {WATER_GOAL} bardak {!reached && `· +${WATER_XP} XP`}
        </span>
      </CardHeader>

      <div className="space-y-4 p-5">
        <div className="flex flex-wrap gap-1.5">
          {Array.from({ length: WATER_GOAL }, (_, i) => (
            <div
              key={i}
              className={cn(
                'flex h-9 flex-1 min-w-7 items-center justify-center rounded-md border transition-all',
                i < count ? 'border-primary/40 bg-primary/15' : 'border-border bg-surface-2',
              )}
            >
              <Droplet size={15} className={cn(i < count ? 'text-primary' : 'text-muted-2')} fill={i < count ? 'currentColor' : 'none'} />
            </div>
          ))}
        </div>

        <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
          <div className="h-full rounded-full bg-primary transition-all duration-500" style={{ width: `${pct}%` }} />
        </div>

        <div className="flex items-center gap-2">
          <Button variant="primary" size="md" className="flex-1" onClick={() => { addWater(); haptic(15) }}>
            <Plus size={15} /> Bardak ekle
          </Button>
          <Button variant="secondary" size="md" onClick={() => { removeWater(); haptic(10) }} disabled={count === 0}>
            <Minus size={15} />
          </Button>
        </div>

        {reached && <p className="text-center text-xs font-medium text-success font-display">Günlük hedef tamam! Harika.</p>}
      </div>
    </Card>
  )
}
