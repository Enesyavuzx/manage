'use client'
import { useState } from 'react'
import { Smile } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { MOOD_META, MOOD_XP } from '@/lib/constants'
import { todayMood } from '@/lib/store'
import type { MoodLevel } from '@/lib/types'
import { cn } from '@/lib/utils'
import { format, subDays } from 'date-fns'

const LEVELS: MoodLevel[] = [1, 2, 3, 4, 5]

const LOW_MOOD_TIPS: { emoji: string; text: string }[] = [
  { emoji: '💧', text: 'Bir bardak soğuk su iç. Gerçekten işe yarar.' },
  { emoji: '🚶', text: '5 dakika yürü. En küçük hareket bile kimyayı değiştirir.' },
  { emoji: '🌬️', text: '4 saniye nefes al, 7 tut, 8\'de bırak. Üç kez tekrarla.' },
  { emoji: '📱', text: 'Bir arkadaşına "nasılsın" mesajı at. Bağlantı dopamin verir.' },
  { emoji: '☀️', text: 'Varsa bir pencereye git, 2 dakika güneş ışığına bak.' },
  { emoji: '🎵', text: 'Favori şarkını aç, 1 dakika sadece dinle.' },
  { emoji: '🍎', text: 'Ne yedin? Karbonhidrat düşüklüğü ruh halini direkt etkiler.' },
  { emoji: '🛏️', text: 'Zor günler olur. Küçük bir görev bile sayılır.' },
  { emoji: '🎯', text: 'Bugün tek bir şey yap. Sadece bir. Hepsi bu.' },
  { emoji: '🧘', text: 'Hisler geçici, sen kalıcısın. Şu an olduğun yer yeterli.' },
]

function pickThree(): { emoji: string; text: string }[] {
  return [...LOW_MOOD_TIPS].sort(() => Math.random() - 0.5).slice(0, 3)
}

export function MoodTracker() {
  const { data, logMood } = useStore()
  const current = todayMood(data)
  const [note, setNote] = useState(current?.note ?? '')
  const [tips] = useState(() => pickThree())

  function pick(level: MoodLevel) {
    logMood(level, note.trim() || undefined)
  }

  const isLowMood = current && current.level <= 2

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = subDays(new Date(), 13 - i)
    const key = format(d, 'yyyy-MM-dd')
    const m = data.moods.find(x => x.date === key)
    return { key, label: format(d, 'd'), mood: m }
  })

  const avg = data.moods.length
    ? (data.moods.reduce((s, m) => s + m.level, 0) / data.moods.length)
    : 0

  return (
    <div className="space-y-4">
      <Card glow>
        <CardHeader>
          <CardTitle><span className="inline-flex items-center gap-2"><Smile size={15} /> Bugün nasılsın?</span></CardTitle>
          {!current && <span className="text-xs text-xp">+{MOOD_XP} XP</span>}
        </CardHeader>

        <div className="space-y-5 p-5">
          <div className="grid grid-cols-5 gap-2">
            {LEVELS.map(level => {
              const meta = MOOD_META[level]
              const active = current?.level === level
              return (
                <button
                  key={level}
                  onClick={() => pick(level)}
                  className={cn(
                    'flex flex-col items-center gap-1.5 rounded-xl border py-3 transition-all',
                    active ? 'border-2' : 'border-border bg-surface-2 hover:-translate-y-0.5 hover:border-border-hover',
                  )}
                  style={active ? { borderColor: meta.color, background: `${meta.color}1a` } : undefined}
                >
                  <span className="text-3xl">{meta.emoji}</span>
                  <span className="text-[11px] font-medium text-muted">{meta.label}</span>
                </button>
              )
            })}
          </div>

          <input
            value={note}
            onChange={e => setNote(e.target.value)}
            onBlur={() => { if (current) logMood(current.level, note.trim() || undefined) }}
            placeholder="Bir not ekle (opsiyonel)"
            className="h-10 w-full rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
          />

          {current && (
            <p className="text-xs text-muted">
              Bugün: <span style={{ color: MOOD_META[current.level].color }}>{MOOD_META[current.level].emoji} {MOOD_META[current.level].label}</span>
            </p>
          )}
        </div>
      </Card>

      {isLowMood && (
        <Card className="border-primary/30">
          <div className="px-4 pt-4">
            <p className="text-sm font-semibold text-fg font-display">Zor günler için öneriler</p>
          </div>
          <div className="space-y-2 p-4">
            {tips.map((tip, i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg border border-border bg-surface-2 p-3">
                <span className="text-xl">{tip.emoji}</span>
                <p className="text-sm text-muted">{tip.text}</p>
              </div>
            ))}
          </div>
          <p className="pb-4 text-center text-xs text-muted-2">Bunlardan birini denemen bile yeterli.</p>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Son 14 Gün</CardTitle>
          {avg > 0 && <span className="text-xs text-muted">ort. {avg.toFixed(1)} / 5</span>}
        </CardHeader>
        <div className="p-5">
          <div className="flex items-end justify-between gap-1.5">
            {days.map(d => (
              <div key={d.key} className="flex flex-1 flex-col items-center gap-1">
                <div
                  className="aspect-square w-full rounded-md border border-border"
                  style={d.mood ? { background: MOOD_META[d.mood.level].color, borderColor: MOOD_META[d.mood.level].color } : { background: 'rgb(var(--c-surface2))' }}
                  title={d.mood ? MOOD_META[d.mood.level].label : 'kayıt yok'}
                />
                <span className="text-[10px] text-muted-2">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
