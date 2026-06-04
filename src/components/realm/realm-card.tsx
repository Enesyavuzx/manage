'use client'
import { useMemo } from 'react'
import Link from 'next/link'
import { Castle, ChevronRight } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { buildRealm, phaseProgress } from '@/lib/realm'
import { RealmSprite } from './realm-sprite'

// Panelde küçük bir diyar önizlemesi: en gelişmiş birkaç yapı + faz durumu.
export function RealmCard() {
  const { data } = useStore()
  const world = useMemo(() => buildRealm(data), [data])
  const prog = phaseProgress(world)

  const top = world.structures.filter(s => s.stage >= 1).slice(0, 6)

  return (
    <Link
      href="/diyar"
      className="block overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-border-hover"
    >
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <Castle size={15} className="text-primary" />
          <span className="text-sm font-bold text-fg font-display">Diyarım</span>
          <span className="text-xs text-muted">· {world.phase.label}</span>
        </div>
        <ChevronRight size={16} className="text-muted" />
      </div>

      {/* mini silüet */}
      <div className="relative px-4 pt-6" style={{ background: 'linear-gradient(#7ec8ff 0%, #bfe6ff 100%)' }}>
        {top.length === 0 ? (
          <div className="flex h-[72px] items-center justify-center">
            <p className="text-xs font-medium text-white drop-shadow">İlk alışkanlığını tamamla, diyarın kurulsun</p>
          </div>
        ) : (
          <div className="flex flex-wrap items-end justify-center gap-1">
            {top.map(s => (
              <RealmSprite key={s.habitId} name={s.sprite} tint={s.color} pixel={4} />
            ))}
          </div>
        )}
        <div className="mt-4 h-2 w-full" style={{ background: '#5cab4e' }} />
      </div>

      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex gap-4">
          <Mini value={world.population} label="nüfus" />
          <Mini value={world.buildingCount} label="yapı" />
          <Mini value={world.landmarkCount} label="anıt" />
        </div>
        {prog && (
          <span className="text-xs text-muted">sonraki faza {prog.remaining}</span>
        )}
      </div>
    </Link>
  )
}

function Mini({ value, label }: { value: number; label: string }) {
  return (
    <div className="text-center">
      <p className="text-base font-bold text-fg font-display tabular-nums leading-none">{value.toLocaleString('tr-TR')}</p>
      <p className="mt-0.5 text-[10px] text-muted">{label}</p>
    </div>
  )
}
