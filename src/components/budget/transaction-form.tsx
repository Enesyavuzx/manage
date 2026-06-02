'use client'
import { useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { TX_CATEGORIES, CURRENCY_SYMBOL } from '@/lib/constants'
import { todayKey } from '@/lib/store'
import type { TxType } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/confetti'

export function TransactionForm() {
  const { data, addTransaction } = useStore()
  const [type, setType] = useState<TxType>('expense')
  const [amount, setAmount] = useState('')
  const [categoryId, setCategoryId] = useState('food')
  const [accountId, setAccountId] = useState(data.budgetAccounts[0]?.id ?? '')
  const [note, setNote] = useState('')

  const cats = TX_CATEGORIES.filter(c => c.type === type)
  const noAccounts = data.budgetAccounts.length === 0

  function pickType(t: TxType) {
    setType(t)
    const first = TX_CATEGORIES.find(c => c.type === t)
    if (first) setCategoryId(first.id)
  }

  function submit() {
    const amt = Number(amount)
    if (!amt || amt <= 0 || !accountId) return
    addTransaction({ accountId, type, amount: amt, categoryId, note: note.trim() || undefined, date: todayKey() })
    haptic(20)
    setAmount(''); setNote('')
  }

  return (
    <Card className="space-y-3 p-4">
      <h2 className="text-sm font-semibold text-fg font-display">Hızlı işlem</h2>

      <div className="flex gap-1.5">
        <button type="button" onClick={() => pickType('expense')}
          className={cn('flex-1 rounded-lg border py-2 text-xs font-medium transition-all',
            type === 'expense' ? 'border-danger/40 bg-danger/10 text-danger' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
          Gider
        </button>
        <button type="button" onClick={() => pickType('income')}
          className={cn('flex-1 rounded-lg border py-2 text-xs font-medium transition-all',
            type === 'income' ? 'border-success/40 bg-success/10 text-success' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
          Gelir
        </button>
      </div>

      <div className="flex items-center gap-2">
        <input value={amount} onChange={e => setAmount(e.target.value)} type="number" inputMode="decimal" placeholder="0"
          className="h-12 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-xl font-bold text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none font-display" />
        <span className="text-lg text-muted">{CURRENCY_SYMBOL}</span>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {cats.map(c => (
          <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
            className={cn('flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-xs font-medium transition-all',
              categoryId === c.id ? 'text-fg' : 'border-border bg-surface-2 text-muted hover:text-fg')}
            style={categoryId === c.id ? { borderColor: c.color, backgroundColor: `${c.color}1a` } : undefined}>
            <span>{c.emoji}</span>{c.label}
          </button>
        ))}
      </div>

      {data.budgetAccounts.length > 1 && (
        <div className="flex flex-wrap gap-1.5">
          {data.budgetAccounts.map(a => (
            <button key={a.id} type="button" onClick={() => setAccountId(a.id)}
              className={cn('rounded-lg border px-3 py-1.5 text-xs font-medium transition-all',
                accountId === a.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
              {a.name}
            </button>
          ))}
        </div>
      )}

      <input value={note} onChange={e => setNote(e.target.value)} placeholder="Not (opsiyonel)"
        className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />

      <Button variant="primary" className="w-full" onClick={submit} disabled={noAccounts || !amount || Number(amount) <= 0}>
        {noAccounts ? 'Önce bir hesap ekle' : 'Kaydet'}
      </Button>
    </Card>
  )
}
