'use client'
import { useState } from 'react'
import { X, Flame, Shield } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { todayKey, getStreak } from '@/lib/store'
import { format } from 'date-fns'

export function WelcomeBack() {
  const { data, useFreezeToken } = useStore()

  // Capture the stored login date at mount time (before the store effect updates it to today).
  const [prevLogin] = useState<string | undefined>(data.profile.lastLoginDate)
  const [dismissed, setDismissed] = useState(false)
  const [frozen, setFrozen] = useState(false)

  const today = todayKey()
  const yesterday = format(new Date(Date.now() - 86400000), 'yyyy-MM-dd')

  // Show only when returning after a gap (not just yesterday's miss).
  const hasGap = !!prevLogin && prevLogin < yesterday
  const isReturner = hasGap && data.profile.totalXP > 0 && data.habits.length > 0

  if (!isReturner || dismissed) return null

  const lastDate = new Date(prevLogin! + 'T12:00:00')
  const daysDiff = Math.round((new Date(today + 'T12:00:00').getTime() - lastDate.getTime()) / 86400000)

  // Habits that lost their streak during the gap.
  const streakAtRisk = data.habits
    .filter(h => !h.archived)
    .filter(h => {
      const s = getStreak(data.completions, h.id, data.frozenDates)
      return s === 0
    })
    .slice(0, 3)

  function handleFreeze() {
    if (useFreezeToken(yesterday)) {
      setFrozen(true)
    }
  }

  const daysLabel = daysDiff === 1 ? '1 gün' : `${daysDiff} gün`

  return (
    <div className="relative overflow-hidden rounded-xl border border-primary/30 bg-primary/5 p-4">
      <button
        onClick={() => setDismissed(true)}
        className="absolute right-3 top-3 text-muted transition-colors hover:text-fg"
        aria-label="Kapat"
      >
        <X size={15} />
      </button>

      <div className="flex items-start gap-3 pr-6">
        <span className="mt-0.5 text-2xl shrink-0">🤗</span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-fg">
            {daysLabel}dır yoktun — hoş geldin!
          </p>
          <p className="mt-1 text-xs text-muted leading-snug">
            Ara vermek normal, DEHB beyinler için kaçınılmaz. Şimdi burada olman yeterli.
            {' '}<span className="text-fg font-medium">{data.profile.totalXP.toLocaleString('tr-TR')} XP</span> hâlâ sende.
          </p>

          {/* Streak rescue */}
          {data.freezeTokens > 0 && streakAtRisk.length > 0 && !frozen && (
            <div className="mt-3 rounded-lg border border-border bg-surface-2 p-2.5">
              <div className="flex items-center gap-1.5 text-xs font-medium text-fg">
                <Shield size={12} className="text-primary" />
                Streak kurtarma mümkün ({data.freezeTokens} token var)
              </div>
              <p className="mt-0.5 text-xs text-muted">
                Dünü dondurarak {streakAtRisk.length > 1 ? `${streakAtRisk.length} seriyi` : 'seriyi'} kurtarabilirsin.
              </p>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {streakAtRisk.map(h => (
                  <span key={h.id} className="flex items-center gap-0.5 rounded-md bg-surface px-1.5 py-0.5 text-xs text-muted border border-border">
                    {h.emoji} {h.name}
                  </span>
                ))}
              </div>
              <button
                onClick={handleFreeze}
                className="mt-2 flex items-center gap-1.5 rounded-md bg-primary/20 px-3 py-1.5 text-xs font-semibold text-primary hover:bg-primary/30 transition-colors"
              >
                <Flame size={12} /> Dünü dondur
              </button>
            </div>
          )}

          {frozen && (
            <p className="mt-2 text-xs font-medium text-success">
              Dün donduruldu. Seriler korundu!
            </p>
          )}

          <button
            onClick={() => setDismissed(true)}
            className="mt-3 w-full rounded-lg bg-primary py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90 font-display"
          >
            Devam et
          </button>
        </div>
      </div>
    </div>
  )
}
