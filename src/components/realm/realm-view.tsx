'use client'
import { useMemo, useState } from 'react'
import { useStore } from '@/hooks/useStore'
import { buildRealm, phaseProgress, type RealmEra, type RealmStructure, type RealmMonument } from '@/lib/realm'
import { RealmSprite } from './realm-sprite'
import { cn } from '@/lib/utils'

// Era'ya göre gökyüzü/zemin renkleri. Sahne bilinçli olarak renklidir
// (DEHB-odaklı tasarım), bu yüzden inline gradyan burada amaçlıdır.
function eraTheme(era: RealmEra) {
  switch (era) {
    case 'dawn':
      return { sky: 'linear-gradient(#1a2350 0%, #6b5a9e 30%, #ffb0c4 65%, #ffd9a8 100%)', grass: '#6cae5a', soil: '#7a5230', hill: '#4a7a55', night: false, label: 'Şafak' }
    case 'day':
      return { sky: 'linear-gradient(#5aa6e8 0%, #8fc8f5 50%, #c8ecff 100%)', grass: '#5cab4e', soil: '#6e4a2c', hill: '#3f8a52', night: false, label: 'Gündüz' }
    case 'dusk':
      return { sky: 'linear-gradient(#231a4a 0%, #6b3a72 40%, #c66a6a 72%, #ff9a5a 100%)', grass: '#3f6b46', soil: '#5a3a22', hill: '#34603f', night: false, label: 'Akşam' }
    case 'night':
      return { sky: 'linear-gradient(#070a22 0%, #0f1438 55%, #1c1c44 100%)', grass: '#24452c', soil: '#3a2a1a', hill: '#1a3322', night: true, label: 'Gece' }
  }
}

// Deterministik psödo-rastgele: aynı seed -> aynı dağılım (render'da sahne zıplamaz).
function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

type SceneItem =
  | { kind: 'building'; s: RealmStructure }
  | { kind: 'monument'; m: RealmMonument }
  | { kind: 'deco'; sprite: 'tree' | 'pine' | 'bush' }

export function RealmView() {
  const { data } = useStore()
  const world = useMemo(() => buildRealm(data), [data])
  const theme = eraTheme(world.era)
  const prog = phaseProgress(world)
  const [selected, setSelected] = useState<RealmStructure | null>(null)

  const built = world.structures.filter(s => s.stage >= 1)

  // Sahne öğelerini deterministik olarak ört: yapılar + araya serpilen ağaç/çalı + anıtlar.
  const sceneItems = useMemo<SceneItem[]>(() => {
    const r = rng(built.length * 31 + world.population * 7 + 3)
    const decos: SceneItem[] = Array.from({ length: world.treeCount }).map(() => {
      const v = r()
      return { kind: 'deco', sprite: v < 0.45 ? 'tree' : v < 0.8 ? 'pine' : 'bush' }
    })
    const mons = [...world.monuments]
    const out: SceneItem[] = []
    let di = 0
    let mi = 0
    built.forEach((s, idx) => {
      out.push({ kind: 'building', s })
      if (di < decos.length && idx % 2 === 1) out.push(decos[di++])
      if (mi < mons.length && idx > 0 && idx % 3 === 2) out.push({ kind: 'monument', m: mons[mi++] })
    })
    while (mi < mons.length) out.push({ kind: 'monument', m: mons[mi++] })
    while (di < decos.length) out.push(decos[di++])
    return out
  }, [built, world.treeCount, world.monuments, world.population])

  // Gökyüzü cisimleri
  const stars = useMemo(() => {
    const r = rng(7)
    return Array.from({ length: 40 }).map(() => ({ left: r() * 100, top: r() * 60, big: r() > 0.85, delay: r() * 3 }))
  }, [])
  const clouds = useMemo(() => {
    const r = rng(13)
    return Array.from({ length: 3 }).map((_, i) => ({ left: 6 + i * 28 + r() * 10, top: 8 + r() * 22, p: 3 + Math.round(r() * 2), delay: i * 0.8 }))
  }, [])
  const birds = useMemo(() => {
    const r = rng(21)
    return Array.from({ length: 3 }).map((_, i) => ({ left: 30 + i * 18 + r() * 8, top: 16 + r() * 14, delay: i * 0.6 }))
  }, [])

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

      {/* Diyar sahnesi */}
      <div className="relative h-[22rem] overflow-hidden rounded-2xl border border-border sm:h-[26rem]" style={{ background: theme.sky }}>
        {/* gökyüzü katmanı (kaymaz) */}
        <div className="pointer-events-none absolute inset-0">
          {theme.night ? (
            <>
              {stars.map((st, i) => (
                <div key={i} className="absolute rounded-full bg-white animate-twinkle" style={{ left: `${st.left}%`, top: `${st.top}%`, width: st.big ? 3 : 2, height: st.big ? 3 : 2, animationDelay: `${st.delay}s` }} />
              ))}
              <div className="absolute right-8 top-6"><RealmSprite name="moon" pixel={6} /></div>
            </>
          ) : (
            <>
              <div className="absolute right-8 top-6 animate-float"><RealmSprite name="sun" pixel={7} /></div>
              {birds.map((b, i) => (
                <div key={i} className="absolute animate-float" style={{ left: `${b.left}%`, top: `${b.top}%`, animationDelay: `${b.delay}s`, animationDuration: '7s' }}>
                  <RealmSprite name="bird" pixel={3} />
                </div>
              ))}
            </>
          )}
          {clouds.map((c, i) => (
            <div key={i} className="absolute animate-float" style={{ left: `${c.left}%`, top: `${c.top}%`, animationDelay: `${c.delay}s`, animationDuration: '8s', opacity: theme.night ? 0.4 : 0.9 }}>
              <RealmSprite name="cloud" pixel={c.p} />
            </div>
          ))}
          {/* uzak tepe (derinlik) */}
          <div className="absolute inset-x-0 bottom-9" style={{ height: '38%' }}>
            <div className="absolute inset-x-[-10%] bottom-0 h-full rounded-[100%_100%_0_0]" style={{ background: theme.hill, opacity: 0.5 }} />
            <div className="absolute inset-x-[20%] bottom-0 h-[78%] rounded-[100%_100%_0_0]" style={{ background: theme.hill, opacity: 0.7 }} />
          </div>
        </div>

        {/* şehir (yatay kaydırılır) */}
        <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
          <div className="relative flex h-full min-w-full items-end gap-1.5 px-6 pb-9">
            {/* zemin şeridi (şehir genişliğince) */}
            <div className="absolute inset-x-0 bottom-0 h-9">
              <div className="h-2 w-full" style={{ background: theme.grass }} />
              <div className="h-7 w-full" style={{ background: theme.soil }} />
            </div>

            {built.length === 0 ? (
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center pb-9 text-center">
                <RealmSprite name="hut" tint="#7c8492" pixel={6} className="opacity-50" />
                <p className="mt-3 text-sm font-semibold text-white drop-shadow">Diyarın henüz çorak</p>
                <p className="mt-1 max-w-xs text-xs text-white/80 drop-shadow">
                  İlk alışkanlığını tamamla, ilk evin yükselsin. Her tamamlama bu toprağı büyütür.
                </p>
              </div>
            ) : (
              sceneItems.map((it, i) => {
                if (it.kind === 'building') {
                  return <Building key={`b-${it.s.habitId}`} structure={it.s} onSelect={() => setSelected(it.s)} active={selected?.habitId === it.s.habitId} />
                }
                if (it.kind === 'monument') {
                  return (
                    <div key={`m-${it.m.id}-${i}`} className="relative z-10 shrink-0 self-end" title={it.m.label}>
                      <RealmSprite name={it.m.sprite} pixel={it.m.sprite === 'bigtree' ? 6 : 5} className={it.m.sprite === 'lamppost' && theme.night ? 'drop-shadow-[0_0_6px_rgba(255,210,74,0.8)]' : undefined} />
                    </div>
                  )
                }
                return (
                  <div key={`d-${i}`} className="relative z-10 shrink-0 self-end animate-sway" style={{ transformOrigin: 'bottom center', animationDelay: `${(i % 5) * 0.4}s` }}>
                    <RealmSprite name={it.sprite} pixel={4} />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* kaydırma ipucu */}
        {built.length > 6 && (
          <div className="pointer-events-none absolute right-2 top-2 rounded-full bg-black/30 px-2 py-0.5 text-[10px] text-white/90">
            kaydır →
          </div>
        )}
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
          {selected.isLandmark ? (
            <span className="shrink-0 text-xs font-semibold text-xp">ANIT</span>
          ) : (
            <span className="shrink-0 text-right text-xs text-muted-2">
              {STAGE_NEXT[selected.stage] - selected.completions} sonra<br />büyür
            </span>
          )}
        </div>
      )}

      {/* Dünya istatistikleri */}
      <div className="grid grid-cols-4 gap-2">
        <Stat value={world.buildingCount} label="yapı" />
        <Stat value={world.landmarkCount} label="anıt yapı" />
        <Stat value={world.monuments.length} label="eser" />
        <Stat value={world.treeCount} label="ağaç" />
      </div>

      <p className="text-center text-xs text-muted-2">
        Her alışkanlık bir yapı. Tamamladıkça büyür: kulübe → ev → kule → kale. Serisi yaşıyorsa bayrak çeker. Nüfus arttıkça diyar çeşme, fener ve kadim ağaç kazanır.
      </p>
    </div>
  )
}

function Building({ structure, onSelect, active }: { structure: RealmStructure; onSelect: () => void; active: boolean }) {
  const pixel = structure.sprite === 'hut' ? 5 : 6
  const smokes = structure.sprite === 'tower' || structure.sprite === 'castle'
  return (
    <button
      onClick={onSelect}
      title={`${structure.name} · ${structure.completions} tamamlama`}
      className={cn('group relative z-10 flex shrink-0 flex-col items-center self-end transition-transform active:translate-y-0.5', active && '-translate-y-1')}
    >
      {/* baca dumanı */}
      {smokes && (
        <>
          <span className="absolute -top-1 left-[38%] h-1 w-1 rounded-full bg-white/60 animate-smoke" />
          <span className="absolute -top-1 left-[48%] h-1.5 w-1.5 rounded-full bg-white/50 animate-smoke" style={{ animationDelay: '1.2s' }} />
        </>
      )}

      {/* bayrak (aktif seri) */}
      {structure.hasFlag && (
        <div className="relative mb-0.5 h-3 animate-sway" style={{ transformOrigin: 'bottom left' }}>
          <div className="absolute bottom-0 left-1/2 h-3 w-[2px]" style={{ backgroundColor: '#5a4630' }} />
          <div className="absolute bottom-1.5 left-1/2 h-2 w-3" style={{ backgroundColor: structure.color }} />
        </div>
      )}

      {/* her zaman görünen emoji tabela */}
      <span className={cn(
        'mb-0.5 rounded bg-black/25 px-1 text-[11px] leading-tight text-white transition-transform',
        active && 'scale-110',
      )}>
        {structure.emoji}
      </span>

      <RealmSprite name={structure.sprite} tint={structure.color} pixel={pixel} className={cn(active && 'drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]')} />
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
  1: 'kulübe', 2: 'küçük ev', 3: 'ev', 4: 'kule', 5: 'kale',
}
const STAGE_NEXT: Record<number, number> = {
  1: 5, 2: 15, 3: 40, 4: 100,
}
