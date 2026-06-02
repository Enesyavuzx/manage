'use client'
import { useState } from 'react'
import { Check, Plus } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { TEMPLATE_PACKS } from '@/lib/constants'
import { DIFFICULTY_META } from '@/lib/gamification'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function TemplateGallery({ onDone }: { onDone?: () => void }) {
  const { addTemplatePack } = useStore()
  const [openId, setOpenId] = useState<string | null>(TEMPLATE_PACKS[0]?.id ?? null)
  const [added, setAdded] = useState<string[]>([])

  function add(packId: string) {
    const pack = TEMPLATE_PACKS.find(p => p.id === packId)
    if (!pack || added.includes(packId)) return
    addTemplatePack(pack)
    setAdded(prev => [...prev, packId])
  }

  return (
    <div className="space-y-3">
      <p className="text-xs text-muted-2">
        Hazır bir paket seç, içindeki alışkanlıklar tek dokunuşla eklensin. Sonra istediğini düzenleyebilir veya kaldırabilirsin.
      </p>

      <div className="space-y-2">
        {TEMPLATE_PACKS.map(pack => {
          const isOpen = openId === pack.id
          const isAdded = added.includes(pack.id)
          return (
            <div key={pack.id} className="overflow-hidden rounded-lg border border-border bg-surface-2">
              <button
                onClick={() => setOpenId(isOpen ? null : pack.id)}
                className="flex w-full items-center gap-3 px-3 py-2.5 text-left"
              >
                <span className="text-xl">{pack.emoji}</span>
                <span className="flex-1">
                  <span className="block text-sm font-semibold text-fg font-display">{pack.name}</span>
                  <span className="block text-xs text-muted">{pack.description} · {pack.habits.length} alışkanlık</span>
                </span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={e => { e.stopPropagation(); add(pack.id) }}
                  onKeyDown={e => { if (e.key === 'Enter') { e.stopPropagation(); add(pack.id) } }}
                  className={cn(
                    'inline-flex shrink-0 items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium font-display transition-all',
                    isAdded ? 'bg-success/15 text-success' : 'bg-primary text-bg hover:brightness-110',
                  )}
                >
                  {isAdded ? <><Check size={13} /> Eklendi</> : <><Plus size={13} /> Ekle</>}
                </span>
              </button>

              {isOpen && (
                <div className="border-t border-border px-3 py-2 space-y-1.5">
                  {pack.habits.map((h, i) => {
                    const m = DIFFICULTY_META[h.difficulty]
                    return (
                      <div key={i} className="flex items-center gap-2.5 py-1">
                        <span className="flex h-7 w-7 items-center justify-center rounded-md text-sm" style={{ backgroundColor: `${h.color}20` }}>
                          {h.emoji}
                        </span>
                        <span className="flex-1 text-sm text-fg">{h.name}</span>
                        <span className="text-xs text-xp">+{m.xp}</span>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {onDone && (
        <Button variant="secondary" className="w-full" onClick={onDone}>Bitti</Button>
      )}
    </div>
  )
}
