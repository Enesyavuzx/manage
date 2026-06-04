'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Check, Settings2 } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getAdvice, philosopherOf, philosopherLine, PHILOSOPHERS, type Advice } from '@/lib/advisor'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function AdvisorCard() {
  const { data, toggleHabit, addWater, setAdvisor } = useStore()
  const [picking, setPicking] = useState(false)

  const philosopher = useMemo(() => philosopherOf(data), [data])
  const line = useMemo(() => philosopherLine(philosopher), [philosopher])
  const advice = useMemo(() => getAdvice(data), [data])

  const top = advice[0]
  const rest = advice.slice(1, 4)

  return (
    <Card className="overflow-hidden">
      {/* Filozof başlığı */}
      <div className="flex items-start gap-3 border-b border-border px-4 py-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-2xl">{philosopher.emoji}</span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="text-sm font-bold text-fg font-display">{philosopher.name}</p>
            <span className="text-[10px] text-muted-2">{philosopher.era}</span>
          </div>
          <p className="mt-0.5 text-xs italic leading-snug text-muted">&ldquo;{line}&rdquo;</p>
        </div>
        <button onClick={() => setPicking(p => !p)} className="shrink-0 text-muted-2 hover:text-fg" aria-label="Danışmanı seç">
          <Settings2 size={15} />
        </button>
      </div>

      {/* Filozof seçici */}
      {picking && (
        <div className="border-b border-border bg-surface-2/50 px-4 py-3">
          <p className="mb-2 text-[11px] font-medium text-muted">Danışmanını seç</p>
          <div className="flex flex-wrap gap-1.5">
            <button onClick={() => { setAdvisor(null); setPicking(false) }}
              className={cn('rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                !data.profile.advisorId ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-muted hover:text-fg')}>
              🗓 Günün filozofu
            </button>
            {PHILOSOPHERS.map(p => (
              <button key={p.id} onClick={() => { setAdvisor(p.id); setPicking(false) }}
                className={cn('rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                  data.profile.advisorId === p.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface text-muted hover:text-fg')}>
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Öğüt */}
      <div className="p-4">
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Şimdi ne yapmalıyım?</p>
        {!top ? (
          <p className="text-sm text-muted">Önce birkaç alışkanlık ekle, sana yol göstereyim.</p>
        ) : (
          <>
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-2xl">{top.emoji}</span>
              <div className="min-w-0 flex-1">
                <p className="text-base font-semibold text-fg">{top.title}</p>
                <p className="mt-0.5 text-xs text-muted">{top.reason}</p>
              </div>
            </div>
            <div className="mt-3">
              <AdviceAction advice={top} onComplete={toggleHabit} onWater={addWater} primary />
            </div>
          </>
        )}

        {/* İkincil öneriler */}
        {rest.length > 0 && (
          <div className="mt-4 space-y-1.5 border-t border-border pt-3">
            {rest.map(a => (
              <div key={a.id} className="flex items-center gap-2.5">
                <span className="text-base">{a.emoji}</span>
                <span className="min-w-0 flex-1 truncate text-xs text-muted">{a.title}</span>
                <AdviceAction advice={a} onComplete={toggleHabit} onWater={addWater} />
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  )
}

function AdviceAction({ advice, onComplete, onWater, primary }: {
  advice: Advice
  onComplete: (id: string) => void
  onWater: () => void
  primary?: boolean
}) {
  if (advice.kind === 'habit' && advice.habitId) {
    const id = advice.habitId
    return primary
      ? <Button variant="primary" className="w-full" onClick={() => onComplete(id)}>Şimdi yap</Button>
      : <button onClick={() => onComplete(id)} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10"><Check size={12} /> Yap</button>
  }
  if (advice.kind === 'water') {
    return primary
      ? <Button variant="primary" className="w-full" onClick={onWater}>Bir bardak ekle</Button>
      : <button onClick={onWater} className="rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-primary hover:bg-primary/10">+1</button>
  }
  const href = advice.href ?? '/'
  return primary
    ? <Link href={href}><Button variant="primary" className="w-full">Git</Button></Link>
    : <Link href={href} className="flex items-center gap-0.5 rounded-lg border border-border px-2 py-1 text-[11px] font-medium text-muted hover:text-fg">Git <ChevronRight size={12} /></Link>
}
