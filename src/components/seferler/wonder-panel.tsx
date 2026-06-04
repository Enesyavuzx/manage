'use client'
import { useState } from 'react'
import { Plus, Trash2, X } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { wonderProgress } from '@/lib/store'
import { RealmSprite } from '@/components/realm/realm-sprite'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const WONDER_EMOJIS = ['🏰', '⛪', '🗼', '🏛️', '🌉', '🗿', '📚', '🏆', '🚀', '🎓']
const STAGE_LABEL = ['Temel atılıyor', 'Duvarlar yükseliyor', 'Çatı örülüyor', 'Kuleye doğru', 'Tamamlandı']

export function WonderPanel() {
  const { data, addWonder, deleteWonder } = useStore()
  const banner = data.profile.realmBanner || '#d9a441'
  const activeHabits = data.habits.filter(h => !h.archived)

  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(WONDER_EMOJIS[0])
  const [target, setTarget] = useState('')
  const [habitId, setHabitId] = useState<string>('')

  function reset() {
    setName(''); setEmoji(WONDER_EMOJIS[0]); setTarget(''); setHabitId(''); setAdding(false)
  }

  function submit() {
    const t = Number(target)
    if (!name.trim() || !t || t <= 0) return
    addWonder({ name: name.trim(), emoji, target: t, habitId: habitId || null })
    reset()
  }

  return (
    <Card className="overflow-hidden">
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">🏛️</span>
          <span className="text-sm font-bold text-fg font-display">Harikalar</span>
          <span className="text-xs text-muted">uzun vadeli hedeflerin</span>
        </div>
        {!adding && data.wonders.length < 3 && (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-xs text-primary hover:underline">
            <Plus size={13} /> Ekle
          </button>
        )}
      </div>

      <div className="space-y-3 p-4">
        {data.wonders.length === 0 && !adding && (
          <div className="py-4 text-center">
            <p className="text-sm text-muted">Büyük bir hedefin mi var? Onu bir Harika yap.</p>
            <p className="mx-auto mt-1 max-w-sm text-xs text-muted-2">Kitap yaz, maraton koş, dil öğren... Her ilgili tamamlama megastructure'ına bir tuğla ekler ve yükseldiğini görürsün.</p>
            <button onClick={() => setAdding(true)} className="mt-2 text-sm text-primary hover:underline">İlk harikanı kur</button>
          </div>
        )}

        {data.wonders.map(w => {
          const prog = wonderProgress(data, w)
          const pct = Math.min(100, Math.round((prog / w.target) * 100))
          const reveal = Math.max(0.07, Math.min(1, prog / w.target))
          const stage = pct >= 100 ? 4 : Math.min(3, Math.floor(pct / 25))
          const linkedHabit = w.habitId ? activeHabits.find(h => h.id === w.habitId) : null
          return (
            <div key={w.id} className="group rounded-xl border border-border bg-surface-2 p-3">
              <div className="flex items-center gap-3">
                <div className="flex h-20 w-20 shrink-0 items-end justify-center overflow-hidden rounded-lg bg-gradient-to-b from-sky-900/40 to-emerald-950/40">
                  <RealmSprite name="cathedral" tint={banner} pixel={5} reveal={reveal} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="truncate text-sm font-semibold text-fg">{w.emoji} {w.name}</p>
                    <button onClick={() => deleteWonder(w.id)} className="shrink-0 text-muted-2 opacity-0 transition-opacity hover:text-danger group-hover:opacity-100">
                      <Trash2 size={14} />
                    </button>
                  </div>
                  <p className="text-[11px] text-muted">{linkedHabit ? `${linkedHabit.emoji} ${linkedHabit.name}` : 'Tüm tamamlamalar'} · {STAGE_LABEL[stage]}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="h-2 flex-1 overflow-hidden rounded-full bg-surface">
                      <div className={cn('h-full rounded-full transition-all duration-700', pct >= 100 ? 'bg-xp' : 'bg-primary')} style={{ width: `${pct}%` }} />
                    </div>
                    <span className="shrink-0 text-xs font-semibold text-fg tabular-nums">{prog}/{w.target}</span>
                  </div>
                  {pct >= 100 && <p className="mt-1 text-xs font-semibold text-xp">Harika tamamlandı! 🎉</p>}
                </div>
              </div>
            </div>
          )
        })}

        {adding && (
          <div className="space-y-3 rounded-xl border border-border bg-surface-2 p-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted font-display">Yeni harika</span>
              <button onClick={reset} className="text-muted hover:text-fg"><X size={15} /></button>
            </div>
            <input value={name} onChange={e => setName(e.target.value)} placeholder="Hedef adı (örn. Romanı bitir)"
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />
            <input value={target} onChange={e => setTarget(e.target.value)} type="number" inputMode="numeric" placeholder="Kaç tamamlama? (örn. 100)"
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none" />
            <div className="flex flex-wrap gap-1.5">
              {WONDER_EMOJIS.map(e => (
                <button key={e} type="button" onClick={() => setEmoji(e)}
                  className={cn('flex h-8 w-8 items-center justify-center rounded-lg border text-sm transition-all',
                    emoji === e ? 'border-primary bg-primary/10' : 'border-border bg-surface')}>
                  {e}
                </button>
              ))}
            </div>
            <select value={habitId} onChange={e => setHabitId(e.target.value)}
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg focus:border-primary focus:outline-none">
              <option value="">Tüm tamamlamalar sayılsın</option>
              {activeHabits.map(h => (
                <option key={h.id} value={h.id}>{h.emoji} {h.name}</option>
              ))}
            </select>
            <Button variant="primary" className="w-full" onClick={submit} disabled={!name.trim() || !Number(target)}>Harikayı kur</Button>
          </div>
        )}
      </div>
    </Card>
  )
}
