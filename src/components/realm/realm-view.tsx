'use client'
import { useMemo, useState, useRef, useEffect } from 'react'
import { useStore } from '@/hooks/useStore'
import { buildRealm, phaseProgress, villagerLine, villagerName, type RealmEra, type RealmStructure, type RealmMonument } from '@/lib/realm'
import { RealmSprite } from './realm-sprite'
import { cn } from '@/lib/utils'

// Era'ya göre gökyüzü/zemin renkleri — bu sahne bilinçli olarak renklidir
// (DEHB-odaklı tasarım), bu yüzden inline gradyan burada amaçlıdır.
function eraTheme(era: RealmEra) {
  switch (era) {
    case 'dawn':
      return { sky: 'linear-gradient(180deg,#1a2350 0%,#6b5a9e 28%,#ffb0c4 62%,#ffd9a8 100%)', grass: '#6cae5a', soil: '#7a5230', hill1: '#4a7a55', hill2: '#3a6244', hill3: '#2a4f35', water: '#6ac8e8', night: false, label: 'Şafak' }
    case 'day':
      return { sky: 'linear-gradient(180deg,#5aa6e8 0%,#8fc8f5 45%,#c8ecff 100%)', grass: '#5cab4e', soil: '#6e4a2c', hill1: '#4a9a5c', hill2: '#3a7a4a', hill3: '#2c6038', water: '#5abce0', night: false, label: 'Gündüz' }
    case 'dusk':
      return { sky: 'linear-gradient(180deg,#231a4a 0%,#6b3a72 38%,#c66a6a 70%,#ff9a5a 100%)', grass: '#3f6b46', soil: '#5a3a22', hill1: '#3a604a', hill2: '#2c4e3a', hill3: '#1e3c2a', water: '#4ab0d0', night: false, label: 'Akşam' }
    case 'night':
      return { sky: 'linear-gradient(180deg,#030a1c 0%,#0c1438 50%,#171c44 100%)', grass: '#1e3a26', soil: '#2e221a', hill1: '#1a2e24', hill2: '#12221c', hill3: '#0a1814', water: '#2848a0', night: true, label: 'Gece' }
  }
}

function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

type SceneItem =
  | { kind: 'building'; s: RealmStructure }
  | { kind: 'monument'; m: RealmMonument }
  | { kind: 'deco'; sprite: 'tree' | 'pine' | 'bush' }

const VILLAGER_COLORS = ['#e03c52', '#e07a20', '#9a54d0', '#2a8de8', '#1a9e50', '#d0842a']

export function RealmView() {
  const { data } = useStore()
  const world = useMemo(() => buildRealm(data), [data])
  const theme = eraTheme(world.era)
  const prog = phaseProgress(world)
  const [selected, setSelected] = useState<RealmStructure | null>(null)
  const [talking, setTalking] = useState<{ idx: number; line: string } | null>(null)
  const talkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => { if (talkTimer.current) clearTimeout(talkTimer.current) }, [])

  function speak(i: number) {
    if (talkTimer.current) clearTimeout(talkTimer.current)
    setTalking({ idx: i, line: villagerLine(world) })
    talkTimer.current = setTimeout(() => setTalking(null), 5000)
  }

  const built = world.structures.filter(s => s.stage >= 1)

  const sceneItems = useMemo<SceneItem[]>(() => {
    const r = rng(built.length * 31 + world.population * 7 + 3)
    const decos: SceneItem[] = Array.from({ length: world.treeCount }).map(() => {
      const v = r()
      return { kind: 'deco', sprite: v < 0.4 ? 'tree' : v < 0.75 ? 'pine' : 'bush' }
    })
    const mons = [...world.monuments]
    const out: SceneItem[] = []
    let di = 0, mi = 0
    built.forEach((s, idx) => {
      out.push({ kind: 'building', s })
      if (di < decos.length && idx % 2 === 1) out.push(decos[di++])
      if (mi < mons.length && idx > 0 && idx % 3 === 2) out.push({ kind: 'monument', m: mons[mi++] })
    })
    while (mi < mons.length) out.push({ kind: 'monument', m: mons[mi++] })
    while (di < decos.length) out.push(decos[di++])
    return out
  }, [built, world.treeCount, world.monuments, world.population])

  const stars = useMemo(() => {
    const r = rng(7)
    return Array.from({ length: 50 }).map(() => ({ left: r() * 100, top: r() * 65, big: r() > 0.85, delay: r() * 4 }))
  }, [])
  const clouds = useMemo(() => {
    const r = rng(13)
    const n = world.weather === 'cloudy' ? 6 : world.weather === 'rainy' ? 8 : 3
    return Array.from({ length: n }).map((_, i) => ({
      left: 3 + i * 18 + r() * 8, top: 5 + r() * 22, p: 3 + Math.round(r() * 2), delay: i * 0.7,
    }))
  }, [world.weather])
  const birds = useMemo(() => {
    const r = rng(21)
    const n = world.weather === 'sunny' ? 5 : 2
    return Array.from({ length: n }).map((_, i) => ({
      left: 25 + i * 15 + r() * 8, top: 12 + r() * 18, delay: i * 0.5,
    }))
  }, [world.weather])
  const fireflies = useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 12 }).map((_, i) => ({
      left: r() * 90 + 5, bottom: 10 + r() * 40, delay: i * 0.35,
    }))
  }, [])

  const riverH = world.riverSize === 1 ? 6 : world.riverSize === 2 ? 10 : world.riverSize === 3 ? 14 : 0
  const groundH = 52 + riverH
  const todayPct = world.todayTotalCount > 0 ? Math.round(world.todayDoneCount / world.todayTotalCount * 100) : 0

  return (
    <div className="space-y-4">
      {/* Faz ve günlük durum başlığı */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-muted font-display">{theme.label} · diyarın</p>
          <h2 className="text-xl font-bold text-fg font-display">{world.phase.label}</h2>
          {world.todayTotalCount > 0 && (
            <p className="mt-0.5 text-xs text-muted">
              Bugün:{' '}
              <span className={cn('font-semibold', todayPct === 100 ? 'text-success' : 'text-fg')}>
                {world.todayDoneCount}/{world.todayTotalCount}
              </span>
              {todayPct === 100 && ' · diyar çiçek açıyor!'}
            </p>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-fg font-display tabular-nums">{world.population.toLocaleString('tr-TR')}</p>
          <p className="text-xs text-muted">nüfus</p>
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

      {/* BÜYÜK DİYAR SAHNESİ */}
      <div
        className="relative overflow-hidden rounded-2xl border border-border"
        style={{ height: '30rem', background: theme.sky }}
      >
        {/* Gökyüzü katmanı (sabit) */}
        <div className="pointer-events-none absolute inset-0">
          {theme.night ? (
            <>
              {stars.map((st, i) => (
                <div key={i} className="absolute rounded-full bg-white animate-twinkle"
                  style={{ left: `${st.left}%`, top: `${st.top}%`, width: st.big ? 3 : 2, height: st.big ? 3 : 2, animationDelay: `${st.delay}s`, opacity: st.big ? 0.9 : 0.6 }} />
              ))}
              <div className="absolute right-10 top-5"><RealmSprite name="moon" pixel={7} /></div>
            </>
          ) : (
            <>
              <div className={cn('absolute right-10 top-5 animate-float', world.weather === 'sunny' && 'drop-shadow-[0_0_18px_rgba(255,220,80,0.7)]')}>
                <RealmSprite name="sun" pixel={8} />
              </div>
              {birds.map((b, i) => (
                <div key={i} className="absolute animate-float"
                  style={{ left: `${b.left}%`, top: `${b.top}%`, animationDelay: `${b.delay}s`, animationDuration: '7s' }}>
                  <RealmSprite name="bird" pixel={3} />
                </div>
              ))}
            </>
          )}
          {clouds.map((c, i) => (
            <div key={i} className="absolute animate-float"
              style={{ left: `${c.left}%`, top: `${c.top}%`, animationDelay: `${c.delay}s`, animationDuration: '9s', opacity: theme.night ? 0.3 : world.weather === 'rainy' ? 0.85 : world.weather === 'cloudy' ? 0.75 : 0.85 }}>
              <RealmSprite name="cloud" pixel={c.p} />
            </div>
          ))}
        </div>

        {/* Yağmur overlay */}
        {(world.weather === 'rainy' || world.weather === 'cloudy') && (
          <div
            className={cn('pointer-events-none absolute inset-0', world.weather === 'rainy' && 'animate-rain')}
            style={{
              background: world.weather === 'rainy'
                ? 'repeating-linear-gradient(175deg,transparent,transparent 5px,rgba(160,210,255,0.22) 5px,rgba(160,210,255,0.22) 6px)'
                : 'rgba(180,200,220,0.08)',
              backgroundSize: world.weather === 'rainy' ? '20px 40px' : undefined,
            }}
          />
        )}

        {/* Güneşli halo */}
        {world.weather === 'sunny' && !theme.night && (
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 30% at 88% 18%,rgba(255,240,100,0.12) 0%,transparent 70%)' }} />
        )}

        {/* Uzak dağ/tepe silüetleri — 3 katman */}
        <div className="pointer-events-none absolute inset-x-0" style={{ bottom: `${groundH}px`, height: '55%' }}>
          <div className="absolute inset-x-[-8%] bottom-0 h-[50%] rounded-[100%_100%_0_0]" style={{ background: theme.hill3, opacity: 0.45 }} />
          <div className="absolute inset-x-[8%] bottom-0 h-[68%] rounded-[100%_100%_0_0]" style={{ background: theme.hill2, opacity: 0.60 }} />
          <div className="absolute inset-x-[26%] bottom-0 h-[84%] rounded-[100%_100%_0_0]" style={{ background: theme.hill1, opacity: 0.75 }} />
        </div>

        {/* Sıcak hava balonu */}
        {world.hasBalloon && (
          <div className="pointer-events-none absolute animate-float" style={{ left: '14%', top: '7%', animationDuration: '8s', zIndex: 5 }}>
            <RealmSprite name="balloon" pixel={6} tint={world.balloonColor} />
          </div>
        )}

        {/* Şehir (yatay kaydırılabilir) */}
        <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
          <div
            className="relative flex h-full min-w-full items-end gap-1.5 px-5"
            style={{ paddingBottom: `${groundH}px` }}
          >
            {/* Zemin şeridi */}
            <div className="absolute inset-x-0 bottom-0" style={{ height: `${groundH}px` }}>
              <div className="absolute inset-x-0 bottom-0" style={{ height: 20, background: theme.soil }} />
              <div className="absolute inset-x-0" style={{ bottom: 20, height: 8, background: theme.grass }} />
              <div className="absolute inset-x-0" style={{ bottom: 28, height: 4, background: 'repeating-linear-gradient(90deg,#7a7060 0px,#7a7060 6px,#6a6050 6px,#6a6050 10px)' }} />
              {world.hasRiver && (
                <div
                  className="absolute inset-x-0 animate-flow"
                  style={{
                    bottom: 32,
                    height: riverH,
                    background: `repeating-linear-gradient(90deg,${theme.water}aa 0px,${theme.water}dd 10px,${theme.water}99 20px,${theme.water}cc 30px,${theme.water}aa 60px)`,
                    backgroundSize: '60px 100%',
                  }}
                />
              )}
            </div>

            {built.length === 0 ? (
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center pb-12 text-center">
                <RealmSprite name="hut" tint="#7c8492" pixel={7} className="opacity-40" />
                <p className="mt-3 text-sm font-semibold text-white drop-shadow">Diyarın henüz çorak</p>
                <p className="mt-1 max-w-xs text-xs text-white/75 drop-shadow">İlk alışkanlığını tamamla, bu toprak sana ait olacak.</p>
              </div>
            ) : (
              sceneItems.map((it, i) => {
                if (it.kind === 'building') {
                  return <Building key={`b-${it.s.habitId}`} structure={it.s} onSelect={() => setSelected(it.s)} active={selected?.habitId === it.s.habitId} nightGlow={theme.night} />
                }
                if (it.kind === 'monument') {
                  return <Monument key={`m-${it.m.id}-${i}`} monument={it.m} night={theme.night} />
                }
                return (
                  <div key={`d-${i}`} className="relative z-10 shrink-0 self-end animate-sway"
                    style={{ transformOrigin: 'bottom center', animationDelay: `${(i % 5) * 0.45}s` }}>
                    <RealmSprite name={it.sprite} pixel={4} />
                  </div>
                )
              })
            )}
          </div>
        </div>

        {/* Köylüler (görünen alanda yürür, tıklanınca diyaloğa girer) */}
        {world.villagerCount > 0 && (
          <div className="pointer-events-none absolute inset-x-0" style={{ bottom: `${groundH - 2}px`, height: 150, zIndex: 15, overflow: 'hidden' }}>
            {Array.from({ length: world.villagerCount }).map((_, i) => {
              const walksRight = i % 2 === 0   // walk-left animasyonu scaleX(-1) içerir, sağ yürüyenler aynalanmaz
              const isTalking = talking?.idx === i
              return (
                <button
                  key={i}
                  onClick={() => speak(i)}
                  aria-label={`${villagerName(i)} ile konuş`}
                  className={cn('pointer-events-auto absolute bottom-0 cursor-pointer p-1', walksRight ? 'animate-walk-right' : 'animate-walk-left')}
                  style={{ animationDuration: `${13 + i * 2.8}s`, animationDelay: `${i * -3.1}s`, animationPlayState: isTalking ? 'paused' : 'running' }}
                >
                  {isTalking && (
                    <div
                      className="absolute bottom-full left-1/2 mb-1 w-40 -translate-x-1/2"
                      style={{ transform: `translateX(-50%) ${walksRight ? '' : 'scaleX(-1)'}` }}
                    >
                      <div className="relative rounded-lg border border-border bg-surface px-2.5 py-1.5 shadow-lg">
                        <p className="mb-0.5 text-[10px] font-bold text-primary">{villagerName(i)}</p>
                        <p className="text-[11px] leading-snug text-fg">{talking!.line}</p>
                        <div className="absolute left-1/2 top-full h-0 w-0 -translate-x-1/2 border-l-4 border-r-4 border-t-[6px] border-l-transparent border-r-transparent border-t-surface" />
                      </div>
                    </div>
                  )}
                  <RealmSprite name="villager" pixel={5} tint={VILLAGER_COLORS[i % VILLAGER_COLORS.length]} className={isTalking ? 'drop-shadow-[0_0_6px_rgba(255,255,255,0.6)]' : undefined} />
                </button>
              )
            })}
          </div>
        )}

        {/* Gece ateşböcekleri */}
        {theme.night && world.buildingCount > 0 && fireflies.map((ff, i) => (
          <div key={i} className="pointer-events-none absolute rounded-full bg-yellow-200 animate-twinkle"
            style={{ left: `${ff.left}%`, bottom: `${ff.bottom}px`, width: 3, height: 3, animationDelay: `${ff.delay}s`, opacity: 0.7, boxShadow: '0 0 5px 2px rgba(255,250,150,0.45)', zIndex: 16 }} />
        ))}

        {/* Kaydır ipucu */}
        {built.length > 6 && (
          <div className="pointer-events-none absolute right-2 top-2 z-20 animate-bob rounded-full bg-black/35 px-2.5 py-1 text-[10px] text-white/90">
            kaydır →
          </div>
        )}

        {/* Hava durumu rozeti */}
        <div className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-black/25 px-2 py-0.5 text-[10px] text-white/80">
          {world.weather === 'sunny' ? '☀️ Güneşli' : world.weather === 'rainy' ? '🌧 Yağmurlu' : world.weather === 'cloudy' ? '☁️ Bulutlu' : theme.label}
        </div>
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
              {selected.streak > 0 && <> · 🔥 {selected.streak} gün seri</>}
            </p>
          </div>
          {selected.isLandmark ? (
            <span className="shrink-0 text-xs font-bold text-xp">KALE</span>
          ) : (
            <span className="shrink-0 text-right text-xs text-muted-2">
              {(STAGE_NEXT[selected.stage] ?? 100) - selected.completions} sonra<br />yükselir
            </span>
          )}
        </div>
      )}

      {/* Dünya istatistikleri */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat value={world.buildingCount} label="yapı" />
        <Stat value={world.landmarkCount} label="kale" />
        <Stat value={world.monuments.length} label="eser" />
        <Stat value={world.villagerCount} label="köylü" />
      </div>

      {/* Açılmamış anıt ipuçları */}
      <UnlockHints world={world} />

      <p className="text-center text-xs text-muted-2">
        Köylülere dokun, sana diyardan haber versinler. Ruh halin havayı, su takibin nehri, bütçen hazineyi, odak seansların saat kulesini açar.
      </p>
    </div>
  )
}

function Building({ structure, onSelect, active, nightGlow }: {
  structure: RealmStructure; onSelect: () => void; active: boolean; nightGlow: boolean
}) {
  const pixel = 6
  const smokes = structure.sprite === 'tower' || structure.sprite === 'castle'
  const glowStyle = nightGlow ? { filter: `drop-shadow(0 0 6px ${structure.color}88)` } : undefined
  return (
    <button
      onClick={onSelect}
      title={`${structure.name} · ${structure.completions} tamamlama`}
      className={cn('group relative z-20 flex shrink-0 flex-col items-center self-end transition-transform active:translate-y-0.5', active && '-translate-y-1.5')}
    >
      {smokes && (
        <>
          <span className="absolute -top-1 left-[38%] h-1 w-1 rounded-full bg-white/60 animate-smoke" />
          <span className="absolute -top-1 left-[52%] h-1.5 w-1.5 rounded-full bg-white/45 animate-smoke" style={{ animationDelay: '1.4s' }} />
        </>
      )}
      {structure.hasFlag && (
        <div className="relative mb-0.5 h-3.5 animate-sway" style={{ transformOrigin: 'bottom left' }}>
          <div className="absolute bottom-0 left-1/2 h-3.5 w-[2px]" style={{ backgroundColor: '#6a5040' }} />
          <div className="absolute bottom-2 left-1/2 h-2 w-3.5" style={{ backgroundColor: structure.color }} />
        </div>
      )}
      <span className={cn('mb-0.5 rounded bg-black/30 px-1 text-[11px] leading-tight text-white', active && 'bg-black/50')}>
        {structure.emoji}
      </span>
      <RealmSprite
        name={structure.sprite}
        tint={structure.color}
        pixel={pixel}
        className={active ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]' : undefined}
        style={glowStyle}
      />
    </button>
  )
}

function Monument({ monument, night }: { monument: RealmMonument; night: boolean }) {
  const isLamppost = monument.sprite === 'lamppost'
  const isWindmill = monument.sprite === 'windmill'
  const pxl = monument.sprite === 'bigtree' ? 6 : monument.sprite === 'clocktower' ? 5 : monument.sprite === 'windmill' ? 4 : 5
  return (
    <div
      className={cn('relative z-20 shrink-0 self-end', isWindmill && 'animate-sway')}
      style={isWindmill ? { transformOrigin: 'bottom center', animationDuration: '8s' } : undefined}
      title={monument.label}
    >
      <RealmSprite
        name={monument.sprite}
        pixel={pxl}
        className={isLamppost && night ? 'drop-shadow-[0_0_8px_rgba(255,210,74,0.9)]' : undefined}
      />
      <p className="mt-0.5 text-center text-[9px] leading-none text-white/55 drop-shadow">{monument.label}</p>
    </div>
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

function UnlockHints({ world }: { world: ReturnType<typeof buildRealm> }) {
  const hints: string[] = []
  if (!world.hasRiver) hints.push('Su takibini başlat → nehir belirir')
  if (!world.monuments.find(m => m.sprite === 'treasury')) hints.push('Bütçe hesabı ekle → hazine kasası açılır')
  if (!world.monuments.find(m => m.sprite === 'clocktower')) hints.push('90 dk odak seansı tamamla → saat kulesi')
  if (!world.hasBalloon) hints.push(`${30 - world.population} tamamlama daha → sıcak hava balonu`)
  if (hints.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2">
      <p className="mb-1.5 text-xs font-semibold text-muted">Henüz açılmadı</p>
      <div className="space-y-0.5">
        {hints.slice(0, 3).map((h, i) => (
          <p key={i} className="text-xs text-muted-2">· {h}</p>
        ))}
      </div>
    </div>
  )
}

const STAGE_LABEL: Record<number, string> = {
  1: 'kulübe', 2: 'küçük ev', 3: 'ev', 4: 'kule', 5: 'kale',
}
const STAGE_NEXT: Record<number, number> = {
  1: 5, 2: 15, 3: 40, 4: 100,
}
