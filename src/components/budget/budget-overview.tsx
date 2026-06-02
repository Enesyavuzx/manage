'use client'
import { TrendingUp, TrendingDown } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { netWorth, monthTotals, expenseByCategory, currentMonthPrefix } from '@/lib/store'
import { CURRENCY_SYMBOL, txCategory } from '@/lib/constants'
import { Card } from '@/components/ui/card'
import { StatBar } from '@/components/ui/stat-bar'
import { cn, formatMoney } from '@/lib/utils'

export function BudgetOverview() {
  const { data } = useStore()
  const month = currentMonthPrefix()
  const net = netWorth(data)
  const { income, expense } = monthTotals(data, month)
  const byCat = expenseByCategory(data, month)
  const cats = Object.entries(byCat).sort((a, b) => b[1] - a[1])
  const maxCat = cats.length ? cats[0][1] : 0

  return (
    <div className="space-y-4">
      <Card glow className="p-5 text-center">
        <p className="text-xs text-muted font-display">Toplam Varlık</p>
        <p className={cn('mt-1 text-3xl font-bold font-display', net < 0 ? 'text-danger' : 'text-fg')}>
          {formatMoney(net, CURRENCY_SYMBOL)}
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <TrendingUp size={13} className="text-success" /> Bu ay gelir
          </div>
          <p className="mt-1 text-lg font-bold text-success font-display">{formatMoney(income, CURRENCY_SYMBOL)}</p>
        </Card>
        <Card className="p-4">
          <div className="flex items-center gap-1.5 text-xs text-muted">
            <TrendingDown size={13} className="text-danger" /> Bu ay gider
          </div>
          <p className="mt-1 text-lg font-bold text-danger font-display">{formatMoney(expense, CURRENCY_SYMBOL)}</p>
        </Card>
      </div>

      {cats.length > 0 && (
        <Card className="space-y-3 p-4">
          <h2 className="text-sm font-semibold text-fg font-display">Bu ay harcama dağılımı</h2>
          {cats.map(([id, amt]) => {
            const c = txCategory(id)
            return (
              <StatBar key={id} label={c.label} emoji={c.emoji} value={amt} max={maxCat}
                color={c.color} valueLabel={formatMoney(amt, CURRENCY_SYMBOL)} />
            )
          })}
        </Card>
      )}
    </div>
  )
}
