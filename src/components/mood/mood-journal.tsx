'use client'
import { BookOpen } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { MOOD_META } from '@/lib/constants'

export function MoodJournal() {
  const { data } = useStore()

  const entries = data.moods
    .filter(m => m.note && m.note.trim())
    .sort((a, b) => (a.date < b.date ? 1 : -1))

  return (
    <Card>
      <CardHeader>
        <CardTitle><span className="flex items-center gap-2"><BookOpen size={16} /> Jurnal</span></CardTitle>
        {entries.length > 0 && <span className="text-xs text-muted">{entries.length} not</span>}
      </CardHeader>
      <CardBody>
        {entries.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted">
            Ruh hali kaydederken not eklersen burada günlüğün oluşur.
          </p>
        ) : (
          <ol className="space-y-3">
            {entries.map(m => {
              const meta = MOOD_META[m.level]
              return (
                <li key={m.id} className="flex gap-3 border-l-2 pl-3" style={{ borderColor: meta.color }}>
                  <span className="text-xl">{meta.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-medium text-fg">
                        {format(parseISO(m.date), 'd MMMM EEEE', { locale: tr })}
                      </span>
                      <span className="text-[11px]" style={{ color: meta.color }}>{meta.label}</span>
                    </div>
                    <p className="mt-0.5 text-sm text-muted leading-snug">{m.note}</p>
                  </div>
                </li>
              )
            })}
          </ol>
        )}
      </CardBody>
    </Card>
  )
}
