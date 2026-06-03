'use client'
import { useState } from 'react'
import { Pill, Plus, Trash2, Check } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { medTakenOn, todayKey } from '@/lib/store'
import { cn } from '@/lib/utils'

const EMOJIS = ['💊', '💉', '🧴', '🌿', '🩹']

export function MedicationTracker() {
  const { data, addMedication, deleteMedication, toggleMedicationDose } = useStore()
  const [adding, setAdding] = useState(false)
  const [name, setName] = useState('')
  const [emoji, setEmoji] = useState(EMOJIS[0])
  const [time, setTime] = useState('')

  const today = todayKey()
  const takenCount = data.medications.filter(m => medTakenOn(data, m.id, today)).length

  function submit() {
    if (!name.trim()) return
    addMedication(name.trim(), emoji, time || null)
    setName(''); setTime(''); setEmoji(EMOJIS[0]); setAdding(false)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle><span className="inline-flex items-center gap-2"><Pill size={15} /> İlaç takibi</span></CardTitle>
        {data.medications.length > 0 && (
          <span className="text-xs text-muted">{takenCount}/{data.medications.length} alındı</span>
        )}
      </CardHeader>

      <div className="space-y-2 p-4">
        {data.medications.length === 0 && !adding && (
          <p className="py-3 text-center text-sm text-muted">Henüz ilaç eklemedin. Günlük takip için bir tane ekle.</p>
        )}

        {data.medications.map(med => {
          const taken = medTakenOn(data, med.id, today)
          return (
            <div key={med.id} className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
              <button
                onClick={() => toggleMedicationDose(med.id)}
                aria-pressed={taken}
                aria-label={taken ? 'Alındı işaretini kaldır' : 'Alındı olarak işaretle'}
                className={cn(
                  'flex h-6 w-6 shrink-0 items-center justify-center rounded-md border-2 transition-all',
                  taken ? 'border-success bg-success/20 text-success' : 'border-border-hover hover:border-fg',
                )}
              >
                {taken && <Check size={14} />}
              </button>
              <span className="text-lg">{med.emoji}</span>
              <span className={cn('min-w-0 flex-1 truncate text-sm', taken ? 'text-muted line-through' : 'text-fg')}>{med.name}</span>
              {med.time && <span className="shrink-0 text-xs text-muted">{med.time}</span>}
              <button onClick={() => deleteMedication(med.id)} className="shrink-0 text-muted transition-colors hover:text-danger" aria-label="Sil">
                <Trash2 size={14} />
              </button>
            </div>
          )
        })}

        {adding ? (
          <div className="space-y-2 rounded-lg border border-border bg-surface-2 p-3">
            <div className="flex gap-1.5">
              {EMOJIS.map(e => (
                <button
                  key={e}
                  onClick={() => setEmoji(e)}
                  className={cn('h-9 w-9 rounded-lg border text-lg transition-all', emoji === e ? 'border-primary' : 'border-border hover:border-border-hover')}
                >
                  {e}
                </button>
              ))}
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="İlaç adı"
              className="h-10 w-full rounded-lg border border-border bg-surface px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
            />
            <div className="flex items-center gap-2">
              <input
                type="time"
                value={time}
                onChange={e => setTime(e.target.value)}
                className="h-10 flex-1 rounded-lg border border-border bg-surface px-3 text-sm text-fg focus:border-primary focus:outline-none"
              />
              <Button variant="primary" onClick={submit} disabled={!name.trim()}>Ekle</Button>
              <Button variant="secondary" onClick={() => setAdding(false)}>İptal</Button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setAdding(true)}
            className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-dashed border-border py-2.5 text-sm text-muted transition-colors hover:text-fg"
          >
            <Plus size={15} /> İlaç ekle
          </button>
        )}
      </div>
    </Card>
  )
}
