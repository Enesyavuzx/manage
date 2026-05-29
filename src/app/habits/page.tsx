'use client'
import { useState } from 'react'
import { Plus, Archive } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { HabitCard } from '@/components/habits/habit-card'
import { HabitForm } from '@/components/habits/habit-form'
import { Modal } from '@/components/ui/modal'
import { Button } from '@/components/ui/button'

export default function HabitsPage() {
  const { data, addHabit } = useStore()
  const [addOpen, setAddOpen] = useState(false)
  const [showArchived, setShowArchived] = useState(false)

  const active   = data.habits.filter(h => !h.archived)
  const archived = data.habits.filter(h => h.archived)

  return (
    <>
      <div className="max-w-3xl space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Habits</h1>
            <p className="text-sm text-muted mt-0.5">{active.length} active</p>
          </div>
          <Button variant="primary" onClick={() => setAddOpen(true)}>
            <Plus size={15} /> New habit
          </Button>
        </div>

        {active.length === 0 && (
          <div className="rounded-xl border border-border bg-surface py-16 text-center">
            <p className="text-muted text-sm">No habits yet.</p>
            <button onClick={() => setAddOpen(true)} className="mt-2 text-sm text-accent-light hover:underline">
              Add your first habit
            </button>
          </div>
        )}

        <div className="space-y-2">
          {active.map(h => <HabitCard key={h.id} habit={h} />)}
        </div>

        {archived.length > 0 && (
          <div>
            <button
              onClick={() => setShowArchived(o => !o)}
              className="flex items-center gap-2 text-xs text-muted hover:text-white transition-colors"
            >
              <Archive size={13} />
              {showArchived ? 'Hide' : 'Show'} archived ({archived.length})
            </button>
            {showArchived && (
              <div className="mt-3 space-y-2 opacity-60">
                {archived.map(h => <HabitCard key={h.id} habit={h} />)}
              </div>
            )}
          </div>
        )}
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New habit">
        <HabitForm
          onSubmit={d => { addHabit(d); setAddOpen(false) }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </>
  )
}
