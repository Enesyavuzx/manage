'use client'
import { useState } from 'react'
import { Plus, Archive, Sparkles } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { HabitCard } from '@/components/habits/habit-card'
import { HabitForm } from '@/components/habits/habit-form'
import { TemplateGallery } from '@/components/habits/template-gallery'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function HabitsPage() {
  const { data, addHabit } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [tplOpen, setTplOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const active = data.habits.filter(h => !h.archived)
  const archived = data.habits.filter(h => h.archived)

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

        <div className="space-y-2">{active.map(h => <HabitCard key={h.id} habit={h} showCheck />)}</div>

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
