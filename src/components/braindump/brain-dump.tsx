'use client'
import { useState } from 'react'
import { Plus, Trash2, Brain, ListChecks, Sparkles } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { HabitForm } from '@/components/habits/habit-form'
import { cn } from '@/lib/utils'
import { haptic } from '@/lib/confetti'
import type { BrainDumpItem } from '@/lib/types'

export function BrainDump() {
  const { data, addBrainDumpItem, toggleBrainDumpItem, deleteBrainDumpItem, clearDoneBrainDump, addHabit } = useStore()
  const [text, setText] = useState('')
  const [convert, setConvert] = useState<BrainDumpItem | null>(null)

  const items = data.brainDump
  const open = items.filter(i => !i.done)
  const done = items.filter(i => i.done)

  function submit(e: React.FormEvent) {
    e.preventDefault()
    if (!text.trim()) return
    addBrainDumpItem(text)
    setText('')
    haptic(15)
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>
            <span className="flex items-center gap-2"><Brain size={17} className="text-primary" /> Beyin Boşaltma</span>
          </CardTitle>
          {done.length > 0 && (
            <button onClick={clearDoneBrainDump} className="text-xs text-muted hover:text-fg">
              Bitenleri temizle ({done.length})
            </button>
          )}
        </CardHeader>
        <CardBody className="space-y-4">
          <p className="text-xs text-muted leading-relaxed">
            Aklındaki her şeyi buraya bırak: yapılacaklar, fikirler, endişeler. Sonra eleriz. Tek amaç kafanı boşaltmak.
          </p>

          <form onSubmit={submit} className="flex gap-2">
            <input
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Aklındakini yaz, Enter'a bas..."
              autoFocus
              className="h-11 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
            />
            <Button variant="primary" type="submit"><Plus size={16} /></Button>
          </form>

          {items.length === 0 && (
            <div className="py-10 text-center">
              <Sparkles size={22} className="mx-auto text-muted-2" />
              <p className="mt-2 text-sm text-muted">Henüz boş. Kafandakileri dök.</p>
            </div>
          )}

          {open.length > 0 && (
            <ul className="space-y-1.5">
              {open.map(item => (
                <BrainRow key={item.id} item={item}
                  onToggle={() => { toggleBrainDumpItem(item.id); haptic(15) }}
                  onDelete={() => deleteBrainDumpItem(item.id)}
                  onConvert={() => setConvert(item)} />
              ))}
            </ul>
          )}

          {done.length > 0 && (
            <div className="space-y-1.5 border-t border-border pt-3">
              <p className="text-[11px] font-medium uppercase text-muted-2">Bitti</p>
              {done.map(item => (
                <BrainRow key={item.id} item={item}
                  onToggle={() => toggleBrainDumpItem(item.id)}
                  onDelete={() => deleteBrainDumpItem(item.id)}
                  onConvert={() => setConvert(item)} />
              ))}
            </div>
          )}
        </CardBody>
      </Card>

      {/* Convert a dumped thought into a real habit */}
      <Modal open={!!convert} onClose={() => setConvert(null)} title="Alışkanlığa dönüştür">
        {convert && (
          <HabitForm
            initial={{ name: convert.text.slice(0, 60), category: 'productivity', difficulty: 'easy', emoji: '🧠' }}
            onSubmit={d => { addHabit(d); deleteBrainDumpItem(convert.id); setConvert(null) }}
            onCancel={() => setConvert(null)}
          />
        )}
      </Modal>
    </>
  )
}

function BrainRow({ item, onToggle, onDelete, onConvert }: {
  item: BrainDumpItem
  onToggle: () => void
  onDelete: () => void
  onConvert: () => void
}) {
  return (
    <li className="group flex items-center gap-2.5 rounded-lg border border-border bg-surface-2 px-3 py-2.5">
      <button onClick={onToggle}
        className={cn(
          'flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-all',
          item.done ? 'border-success bg-success/20 text-success' : 'border-border-hover hover:border-fg',
        )}>
        {item.done && (
          <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
            <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>
      <span className={cn('flex-1 text-sm', item.done ? 'text-muted line-through' : 'text-fg')}>{item.text}</span>
      {!item.done && (
        <button onClick={onConvert} title="Alışkanlığa dönüştür"
          className="text-muted opacity-0 transition-opacity hover:text-primary group-hover:opacity-100">
          <ListChecks size={15} />
        </button>
      )}
      <button onClick={onDelete} title="Sil"
        className="text-muted opacity-0 transition-opacity hover:text-danger group-hover:opacity-100">
        <Trash2 size={15} />
      </button>
    </li>
  )
}
