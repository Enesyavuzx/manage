'use client'
import { useMemo } from 'react'
import { useStore } from '@/hooks/useStore'
import { monthTotals } from '@/lib/store'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { cn, formatMoney } from '@/lib/utils'
import { format, subMonths } from 'date-fns'
import { tr } from 'date-fns/locale'

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3 text-center">
      <p className={cn('text-lg font-bold font-display tabular-nums', color)}>{formatMoney(value)}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

export function BudgetReport() {
  const { data } = useStore()
  const months = useMemo(() => {
    const now = new Date()
    const arr: { label: string; income: number; expense: number; net: number }[] = []
    for (let i = 5; i >= 0; i--) {
      const d = subMonths(now, i)
      const { income, expense } = monthTotals(data, format(d, 'yyyy-MM'))
      arr.push({ label: format(d, 'MMM', { locale: tr }), income, expense, net: income - expense })
    }
    return arr
  }, [data])

  const totalIncome = months.reduce((s, m) => s + m.income, 0)
  const totalExpense = months.reduce((s, m) => s + m.expense, 0)
  const net = totalIncome - totalExpense
  const max = Math.max(1, ...months.map(m => Math.max(m.income, m.expense)))

  return (
    <Card>
      <CardHeader><CardTitle>Son 6 ay raporu</CardTitle></CardHeader>
      <CardBody className="space-y-5">
        <div className="grid grid-cols-3 gap-2">
          <Stat label="Gelir" value={totalIncome} color="text-success" />
          <Stat label="Gider" value={totalExpense} color="text-danger" />
          <Stat label="Net" value={net} color={net >= 0 ? 'text-success' : 'text-danger'} />
        </div>

        <div className="space-y-3">
          {months.map(m => (
            <div key={m.label}>
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="font-medium text-fg font-display">{m.label}</span>
                <span className={cn('font-semibold tabular-nums', m.net >= 0 ? 'text-success' : 'text-danger')}>
                  {m.net >= 0 ? '+' : ''}{formatMoney(m.net)}
                </span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-success/70" style={{ width: `${(m.income / max) * 100}%` }} />
              </div>
              <div className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2">
                <div className="h-full rounded-full bg-danger/70" style={{ width: `${(m.expense / max) * 100}%` }} />
              </div>
            </div>
          ))}
        </div>

        <p className="text-xs text-muted">
          <span className="text-success">●</span> gelir · <span className="text-danger">●</span> gider · {data.budgetTransactions.length} işlem üzerinden.
        </p>
      </CardBody>
    </Card>
  )
}
