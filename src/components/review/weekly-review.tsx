'use client'

import { useState } from 'react'
import { format, startOfWeek, endOfWeek, addDays, isWithinInterval, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'
import { CheckCircle2, ChevronDown, ChevronUp } from 'lucide-react'
import { useStore, getStreak } from '@/hooks/useStore'
import type { WeeklyReview } from '@/lib/types'

function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  const startDay = format(weekStart, 'd MMM', { locale: tr })
  const endStr = format(weekEnd, 'd MMM yyyy', { locale: tr })
  return `${startDay} - ${endStr}`
}

function weekKey(date: Date): string {
  return format(getWeekStart(date), 'yyyy-MM-dd')
}

function useWeekStats() {
  const { data } = useStore()
  const now = new Date()
  const weekStart = getWeekStart(now)
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

  const weekCompletions = data.completions.filter(c => {
    try {
      const d = parseISO(c.date)
      return isWithinInterval(d, { start: weekStart, end: weekEnd })
    } catch {
      return false
    }
  })

  const totalCompleted = weekCompletions.length

  const maxStreak = Math.max(
    0,
    ...data.habits
      .filter(h => !h.archived)
      .map(h => getStreak(data.completions, h.id, data.frozenDates))
  )

  const weekXP = weekCompletions.reduce((sum, c) => sum + (c.xpAwarded ?? 0), 0)

  return { totalCompleted, maxStreak, weekXP }
}

interface ReviewCardProps {
  review: WeeklyReview
}

function ReviewCard({ review }: ReviewCardProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="rounded-lg border border-border bg-surface-2 overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted">
            {formatWeekRange(new Date(review.weekStart + 'T12:00:00'))}
          </p>
          <p className="mt-0.5 text-sm text-fg truncate">{review.wentWell}</p>
        </div>
        <span className="ml-3 shrink-0 text-muted">
          {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
        </span>
      </button>
      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          <div>
            <p className="text-xs text-muted mb-1">Ne iyi gitti?</p>
            <p className="text-sm text-fg whitespace-pre-wrap">{review.wentWell}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Gelistirilecek?</p>
            <p className="text-sm text-fg whitespace-pre-wrap">{review.toImprove}</p>
          </div>
          <div>
            <p className="text-xs text-muted mb-1">Gelecek hafta hedefi</p>
            <p className="text-sm text-fg whitespace-pre-wrap">{review.nextWeekGoal}</p>
          </div>
          <p className="text-xs text-muted">+{review.xpEarned} XP kazanildi</p>
        </div>
      )}
    </div>
  )
}

export function WeeklyReview() {
  const { data, saveWeeklyReview } = useStore()
  const [wentWell, setWentWell] = useState('')
  const [toImprove, setToImprove] = useState('')
  const [nextWeekGoal, setNextWeekGoal] = useState('')

  const now = new Date()
  const thisWeekKey = weekKey(now)
  const weekStart = getWeekStart(now)

  const { totalCompleted, maxStreak, weekXP } = useWeekStats()

  const alreadyReviewed = data.weeklyReviews.find(r => r.weekStart === thisWeekKey)

  const canSubmit = wentWell.trim() !== '' && toImprove.trim() !== '' && nextWeekGoal.trim() !== '' && !alreadyReviewed

  function handleSubmit() {
    if (!canSubmit) return
    saveWeeklyReview({
      weekStart: thisWeekKey,
      wentWell: wentWell.trim(),
      toImprove: toImprove.trim(),
      nextWeekGoal: nextWeekGoal.trim(),
    })
    setWentWell('')
    setToImprove('')
    setNextWeekGoal('')
  }

  const pastReviews = [...data.weeklyReviews]
    .filter(r => r.weekStart !== thisWeekKey)
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    .slice(0, 5)

  const weekRange = formatWeekRange(weekStart)

  return (
    <div className="space-y-4">
      {/* Current week card */}
      <div className="rounded-xl border border-border bg-surface p-5 space-y-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-muted uppercase tracking-wider">Bu Hafta</p>
            <p className="mt-0.5 text-sm font-semibold text-fg">{weekRange}</p>
          </div>
          {alreadyReviewed && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-success">
              <CheckCircle2 size={14} /> Kapatildi
            </span>
          )}
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-fg font-display">{totalCompleted}</p>
            <p className="text-xs text-muted">tamamlandi</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-fg font-display">{maxStreak}</p>
            <p className="text-xs text-muted">en uzun seri</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-center">
            <p className="text-lg font-bold text-fg font-display">{weekXP}</p>
            <p className="text-xs text-muted">XP kazanildi</p>
          </div>
        </div>

        {alreadyReviewed ? (
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted mb-1">Ne iyi gitti?</p>
              <p className="text-sm text-fg">{alreadyReviewed.wentWell}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Gelistirilecek?</p>
              <p className="text-sm text-fg">{alreadyReviewed.toImprove}</p>
            </div>
            <div>
              <p className="text-xs text-muted mb-1">Hedef</p>
              <p className="text-sm text-fg">{alreadyReviewed.nextWeekGoal}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Bu hafta ne iyi gitti?
              </label>
              <textarea
                value={wentWell}
                onChange={e => setWentWell(e.target.value)}
                placeholder="Bir sey, kucuk de olsa..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Gelecek hafta ne gelistirilebilir?
              </label>
              <textarea
                value={toImprove}
                onChange={e => setToImprove(e.target.value)}
                placeholder="Odaklanmak istedigim bir sey..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                Gelecek hafta tek hedefim:
              </label>
              <textarea
                value={nextWeekGoal}
                onChange={e => setNextWeekGoal(e.target.value)}
                placeholder="Somut, kucuk bir hedef..."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 font-mono text-sm text-fg placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-primary hover:text-bg hover:border-primary disabled:pointer-events-none disabled:opacity-40"
            >
              Haftayi Kapat (+50 XP)
            </button>
          </div>
        )}
      </div>

      {/* Past reviews */}
      {pastReviews.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-medium text-muted uppercase tracking-wider">Gecmis Haftalar</p>
          {pastReviews.map(r => (
            <ReviewCard key={r.id} review={r} />
          ))}
        </div>
      )}
    </div>
  )
}
