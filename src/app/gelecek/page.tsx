'use client'
import { useState, useMemo } from 'react'
import { Plus, Lock, Mail, Trash2, X } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getLevelInfo } from '@/lib/gamification'
import { getStreak } from '@/hooks/useStore'
import { format, formatDistanceToNow, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { FutureLetterDelay } from '@/lib/types'
import { cn } from '@/lib/utils'

const DELAY_OPTIONS: { value: FutureLetterDelay; label: string; hint: string }[] = [
  { value: '1w', label: '1 Hafta', hint: 'Kısa vadeli hedef kontrolü' },
  { value: '1m', label: '1 Ay',    hint: 'Aylık değerlendirme' },
  { value: '3m', label: '3 Ay',    hint: 'Uzun vadeli vizyon' },
]

function TrajectoryPanel() {
  const { data } = useStore()

  const info = useMemo(() => {
    const li = getLevelInfo(data.profile.totalXP)
    const dailyCompletions = data.completions.length
    const days = data.habits.length > 0 ? Math.max(1, dailyCompletions / Math.max(1, data.habits.filter(h => !h.archived).length)) : 0
    const avgXpPerDay = days > 0
      ? data.completions.reduce((s, c) => s + (c.xpAwarded ?? 0), 0) / days
      : 0

    // top streak
    const topStreak = data.habits
      .filter(h => !h.archived)
      .map(h => getStreak(data.completions, h.id, data.frozenDates))
      .reduce((m, s) => Math.max(m, s), 0)

    const proj30xp = Math.round(avgXpPerDay * 30)
    const proj30Level = getLevelInfo(data.profile.totalXP + proj30xp).level

    return { li, avgXpPerDay: Math.round(avgXpPerDay), topStreak, proj30xp, proj30Level }
  }, [data])

  if (data.habits.filter(h => !h.archived).length === 0) return null

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">30 Günlük Projeksiyon</p>
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-lg border border-border bg-surface-2 px-2 py-2.5 text-center">
          <p className="font-display text-lg font-bold text-fg tabular-nums">Lv {info.proj30Level}</p>
          <p className="text-[10px] text-muted">tahmini seviye</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 px-2 py-2.5 text-center">
          <p className="font-display text-lg font-bold text-xp tabular-nums">+{info.proj30xp}</p>
          <p className="text-[10px] text-muted">tahmini XP</p>
        </div>
        <div className="rounded-lg border border-border bg-surface-2 px-2 py-2.5 text-center">
          <p className="font-display text-lg font-bold text-orange-400 tabular-nums">{info.topStreak}🔥</p>
          <p className="text-[10px] text-muted">en uzun seri</p>
        </div>
      </div>
      <p className="text-[11px] text-muted leading-relaxed">
        Bu tempoda devam edersen 30 gün içinde yaklaşık <span className="font-semibold text-fg">Seviye {info.proj30Level}</span> olabilirsin.
        Günlük ort. <span className="font-semibold text-fg">{info.avgXpPerDay} XP</span> kazanıyorsun.
      </p>
    </div>
  )
}

function WriteLetterPanel({ onClose }: { onClose: () => void }) {
  const { data, saveFutureLetter } = useStore()
  const li = getLevelInfo(data.profile.totalXP)
  const topStreak = data.habits
    .filter(h => !h.archived)
    .map(h => getStreak(data.completions, h.id, data.frozenDates))
    .reduce((m, s) => Math.max(m, s), 0)

  const [text, setText] = useState('')
  const [delay, setDelay] = useState<FutureLetterDelay>('1m')

  const context = `Seviye ${li.level} · ${topStreak > 0 ? `${topStreak} gün seri` : `${data.completions.length} tamamlama`}`

  function handleSave() {
    if (!text.trim()) return
    saveFutureLetter(text, delay, context)
    onClose()
  }

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-fg">Gelecekteki Kendine Mektup Yaz</p>
        <button onClick={onClose} className="text-muted hover:text-fg"><X size={15} /></button>
      </div>

      <p className="text-xs text-muted leading-relaxed">
        Bugünkü hedeflerini, umutlarını, korkularını yaz. Gelecekteki sen bunu okuyacak.
        Şu an: <span className="font-semibold text-fg">{context}</span>
      </p>

      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Merhaba gelecekteki ben, bugün..."
        rows={6}
        className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none"
      />

      <div>
        <p className="mb-2 text-xs text-muted">Ne zaman açılsın?</p>
        <div className="grid grid-cols-3 gap-2">
          {DELAY_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => setDelay(opt.value)}
              className={cn(
                'rounded-lg border px-3 py-2 text-center text-xs transition-colors',
                delay === opt.value
                  ? 'border-primary bg-primary/10 text-fg'
                  : 'border-border bg-surface-2 text-muted hover:text-fg',
              )}
            >
              <p className="font-semibold">{opt.label}</p>
              <p className="text-[10px] text-muted mt-0.5">{opt.hint}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 rounded-lg border border-border bg-surface-2 px-3 py-2 text-sm text-muted hover:text-fg transition-colors"
        >
          Vazgeç
        </button>
        <button
          type="button"
          onClick={handleSave}
          disabled={!text.trim()}
          className="flex-1 rounded-lg border border-primary bg-primary/10 px-3 py-2 text-sm font-semibold text-fg hover:bg-primary hover:text-bg transition-colors disabled:pointer-events-none disabled:opacity-40"
        >
          Mektup Kilitle
        </button>
      </div>
    </div>
  )
}

function LetterCard({ letter, onOpen, onDelete }: {
  letter: { id: string; writtenAt: string; unlockAt: string; text: string; opened: boolean; openedAt?: string; context?: string }
  onOpen: (id: string) => void
  onDelete: (id: string) => void
}) {
  const now = new Date().toISOString()
  const unlocked = letter.unlockAt <= now
  const [expanded, setExpanded] = useState(letter.opened)

  function handleRead() {
    if (!unlocked) return
    if (!letter.opened) onOpen(letter.id)
    setExpanded(v => !v)
  }

  return (
    <div className={cn(
      'rounded-xl border bg-surface transition-colors',
      unlocked && !letter.opened ? 'border-primary/50 bg-primary/5' : 'border-border',
    )}>
      <button
        type="button"
        onClick={handleRead}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="text-xl leading-none">
          {unlocked ? (letter.opened ? '📬' : '✉️') : '🔒'}
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-fg">
            {unlocked
              ? letter.opened ? 'Okundu' : 'Mektup geldi!'
              : 'Kilitli'}
          </p>
          <p className="text-xs text-muted">
            {format(parseISO(letter.writtenAt), 'd MMM yyyy', { locale: tr })} tarihinde yazıldı
            {letter.context ? ` · ${letter.context}` : ''}
          </p>
          {!unlocked && (
            <p className="text-xs text-muted">
              {formatDistanceToNow(parseISO(letter.unlockAt), { locale: tr, addSuffix: true })} açılır
            </p>
          )}
        </div>
        {unlocked && !letter.opened && (
          <span className="shrink-0 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-bg">!</span>
        )}
        {!unlocked && <Lock size={13} className="shrink-0 text-muted-2" />}
        {unlocked && <Mail size={13} className="shrink-0 text-muted-2" />}
      </button>

      {expanded && unlocked && (
        <div className="border-t border-border px-4 pb-4 pt-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">{letter.text}</p>
          {letter.openedAt && (
            <p className="mt-2 text-[11px] text-muted-2">
              {format(parseISO(letter.openedAt), 'd MMM yyyy', { locale: tr })} tarihinde açıldı
            </p>
          )}
        </div>
      )}

      <div className="flex justify-end border-t border-border px-4 py-1.5">
        <button
          type="button"
          onClick={() => onDelete(letter.id)}
          className="text-muted-2 hover:text-danger transition-colors p-1"
          aria-label="Sil"
        >
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  )
}

export default function GelecekPage() {
  const { data, openFutureLetter, deleteFutureLetter } = useStore()
  const [writing, setWriting] = useState(false)

  const now = new Date().toISOString()
  const sorted = [...data.futureLetters].sort((a, b) => {
    // Unread unlocked first, then by written date desc
    const aReady = a.unlockAt <= now && !a.opened
    const bReady = b.unlockAt <= now && !b.opened
    if (aReady !== bReady) return aReady ? -1 : 1
    return b.writtenAt.localeCompare(a.writtenAt)
  })

  const unreadCount = sorted.filter(l => l.unlockAt <= now && !l.opened).length

  return (
    <div className="mx-auto max-w-xl space-y-5">
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted">Gelecek Benlik</p>
          <h1 className="text-2xl font-bold text-fg font-display">Mektupların</h1>
          {unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-primary font-medium">
              {unreadCount} mektup seni bekliyor
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={() => setWriting(true)}
          className="flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-bold text-bg shadow-glow hover:opacity-90 transition-opacity"
        >
          <Plus size={15} /> Yaz
        </button>
      </div>

      <TrajectoryPanel />

      {writing && <WriteLetterPanel onClose={() => setWriting(false)} />}

      {sorted.length === 0 && !writing ? (
        <div className="rounded-xl border border-dashed border-border bg-surface p-8 text-center">
          <p className="text-4xl mb-3">📝</p>
          <p className="text-sm font-semibold text-fg">Henüz mektup yok</p>
          <p className="mt-1 text-xs text-muted leading-relaxed">
            Bugünkü hedeflerini, umutlarını, korkularını yaz.<br />
            Gelecekteki sen okuyunca ne hisseder?
          </p>
          <button
            type="button"
            onClick={() => setWriting(true)}
            className="mt-4 rounded-lg border border-border bg-surface-2 px-5 py-2 text-sm font-medium text-fg hover:bg-primary hover:text-bg hover:border-primary transition-colors"
          >
            İlk mektubunu yaz
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {sorted.map(l => (
            <LetterCard
              key={l.id}
              letter={l}
              onOpen={openFutureLetter}
              onDelete={deleteFutureLetter}
            />
          ))}
        </div>
      )}

      <p className="text-center text-xs text-muted-2">
        Mektuplar cihazında saklanır. Kilitleme süreleri geçince açılır.
      </p>
    </div>
  )
}
