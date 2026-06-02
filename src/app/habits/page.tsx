'use client'
import { useState } from 'react'
import { Plus, Archive } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { HabitCard } from '@/components/habits/habit-card'
import { HabitForm } from '@/components/habits/habit-form'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export default function HabitsPage() {
  const { data, addHabit } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const active = data.habits.filter(h => !h.archived)
  const archived = data.habits.filter(h => h.archived)

  return (
    <>
      <div className="mx-auto max-w-3xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-fg text-gradient">Alışkanlıklar</h1>
            <p className="mt-0.5 text-sm text-muted">{active.length} aktif</p>
          </div>
          <Button variant="primary" onClick={() => setAddOpen(true)}><Plus size={15} /> Yeni</Button>
        </div>

        {active.length === 0 && (
          <Card className="py-16 text-center">
            <p className="text-sm text-muted">Henüz alışkanlık yok.</p>
            <button onClick={() => setAddOpen(true)} className="mt-2 text-sm text-primary hover:underline">İlk alışkanlığını ekle</button>
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
    </>
  )
}
