'use client'
import { Snowflake, Check } from 'lucide-react'
import { format, subDays } from 'date-fns'
import { useStore } from '@/hooks/useStore'
import { todayKey } from '@/lib/store'
import { Card, CardBody } from '@/components/ui/card'
import { haptic } from '@/lib/confetti'
import { cn } from '@/lib/utils'

export function StreakFreeze() {
  const { data, useFreezeToken } = useStore()

  const today = todayKey()
  const yesterday = format(subDays(new Date(), 1), 'yyyy-MM-dd')
  const tokens = data.freezeTokens
  const todayFrozen = data.frozenDates.includes(today)
  const yesterdayFrozen = data.frozenDates.includes(yesterday)

  function freeze(date: string) {
    if (useFreezeToken(date)) haptic([15, 30, 15])
  }

  return (
    <Card>
      <CardBody className="space-y-3">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-primary2/12 text-xl">🧊</div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-fg">Seri Koruma</p>
            <p className="text-xs text-muted">
              {tokens > 0 ? `${tokens} jeton hazır` : 'Jeton yok'} · her 7 günlük giriş 1 jeton verir
            </p>
          </div>
          <span className="flex items-center gap-1 text-sm font-bold text-primary2">
            <Snowflake size={15} /> {tokens}
          </span>
        </div>

        <p className="text-[11px] text-muted-2 leading-snug">
          Bir günü dondur, o gün hiçbir alışkanlığın serisini bozmaz. Hasta olduğun ya da unuttuğun günler için.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <FreezeButton label="Bugünü dondur" frozen={todayFrozen} disabled={tokens <= 0} onClick={() => freeze(today)} />
          <FreezeButton label="Dünü dondur" frozen={yesterdayFrozen} disabled={tokens <= 0} onClick={() => freeze(yesterday)} />
        </div>
      </CardBody>
    </Card>
  )
}

function FreezeButton({ label, frozen, disabled, onClick }: {
  label: string; frozen: boolean; disabled: boolean; onClick: () => void
}) {
  return (
    <button onClick={onClick} disabled={frozen || disabled}
      className={cn(
        'flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2.5 text-xs font-medium transition-all',
        frozen ? 'border-primary2/40 bg-primary2/8 text-primary2'
          : disabled ? 'border-border bg-surface-2 text-muted-2'
          : 'border-border bg-surface-2 text-fg hover:border-border-hover',
      )}>
      {frozen ? <><Check size={13} /> Donduruldu</> : <><Snowflake size={13} /> {label}</>}
    </button>
  )
}
