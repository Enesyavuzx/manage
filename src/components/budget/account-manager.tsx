'use client'
import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { accountBalance } from '@/lib/store'
import { ACCOUNT_TYPE_META, ACCOUNT_COLORS, CURRENCY_SYMBOL } from '@/lib/constants'
import type { AccountType } from '@/lib/types'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn, formatMoney } from '@/lib/utils'

export function AccountManager() {
  const { data, addAccount, deleteAccount } = useStore()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('cash')
  const [opening, setOpening] = useState('')
  const [color, setColor] = useState(ACCOUNT_COLORS[0])

  function submit() {
    if (!name.trim()) return
    addAccount({ name: name.trim(), type, openingBalance: Number(opening) || 0, color })
    setName(''); setOpening(''); setType('cash'); setColor(ACCOUNT_COLORS[0]); setAdding(false)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-fg font-display">Hesaplar</h2>
        {!adding && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus size={13} /> Hesap ekle
          </button>
        )}
      </div>

      {data.budgetAccounts.length === 0 && !adding && (
        <Card className="py-8 text-center">
          <p className="text-sm text-muted">Henüz hesap yok.</p>
          <button onClick={() => setAdding(true)} className="mt-1 text-sm text-primary hover:underline">İlk hesabını ekle</button>
        </Card>
      )}

      <div className="grid gap-2 sm:grid-cols-2">
        {data.budgetAccounts.map(acc => {
          const bal = accountBalance(data, acc.id)
          return (
            <Card key={acc.id} className="group p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg text-sm" style={{ backgroundColor: `${acc.color}22` }}>
                    {ACCOUNT_TYPE_META[acc.type].emoji}
                  </span>
                  <div>
                    <p className="text-sm font-medium text-fg">{acc.name}</p>
                    <p className="text-xs text-muted">{ACCOUNT_TYPE_META[acc.type].label}</p>
                  </div>
                </div>
                <button onClick={() => deleteAccount(acc.id)} className="text-muted-2 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100">
                  <Trash2 size={14} />
                </button>
              </div>
              <p className={cn('mt-2 text-lg font-bold font-display', bal < 0 ? 'text-danger' : 'text-fg')}>
                {formatMoney(bal, CURRENCY_SYMBOL)}
              </p>
            </Card>
          )
        })}
      </div>

      {adding && (
        <Card className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-muted font-display">Yeni hesap</span>
            <button onClick={() => setAdding(false)} className="text-muted hover:text-fg"><X size={15} /></button>
          </div>
          <input value={name} onChange={e => setName(e.target.value)} placeholder="Hesap adı (örn. Cüzdan)"
            className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />
          <div className="flex gap-1.5">
            {(Object.keys(ACCOUNT_TYPE_META) as AccountType[]).map(t => (
              <button key={t} type="button" onClick={() => setType(t)}
                className={cn('flex flex-1 items-center justify-center gap-1.5 rounded-lg border py-2 text-xs font-medium transition-all',
                  type === t ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
                {ACCOUNT_TYPE_META[t].emoji} {ACCOUNT_TYPE_META[t].label}
              </button>
            ))}
          </div>
          <input value={opening} onChange={e => setOpening(e.target.value)} type="number" inputMode="decimal" placeholder="Başlangıç bakiyesi"
            className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />
          <div className="flex flex-wrap gap-2">
            {ACCOUNT_COLORS.map(c => (
              <button key={c} type="button" onClick={() => setColor(c)}
                className={cn('h-6 w-6 rounded-full transition-all', color === c && 'ring-2 ring-offset-2 ring-offset-surface ring-fg')}
                style={{ backgroundColor: c }} />
            ))}
          </div>
          <Button variant="primary" className="w-full" onClick={submit} disabled={!name.trim()}>Ekle</Button>
        </Card>
      )}
    </div>
  )
}
