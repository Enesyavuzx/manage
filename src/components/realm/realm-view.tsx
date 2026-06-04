'use client'
import { useMemo, useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { buildRealm, phaseProgress, type RealmEra, type RealmStructure } from '@/lib/realm'
import { RealmSprite } from './realm-sprite'
import { cn } from '@/lib/utils'

// Era'ya göre gökyüzü/zemin/su renkleri. Bu sahne bilinçli olarak renklidir
// (DEHB-odaklı tasarım dili), bu yüzden inline gradyan kullanmak burada amaçlıdır.
function eraTheme(era: RealmEra) {
  switch (era) {
    case 'dawn':
      return { sky: 'linear-gradient(#ffd9a8 0%, #ffc0cf 45%, #bfe0ff 100%)', ground: '#6cae5a', groundDark: '#558b46', water: '#7fc4e8', night: false, label: 'Şafak' }
    case 'day':
      return { sky: 'linear-gradient(#7ec8ff 0%, #aaddff 55%, #d8f0ff 100%)', ground: '#5cab4e', groundDark: '#478a3c', water: '#5bb6e0', night: false, label: 'Gündüz' }
    case 'dusk':
      return { sky: 'linear-gradient(#3a2a6a 0%, #b65f86 55%, #ffb27a 100%)', ground: '#3f6b46', groundDark: '#2f5236', water: '#4a7fb0', night: false, label: 'Akşam' }
    case 'night':
      return { sky: 'linear-gradient(#0b1030 0%, #161a40 60%, #25204a 100%)', ground: '#24452c', groundDark: '#193020', water: '#1f3b5a', night: true, label: 'Gece' }
  }
}

// Deterministik psödo-rastgele: aynı seed -> aynı dağılım (yeniden render'da sahne zıplamaz).
function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

export function RealmView() {
  const { data } = useStore()
  const world = useMemo(() => buildRealm(data), [data])
  const theme = eraTheme(world.era)
  const prog = phaseProgress(world)
  const [selected, setSelected] = useState<RealmStructure | null>(null)

  const built = world.structures.filter(s => s.stage >= 1)

  // Yıldızlar (gece) ve bulutlar (gündüz) deterministik konumlanır.
  const stars = useMemo(() => {
    const r = rng(7)
    return Array.from({ length: 28 }).map(() => ({ left: r() * 100, top: r() * 55, s: 1 + Math.round(r() * 1.5) }))
  }, [])
  const clouds = useMemo(() => {
    const r = rng(13)
    return Array.from({ length: 3 }).map((_, i) => ({ left: 8 + i * 30 + r() * 8, top: 6 + r() * 20 }))
  }, [])

  // Ağaçları yapıların arasına deterministik serpiştir.
  const treeSlots = useMemo(() => {
    const r = rng(world.treeCount * 31 + built.length)
    return Array.from({ length: world.treeCount }).map(() => ({
      pine: r() > 0.5,
      flip: r() > 0.5,
    }))
  }, [world.treeCount, built.length])

  return (
    <div className="space-y-4">
      {/* Faz başlığı */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted font-display">{theme.label} · diyarın</p>
          <h2 className="text-xl font-bold text-fg font-display">{world.phase.label}</h2>
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-fg font-display tabular-nums">{world.population.toLocaleString('tr-TR')}</p>
          <p className="text-xs text-muted">nüfus (toplam tamamlama)</p>
        </div>
      </div>

      {/* Faz ilerlemesi */}
      {prog && (
        <div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${prog.pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">
            Bir sonraki faza <span className="font-semibold text-fg">{prog.remaining}</span> tamamlama kaldı
          </p>
        </div>
      )}

      {/* Sahne */}
      <div className="relative overflow-hidden rounded-2xl border border-border" style={{ background: theme.sky }}>
        {/* gökyüzü cisimleri */}
        {theme.night ? (
          <>
            {stars.map((st, i) => (
              <div key={i} className="absolute rounded-full bg-white" style={{ left: `${st.left}%`, top: `${st.top}%`, width: st.s, height: st.s, opacity: 0.85 }} />
            ))}
            <div className="absolute right-6 top-5"><RealmSprite name="moon" pixel={5} /></div>
          </>
        ) : (
          <>
            <div className="absolute right-6 top-5 animate-float"><RealmSprite name="sun" pixel={6} /></div>
            {clouds.map((c, i) => (
              <div key={i} className="absolute animate-float" style={{ left: `${c.left}%`, top: `${c.top}%`, animationDelay: `${i * 0.7}s` }}>
                <RealmSprite name="cloud" pixel={4} />
              </div>
            ))}
          </>
        )}

        {/* yapı silüeti: zemine oturur, taşarsa kaydırılır */}
        <div className="relative min-h-[220px] px-4 pb-0 pt-16">
          {built.length === 0 ? (
            <div className="flex h-[160px] flex-col items-center justify-center text-center">
              <p className="text-sm font-semibold text-white drop-shadow">Diyarın henüz çorak</p>
              <p className="mt-1 max-w-xs text-xs text-white/80 drop-shadow">
                İlk alışkanlığını tamamla, ilk evin yükselsin. Her tamamlama bu toprağı büyütür.
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap items-end justify-center gap-x-2 gap-y-0">
              {built.map(s => (
                <Building key={s.habitId} structure={s} onSelect={() => setSelected(s)} active={selected?.habitId === s.habitId} />
              ))}
              {/* ambient ağaçlar */}
              {treeSlots.map((t, i) => (
                <div key={`tree-${i}`} className="self-end" style={{ transform: t.flip ? 'scaleX(-1)' : undefined }}>
                  <RealmSprite name={t.pine ? 'pine' : 'tree'} pixel={t.pine ? 4 : 4} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* zemin şeridi */}
        <div className="h-3 w-full" style={{ background: theme.ground }} />
        <div className="h-2 w-full" style={{ background: theme.groundDark }} />
        <div className="h-3 w-full" style={{ background: theme.water, opacity: 0.9 }} />
      </div>

      {/* Seçili yapı detayı */}
      {selected && (
        <div className="flex items-center gap-3 rounded-xl border border-border bg-surface-2 p-3">
          <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-2xl" style={{ backgroundColor: selected.color + '22' }}>
            {selected.emoji}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-fg">{selected.name}</p>
            <p className="text-xs text-muted">
              {selected.completions} tamamlama · {STAGE_LABEL[selected.stage]}
              {selected.streak > 0 && <> · 🔥 {selected.streak} gün</>}
            </p>
          </div>
          {selected.stage < 5 && (
            <span className="shrink-0 text-right text-xs text-muted-2">
              {STAGE_NEXT[selected.stage] - selected.completions} sonra<br />büyür
            </span>
          )}
          {selected.isLandmark && <span className="shrink-0 text-xs font-semibold text-xp">ANIT</span>}
        </div>
      )}

      {/* Dünya istatistikleri */}
      <div className="grid grid-cols-3 gap-2">
        <Stat value={world.buildingCount} label="yapı" />
        <Stat value={world.landmarkCount} label="anıt" />
        <Stat value={world.treeCount} label="ağaç" />
      </div>

      <p className="text-center text-xs text-muted-2">
        Her alışkanlık bir yapı. Tamamladıkça büyür: kulübe, ev, kule. Serisi yaşıyorsa bayrak çeker.
      </p>
    </div>
  )
}

function Building({ structure, onSelect, active }: { structure: RealmStructure; onSelect: () => void; active: boolean }) {
  const pixel = structure.sprite === 'tower' ? 5 : structure.sprite === 'house' ? 5 : 5
  return (
    <button
      onClick={onSelect}
      title={`${structure.name} · ${structure.completions} tamamlama`}
      className={cn('group relative flex flex-col items-center transition-transform active:translate-y-0.5', active && '-translate-y-0.5')}
    >
      {/* bayrak (aktif seri) */}
      {structure.hasFlag && (
        <div className="absolute -top-1 left-1/2 z-10 -translate-x-1/2">
          <div className="h-2.5 w-0.5" style={{ backgroundColor: '#6b5030' }} />
          <div className="absolute left-0.5 top-0 h-1.5 w-2.5 animate-pulse" style={{ backgroundColor: structure.color }} />
        </div>
      )}
      {/* emoji tabela */}
      <span className={cn(
        'mb-0.5 rounded px-1 text-[11px] leading-none transition-opacity',
        active ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
      )}>
        {structure.emoji}
      </span>
      <RealmSprite name={structure.sprite} tint={structure.color} pixel={pixel} className={cn(active && 'drop-shadow-[0_0_6px_rgba(255,255,255,0.5)]')} />
    </button>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3 text-center">
      <p className="text-xl font-bold text-fg font-display tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

const STAGE_LABEL: Record<number, string> = {
  1: 'kulübe', 2: 'küçük ev', 3: 'ev', 4: 'kule', 5: 'anıt',
}
const STAGE_NEXT: Record<number, number> = {
  1: 5, 2: 15, 3: 40, 4: 100,
}
