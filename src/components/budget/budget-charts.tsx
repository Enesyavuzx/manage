'use client'

import { useStore } from '@/hooks/useStore'
import { currentMonthPrefix, expenseByCategory, monthTotals } from '@/lib/store'
import { format, subDays } from 'date-fns'

const CATEGORY_LABELS: Record<string, string> = {
  yemek: 'Yemek 🍕',
  food: 'Yemek 🍕',
  ulasim: 'Ulaşım 🚌',
  transport: 'Ulaşım 🚌',
  eglence: 'Eğlence 🎮',
  entertainment: 'Eğlence 🎮',
  saglik: 'Sağlık 💊',
  health: 'Sağlık 💊',
  alisveris: 'Alışveriş 🛍️',
  shopping: 'Alışveriş 🛍️',
  fatura: 'Faturalar 💡',
  bills: 'Faturalar 💡',
  diger: 'Diğer 📦',
  other: 'Diğer 📦',
}

const CATEGORY_COLORS = [
  '#ffa447', // turuncu
  '#7b95ff', // periwinkle
  '#f57e2e', // derin turuncu
  '#3caa6e', // yeşil
  '#ec6ea0', // pembe
]

function categoryLabel(id: string): string {
  return CATEGORY_LABELS[id.toLowerCase()] ?? id
}

function fmt(n: number): string {
  return new Intl.NumberFormat('tr-TR', { style: 'currency', currency: 'TRY', maximumFractionDigits: 0 }).format(n)
}

export function BudgetCharts() {
  const { data } = useStore()
  const monthPrefix = currentMonthPrefix()
  const { income, expense } = monthTotals(data, monthPrefix)
  const net = income - expense
  const catMap = expenseByCategory(data, monthPrefix)

  // Top 5 categories
  const sorted = Object.entries(catMap)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
  const totalSpend = sorted.reduce((s, [, v]) => s + v, 0)

  // Last 14 days daily spending
  const today = new Date()
  const days: { label: string; date: string; expense: number; income: number }[] = []
  for (let i = 13; i >= 0; i--) {
    const d = subDays(today, i)
    const dateStr = format(d, 'yyyy-MM-dd')
    const dayLabel = format(d, 'd')
    let dayExpense = 0
    let dayIncome = 0
    for (const t of data.budgetTransactions) {
      if (t.date !== dateStr) continue
      if (t.type === 'expense') dayExpense += t.amount
      else dayIncome += t.amount
    }
    days.push({ label: dayLabel, date: dateStr, expense: dayExpense, income: dayIncome })
  }

  const maxDaily = Math.max(...days.map(d => Math.max(d.expense, d.income)), 1)

  return (
    <div className="space-y-4">
      {/* Net Summary */}
      <div className="bg-surface-2 border border-border rounded-xl p-4">
        <p className="text-xs font-medium text-muted mb-3 uppercase tracking-wide">Bu Ay Özeti</p>
        <div className="flex gap-6">
          <div>
            <p className="text-xs text-muted mb-0.5">Gelir</p>
            <p className="text-xl font-bold text-fg">{fmt(income)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Gider</p>
            <p className="text-xl font-bold text-fg">{fmt(expense)}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-0.5">Net</p>
            <p
              className="text-xl font-bold"
              style={{ color: net >= 0 ? 'var(--c-success, #22c55e)' : 'var(--c-danger, #ef4444)' }}
            >
              {net >= 0 ? '+' : ''}{fmt(net)}
            </p>
          </div>
        </div>
      </div>

      {/* Category Bar Chart */}
      <div className="bg-surface-2 border border-border rounded-xl p-4">
        <p className="text-xs font-medium text-muted mb-3 uppercase tracking-wide">Kategori Dağılımı</p>
        {sorted.length === 0 ? (
          <p className="text-sm text-muted py-4 text-center">Henüz harcama yok</p>
        ) : (
          <div className="space-y-2.5">
            {sorted.map(([id, amount], idx) => {
              const pct = totalSpend > 0 ? (amount / totalSpend) * 100 : 0
              const color = CATEGORY_COLORS[idx % CATEGORY_COLORS.length]
              return (
                <div key={id}>
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-1.5">
                      <span
                        className="inline-block h-2 w-2 rounded-full flex-shrink-0"
                        style={{ backgroundColor: color }}
                      />
                      <span className="text-sm text-fg">{categoryLabel(id)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted">{pct.toFixed(0)}%</span>
                      <span className="text-sm font-medium text-fg">{fmt(amount)}</span>
                    </div>
                  </div>
                  <div className="h-1.5 rounded-full bg-surface overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${pct}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Daily Trend Bar Chart */}
      <div className="bg-surface-2 border border-border rounded-xl p-4">
        <p className="text-xs font-medium text-muted mb-3 uppercase tracking-wide">Son 14 Gün Harcama</p>
        <div className="flex items-end gap-1 h-24 relative">
          {days.map((d, i) => {
            const expH = Math.round((d.expense / maxDaily) * 88)
            const incH = Math.round((d.income / maxDaily) * 88)
            const showLabel = i % 2 === 0
            return (
              <div key={d.date} className="flex-1 flex flex-col items-center gap-0.5 min-w-0">
                <div className="flex flex-col items-center justify-end w-full gap-px" style={{ height: 88 }}>
                  {incH > 0 && (
                    <div
                      className="w-full rounded-t"
                      style={{ height: incH, backgroundColor: 'var(--c-success, #22c55e)', minHeight: 2 }}
                    />
                  )}
                  {expH > 0 && (
                    <div
                      className="w-full rounded-t"
                      style={{ height: expH, backgroundColor: 'var(--c-danger, #ef4444)', minHeight: 2 }}
                    />
                  )}
                  {expH === 0 && incH === 0 && (
                    <div className="w-full rounded" style={{ height: 2, backgroundColor: 'var(--c-border, #e5e7eb)' }} />
                  )}
                </div>
                {showLabel && (
                  <span className="text-[10px] text-muted leading-none">{d.label}</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="flex items-center gap-3 mt-2">
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--c-danger, #ef4444)' }} />
            <span className="text-[11px] text-muted">Gider</span>
          </div>
          <div className="flex items-center gap-1">
            <span className="inline-block h-2 w-2 rounded-full" style={{ backgroundColor: 'var(--c-success, #22c55e)' }} />
            <span className="text-[11px] text-muted">Gelir</span>
          </div>
          <span className="ml-auto text-[11px] text-muted">Maks: {fmt(maxDaily)}</span>
        </div>
      </div>
    </div>
  )
}
