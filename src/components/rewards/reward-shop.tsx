'use client'
import { useState } from 'react'
import { ShoppingCart, Plus, Trash2, Check } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { generateId } from '@/lib/utils'
import { cn } from '@/lib/utils'

export function RewardShop() {
  const { data, redeemReward, addReward, deleteReward } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [name, setName] = useState('')
  const [desc, setDesc] = useState('')
  const [cost, setCost] = useState(300)
  const [emoji, setEmoji] = useState('🎁')

  const available = data.profile.totalXP - data.profile.redeemedXP

  function handleAdd(e: React.FormEvent) {
    e.preventDefault()
    if (!name.trim()) return
    addReward({ name: name.trim(), description: desc.trim(), xpCost: cost, emoji })
    setName(''); setDesc(''); setCost(300); setEmoji('🎁')
    setAddOpen(false)
  }

  return (
    <>
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={16} className="text-muted" />
            <h2 className="text-sm font-semibold text-white">Reward Shop</h2>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-xp font-medium">{available} XP available</span>
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={14} /> Custom reward
            </Button>
          </div>
        </div>

        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {data.rewards.map(r => {
            const canAfford = !r.redeemedAt && available >= r.xpCost
            const redeemed = !!r.redeemedAt
            return (
              <div
                key={r.id}
                className={cn(
                  'relative flex flex-col gap-3 rounded-xl border p-4 transition-all',
                  redeemed ? 'border-success/20 bg-success/5' : 'border-border bg-surface-2',
                )}
              >
                <div className="flex items-start justify-between">
                  <span className="text-3xl">{r.emoji}</span>
                  <button
                    onClick={() => deleteReward(r.id)}
                    className="text-muted hover:text-red-400 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{r.name}</p>
                  {r.description && <p className="text-xs text-muted mt-0.5">{r.description}</p>}
                </div>
                <div className="flex items-center justify-between mt-auto">
                  <span className={cn('text-sm font-bold', canAfford || redeemed ? 'text-xp' : 'text-muted-2')}>
                    {r.xpCost} XP
                  </span>
                  {redeemed ? (
                    <span className="flex items-center gap-1 text-xs text-success-light font-medium">
                      <Check size={12} /> Redeemed
                    </span>
                  ) : (
                    <Button
                      size="sm"
                      variant={canAfford ? 'primary' : 'secondary'}
                      disabled={!canAfford}
                      onClick={() => redeemReward(r.id)}
                    >
                      Redeem
                    </Button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add custom reward">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Reward name</label>
            <div className="flex gap-2">
              <input
                value={emoji}
                onChange={e => setEmoji(e.target.value)}
                className="h-10 w-12 rounded-lg border border-border bg-surface-2 text-center text-lg focus:border-accent focus:outline-none"
              />
              <input
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="e.g. Cheat day"
                className="h-10 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
              />
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted">Description</label>
            <input
              value={desc}
              onChange={e => setDesc(e.target.value)}
              placeholder="Optional description"
              className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-white placeholder:text-muted focus:border-accent focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1.5 flex justify-between text-xs font-medium text-muted">
              <span>XP cost</span><span className="text-xp">{cost} XP</span>
            </label>
            <input
              type="range" min="100" max="2000" step="50"
              value={cost}
              onChange={e => setCost(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} className="flex-1">Cancel</Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim()}>Add reward</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
