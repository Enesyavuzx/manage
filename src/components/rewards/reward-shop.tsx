'use client'
import { useState } from 'react'
import { ShoppingCart, Plus, Trash2, Check, Lock } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { formatXP, cn } from '@/lib/utils'
import { REWARD_TIER_META, REWARD_TIER_ORDER } from '@/lib/constants'
import type { CustomReward, RewardTier } from '@/lib/types'

const REWARD_EMOJIS = ['🎁', '🎬', '🍕', '🎮', '🛁', '🛍️', '🏖️', '☕', '🍰', '📱', '🎧', '⚽', '✈️', '🏆', '🧋', '🎟️']

function tierFromCost(cost: number): RewardTier {
  if (cost < 300) return 'small'
  if (cost < 700) return 'medium'
  if (cost < 1500) return 'large'
  if (cost < 3000) return 'legendary'
  return 'mythic'
}

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
    addReward({ name: name.trim(), description: desc.trim(), xpCost: cost, emoji, tier: tierFromCost(cost) })
    setName(''); setDesc(''); setCost(300); setEmoji('🎁'); setAddOpen(false)
  }

  const grouped = REWARD_TIER_ORDER.map(tier => ({
    tier,
    items: data.rewards.filter(r => (r.tier ?? tierFromCost(r.xpCost)) === tier),
  })).filter(g => g.items.length > 0)

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle><span className="inline-flex items-center gap-2"><ShoppingCart size={15} /> Ödül Mağazası</span></CardTitle>
          <div className="flex items-center gap-3">
            <span className="text-xs font-medium text-xp">{formatXP(available)} XP</span>
            <Button variant="secondary" size="sm" onClick={() => setAddOpen(true)}><Plus size={14} /> Özel</Button>
          </div>
        </CardHeader>

        <div className="space-y-6 p-4">
          {grouped.map(({ tier, items }) => {
            const meta = REWARD_TIER_META[tier]
            return (
              <section key={tier}>
                <div className="mb-3 flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: meta.color, boxShadow: `0 0 8px ${meta.color}` }} />
                  <h3 className="text-xs font-bold uppercase tracking-wide text-fg font-display">{meta.label}</h3>
                  <span className="text-xs text-muted-2">({items.length})</span>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map(r => {
                    const redeemed = !!r.redeemedAt
                    const canAfford = !redeemed && available >= r.xpCost
                    const progress = redeemed ? 100 : Math.min(100, (available / r.xpCost) * 100)
                    const remaining = Math.max(0, r.xpCost - available)
                    return (
                      <div key={r.id} className={cn(
                        'group relative flex flex-col gap-3 rounded-xl border p-4 transition-all',
                        redeemed
                          ? 'border-success/30 bg-success/5'
                          : canAfford
                            ? 'border-border bg-surface-2 hover:-translate-y-0.5 hover:border-primary/50'
                            : 'border-border bg-surface-2',
                      )}>
                        <div className="flex items-start justify-between">
                          <span className={cn('text-3xl', !canAfford && !redeemed && 'grayscale opacity-60')}>{r.emoji}</span>
                          <button onClick={() => deleteReward(r.id)} className="text-muted opacity-0 transition-colors hover:text-danger group-hover:opacity-100">
                            <Trash2 size={14} />
                          </button>
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-fg">{r.name}</p>
                          {r.description && <p className="mt-0.5 text-xs text-muted">{r.description}</p>}
                        </div>

                        {!redeemed && !canAfford && (
                          <div className="space-y-1">
                            <div className="h-1.5 w-full overflow-hidden rounded-full bg-bg">
                              <div className="h-full rounded-full bg-xp/70 transition-all duration-700" style={{ width: `${progress}%` }} />
                            </div>
                            <p className="text-[11px] text-muted-2">{formatXP(remaining)} XP kaldı</p>
                          </div>
                        )}

                        <div className="mt-auto flex items-center justify-between">
                          <span className={cn('text-sm font-bold font-display', canAfford || redeemed ? 'text-xp' : 'text-muted-2')}>{r.xpCost} XP</span>
                          {redeemed ? (
                            <span className="flex items-center gap-1 text-xs font-medium text-success"><Check size={12} /> Alındı</span>
                          ) : (
                            <Button size="sm" variant={canAfford ? 'xp' : 'secondary'} disabled={!canAfford} onClick={() => redeemReward(r.id)}>
                              {canAfford ? 'Al' : <><Lock size={12} /> Kilitli</>}
                            </Button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </section>
            )
          })}
        </div>
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Özel ödül ekle">
        <form onSubmit={handleAdd} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted font-display">Ödül adı</label>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="örn. Kaçamak günü"
              className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted font-display">İkon</label>
            <div className="flex flex-wrap gap-1.5">
              {REWARD_EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  className={cn('flex h-9 w-9 items-center justify-center rounded-md text-lg transition-all',
                    emoji === e ? 'bg-primary/20 ring-1 ring-primary' : 'bg-surface-2 hover:bg-border')}>{e}</button>
              ))}
            </div>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-medium text-muted font-display">Açıklama</label>
            <input value={desc} onChange={e => setDesc(e.target.value)} placeholder="Opsiyonel"
              className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />
          </div>
          <div>
            <label className="mb-1.5 flex justify-between text-xs font-medium text-muted font-display"><span>XP bedeli</span><span className="text-xp">{cost} XP · {REWARD_TIER_META[tierFromCost(cost)].label}</span></label>
            <input type="range" min="100" max="9000" step="50" value={cost} onChange={e => setCost(Number(e.target.value))} className="w-full" />
          </div>
          <div className="flex gap-2 pt-1">
            <Button type="button" variant="ghost" onClick={() => setAddOpen(false)} className="flex-1">İptal</Button>
            <Button type="submit" variant="primary" className="flex-1" disabled={!name.trim()}>Ekle</Button>
          </div>
        </form>
      </Modal>
    </>
  )
}
