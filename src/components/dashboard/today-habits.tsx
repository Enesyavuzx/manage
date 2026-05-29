'use client'
import { useState } from 'react'
import { Plus, CheckCircle2 } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { HabitCard } from '@/components/habits/habit-card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { HabitForm } from '@/components/habits/habit-form'
import { Progress } from '@/components/ui/progress'

export function TodayHabits() {
  const { habitsToday, todayCompletedIds, addHabit } = useStore()
  const [addOpen, setAddOpen] = useState(false)

  const completed = habitsToday.filter(h => todayCompletedIds.has(h.id)).length
  const total = habitsToday.length
  const allDone = total > 0 && completed === total

  return (
    <>
      <div className="rounded-xl border border-border bg-surface">
        <div className="flex items-center justify-between border-b border-border px-5 py-4">
          <div>
            <h2 className="text-sm font-semibold text-white">Today</h2>
            <p className="text-xs text-muted mt-0.5">{completed} of {total} completed</p>
          </div>
          <div className="flex items-center gap-3">
            {total > 0 && (
              <div className="w-32">
                <Progress value={completed} max={total} color="success" size="sm" />
              </div>
            )}
            <Button variant="primary" size="sm" onClick={() => setAddOpen(true)}>
              <Plus size={14} /> New habit
            </Button>
          </div>
        </div>

        <div className="p-4 space-y-2">
          {total === 0 && (
            <div className="py-10 text-center">
              <p className="text-muted text-sm">No habits scheduled for today.</p>
              <button
                onClick={() => setAddOpen(true)}
                className="mt-2 text-xs text-accent-light hover:underline"
              >
                Add your first habit
              </button>
            </div>
          )}
          {allDone && total > 0 && (
            <div className="flex items-center gap-2 rounded-lg border border-success/20 bg-success/5 px-4 py-3 mb-2">
              <CheckCircle2 size={16} className="text-success-light" />
              <span className="text-sm font-medium text-success-light">All done for today! Great work.</span>
            </div>
          )}
          {habitsToday.map(h => (
            <HabitCard key={h.id} habit={h} showCheck />
          ))}
        </div>
      </div>

      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="New habit">
        <HabitForm
          onSubmit={(d) => { addHabit(d); setAddOpen(false) }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>
    </>
  )
}
