'use client'
import { useMemo, useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { Pencil, Check, X, ArrowRight, Snowflake } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import {
  buildRealm, phaseProgress, villagerLine, villagerName,
  type RealmEra, type RealmSeason, type RealmStructure, type RealmMonument,
} from '@/lib/realm'
import { philosopherOf, philosopherLine, philosopherLesson, getWeeklyTheme, type Philosopher, type WeeklyTheme } from '@/lib/advisor'
import { RealmSprite } from './realm-sprite'
import { Button } from '@/components/ui/button'
import { fireConfetti, haptic } from '@/lib/confetti'
import { playChime } from '@/lib/sound'
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
const BANNER_COLORS = ['#e0b341', '#e03c52', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#06b6d4', '#f97316']
const SEASON_META: Record<RealmSeason, { emoji: string; label: string }> = {
  'kış': { emoji: '❄️', label: 'Kış' },
  'ilkbahar': { emoji: '🌸', label: 'İlkbahar' },
  'yaz': { emoji: '🌞', label: 'Yaz' },
  'sonbahar': { emoji: '🍂', label: 'Sonbahar' },
}
const FW_COLORS = ['#ffd24a', '#ff6b9a', '#6ad0ff', '#7be08a', '#c08bff']

const PET_META = {
  cat: { sprite: 'pet' as const, label: 'Kedi', emoji: '🐱', sound: 'Miyav! 🐾' },
  dog: { sprite: 'petDog' as const, label: 'Köpek', emoji: '🐶', sound: 'Hav hav! 🐾' },
  bird: { sprite: 'petBird' as const, label: 'Kuş', emoji: '🐦', sound: 'Cik cik! 🐦' },
}

export function RealmView() {
  const { data, toggleHabit, setRealmName, setRealmBanner, setPetType, buyFreezeToken } = useStore()
  const world = useMemo(() => buildRealm(data), [data])
  const theme = eraTheme(world.era)
  const prog = phaseProgress(world)

  const realmName = data.profile.realmName || 'Diyarın'
  const banner = data.profile.realmBanner || '#e0b341'
  const petType = data.profile.petType || 'cat'
  const pet = PET_META[petType]

  const [selectedId, setSelectedId] = useState<string | null>(null)
  const selected = selectedId ? world.structures.find(s => s.habitId === selectedId) ?? null : null

  const [talking, setTalking] = useState<{ idx: number; line: string } | null>(null)
  const talkTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [petMeow, setPetMeow] = useState(false)
  const petTimer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [balloonOpen, setBalloonOpen] = useState(false)
  const [merchantOpen, setMerchantOpen] = useState(false)
  const [wisdomOpen, setWisdomOpen] = useState(false)
  const philosopher = useMemo(() => philosopherOf(data), [data])
  const weeklyTheme = useMemo(() => getWeeklyTheme(), [])
  const [bought, setBought] = useState(false)
  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(realmName)

  useEffect(() => () => {
    if (talkTimer.current) clearTimeout(talkTimer.current)
    if (petTimer.current) clearTimeout(petTimer.current)
  }, [])

  function speak(i: number) {
    if (talkTimer.current) clearTimeout(talkTimer.current)
    setTalking({ idx: i, line: villagerLine(world) })
    talkTimer.current = setTimeout(() => setTalking(null), 5000)
  }

  function meow() {
    if (petTimer.current) clearTimeout(petTimer.current)
    setPetMeow(true)
    petTimer.current = setTimeout(() => setPetMeow(false), 2200)
  }

  function quickComplete(habitId: string) {
    toggleHabit(habitId)
  }

  function buy() {
    if (!world.merchant) return
    if (buyFreezeToken(world.merchant.costXP)) {
      setBought(true)
      fireConfetti({ count: 50 }); playChime(2); haptic(30)
    }
  }

  function saveName() {
    setRealmName(nameDraft)
    setEditing(false)
  }

  const built = world.structures.filter(s => s.stage >= 1)
  const available = data.profile.totalXP - data.profile.redeemedXP

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
    return Array.from({ length: n }).map((_, i) => ({ left: 3 + i * 18 + r() * 8, top: 5 + r() * 22, p: 3 + Math.round(r() * 2), delay: i * 0.7 }))
  }, [world.weather])
  const birds = useMemo(() => {
    const r = rng(21)
    const n = world.weather === 'sunny' ? 5 : 2
    return Array.from({ length: n }).map((_, i) => ({ left: 25 + i * 15 + r() * 8, top: 12 + r() * 18, delay: i * 0.5 }))
  }, [world.weather])
  const fireflies = useMemo(() => {
    const r = rng(42)
    return Array.from({ length: 12 }).map((_, i) => ({ left: r() * 90 + 5, bottom: 10 + r() * 40, delay: i * 0.35 }))
  }, [])
  // Mevsim partikülleri (kar / yaprak / yaprak-çiçek)
  const seasonParticles = useMemo(() => {
    if (world.season === 'yaz') return []
    const r = rng(world.season === 'kış' ? 88 : world.season === 'sonbahar' ? 77 : 66)
    const n = world.season === 'kış' ? 34 : world.season === 'sonbahar' ? 20 : 16
    return Array.from({ length: n }).map(() => ({
      left: r() * 100,
      size: world.season === 'kış' ? 2 + Math.round(r() * 3) : 3 + Math.round(r() * 3),
      dur: 6 + r() * 7,
      delay: -r() * 12,
    }))
  }, [world.season])
  const fireworks = useMemo(() => {
    const r = rng(99)
    return Array.from({ length: 6 }).map((_, i) => ({
      left: 12 + r() * 76, top: 6 + r() * 30, delay: i * 0.6 + r() * 0.4, color: FW_COLORS[i % FW_COLORS.length], size: 50 + Math.round(r() * 40),
    }))
  }, [])

  const riverH = world.riverSize === 1 ? 6 : world.riverSize === 2 ? 10 : world.riverSize === 3 ? 14 : 0
  const groundH = 52 + riverH
  const todayPct = world.todayTotalCount > 0 ? Math.round(world.todayDoneCount / world.todayTotalCount * 100) : 0
  const winter = world.season === 'kış'
  const leafColor = world.season === 'sonbahar' ? ['#d9822b', '#c0492a', '#b8862a'] : ['#ffc0d8', '#ffe0ec', '#fff0f6']

  return (
    <div className="space-y-4">
      {/* Başlık: düzenlenebilir diyar adı + faz + nüfus */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          {editing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false) }}
                  placeholder="Diyarına bir ad ver"
                  autoFocus
                  className="h-9 w-48 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
                />
                <button onClick={saveName} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-bg"><Check size={15} /></button>
                <button onClick={() => setEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted hover:text-fg"><X size={15} /></button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BANNER_COLORS.map(c => (
                  <button key={c} onClick={() => setRealmBanner(c)}
                    className={cn('h-6 w-6 rounded-full transition-all', banner === c && 'ring-2 ring-offset-2 ring-offset-surface ring-fg')}
                    style={{ backgroundColor: c }} aria-label="Bayrak rengi" />
                ))}
              </div>
              <div className="flex gap-1.5">
                {(Object.keys(PET_META) as (keyof typeof PET_META)[]).map(p => (
                  <button key={p} onClick={() => setPetType(p)}
                    className={cn('flex items-center gap-1 rounded-lg border px-2.5 py-1.5 text-xs font-medium transition-all',
                      petType === p ? 'border-primary bg-primary/10 text-primary' : 'border-border bg-surface-2 text-muted hover:text-fg')}>
                    {PET_META[p].emoji} {PET_META[p].label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-muted font-display">{world.phase.label} · {theme.label}</p>
              <h2 className="flex items-center gap-2 text-xl font-bold text-fg font-display">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: banner }} />
                <span className="truncate">{realmName}</span>
                <button onClick={() => { setNameDraft(data.profile.realmName || ''); setEditing(true) }}
                  className="text-muted-2 hover:text-fg" aria-label="Diyarı düzenle"><Pencil size={14} /></button>
              </h2>
              {world.todayTotalCount > 0 && (
                <p className="mt-0.5 text-xs text-muted">
                  Bugün:{' '}
                  <span className={cn('font-semibold', todayPct === 100 ? 'text-success' : 'text-fg')}>
                    {world.todayDoneCount}/{world.todayTotalCount}
                  </span>
                  {todayPct === 100 && ' · diyar çiçek açıyor!'}
                </p>
              )}
            </>
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
      <div className="relative overflow-hidden rounded-2xl border border-border" style={{ height: '30rem', background: theme.sky }}>
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
              <div className={cn('absolute right-10 top-5 animate-float', (world.weather === 'sunny' || world.season === 'yaz') && 'drop-shadow-[0_0_18px_rgba(255,220,80,0.7)]')}>
                <RealmSprite name="sun" pixel={8} />
              </div>
              {birds.map((b, i) => (
                <div key={i} className="absolute animate-float" style={{ left: `${b.left}%`, top: `${b.top}%`, animationDelay: `${b.delay}s`, animationDuration: '7s' }}>
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
          <div className={cn('pointer-events-none absolute inset-0', world.weather === 'rainy' && 'animate-rain')}
            style={{
              background: world.weather === 'rainy'
                ? 'repeating-linear-gradient(175deg,transparent,transparent 5px,rgba(160,210,255,0.22) 5px,rgba(160,210,255,0.22) 6px)'
                : 'rgba(180,200,220,0.08)',
              backgroundSize: world.weather === 'rainy' ? '20px 40px' : undefined,
            }} />
        )}

        {/* Güneşli / yaz halo */}
        {(world.weather === 'sunny' || world.season === 'yaz') && !theme.night && (
          <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(ellipse 40% 30% at 88% 18%,rgba(255,240,100,0.12) 0%,transparent 70%)' }} />
        )}

        {/* Mevsim partikülleri (kar / yaprak / çiçek) */}
        {seasonParticles.length > 0 && (
          <div className="pointer-events-none absolute inset-0 z-[18] overflow-hidden">
            {seasonParticles.map((p, i) => (
              <div key={i}
                className={cn('absolute top-0', winter ? 'animate-snowfall rounded-full' : 'animate-leaffall rounded-[1px]')}
                style={{
                  left: `${p.left}%`,
                  width: p.size, height: p.size,
                  background: winter ? 'rgba(255,255,255,0.92)' : leafColor[i % leafColor.length],
                  animationDuration: `${p.dur}s`,
                  animationDelay: `${p.delay}s`,
                }} />
            ))}
          </div>
        )}

        {/* Mükemmel gün havai fişeği */}
        {world.perfectDay && (
          <div className="pointer-events-none absolute inset-0 z-[17]">
            {fireworks.map((f, i) => (
              <div key={i} className="absolute animate-burst rounded-full"
                style={{
                  left: `${f.left}%`, top: `${f.top}%`, width: f.size, height: f.size,
                  background: `radial-gradient(circle, ${f.color} 0%, ${f.color}99 35%, transparent 70%)`,
                  animationDelay: `${f.delay}s`,
                }} />
            ))}
          </div>
        )}

        {/* Uzak dağ/tepe silüetleri */}
        <div className="pointer-events-none absolute inset-x-0" style={{ bottom: `${groundH}px`, height: '55%' }}>
          <div className="absolute inset-x-[-8%] bottom-0 h-[50%] rounded-[100%_100%_0_0]" style={{ background: theme.hill3, opacity: 0.45 }} />
          <div className="absolute inset-x-[8%] bottom-0 h-[68%] rounded-[100%_100%_0_0]" style={{ background: theme.hill2, opacity: 0.60 }} />
          <div className="absolute inset-x-[26%] bottom-0 h-[84%] rounded-[100%_100%_0_0]" style={{ background: theme.hill1, opacity: 0.75 }} />
          {/* Kış: dağlara kar başlığı */}
          {winter && (
            <>
              <div className="absolute inset-x-[26%] bottom-[64%] h-[20%] rounded-[100%_100%_0_0]" style={{ background: 'rgba(255,255,255,0.55)' }} />
              <div className="absolute inset-x-[8%] bottom-[52%] h-[16%] rounded-[100%_100%_0_0]" style={{ background: 'rgba(255,255,255,0.4)' }} />
            </>
          )}
        </div>

        {/* Sıcak hava balonu (tıklanınca özet) */}
        {world.hasBalloon && (
          <button onClick={() => setBalloonOpen(true)} aria-label="Diyar özeti"
            className="absolute z-[19] animate-float cursor-pointer" style={{ left: '14%', top: '7%', animationDuration: '8s' }}>
            <RealmSprite name="balloon" pixel={6} tint={world.balloonColor} />
          </button>
        )}

        {/* Diyar bayrağı (far-left, zemine dikili) */}
        <div className="pointer-events-none absolute z-20" style={{ left: 10, bottom: groundH }}>
          <div className="relative h-16 w-[3px]" style={{ backgroundColor: '#6a5040' }}>
            <div className="absolute left-[3px] top-0 h-3.5 w-6 animate-sway" style={{ backgroundColor: banner, transformOrigin: 'left center' }} />
          </div>
        </div>

        {/* Şehir (yatay kaydırılabilir) */}
        <div className="absolute inset-0 overflow-x-auto overflow-y-hidden">
          <div className="relative flex h-full min-w-full items-end gap-1.5 px-5" style={{ paddingBottom: `${groundH}px` }}>
            {/* Zemin şeridi */}
            <div className="absolute inset-x-0 bottom-0" style={{ height: `${groundH}px` }}>
              <div className="absolute inset-x-0 bottom-0" style={{ height: 20, background: theme.soil }} />
              <div className="absolute inset-x-0" style={{ bottom: 20, height: 8, background: theme.grass }} />
              {winter && <div className="absolute inset-x-0" style={{ bottom: 27, height: 4, background: 'rgba(255,255,255,0.8)' }} />}
              <div className="absolute inset-x-0" style={{ bottom: 28, height: 4, background: 'repeating-linear-gradient(90deg,#7a7060 0px,#7a7060 6px,#6a6050 6px,#6a6050 10px)' }} />
              {world.hasRiver && (
                <div className="absolute inset-x-0 animate-flow"
                  style={{ bottom: 32, height: riverH, background: `repeating-linear-gradient(90deg,${theme.water}aa 0px,${theme.water}dd 10px,${theme.water}99 20px,${theme.water}cc 30px,${theme.water}aa 60px)`, backgroundSize: '60px 100%' }} />
              )}
            </div>

            {built.length === 0 ? (
              <div className="relative z-10 flex h-full w-full flex-col items-center justify-center pb-12 text-center">
                <RealmSprite name="hut" tint="#7c8492" pixel={7} className="opacity-40" />
                <p className="mt-3 text-sm font-semibold text-white drop-shadow">Diyarın henüz çorak</p>
                <p className="mt-1 max-w-xs text-xs text-white/75 drop-shadow">İlk alışkanlığını tamamla, bu toprak sana ait olacak.</p>
              </div>
            ) : (
              <>
              <button onClick={() => setWisdomOpen(true)} title="Bilgelik Akademisi"
                className="relative z-20 flex shrink-0 flex-col items-center self-end">
                <span className="mb-0.5 rounded bg-black/30 px-1 text-[11px] leading-tight text-white">📜</span>
                <RealmSprite name="academy" pixel={5} className="drop-shadow-[0_0_6px_rgba(255,210,74,0.45)]" />
                <p className="mt-0.5 text-center text-[9px] leading-none text-white/55 drop-shadow">Akademi</p>
              </button>
              {sceneItems.map((it, i) => {
                if (it.kind === 'building') {
                  return <Building key={`b-${it.s.habitId}`} structure={it.s} onSelect={() => setSelectedId(it.s.habitId)} active={selectedId === it.s.habitId} nightGlow={theme.night} />
                }
                if (it.kind === 'monument') {
                  return <Monument key={`m-${it.m.id}-${i}`} monument={it.m} night={theme.night} />
                }
                return (
                  <div key={`d-${i}`} className="relative z-10 shrink-0 self-end animate-sway" style={{ transformOrigin: 'bottom center', animationDelay: `${(i % 5) * 0.45}s` }}>
                    <RealmSprite name={it.sprite} pixel={4} />
                  </div>
                )
              })}
              </>
            )}
          </div>
        </div>

        {/* Köylüler (yürür, tıklanınca diyaloğa girer) */}
        {world.villagerCount > 0 && (
          <div className="pointer-events-none absolute inset-x-0" style={{ bottom: `${groundH - 2}px`, height: 150, zIndex: 15, overflow: 'hidden' }}>
            {Array.from({ length: world.villagerCount }).map((_, i) => {
              const walksRight = i % 2 === 0
              const isTalking = talking?.idx === i
              return (
                <button key={i} onClick={() => speak(i)} aria-label={`${villagerName(i)} ile konuş`}
                  className={cn('pointer-events-auto absolute bottom-0 cursor-pointer p-1', walksRight ? 'animate-walk-right' : 'animate-walk-left')}
                  style={{ animationDuration: `${13 + i * 2.8}s`, animationDelay: `${i * -3.1}s`, animationPlayState: isTalking ? 'paused' : 'running' }}>
                  {isTalking && (
                    <div className="absolute bottom-full left-1/2 mb-1 w-40 -translate-x-1/2" style={{ transform: `translateX(-50%) ${walksRight ? '' : 'scaleX(-1)'}` }}>
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

        {/* Maskot (tıklayınca miyavlar) */}
        {world.hasPet && (
          <div className="pointer-events-none absolute inset-x-0" style={{ bottom: `${groundH - 4}px`, height: 90, zIndex: 16, overflow: 'hidden' }}>
            <button onClick={meow} aria-label="Maskotu sev"
              className="pointer-events-auto absolute bottom-0 cursor-pointer animate-walk-right p-1" style={{ animationDuration: '21s', animationDelay: '-7s' }}>
              {petMeow && (
                <div className="absolute bottom-full left-1/2 mb-1 -translate-x-1/2">
                  <div className="whitespace-nowrap rounded-md border border-border bg-surface px-2 py-0.5 text-[10px] text-fg shadow">{pet.sound}</div>
                </div>
              )}
              <RealmSprite name={pet.sprite} pixel={4} className={petMeow ? 'drop-shadow-[0_0_5px_rgba(255,255,255,0.7)]' : undefined} />
            </button>
          </div>
        )}

        {/* Gezgin tüccar (tıklanınca tezgah) */}
        {world.merchant && (
          <button onClick={() => { setMerchantOpen(true); setBought(false) }} aria-label="Gezgin tüccar"
            className="absolute z-20 cursor-pointer" style={{ right: 16, bottom: groundH - 2 }}>
            <span className="absolute -top-3 left-1/2 -translate-x-1/2 animate-bob text-xs">❗</span>
            <RealmSprite name="merchant" pixel={5} />
          </button>
        )}

        {/* Gece ateşböcekleri */}
        {theme.night && world.buildingCount > 0 && fireflies.map((ff, i) => (
          <div key={i} className="pointer-events-none absolute rounded-full bg-yellow-200 animate-twinkle"
            style={{ left: `${ff.left}%`, bottom: `${ff.bottom}px`, width: 3, height: 3, animationDelay: `${ff.delay}s`, opacity: 0.7, boxShadow: '0 0 5px 2px rgba(255,250,150,0.45)', zIndex: 16 }} />
        ))}

        {/* Kaydır ipucu */}
        {built.length > 6 && (
          <div className="pointer-events-none absolute right-2 top-2 z-20 animate-bob rounded-full bg-black/35 px-2.5 py-1 text-[10px] text-white/90">kaydır →</div>
        )}

        {/* Hava + mevsim rozeti */}
        <div className="pointer-events-none absolute left-2 top-2 z-20 rounded-full bg-black/25 px-2 py-0.5 text-[10px] text-white/80">
          {world.weather === 'sunny' ? '☀️ Güneşli' : world.weather === 'rainy' ? '🌧 Yağmurlu' : world.weather === 'cloudy' ? '☁️ Bulutlu' : theme.label}
          {' · '}{SEASON_META[world.season].emoji} {SEASON_META[world.season].label}
        </div>

        {/* Balon özet modalı */}
        {balloonOpen && (
          <BalloonSummary world={world} realmName={realmName} onClose={() => setBalloonOpen(false)} />
        )}

        {/* Tüccar modalı */}
        {merchantOpen && world.merchant && (
          <MerchantPanel cost={world.merchant.costXP} available={available} tokens={data.freezeTokens}
            bought={bought} onBuy={buy} onClose={() => setMerchantOpen(false)} />
        )}

        {/* Bilgelik akademisi modalı */}
        {wisdomOpen && (
          <WisdomModal philosopher={philosopher} theme={weeklyTheme} quotes={data.savedQuotes}
            isFixed={!!data.profile.advisorId} onClose={() => setWisdomOpen(false)} />
        )}
      </div>

      {/* Seçili yapı detayı + hızlı tamamla */}
      {selected && (
        <div className="space-y-2 rounded-xl border border-border bg-surface-2 p-3">
          <div className="flex items-center gap-3">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-2xl" style={{ backgroundColor: selected.color + '22' }}>
              {selected.emoji}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-fg">{selected.name}</p>
              <p className="text-xs text-muted">
                {selected.completions} tamamlama · {STAGE_LABEL[selected.stage]}
                {selected.streak > 0 && <> · 🔥 {selected.streak} gün seri</>}
                {selected.damaged && <span className="text-danger"> · 🛠 yıkık</span>}
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
          <div className="flex gap-2">
            {selected.doneToday ? (
              <span className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-success/15 py-2 text-xs font-medium text-success">
                <Check size={14} /> Bugün tamamlandı
              </span>
            ) : (
              <Button variant="primary" className="flex-1" onClick={() => quickComplete(selected.habitId)}>
                {selected.damaged ? '🛠 Tamamla, onar' : 'Bugün tamamla'}
              </Button>
            )}
            <Link href="/habits" className="flex items-center gap-1 rounded-lg border border-border bg-surface px-3 text-xs font-medium text-muted hover:text-fg">
              Alışkanlığa git <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      )}

      {/* Dünya istatistikleri */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat value={world.buildingCount} label="yapı" />
        <Stat value={world.landmarkCount} label="kale" />
        <Stat value={world.monuments.length} label="eser" />
        <Stat value={world.villagerCount} label="köylü" />
      </div>

      {/* Açılmamış içerikler */}
      <UnlockHints world={world} />

      <p className="text-center text-xs text-muted-2">
        Yapıya dokun, oradan tamamla. Akademiye dokun, günün filozofundan ders al. Köylülere ve maskota dokun. Ruh halin havayı, mevsim manzarayı, su takibin nehri, bütçen hazineyi, odakların saat kulesini, başarımların ve tamamlanan harikaların anıtları açar.
      </p>
    </div>
  )
}

function Building({ structure, onSelect, active, nightGlow }: {
  structure: RealmStructure; onSelect: () => void; active: boolean; nightGlow: boolean
}) {
  const smokes = structure.sprite === 'tower' || structure.sprite === 'castle'
  // Gece: bugün yapılan ya da serisi yaşayan binalarda ışık yanar (evde biri var).
  const lit = nightGlow && (structure.doneToday || structure.streak > 0)
  const windowMode: 'day' | 'lit' | 'off' = !nightGlow ? 'day' : lit ? 'lit' : 'off'
  const baseFilter = nightGlow
    ? (lit ? 'drop-shadow(0 0 7px rgba(255,210,120,0.6))' : 'brightness(0.68)')
    : ''
  const damagedFilter = structure.damaged ? 'grayscale(0.55) brightness(0.82)' : ''
  const filter = [damagedFilter, baseFilter].filter(Boolean).join(' ') || undefined
  return (
    <button onClick={onSelect} title={`${structure.name} · ${structure.completions} tamamlama`}
      className={cn('group relative z-20 flex shrink-0 flex-col items-center self-end transition-transform active:translate-y-0.5', active && '-translate-y-1.5')}>
      {smokes && !structure.damaged && (
        <>
          <span className="absolute -top-1 left-[38%] h-1 w-1 rounded-full bg-white/60 animate-smoke" />
          <span className="absolute -top-1 left-[52%] h-1.5 w-1.5 rounded-full bg-white/45 animate-smoke" style={{ animationDelay: '1.4s' }} />
        </>
      )}
      {structure.hasFlag && !structure.damaged && (
        <div className="relative mb-0.5 h-3.5 animate-sway" style={{ transformOrigin: 'bottom left' }}>
          <div className="absolute bottom-0 left-1/2 h-3.5 w-[2px]" style={{ backgroundColor: '#6a5040' }} />
          <div className="absolute bottom-2 left-1/2 h-2 w-3.5" style={{ backgroundColor: structure.color }} />
        </div>
      )}
      <span className={cn('mb-0.5 flex items-center gap-0.5 rounded bg-black/30 px-1 text-[11px] leading-tight text-white', active && 'bg-black/50')}>
        {structure.emoji}
        {structure.doneToday && <Check size={9} className="text-green-300" />}
      </span>
      <div className="relative">
        <RealmSprite name={structure.sprite} tint={structure.color} pixel={6} windowMode={windowMode}
          className={active ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.7)]' : undefined}
          style={filter ? { filter } : undefined} />
        {/* Yıkıntı çatlağı */}
        {structure.damaged && (
          <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 20 20" preserveAspectRatio="none" aria-hidden="true">
            <path d="M9 1 L11 7 L8 10 L12 14 L10 19" stroke="rgba(20,12,10,0.7)" strokeWidth="0.7" fill="none" />
          </svg>
        )}
      </div>
    </button>
  )
}

function Monument({ monument, night }: { monument: RealmMonument; night: boolean }) {
  const isLamppost = monument.sprite === 'lamppost'
  const isWindmill = monument.sprite === 'windmill'
  const highlight = !!monument.fromAchievement || !!monument.fromWonder
  const pxl = monument.sprite === 'cathedral' ? 3
    : monument.sprite === 'bigtree' ? 6
    : monument.sprite === 'arch' ? 4
    : monument.sprite === 'obelisk' || monument.sprite === 'statue' ? 4
    : monument.sprite === 'clocktower' ? 5
    : monument.sprite === 'windmill' ? 4 : 5
  return (
    <div className={cn('relative z-20 shrink-0 self-end', isWindmill && 'animate-sway')}
      style={isWindmill ? { transformOrigin: 'bottom center', animationDuration: '8s' } : undefined}
      title={monument.label}>
      <RealmSprite name={monument.sprite} pixel={pxl} tint={monument.tint}
        className={cn(
          isLamppost && night && 'drop-shadow-[0_0_8px_rgba(255,210,74,0.9)]',
          highlight && 'drop-shadow-[0_0_7px_rgba(255,210,74,0.65)]',
        )} />
      <p className={cn('mt-0.5 max-w-[64px] truncate text-center text-[9px] leading-none drop-shadow', highlight ? 'text-xp/90' : 'text-white/55')}>
        {monument.emoji ? `${monument.emoji} ` : ''}{monument.label}
      </p>
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

function BalloonSummary({ world, realmName, onClose }: { world: ReturnType<typeof buildRealm>; realmName: string; onClose: () => void }) {
  const maxStreak = world.structures.reduce((m, s) => Math.max(m, s.streak), 0)
  const rows: { label: string; value: string }[] = [
    { label: 'Faz', value: world.phase.label },
    { label: 'Nüfus', value: world.population.toLocaleString('tr-TR') },
    { label: 'Yapılar', value: `${world.buildingCount}` },
    { label: 'Kaleler', value: `${world.landmarkCount}` },
    { label: 'Anıtlar', value: `${world.monuments.length}` },
    { label: 'Köylüler', value: `${world.villagerCount}` },
    { label: 'Bugün', value: world.todayTotalCount > 0 ? `${world.todayDoneCount}/${world.todayTotalCount}` : '-' },
    { label: 'En uzun seri', value: maxStreak > 0 ? `🔥 ${maxStreak} gün` : '-' },
    { label: 'Hava', value: world.weather === 'sunny' ? 'Güneşli' : world.weather === 'rainy' ? 'Yağmurlu' : world.weather === 'cloudy' ? 'Bulutlu' : 'Açık' },
    { label: 'Mevsim', value: SEASON_META[world.season].label },
  ]
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-4" onClick={onClose}>
      <div className="w-full max-w-xs rounded-2xl border border-border bg-surface p-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-fg font-display">🎈 {realmName} · Kuşbakışı</p>
          <button onClick={onClose} className="text-muted hover:text-fg"><X size={16} /></button>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {rows.map(r => (
            <div key={r.label} className="rounded-lg border border-border bg-surface-2 px-2.5 py-2">
              <p className="text-[10px] text-muted">{r.label}</p>
              <p className="text-sm font-semibold text-fg">{r.value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function WisdomModal({ philosopher, theme, quotes, isFixed, onClose }: {
  philosopher: Philosopher; theme: WeeklyTheme; quotes: string[]; isFixed: boolean; onClose: () => void
}) {
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-4" onClick={onClose}>
      <div className="max-h-full w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-fg font-display">📜 Bilgelik Akademisi</p>
          <button onClick={onClose} className="text-muted hover:text-fg"><X size={16} /></button>
        </div>

        {/* Haftanın teması */}
        <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-border bg-surface-2 p-3">
          <span className="text-xl">{theme.emoji}</span>
          <div>
            <p className="text-xs font-semibold text-fg">Bu haftanın teması: {theme.title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{theme.desc}</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-3xl">{philosopher.emoji}</span>
          <div>
            <p className="text-base font-bold text-fg font-display">{philosopher.name}</p>
            <p className="text-[11px] text-muted-2">{philosopher.era}{isFixed ? '' : ' · günün filozofu'}</p>
          </div>
        </div>
        <p className="mt-3 text-sm italic leading-snug text-muted">&ldquo;{philosopherLine(philosopher)}&rdquo;</p>
        <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Günün dersi</p>
          <p className="text-sm leading-relaxed text-fg">{philosopherLesson(philosopher)}</p>
        </div>

        {/* Kaydettiğin sözler */}
        {quotes.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Kaydettiğin sözler ({quotes.length})</p>
            <div className="space-y-1.5">
              {quotes.slice(-6).reverse().map((q, i) => (
                <p key={i} className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs italic leading-snug text-muted">&ldquo;{q}&rdquo;</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function MerchantPanel({ cost, available, tokens, bought, onBuy, onClose }: {
  cost: number; available: number; tokens: number; bought: boolean; onBuy: () => void; onClose: () => void
}) {
  const canBuy = available >= cost
  return (
    <div className="absolute inset-0 z-30 flex items-center justify-center bg-black/55 p-4" onClick={onClose}>
      <div className="w-full max-w-xs rounded-2xl border border-border bg-surface p-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-fg font-display">🧳 Gezgin Tüccar</p>
          <button onClick={onClose} className="text-muted hover:text-fg"><X size={16} /></button>
        </div>
        <p className="mb-3 text-xs text-muted">
          Uzak diyarlardan geçiyordum. Sana bir teklifim var, yolcu.
        </p>
        <div className="rounded-xl border border-border bg-surface-2 p-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🧊</span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-fg">Dondurma Jetonu</p>
              <p className="text-xs text-muted">Bir günü dondurur, serini korur</p>
            </div>
            <span className="shrink-0 text-sm font-bold text-xp tabular-nums">{cost} XP</span>
          </div>
          {bought ? (
            <p className="mt-3 text-center text-sm font-semibold text-success">Satın alındı! Elinde {tokens} jeton var.</p>
          ) : (
            <Button variant="xp" className="mt-3 w-full" onClick={onBuy} disabled={!canBuy}>
              {canBuy ? 'Satın al' : 'Yetersiz XP'}
            </Button>
          )}
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-2">Kullanılabilir: {available.toLocaleString('tr-TR')} XP · Jeton: {tokens}</p>
      </div>
    </div>
  )
}

function UnlockHints({ world }: { world: ReturnType<typeof buildRealm> }) {
  const hints: string[] = []
  if (!world.hasRiver) hints.push('Su takibini başlat → nehir belirir')
  if (!world.monuments.find(m => m.sprite === 'treasury')) hints.push('Bütçe hesabı ekle → hazine kasası açılır')
  if (!world.monuments.find(m => m.sprite === 'clocktower')) hints.push('90 dk odak seansı tamamla → saat kulesi')
  if (!world.hasPet) hints.push(`${Math.max(0, 20 - world.population)} tamamlama daha → maskot`)
  if (!world.hasBalloon) hints.push(`${Math.max(0, 30 - world.population)} tamamlama daha → sıcak hava balonu`)
  if (!world.monuments.find(m => m.fromAchievement)) hints.push('Büyük başarımlar → eşsiz anıtlar (heykel, zafer takı)')
  if (hints.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2">
      <p className="mb-1.5 text-xs font-semibold text-muted">Henüz açılmadı</p>
      <div className="space-y-0.5">
        {hints.slice(0, 4).map((h, i) => (
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
