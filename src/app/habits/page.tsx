'use client'
import { useState } from 'react'
import { Plus, Archive, Sparkles, Search, X } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { HabitCard } from '@/components/habits/habit-card'
import { HabitForm } from '@/components/habits/habit-form'
import { TemplateGallery } from '@/components/habits/template-gallery'
import { StreakFreeze } from '@/components/habits/streak-freeze'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function HabitsPage() {
  const { data, addHabit } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [tplOpen, setTplOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)
  const [query, setQuery] = useState('')

  const active = data.habits.filter(h => !h.archived)
  const archived = data.habits.filter(h => h.archived)

  const q = query.trim().toLowerCase()
  const filtered = q
    ? active.filter(h => h.name.toLowerCase().includes(q) || h.description.toLowerCase().includes(q))
    : active
  const reorderable = !q   // reordering only makes sense on the full, unfiltered list

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h1 className="text-2xl font-bold text-fg text-gradient">Alışkanlıklar</h1>
            <p className="mt-0.5 text-sm text-muted">{active.length} aktif</p>
          </div>
          <div className="flex gap-2">
            <Button variant="secondary" onClick={() => setTplOpen(true)}><Sparkles size={15} /> Şablonlar</Button>
            <Button variant="primary" onClick={() => setAddOpen(true)}><Plus size={15} /> Yeni</Button>
          </div>
        </div>

        <StreakFreeze />

        {active.length === 0 && (
          <Card className="py-16 text-center">
            <p className="text-sm text-muted">Henüz alışkanlık yok.</p>
            <div className="mt-2 flex items-center justify-center gap-3">
              <button onClick={() => setAddOpen(true)} className="text-sm text-primary hover:underline">Tek tek ekle</button>
              <span className="text-muted-2">·</span>
              <button onClick={() => setTplOpen(true)} className="text-sm text-primary hover:underline">Hazır paketten başla</button>
            </div>
          </Card>
        )}

        {active.length > 3 && (
          <div className="relative">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-2" />
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              placeholder="Alışkanlık ara..."
              className="h-10 w-full rounded-lg border border-border bg-surface-2 pl-9 pr-9 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
            />
            {query && (
              <button onClick={() => setQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-2 hover:text-fg">
                <X size={15} />
              </button>
            )}
          </div>
        )}

        {q && filtered.length === 0 && (
          <p className="py-6 text-center text-sm text-muted">"{query}" ile eşleşen alışkanlık yok.</p>
        )}

        <div className="space-y-2">{filtered.map(h => <HabitCard key={h.id} habit={h} showCheck canReorder={reorderable} />)}</div>

        {archived.length > 0 && (
          <div>
            <button onClick={() => setShowArchived(o => !o)} className="flex items-center gap-2 text-xs text-muted hover:text-fg">
              <Archive size={13} /> Arşiv ({archived.length}) {showArchived ? 'gizle' : 'göster'}
            </button>
            {showArchived && <div className="mt-3 space-y-2 opacity-60">{archived.map(h => <HabitCard key={h.id} habit={h} />)}</div>}
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yeni alışkanlık">
        <HabitForm onSubmit={d => { addHabit(d); setAddOpen(false) }} onCancel={() => setAddOpen(false)} />
      </Modal>

      <Modal open={tplOpen} onClose={() => setTplOpen(false)} title="Hazır alışkanlık paketleri">
        <TemplateGallery onDone={() => setTplOpen(false)} />
      </Modal>
    </>
  )
}
