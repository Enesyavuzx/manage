'use client'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { Trash2 } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { CURRENCY_SYMBOL, txCategory } from '@/lib/constants'
import { Card } from '@/components/ui/card'
import { cn, formatMoney } from '@/lib/utils'

export function TransactionList() {
  const { data, deleteTransaction } = useStore()
  const txs = [...data.budgetTransactions]
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    .slice(0, 15)

  if (txs.length === 0) {
    return (
      <Card className="py-10 text-center">
        <p className="text-sm text-muted">Henüz işlem yok.</p>
      </Card>
    )
  }

  function accountName(id: string): string {
    return data.budgetAccounts.find(a => a.id === id)?.name ?? '-'
  }

  return (
    <Card>
      <div className="border-b border-border px-4 py-3">
        <h2 className="text-sm font-semibold text-fg font-display">Son işlemler</h2>
      </div>
      <div className="divide-y divide-border">
        {txs.map(t => {
          const c = txCategory(t.categoryId)
          const income = t.type === 'income'
          return (
            <div key={t.id} className="group flex items-center gap-3 px-4 py-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: `${c.color}1f` }}>
                {c.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-fg">{t.note || c.label}</p>
                <p className="text-xs text-muted">
                  {accountName(t.accountId)} · {format(new Date(t.date + 'T12:00:00'), 'd MMM', { locale: tr })}
                </p>
              </div>
              <span className={cn('text-sm font-semibold font-display', income ? 'text-success' : 'text-danger')}>
                {income ? '+' : '-'}{formatMoney(t.amount, CURRENCY_SYMBOL)}
              </span>
              <button onClick={() => deleteTransaction(t.id)} className="text-muted-2 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100">
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}
      </div>
    </Card>
  )
}
