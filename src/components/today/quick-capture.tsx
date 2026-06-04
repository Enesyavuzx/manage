'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Plus, ChevronRight } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card } from '@/components/ui/card'

// Hızlı yakalama: aklındaki dağıtıcı düşünceyi ekrandan çıkmadan beyin
// boşaltmaya at. DEHB'de "sonra unuturum" kaygısını anında kapatır.
export function QuickCapture() {
  const { data, addBrainDumpItem } = useStore()
  const [text, setText] = useState('')
  const openCount = data.brainDump.filter(b => !b.done).length

  function add() {
    const t = text.trim()
    if (!t) return
    addBrainDumpItem(t)
    setText('')
  }

  return (
    <Card className="p-4">
      <div className="mb-2 flex items-center justify-between">
        <span className="text-sm font-bold text-fg font-display">Aklını boşalt</span>
        <Link href="/braindump" className="flex items-center gap-0.5 text-xs text-muted hover:text-fg">
          {openCount > 0 ? `${openCount} not` : 'tümü'} <ChevronRight size={13} />
        </Link>
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={e => setText(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') add() }}
          placeholder="Aklındaki bir şeyi yaz, sonra düşünürsün"
          className="h-10 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
        />
        <button onClick={add} disabled={!text.trim()}
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary text-bg disabled:opacity-40">
          <Plus size={17} />
        </button>
      </div>
    </Card>
  )
}
