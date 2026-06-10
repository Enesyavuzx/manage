'use client'

import { useState, useMemo } from 'react'
import { format, startOfWeek, endOfWeek, addDays, isWithinInterval, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'
import { CheckCircle2, ChevronDown, ChevronUp, Zap, Target, TrendingUp, Trophy } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import type { WeeklyReview, MoodLevel } from '@/lib/types'
import { cn } from '@/lib/utils'

function getWeekStart(date: Date): Date {
  return startOfWeek(date, { weekStartsOn: 1 })
}

function formatWeekRange(weekStart: Date): string {
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
  return `${format(weekStart, 'd MMM', { locale: tr })} – ${format(weekEnd, 'd MMM yyyy', { locale: tr })}`
}

function weekKey(date: Date): string {
  return format(getWeekStart(date), 'yyyy-MM-dd')
}

const MOOD_OPTIONS: { level: MoodLevel; emoji: string; label: string }[] = [
  { level: 1, emoji: '😞', label: 'Kötü' },
  { level: 2, emoji: '😕', label: 'Zayıf' },
  { level: 3, emoji: '😐', label: 'Orta' },
  { level: 4, emoji: '🙂', label: 'İyi' },
  { level: 5, emoji: '😄', label: 'Harika' },
]

function useWeekStats(weekStart: Date) {
  const { data } = useStore()
  const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })

  const weekCompletions = useMemo(() => data.completions.filter(c => {
    try {
      const d = parseISO(c.date)
      return isWithinInterval(d, { start: weekStart, end: weekEnd })
    } catch {
      return false
    }
  }), [data.completions, weekStart.toISOString()])

  const weekXP = weekCompletions.reduce((sum, c) => sum + (c.xpAwarded ?? 0), 0)

  const dailyCounts = useMemo(() => Array.from({ length: 7 }, (_, i) => {
    const day = format(addDays(weekStart, i), 'yyyy-MM-dd')
    return weekCompletions.filter(c => c.date === day).length
  }), [weekCompletions, weekStart.toISOString()])

  const maxDaily = Math.max(1, ...dailyCounts)

  const topHabit = useMemo(() => {
    const byHabit = new Map<string, number>()
    weekCompletions.forEach(c => byHabit.set(c.habitId, (byHabit.get(c.habitId) ?? 0) + 1))
    if (byHabit.size === 0) return null
    const [bestId, bestCount] = [...byHabit.entries()].sort((a, b) => b[1] - a[1])[0]
    const habit = data.habits.find(h => h.id === bestId)
    return habit ? { habit, count: bestCount } : null
  }, [weekCompletions, data.habits])

  const uniqueHabits = new Set(weekCompletions.map(c => c.habitId)).size

  return { total: weekCompletions.length, weekXP, dailyCounts, maxDaily, topHabit, uniqueHabits }
}

function ReviewCard({ review }: { review: WeeklyReview }) {
  const [open, setOpen] = useState(false)
  const weekStart = new Date(review.weekStart + 'T12:00:00')
  const mood = MOOD_OPTIONS.find(m => m.level === review.weekMood)

  return (
    <div className="rounded-xl border border-border bg-surface overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-surface-2 transition-colors"
        aria-expanded={open}
      >
        <div className="min-w-0 flex items-center gap-3">
          {mood && <span className="text-base">{mood.emoji}</span>}
          <div className="min-w-0">
            <p className="text-xs text-muted">{formatWeekRange(weekStart)}</p>
            <p className="mt-0.5 text-sm text-fg truncate">{review.wentWell}</p>
          </div>
        </div>
        <div className="flex items-center gap-2 ml-3 shrink-0">
          <span className="text-xs font-semibold text-xp">+{review.xpEarned} XP</span>
          {open ? <ChevronUp size={14} className="text-muted" /> : <ChevronDown size={14} className="text-muted" />}
        </div>
      </button>

      {open && (
        <div className="border-t border-border px-4 pb-4 pt-3 space-y-3">
          {review.wins && (
            <div>
              <p className="text-xs font-medium text-muted mb-1">🏆 Kazanımlar</p>
              <p className="text-sm text-fg whitespace-pre-wrap">{review.wins}</p>
            </div>
          )}
          <div>
            <p className="text-xs font-medium text-muted mb-1">✅ Ne iyi gitti?</p>
            <p className="text-sm text-fg whitespace-pre-wrap">{review.wentWell}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted mb-1">🔧 Geliştirilecek?</p>
            <p className="text-sm text-fg whitespace-pre-wrap">{review.toImprove}</p>
          </div>
          <div>
            <p className="text-xs font-medium text-muted mb-1">🎯 Gelecek hafta hedefi</p>
            <p className="text-sm text-fg whitespace-pre-wrap">{review.nextWeekGoal}</p>
          </div>
        </div>
      )}
    </div>
  )
}

function DayBars({ counts, maxCount }: { counts: number[]; maxCount: number }) {
  const days = ['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz']
  const today = new Date().getDay()
  const todayIndex = today === 0 ? 6 : today - 1

  return (
    <div className="flex items-end gap-1.5 h-16">
      {counts.map((count, i) => {
        const height = maxCount > 0 ? Math.max(0.08, count / maxCount) : 0
        const isToday = i === todayIndex
        const isFuture = i > todayIndex
        return (
          <div key={i} className="flex flex-1 flex-col items-center gap-1">
            <div
              className={cn(
                'w-full rounded-sm transition-all',
                count === 0 ? 'bg-surface-2' : isToday ? 'bg-primary' : 'bg-primary/60',
                isFuture && 'opacity-30',
              )}
              style={{ height: `${height * 52}px`, minHeight: count > 0 ? '4px' : '2px' }}
              title={`${days[i]}: ${count} tamamlandı`}
            />
            <span className={cn('text-[9px] font-medium', isToday ? 'text-primary' : 'text-muted-2')}>{days[i]}</span>
          </div>
        )
      })}
    </div>
  )
}

export function WeeklyReview() {
  const { data, saveWeeklyReview } = useStore()
  const [wentWell, setWentWell] = useState('')
  const [toImprove, setToImprove] = useState('')
  const [nextWeekGoal, setNextWeekGoal] = useState('')
  const [wins, setWins] = useState('')
  const [weekMood, setWeekMood] = useState<MoodLevel | null>(null)

  const now = new Date()
  const thisWeekKey = weekKey(now)
  const weekStart = getWeekStart(now)
  const stats = useWeekStats(weekStart)

  const alreadyReviewed = data.weeklyReviews.find(r => r.weekStart === thisWeekKey)
  const canSubmit = wentWell.trim() !== '' && toImprove.trim() !== '' && nextWeekGoal.trim() !== '' && !alreadyReviewed

  function handleSubmit() {
    if (!canSubmit) return
    saveWeeklyReview({
      weekStart: thisWeekKey,
      wentWell: wentWell.trim(),
      toImprove: toImprove.trim(),
      nextWeekGoal: nextWeekGoal.trim(),
      wins: wins.trim() || undefined,
      weekMood: weekMood ?? undefined,
    })
    setWentWell(''); setToImprove(''); setNextWeekGoal(''); setWins(''); setWeekMood(null)
  }

  const pastReviews = [...data.weeklyReviews]
    .filter(r => r.weekStart !== thisWeekKey)
    .sort((a, b) => b.weekStart.localeCompare(a.weekStart))
    .slice(0, 8)

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-border bg-surface p-5 space-y-5">
        {/* Başlık */}
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-muted uppercase tracking-wider">Bu Hafta</p>
            <p className="mt-0.5 text-sm font-semibold text-fg">{formatWeekRange(weekStart)}</p>
          </div>
          {alreadyReviewed && (
            <span className="flex items-center gap-1.5 rounded-full bg-success/10 px-3 py-1 text-xs font-semibold text-success">
              <CheckCircle2 size={12} /> Kapatıldı
            </span>
          )}
        </div>

        {/* Stat satırı */}
        <div className="grid grid-cols-3 gap-2">
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <CheckCircle2 size={11} className="text-success" />
              <p className="text-base font-bold text-fg font-display">{stats.total}</p>
            </div>
            <p className="text-[10px] text-muted">tamamlandı</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Zap size={11} className="text-xp" />
              <p className="text-base font-bold text-fg font-display">{stats.weekXP}</p>
            </div>
            <p className="text-[10px] text-muted">XP kazanıldı</p>
          </div>
          <div className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-center">
            <div className="flex items-center justify-center gap-1 mb-0.5">
              <Target size={11} className="text-primary" />
              <p className="text-base font-bold text-fg font-display">{stats.uniqueHabits}</p>
            </div>
            <p className="text-[10px] text-muted">alışkanlık</p>
          </div>
        </div>

        {/* Günlük aktivite */}
        <div>
          <p className="text-xs font-medium text-muted mb-2">Günlük aktivite</p>
          <DayBars counts={stats.dailyCounts} maxCount={stats.maxDaily} />
        </div>

        {/* Bu haftanın yıldızı */}
        {stats.topHabit && (
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2">
            <Trophy size={12} className="text-xp shrink-0" />
            <span className="text-xs text-muted">Yıldız:</span>
            <span className="text-sm">{stats.topHabit.habit.emoji}</span>
            <span className="text-xs font-semibold text-fg truncate">{stats.topHabit.habit.name}</span>
            <span className="ml-auto text-xs text-muted shrink-0">{stats.topHabit.count}×</span>
          </div>
        )}

        {alreadyReviewed ? (
          <div className="space-y-3 rounded-lg border border-success/20 bg-success/5 p-4">
            {alreadyReviewed.weekMood && (
              <div className="flex items-center gap-2">
                <span className="text-lg">{MOOD_OPTIONS.find(m => m.level === alreadyReviewed.weekMood)?.emoji}</span>
                <span className="text-xs text-muted">
                  Haftalık ruh halin: <span className="text-fg font-medium">{MOOD_OPTIONS.find(m => m.level === alreadyReviewed.weekMood)?.label}</span>
                </span>
              </div>
            )}
            {alreadyReviewed.wins && (
              <div>
                <p className="text-xs font-medium text-muted mb-1">🏆 Kazanımlar</p>
                <p className="text-sm text-fg">{alreadyReviewed.wins}</p>
              </div>
            )}
            <div>
              <p className="text-xs font-medium text-muted mb-1">✅ Ne iyi gitti?</p>
              <p className="text-sm text-fg">{alreadyReviewed.wentWell}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted mb-1">🔧 Geliştirilecek?</p>
              <p className="text-sm text-fg">{alreadyReviewed.toImprove}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-muted mb-1">🎯 Gelecek hafta hedefi</p>
              <p className="text-sm text-fg">{alreadyReviewed.nextWeekGoal}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Ruh hali */}
            <div>
              <p className="text-xs font-medium text-muted mb-2">Bu haftayı nasıl yaşadın?</p>
              <div className="flex gap-1.5">
                {MOOD_OPTIONS.map(m => (
                  <button
                    key={m.level}
                    type="button"
                    onClick={() => setWeekMood(weekMood === m.level ? null : m.level)}
                    className={cn(
                      'flex flex-1 flex-col items-center gap-1 rounded-lg border py-2 transition-all',
                      weekMood === m.level
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-surface-2 hover:border-border-hover',
                    )}
                    aria-pressed={weekMood === m.level}
                    title={m.label}
                  >
                    <span className="text-lg">{m.emoji}</span>
                    <span className="text-[9px] text-muted">{m.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kazanımlar */}
            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">
                🏆 Kazanımlar <span className="opacity-60 font-normal">(isteğe bağlı)</span>
              </label>
              <textarea
                value={wins}
                onChange={e => setWins(e.target.value)}
                placeholder="Küçük bir ilerleme, bir şükran notu..."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">✅ Bu hafta ne iyi gitti?</label>
              <textarea
                value={wentWell}
                onChange={e => setWentWell(e.target.value)}
                placeholder="Bir şey, küçük de olsa..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">🔧 Gelecek hafta ne geliştirilebilir?</label>
              <textarea
                value={toImprove}
                onChange={e => setToImprove(e.target.value)}
                placeholder="Odaklanmak istediğim bir şey..."
                rows={3}
                className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-muted mb-1.5">🎯 Gelecek hafta tek hedefim:</label>
              <textarea
                value={nextWeekGoal}
                onChange={e => setNextWeekGoal(e.target.value)}
                placeholder="Somut, küçük, ölçülebilir..."
                rows={2}
                className="w-full resize-none rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
              />
            </div>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={!canSubmit}
              className="w-full rounded-lg border border-border bg-surface-2 px-4 py-2.5 text-sm font-semibold text-fg transition-colors hover:bg-primary hover:text-bg hover:border-primary disabled:pointer-events-none disabled:opacity-40"
            >
              Haftayı Kapat (+50 XP)
            </button>
          </div>
        )}
      </div>

      {/* Geçmiş */}
      {pastReviews.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted uppercase tracking-wider flex items-center gap-2">
            <TrendingUp size={12} /> Geçmiş Haftalar
          </p>
          {pastReviews.map(r => <ReviewCard key={r.id} review={r} />)}
        </div>
      )}

      {pastReviews.length === 0 && !alreadyReviewed && (
        <div className="rounded-xl border border-dashed border-border p-6 text-center">
          <p className="text-sm text-muted">İlk retrospektifini tamamlayarak başla.</p>
          <p className="mt-1 text-xs text-muted-2">Her hafta +50 XP ve net bir geri bakış.</p>
        </div>
      )}
    </div>
  )
}
