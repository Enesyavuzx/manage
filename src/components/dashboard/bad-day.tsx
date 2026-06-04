'use client'
import { useState } from 'react'
import { HeartHandshake, Snowflake, Check } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { todayKey } from '@/lib/store'
import { xpForDifficulty } from '@/lib/gamification'
import { Card, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Modal } from '@/components/ui/modal'
import { haptic } from '@/lib/confetti'

// "Bugün zor bir gün" protokolü: ADHD beyninin çöktüğü günler için. Seriyi
// dondurur, tek bir mikro adım önerir, suçluluk yerine şefkat sunar.
export function BadDay() {
  const { data, habitsToday, todayCompletedIds, useFreezeToken, toggleHabit } = useStore()
  const [open, setOpen] = useState(false)

  const today = todayKey()
  const frozen = data.frozenDates.includes(today)
  const tokens = data.freezeTokens

  const incomplete = habitsToday.filter(h => !todayCompletedIds.has(h.id))
  const micro = incomplete.length > 0
    ? [...incomplete].sort((a, b) => xpForDifficulty(a.difficulty) - xpForDifficulty(b.difficulty))[0]
    : null

  function freezeToday() {
    if (useFreezeToken(today)) haptic([15, 30, 15])
  }

  function doMicro() {
    if (!micro) return
    haptic([20, 40, 20])
    toggleHabit(micro.id)
  }

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-border py-3 text-sm text-muted transition-colors hover:border-border-hover hover:text-fg">
        <HeartHandshake size={15} /> Bugün zor bir gün mü?
      </button>

      <Modal open={open} onClose={() => setOpen(false)} title="Bugün zor bir gün">
        <div className="space-y-5">
          <div className="flex items-start gap-3 rounded-xl border border-border bg-surface-2 p-4">
            <span className="text-2xl">🫂</span>
            <p className="text-sm leading-relaxed text-fg">
              Her gün yüzde yüz olmak zorunda değilsin. Bugün sadece nefes almak bile yeterli.
              Seriler seni cezalandırmak için değil. İstersen bugünü koruyalım ve tek bir küçük şey yapalım.
            </p>
          </div>

          {/* Seriyi koru */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted font-display">1. Serini koru</p>
            {frozen ? (
              <div className="flex items-center gap-2 rounded-lg border border-primary2/40 bg-primary2/8 px-3 py-2.5 text-sm text-primary2">
                <Check size={15} /> Bugün donduruldu, hiçbir serin bozulmayacak.
              </div>
            ) : tokens > 0 ? (
              <Button variant="secondary" onClick={freezeToday} className="w-full">
                <Snowflake size={15} /> Bugünü dondur ({tokens} jeton)
              </Button>
            ) : (
              <p className="rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-xs text-muted">
                Şu an dondurma jetonun yok. Sorun değil, bir gün kaçırmak her şeyi bozmaz. Her 7 günlük giriş 1 jeton verir.
              </p>
            )}
          </div>

          {/* Tek mikro adım */}
          <div>
            <p className="mb-2 text-xs font-medium text-muted font-display">2. Sadece bir küçük şey</p>
            {micro ? (
              <div className="flex items-center gap-3 rounded-lg border border-border bg-surface-2 px-3 py-3">
                <span className="text-xl">{micro.emoji}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium text-fg">{micro.name}</p>
                  <p className="text-xs text-muted">En küçük adımı at, 2 dakikası bile sayılır.</p>
                </div>
                <Button variant="primary" onClick={doMicro}>Yaptım</Button>
              </div>
            ) : (
              <p className="rounded-lg border border-success/30 bg-success/5 px-3 py-2.5 text-sm text-success">
                Bugün yapılacak bir şey kalmamış. Gerçekten, bugünlük bu kadar yeterli. 🌙
              </p>
            )}
          </div>

          <Button variant="ghost" onClick={() => setOpen(false)} className="w-full">Kapat</Button>
        </div>
      </Modal>
    </>
  )
}
