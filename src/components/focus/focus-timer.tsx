'use client'
import { useState, useEffect } from 'react'
import { Play, Pause, RotateCcw, Target } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Ring } from '@/components/ui/ring'
import { Button } from '@/components/ui/button'
import { Card, CardHeader, CardTitle } from '@/components/ui/card'
import { StatBar } from '@/components/ui/stat-bar'
import { FOCUS_PRESETS, FOCUS_XP_PER_MIN } from '@/lib/constants'
import { focusMinutesTotal } from '@/lib/store'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

function pad(n: number) { return n.toString().padStart(2, '0') }

export function FocusTimer() {
  const { data, addFocusSession } = useStore()
  const [minutes, setMinutes] = useState(25)
  const [secondsLeft, setSecondsLeft] = useState(25 * 60)
  const [running, setRunning] = useState(false)

  // tick
  useEffect(() => {
    if (!running) return
    const t = setInterval(() => setSecondsLeft(s => (s <= 1 ? 0 : s - 1)), 1000)
    return () => clearInterval(t)
  }, [running])

  // completion
  useEffect(() => {
    if (running && secondsLeft === 0) {
      setRunning(false)
      addFocusSession(minutes)
      setSecondsLeft(minutes * 60)
    }
  }, [secondsLeft, running, minutes, addFocusSession])

  function selectPreset(m: number) {
    if (running) return
    setMinutes(m)
    setSecondsLeft(m * 60)
  }

  function reset() {
    setRunning(false)
    setSecondsLeft(minutes * 60)
  }

  const total = minutes * 60
  const progress = total > 0 ? (total - secondsLeft) / total : 0
  const mm = Math.floor(secondsLeft / 60)
  const ss = secondsLeft % 60

  const today = format(new Date(), 'yyyy-MM-dd')
  const todayMinutes = data.focusSessions
    .filter(s => s.completedAt.slice(0, 10) === today)
    .reduce((sum, s) => sum + s.minutes, 0)
  const totalMinutes = focusMinutesTotal(data)
  const sessionCount = data.focusSessions.length

  return (
    <div className="space-y-4">
      <Card glow>
        <CardHeader>
          <CardTitle><span className="inline-flex items-center gap-2"><Target size={15} /> Odak Seansı</span></CardTitle>
          <span className="text-xs text-muted">{minutes} dk · +{minutes * FOCUS_XP_PER_MIN} XP</span>
        </CardHeader>

        <div className="flex flex-col items-center gap-6 p-6">
          {/* preset chips */}
          <div className="flex flex-wrap justify-center gap-2">
            {FOCUS_PRESETS.map(m => (
              <button
                key={m}
                onClick={() => selectPreset(m)}
                disabled={running}
                className={cn(
                  'rounded-lg border px-4 py-2 text-sm font-medium font-display transition-all disabled:opacity-50',
                  minutes === m ? 'border-primary bg-primary/15 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg',
                )}
              >
                {m} dk
              </button>
            ))}
          </div>

          {/* timer ring */}
          <Ring progress={progress} size={220} stroke={14} color="rgb(var(--c-primary))">
            <span className="text-5xl font-bold text-fg font-display tabular-nums leading-none">
              {pad(mm)}:{pad(ss)}
            </span>
            <span className="mt-2 text-xs text-muted font-display">
              {running ? 'ODAKLAN' : secondsLeft === total ? 'HAZIR' : 'DURAKLATILDI'}
            </span>
          </Ring>

          {/* controls */}
          <div className="flex items-center gap-3">
            <Button
              variant="primary"
              size="lg"
              onClick={() => setRunning(r => !r)}
              disabled={secondsLeft === 0}
              className="min-w-32"
            >
              {running ? <><Pause size={18} /> Duraklat</> : <><Play size={18} /> Başlat</>}
            </Button>
            <Button variant="secondary" size="lg" onClick={reset}>
              <RotateCcw size={18} />
            </Button>
          </div>
        </div>
      </Card>

      <Card>
        <CardHeader><CardTitle>Odak İstatistiği</CardTitle></CardHeader>
        <div className="space-y-4 p-5">
          <StatBar label="Bugün" emoji="📅" value={todayMinutes} max={Math.max(60, todayMinutes)} valueLabel={`${todayMinutes} dk`} color="rgb(var(--c-primary))" />
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-border bg-surface-2 p-3 text-center">
              <p className="text-2xl font-bold text-fg font-display">{totalMinutes}</p>
              <p className="text-xs text-muted">toplam dakika</p>
            </div>
            <div className="rounded-lg border border-border bg-surface-2 p-3 text-center">
              <p className="text-2xl font-bold text-fg font-display">{sessionCount}</p>
              <p className="text-xs text-muted">seans</p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}
