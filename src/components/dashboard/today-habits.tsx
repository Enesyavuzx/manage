'use client'
import { useState } from 'react'
import { Plus, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { HabitCard } from '@/components/habits/habit-card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { HabitForm } from '@/components/habits/habit-form'
import { Ring } from '@/components/ui/ring'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'

export function TodayHabits() {
  const { habitsToday, todayCompletedIds, addHabit } = useStore()
  const [addOpen, setAddOpen] = useState(false)

  const completed = habitsToday.filter(h => todayCompletedIds.has(h.id)).length
  const total = habitsToday.length
  const allDone = total > 0 && completed === total
  const progress = total > 0 ? completed / total : 0

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <Ring progress={progress} size={48} stroke={5} color="rgb(var(--c-success))" glow={false}>
              <span className="text-xs font-bold text-fg font-display">{completed}/{total}</span>
            </Ring>
            <div>
              <CardTitle>Bugün</CardTitle>
              <p className="mt-0.5 text-xs text-muted">{completed} / {total} tamamlandı</p>
            </div>
          </div>
          <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
            <Plus size={14} /> Yeni
          </Button>
        </CardHeader>

        <div className="space-y-2 p-4">
          {total === 0 && (
            <div className="py-10 text-center">
              <p className="text-sm text-muted">Bugün için planlanmış alışkanlık yok.</p>
              <button onClick={() => setAddOpen(true)} className="mt-2 text-xs text-primary hover:underline">
                İlk alışkanlığını ekle
              </button>
            </div>
          )}
          {allDone && (
            <div className="mb-2 flex items-center gap-2 rounded-lg border border-success/30 bg-success/5 px-4 py-3">
              <CheckCircle2 size={16} className="text-success" />
              <span className="text-sm font-medium text-success font-display">Bugün her şey tamam! Harikasın.</span>
            </div>
          )}
          {habitsToday.map(h => <HabitCard key={h.id} habit={h} showCheck />)}
        </div>
      </Card>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Yeni alışkanlık">
        <HabitForm onSubmit={d => { addHabit(d); setAddOpen(false) }} onCancel={() => setAddOpen(false)} />
      </Modal>
    </>
  )
}
