'use client'
import { useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  isSameMonth, isToday, addMonths, subMonths, getDay,
} from 'date-fns'
import { tr } from 'date-fns/locale'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

export function MonthCalendar() {
  const { data } = useStore()
  const [cursor, setCursor] = useState(() => new Date())

  const countByDate = useMemo(() => {
    const m = new Map<string, number>()
    for (const c of data.completions) m.set(c.date, (m.get(c.date) ?? 0) + 1)
    return m
  }, [data.completions])
  const frozen = useMemo(() => new Set(data.frozenDates), [data.frozenDates])

  const days = useMemo(() => {
    const start = startOfMonth(cursor)
    const end = endOfMonth(cursor)
    return eachDayOfInterval({ start, end })
  }, [cursor])

  const leadPad = (getDay(startOfMonth(cursor)) + 6) % 7 // Mon=0
  const max = Math.max(1, ...days.map(d => countByDate.get(format(d, 'yyyy-MM-dd')) ?? 0))
  const monthTotal = days.reduce((s, d) => s + (countByDate.get(format(d, 'yyyy-MM-dd')) ?? 0), 0)
  const isCurrentMonth = isSameMonth(cursor, new Date())

  return (
    <Card>
      <CardHeader>
        <CardTitle>Aylık takvim</CardTitle>
        <div className="flex items-center gap-2">
          <button onClick={() => setCursor(c => subMonths(c, 1))} className="text-muted hover:text-fg"><ChevronLeft size={17} /></button>
          <span className="w-28 text-center text-xs font-medium text-fg">{format(cursor, 'LLLL yyyy', { locale: tr })}</span>
          <button onClick={() => setCursor(c => addMonths(c, 1))} disabled={isCurrentMonth}
            className={cn('text-muted hover:text-fg', isCurrentMonth && 'opacity-30')}>
            <ChevronRight size={17} />
          </button>
        </div>
      </CardHeader>
      <CardBody>
        <div className="grid grid-cols-7 gap-1.5">
          {WEEKDAYS.map(w => <div key={w} className="pb-1 text-center text-[10px] text-muted-2">{w}</div>)}
          {Array.from({ length: leadPad }).map((_, i) => <div key={`pad-${i}`} />)}
          {days.map(d => {
            const key = format(d, 'yyyy-MM-dd')
            const count = countByDate.get(key) ?? 0
            const isFrozen = frozen.has(key)
            const intensity = count > 0 ? 0.2 + 0.8 * (count / max) : 0
            return (
              <div key={key} title={`${count} görev${isFrozen ? ' · donduruldu' : ''}`}
                className={cn(
                  'relative flex aspect-square flex-col items-center justify-center rounded-lg border text-xs',
                  isToday(d) ? 'border-primary' : 'border-border',
                )}
                style={count > 0 ? { backgroundColor: `rgb(var(--c-primary) / ${intensity.toFixed(2)})` } : undefined}>
                <span className={cn('text-[11px]', count > 0 ? 'font-semibold text-fg' : 'text-muted-2')}>{format(d, 'd')}</span>
                {count > 0 && <span className="text-[9px] text-fg/80">{count}</span>}
                {isFrozen && <span className="absolute right-0.5 top-0.5 text-[8px]">🧊</span>}
              </div>
            )
          })}
        </div>
        <p className="mt-3 text-center text-xs text-muted">Bu ay toplam {monthTotal} görev</p>
      </CardBody>
    </Card>
  )
}
