'use client'
import { useState, useEffect, useRef } from 'react'
import { Check, SkipForward, PartyPopper } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { subtaskKey, todayKey } from '@/lib/store'
import { fireConfetti, haptic } from '@/lib/confetti'
import { cn } from '@/lib/utils'

export function OneThing() {
  const { habitsToday, todayCompletedIds, toggleHabit, toggleSubtask, data } = useStore()
  const [skip, setSkip] = useState(0)
  const celebrated = useRef(false)

  const incomplete = habitsToday.filter(h => !todayCompletedIds.has(h.id))
  const total = habitsToday.length
  const doneCount = total - incomplete.length

  useEffect(() => {
    if (total > 0 && incomplete.length === 0 && !celebrated.current) {
      celebrated.current = true
      fireConfetti({ count: 160, power: 1.4 })
      haptic([40, 60, 40, 60, 80])
    }
    if (incomplete.length > 0) celebrated.current = false
  }, [incomplete.length, total])

  if (total === 0) {
    return (
      <Card className="p-10 text-center">
        <p className="text-sm text-muted">Bugün için planlanmış alışkanlık yok.</p>
      </Card>
    )
  }

  if (incomplete.length === 0) {
    return (
      <Card glow className="flex flex-col items-center gap-4 p-12 text-center">
        <PartyPopper size={56} className="text-xp" />
        <h2 className="text-xl font-bold text-fg font-display">Hepsi tamam!</h2>
        <p className="text-sm text-muted">Bugünün tüm alışkanlıklarını bitirdin. Kendinle gurur duy.</p>
      </Card>
    )
  }

  const current = incomplete[skip % incomplete.length]
  const steps = current.subtasks ?? []
  const doneSteps = data.subtaskDone[subtaskKey(todayKey(), current.id)] ?? []

  function complete(e: React.MouseEvent) {
    fireConfetti({ count: 90, origin: { x: e.clientX, y: e.clientY }, power: 1.1 })
    haptic([20, 40, 20])
    toggleHabit(current.id)
  }

  return (
    <div className="space-y-4">
      <p className="text-center text-sm text-muted font-display">
        Bugün {doneCount} / {total} tamamlandı
      </p>

      <Card glow className="flex flex-col items-center gap-6 p-10 text-center">
        <div
          className="flex h-28 w-28 items-center justify-center rounded-2xl text-6xl"
          style={{ backgroundColor: current.color + '22' }}
        >
          {current.emoji}
        </div>

        <div>
          <h2 className="text-2xl font-bold text-fg font-display">{current.name}</h2>
          {current.description && <p className="mt-2 text-sm text-muted">{current.description}</p>}
        </div>

        {steps.length > 0 && (
          <div className="w-full max-w-sm space-y-2 text-left">
            {steps.map(step => {
              const checked = doneSteps.includes(step.id)
              return (
                <button key={step.id} onClick={() => { toggleSubtask(current.id, step.id); haptic(15) }}
                  className="flex w-full items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
                  <span className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all',
                    checked ? 'border-success bg-success/20 text-success' : 'border-border-hover',
                  )}>
                    {checked && <Check size={13} />}
                  </span>
                  <span className={cn('text-sm', checked ? 'text-muted line-through' : 'text-fg')}>{step.text}</span>
                </button>
              )
            })}
          </div>
        )}

        <div className="flex w-full max-w-sm flex-col gap-2">
          <Button variant="primary" size="lg" className="w-full" onClick={complete}>
            <Check size={18} /> Tamamladım
          </Button>
          {incomplete.length > 1 && (
            <Button variant="ghost" size="md" className="w-full" onClick={() => setSkip(s => s + 1)}>
              <SkipForward size={16} /> Sonraki
            </Button>
          )}
        </div>
      </Card>
    </div>
  )
}
