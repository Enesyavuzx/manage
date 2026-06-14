'use client'
import { useState } from 'react'
import { Plus, Trash2, X, Target, TrendingDown } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { budgetGoalProgress } from '@/lib/store'
import { TX_CATEGORIES, CURRENCY_SYMBOL, txCategory } from '@/lib/constants'
import type { BudgetGoalKind } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatMoney } from '@/lib/utils'

const GOAL_EMOJIS = ['🎯', '🏖️', '🚗', '🏠', '💻', '🎓', '✈️', '💍', '🎁', '🛟']
const GOAL_COLORS = ['#ffa447', '#7b95ff', '#b482ff', '#3caa6e', '#ec6ea0', '#f5b942']
const EXPENSE_CATS = TX_CATEGORIES.filter(c => c.type === 'expense')

export function BudgetGoals() {
  const { data, addBudgetGoal, deleteBudgetGoal } = useStore()
  const [adding, setAdding] = useState(false)
  const [kind, setKind] = useState<BudgetGoalKind>('savings')
  const [name, setName] = useState('')
  const [amount, setAmount] = useState('')
  const [emoji, setEmoji] = useState(GOAL_EMOJIS[0])
  const [color, setColor] = useState(GOAL_COLORS[0])
  const [categoryId, setCategoryId] = useState('')

  function reset() {
    setName(''); setAmount(''); setKind('savings'); setEmoji(GOAL_EMOJIS[0])
    setColor(GOAL_COLORS[0]); setCategoryId(''); setAdding(false)
  }

  function submit() {
    const amt = Number(amount)
    if (!name.trim() || !amt || amt <= 0) return
    addBudgetGoal({
      kind,
      name: name.trim(),
      emoji,
      targetAmount: amt,
      categoryId: kind === 'limit' && categoryId ? categoryId : undefined,
      color,
    })
    reset()
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg font-display">Hedefler</h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus size={13} /> Hedef ekle
          </button>
        )}
      </div>

      {data.budgetGoals.length === 0 && !adding && (
        <Card className="py-8 text-center">
          <p className="text-sm text-muted">Henüz hedef yok.</p>
          <p className="mx-auto mt-1 max-w-xs text-xs text-muted-2">Birikim hedefi koy ya da aylık harcama tavanı belirle, ilerlemeni gör.</p>
          <button onClick={() => setAdding(true)} className="mt-2 text-sm text-primary hover:underline">İlk hedefini ekle</button>
        </Card>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {data.budgetGoals.map(goal => {
          const p = budgetGoalProgress(data, goal)
          const cat = goal.categoryId ? txCategory(goal.categoryId) : null
          const reached = goal.kind === 'savings' && p.pct >= 100
          const barColor = goal.kind === 'limit' && p.over ? '#ef4444' : goal.color
          return (
            <Card key={goal.id} className="group p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: `${goal.color}22` }}>
                    {goal.emoji}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-fg">{goal.name}</p>
                    <p className="flex items-center gap-1 text-xs text-muted">
                      {goal.kind === 'savings'
                        ? <><Target size={11} /> Birikim hedefi</>
                        : <><TrendingDown size={11} /> Aylık tavan{cat ? ` · ${cat.emoji} ${cat.label}` : ''}</>}
                    </p>
                  </div>
                </div>
                <button onClick={() => deleteBudgetGoal(goal.id)} className="text-muted-2 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="mt-3">
                <div className="mb-1 flex items-baseline justify-between">
                  <span className={cn('text-sm font-bold font-display', p.over ? 'text-danger' : 'text-fg')}>
                    {formatMoney(p.current, CURRENCY_SYMBOL)}
                  </span>
                  <span className="text-xs text-muted">/ {formatMoney(p.target, CURRENCY_SYMBOL)}</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${Math.min(100, p.pct)}%`, backgroundColor: barColor }} />
                </div>
                <p className={cn('mt-1 text-xs', p.over ? 'text-danger' : reached ? 'text-success' : 'text-muted')}>
                  {goal.kind === 'savings'
                    ? reached ? '🎉 Hedefe ulaştın!' : `${formatMoney(p.remaining, CURRENCY_SYMBOL)} kaldı (%${p.pct})`
                    : p.over ? `Tavan ${formatMoney(-p.remaining, CURRENCY_SYMBOL)} aşıldı` : `${formatMoney(p.remaining, CURRENCY_SYMBOL)} bütçen kaldı (%${p.pct})`}
                </p>
              </div>
            </Card>
          )
        })}
      </div>

      {adding && (
        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted font-display">Yeni hedef</span>
            <button onClick={reset} className="text-muted hover:text-fg"><X size={15} /></button>
          </div>

          <div className="flex gap-1.5">
            <button type="button" onClick={() => setKind('savings')}
              className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all',
                kind === 'savings' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
              <Target size={13} /> Birikim
            </button>
            <button type="button" onClick={() => setKind('limit')}
              className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all',
                kind === 'limit' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
              <TrendingDown size={13} /> Harcama tavanı
            </button>
          </div>

          <input value={name} onChange={e => setName(e.target.value)}
            placeholder={kind === 'savings' ? 'Hedef adı (örn. Tatil)' : 'Tavan adı (örn. Aylık yemek)'}
            className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />

          <input value={amount} onChange={e => setAmount(e.target.value)} type="number" inputMode="decimal"
            placeholder={kind === 'savings' ? 'Hedef tutar' : 'Aylık tavan tutarı'}
            className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />

          {kind === 'limit' && (
            <div className="flex flex-wrap gap-1.5">
              <button type="button" onClick={() => setCategoryId('')}
                className={cn('rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                  categoryId === '' ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
                Tüm giderler
              </button>
              {EXPENSE_CATS.map(c => (
                <button key={c.id} type="button" onClick={() => setCategoryId(c.id)}
                  className={cn('rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                    categoryId === c.id ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
                  {c.emoji} {c.label}
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-wrap gap-1.5">
            {GOAL_EMOJIS.map(e => (
              <button key={e} type="button" onClick={() => setEmoji(e)}
                className={cn('flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-all',
                  emoji === e ? 'border-primary bg-primary/10' : 'border-border bg-surface-2')}>
                {e}
              </button>
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            {GOAL_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={cn('h-6 w-6 rounded-full transition-all', color === c && 'ring-2 ring-offset-2 ring-offset-surface ring-fg')}
                style={{ backgroundColor: c }} />
            ))}
          </div>

          <Button variant="primary" className="w-full" onClick={submit} disabled={!name.trim() || !Number(amount)}>Ekle</Button>
        </Card>
      )}
    </div>
  )
}
