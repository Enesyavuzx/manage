'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, X, Gamepad2 } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { buildRealm } from '@/lib/realm'
import { RealmGraph, type GNode, type GEdge } from '@/components/realm/realm-graph'

const STAGE_LABEL: Record<number, string> = { 0: 'Boş arsa', 1: 'Kulübe', 2: 'Küçük ev', 3: 'Ev', 4: 'Kule', 5: 'Kale' }
const STAGE_NEXT = [5, 15, 40, 100]
const STAGE_PREV = [0, 5, 15, 40]
const SEASON_EMOJI: Record<string, string> = { kış: '❄️', ilkbahar: '🌸', yaz: '🌞', sonbahar: '🍂' }
const WEATHER_EMOJI: Record<string, string> = { sunny: '☀️', normal: '🌤', cloudy: '☁️', rainy: '🌧' }

export default function DiyarOyunPage() {
  const { data } = useStore()
  const world = useMemo(() => buildRealm(data), [data])
  const structs = world.structures

  // bina yerleşimi (zikzak ızgara)
  const layout = useMemo(() => {
    const n = Math.max(structs.length, 1)
    const cols = Math.max(2, Math.ceil(Math.sqrt(n)))
    const SP = 250, PAD = 340
    const rows = Math.ceil(structs.length / cols) || 1
    const W = PAD * 2 + (cols - 1) * SP + 200
    const H = PAD * 2 + (rows - 1) * SP + 200
    const items = structs.map((s, i) => {
      const c = i % cols, r = Math.floor(i / cols)
      return { s, x: PAD + c * SP + (r % 2 ? SP / 2 : 0), y: PAD + r * SP }
    })
    return { items, W, H }
  }, [structs])

  // "Second mind" grafı: alışkanlık + not düğümleri; rutin/zincir/kategori/istif/not kenarları
  const mind = useMemo(() => {
    const habitNodes: GNode[] = structs.map(s => ({ id: s.habitId, type: 'habit', label: s.name, emoji: s.emoji, color: s.color, stage: s.stage }))
    const habitSet = new Set(habitNodes.map(n => n.id))
    const habitList = (data.habits || []).filter(h => habitSet.has(h.id)).map(h => ({ id: h.id, name: h.name, nl: h.name.toLowerCase(), cue: (h.cue || '').toLowerCase(), cat: h.category }))
    const nodes: GNode[] = [...habitNodes]
    const edges: GEdge[] = []
    const seen = new Set<string>()
    const add = (a: string | null, b: string | null, kind: GEdge['kind']) => {
      if (!a || !b || a === b) return
      const key = [a, b].sort().join('|') + ':' + kind
      if (seen.has(key)) return
      seen.add(key); edges.push({ a, b, kind })
    }
    for (const r of data.routines || []) { const ids = (r.habitIds || []).filter(id => habitSet.has(id)); for (let i = 0; i < ids.length - 1; i++) add(ids[i], ids[i + 1], 'rutin') }
    for (const z of data.zincirs || []) { const ids = (z.steps || []).map(s => s.habitId).filter((id): id is string => !!id && habitSet.has(id)); for (let i = 0; i < ids.length - 1; i++) add(ids[i], ids[i + 1], 'zincir') }
    const byCat = new Map<string, string[]>()
    for (const h of habitList) { const a = byCat.get(h.cat) || []; a.push(h.id); byCat.set(h.cat, a) }
    for (const arr of byCat.values()) for (let i = 0; i < arr.length - 1; i++) add(arr[i], arr[i + 1], 'kategori')
    // habit stacking: cue başka bir alışkanlık adını içeriyorsa o -> bu
    for (const h of habitList) { if (!h.cue) continue; for (const o of habitList) { if (o.id === h.id || o.name.length < 3) continue; if (h.cue.includes(o.nl)) add(o.id, h.id, 'istif') } }
    // beyin-boşalt notları: bir alışkanlık adını içeren son notlar düğüm olur ve ona bağlanır
    for (const it of [...(data.brainDump || [])].slice(-20).reverse()) {
      const t = (it.text || '').toLowerCase()
      const links = habitList.filter(o => o.name.length >= 3 && t.includes(o.nl))
      if (links.length === 0) continue
      const nid = 'note:' + it.id
      nodes.push({ id: nid, type: 'note', label: (it.text || '').slice(0, 22), emoji: '📝', color: '#3caa6e' })
      for (const o of links) add(nid, o.id, 'not')
    }
    return { nodes, edges }
  }, [structs, data.routines, data.zincirs, data.habits, data.brainDump])

  const posMap = useMemo(() => new Map(layout.items.map(it => [it.s.habitId, { x: it.x, y: it.y }])), [layout])
  const habitEdges = mind.edges.filter(e => posMap.has(e.a) && posMap.has(e.b))
  const labelOf = (id: string) => mind.nodes.find(n => n.id === id)?.label ?? id
  const connOf = (id: string) => mind.edges.filter(e => e.a === id || e.b === id).map(e => ({ other: e.a === id ? e.b : e.a, kind: e.kind }))

  const worldRef = useRef<HTMLDivElement>(null)
  const charRef = useRef<HTMLDivElement>(null)
  const keys = useRef<Set<string>>(new Set())
  const pos = useRef({ x: layout.W / 2, y: layout.H - 240 })
  const facing = useRef(1)
  const nearRef = useRef<string | null>(null)
  const openRef = useRef<string | null>(null)
  const [nearId, setNearId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [showLinks, setShowLinks] = useState(true)
  const [reduce, setReduce] = useState(false)
  const [mode, setMode] = useState<'explore' | 'graph'>('explore')
  const [openNote, setOpenNote] = useState<string | null>(null)
  useEffect(() => { openRef.current = openId }, [openId])
  useEffect(() => { setReduce(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false) }, [])

  // hareket + kamera döngüsü
  useEffect(() => {
    let raf = 0
    const SPEED = 3.6
    const step = () => {
      raf = requestAnimationFrame(step)
      if (!openRef.current) {
        const k = keys.current
        let dx = 0, dy = 0
        if (k.has('up')) dy -= 1
        if (k.has('down')) dy += 1
        if (k.has('left')) dx -= 1
        if (k.has('right')) dx += 1
        if (dx || dy) {
          const m = Math.hypot(dx, dy) || 1
          pos.current.x = Math.max(70, Math.min(layout.W - 70, pos.current.x + (dx / m) * SPEED))
          pos.current.y = Math.max(70, Math.min(layout.H - 70, pos.current.y + (dy / m) * SPEED))
          if (dx) facing.current = dx > 0 ? 1 : -1
        }
      }
      const vw = window.innerWidth, vh = window.innerHeight
      if (worldRef.current) worldRef.current.style.transform = `translate(${Math.round(vw / 2 - pos.current.x)}px, ${Math.round(vh / 2 - pos.current.y)}px)`
      if (charRef.current) {
        charRef.current.style.left = pos.current.x + 'px'
        charRef.current.style.top = pos.current.y + 'px'
        charRef.current.style.transform = `translate(-50%, -88%) scaleX(${facing.current})`
      }
      // yakınlık (bina tabanına göre)
      let best: string | null = null, bd = 130 * 130
      for (const it of layout.items) {
        const ax = it.x - pos.current.x, ay = (it.y - 24) - pos.current.y
        const d = ax * ax + ay * ay
        if (d < bd) { bd = d; best = it.s.habitId }
      }
      if (best !== nearRef.current) { nearRef.current = best; setNearId(best) }
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [layout])

  // klavye
  useEffect(() => {
    const map: Record<string, string> = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', a: 'left', s: 'down', d: 'right', W: 'up', A: 'left', S: 'down', D: 'right' }
    const down = (e: KeyboardEvent) => {
      const dir = map[e.key]
      if (dir) { keys.current.add(dir); if (e.key.startsWith('Arrow')) e.preventDefault() }
      if ((e.key === 'Enter' || e.key === ' ') && nearRef.current && !openRef.current) { e.preventDefault(); setOpenId(nearRef.current) }
      if (e.key === 'Escape' && openRef.current) setOpenId(null)
      if (e.key === 'l' || e.key === 'L') setShowLinks(v => !v)
    }
    const up = (e: KeyboardEvent) => { const dir = map[e.key]; if (dir) keys.current.delete(dir) }
    window.addEventListener('keydown', down)
    window.addEventListener('keyup', up)
    return () => { window.removeEventListener('keydown', down); window.removeEventListener('keyup', up); keys.current.clear() }
  }, [])

  const press = (dir: string, on: boolean) => { if (on) keys.current.add(dir); else keys.current.delete(dir) }
  const open = structs.find(s => s.habitId === openId) || null
  const oNext = open ? (STAGE_NEXT[open.stage - 1] ?? null) : null
  const oPrev = open ? (STAGE_PREV[open.stage - 1] ?? 0) : 0
  const oPct = open ? (oNext ? Math.min(100, Math.max(0, ((open.completions - oPrev) / (oNext - oPrev)) * 100)) : 100) : 0

  return (
    <div className="fixed inset-0 z-[140] select-none overflow-hidden" style={{ background: 'rgb(var(--c-bg))' }}>
      <div data-no-reveal style={{ display: 'contents' }}>

        {/* DÜNYA (kamera ile kayar) — yalnızca Keşif modu */}
        {mode === 'explore' && (
        <div
          ref={worldRef}
          className="absolute left-0 top-0"
          style={{
            width: layout.W, height: layout.H,
            background: 'repeating-linear-gradient(0deg, rgb(var(--c-border) / 0.16) 0 1px, transparent 1px 44px), repeating-linear-gradient(90deg, rgb(var(--c-border) / 0.16) 0 1px, transparent 1px 44px), radial-gradient(circle at 50% 35%, rgb(var(--c-primary) / 0.10), transparent 60%), rgb(var(--c-surface2))',
          }}
        >
          {/* nöral-ağ bağlantı katmanı (oklar + sinyal nabızları) */}
          {showLinks && habitEdges.length > 0 && (
            <svg className="pointer-events-none absolute left-0 top-0" width={layout.W} height={layout.H} style={{ zIndex: 0 }} aria-hidden="true">
              <defs>
                <marker id="ar-rutin" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#7b95ff" /></marker>
                <marker id="ar-zincir" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#ffa447" /></marker>
                <marker id="ar-istif" markerWidth="7" markerHeight="7" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#b482ff" /></marker>
              </defs>
              {habitEdges.map((e, i) => {
                const A = posMap.get(e.a)!, B = posMap.get(e.b)!
                const ay = A.y - 44, by = B.y - 44
                const hot = nearId === e.a || nearId === e.b
                const directed = e.kind !== 'kategori'
                const col = e.kind === 'rutin' ? '#7b95ff' : e.kind === 'zincir' ? '#ffa447' : e.kind === 'istif' ? '#b482ff' : 'rgb(var(--c-muted))'
                return (
                  <g key={i}>
                    <line
                      x1={A.x} y1={ay} x2={B.x} y2={by} stroke={col}
                      strokeWidth={hot ? 4.5 : directed ? 3 : 1.5}
                      strokeOpacity={nearId ? (hot ? 0.98 : 0.32) : (directed ? 0.62 : 0.3)}
                      strokeDasharray={directed ? undefined : '4 6'} strokeLinecap="round"
                      markerEnd={directed ? `url(#ar-${e.kind})` : undefined}
                    />
                    {directed && !reduce && (
                      <circle r={hot ? 3.5 : 2.4} fill={col} opacity={nearId && !hot ? 0.32 : 0.9}>
                        <animate attributeName="cx" values={`${A.x};${B.x}`} dur="2.4s" repeatCount="indefinite" />
                        <animate attributeName="cy" values={`${ay};${by}`} dur="2.4s" repeatCount="indefinite" />
                      </circle>
                    )}
                  </g>
                )
              })}
            </svg>
          )}

          {/* binalar (kuleler) */}
          {layout.items.map(({ s, x, y }) => {
            const near = s.habitId === nearId
            const blocks = Math.max(1, s.stage)
            return (
              <div key={s.habitId} className="absolute flex flex-col items-center" style={{ left: x, top: y, transform: 'translate(-50%, -100%)' }}>
                {near && (
                  <div className="mb-1 animate-bob rounded border-2 border-border bg-surface px-2 py-0.5 font-display text-[11px] font-bold text-fg" style={{ boxShadow: '2px 2px 0 0 rgb(var(--c-primary))' }}>⏎ Gir</div>
                )}
                {/* tabela */}
                <div className={near ? 'scale-110 transition-transform' : 'transition-transform'} style={{ filter: near ? `drop-shadow(0 0 9px ${s.color})` : showLinks ? `drop-shadow(0 0 5px ${s.color}aa)` : undefined }}>
                  <span className="text-3xl leading-none">{s.emoji}</span>
                </div>
                {/* kule blokları */}
                {s.stage === 0 ? (
                  <div className="mt-1 h-10 w-12 rounded border-2 border-dashed border-border/60 opacity-50" />
                ) : (
                  <div className="mt-1 flex flex-col-reverse items-center">
                    {Array.from({ length: blocks }).map((_, bi) => (
                      <div key={bi} className="border-2 border-border" style={{ width: 58 - bi * 4, height: 18, background: s.color, boxShadow: s.doneToday ? `0 0 0 0 ${s.color}` : undefined }} />
                    ))}
                  </div>
                )}
                {/* etiket */}
                <div className="mt-1 flex max-w-[120px] items-center gap-1 rounded border-2 border-border bg-surface px-1.5 py-0.5">
                  <span className="truncate font-display text-[11px] font-semibold text-fg">{s.name}</span>
                </div>
                <div className="mt-0.5 flex items-center gap-1 text-[10px]">
                  {s.streak >= 2 && <span className="text-xp">🔥{s.streak}</span>}
                  {s.isLandmark && <span>👑</span>}
                  {s.damaged && <span>🛠</span>}
                  {s.doneToday && <span className="text-success">✓</span>}
                </div>
              </div>
            )
          })}

          {/* karakter */}
          <div ref={charRef} className="absolute z-10" style={{ left: pos.current.x, top: pos.current.y }}>
            {/* gölge */}
            <div className="absolute left-1/2 top-full h-2 w-7 -translate-x-1/2 rounded-full bg-black/25 blur-[1px]" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/brix/walk.gif" alt="" width={42} height={67} className="pixelated" style={{ imageRendering: 'pixelated' }} draggable={false} />
          </div>

          {structs.length === 0 && (
            <div className="absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center" style={{ left: layout.W / 2, top: layout.H / 2 - 120 }}>
              <span className="text-4xl opacity-50">🏗️</span>
              <p className="mt-2 font-display text-sm font-bold text-fg">Diyarın çorak</p>
              <p className="text-xs text-muted">İlk alışkanlığını tamamla, ilk kulen yükselsin.</p>
            </div>
          )}
        </div>
        )}

        {/* GRAF modu — force-directed second mind */}
        {mode === 'graph' && (
          <RealmGraph
            nodes={mind.nodes}
            edges={mind.edges}
            onOpen={(n) => {
              if (n.type === 'habit') setOpenId(n.id)
              else { const it = (data.brainDump || []).find(x => 'note:' + x.id === n.id); setOpenNote(it?.text || n.label) }
            }}
          />
        )}

        {/* HUD üst */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 flex items-start justify-between gap-2 p-3">
          <div className="pointer-events-auto rounded border-2 border-border bg-surface/90 px-3 py-2 brix-bevel-sm">
            <p className="font-display text-sm font-bold text-fg">{data.profile.realmName || 'Diyarım'}</p>
            <p className="text-[11px] text-muted">{world.phase.label} · {world.population.toLocaleString('tr-TR')} nüfus · {SEASON_EMOJI[world.season]} {WEATHER_EMOJI[world.weather]}</p>
          </div>
          <div className="pointer-events-auto flex items-center gap-1.5">
            <button onClick={() => setMode(m => m === 'explore' ? 'graph' : 'explore')} title="Keşif / Graf modu" className="inline-flex items-center gap-1 rounded border-2 border-border bg-surface px-2.5 py-1.5 font-display text-xs font-bold text-fg hover:-translate-y-px">{mode === 'explore' ? '🕸️ Graf' : '🎮 Keşif'}</button>
            {mode === 'explore' && <button onClick={() => setShowLinks(v => !v)} title="Bağlantılar (L)" className={`inline-flex items-center gap-1 rounded border-2 border-border px-2.5 py-1.5 font-display text-xs font-bold hover:-translate-y-px ${showLinks ? 'bg-primary text-bg' : 'bg-surface text-fg'}`}>🔗 Ağ</button>}
            <Link href="/diyar" className="inline-flex items-center gap-1 rounded border-2 border-border bg-surface px-2.5 py-1.5 font-display text-xs font-bold text-fg hover:-translate-y-px"><ArrowLeft size={13} /> Diyar</Link>
            <button onClick={() => window.close()} title="Sekmeyi kapat" className="inline-flex items-center justify-center rounded border-2 border-border bg-surface p-1.5 text-fg hover:-translate-y-px"><X size={14} /></button>
          </div>
        </div>

        {/* başlık rozeti */}
        <div className="pointer-events-none absolute left-1/2 top-3 z-20 -translate-x-1/2">
          <span className="inline-flex items-center gap-1.5 rounded border-2 border-border bg-primary/15 px-2.5 py-1 font-display text-xs font-bold text-fg"><Gamepad2 size={13} className="text-primary" /> Diyar Keşif</span>
        </div>

        {/* nöral-ağ efsanesi */}
        {showLinks && (
          <div className="pointer-events-none absolute left-1/2 top-12 z-20 flex -translate-x-1/2 flex-wrap items-center justify-center gap-x-3 gap-y-0.5 rounded border-2 border-border bg-surface/85 px-2.5 py-1 font-display text-[10px] text-muted">
            <span className="flex items-center gap-1"><span className="inline-block h-[3px] w-4 rounded" style={{ background: '#7b95ff' }} /> Rutin</span>
            <span className="flex items-center gap-1"><span className="inline-block h-[3px] w-4 rounded" style={{ background: '#ffa447' }} /> Zincir</span>
            <span className="flex items-center gap-1"><span className="inline-block h-[3px] w-4 rounded" style={{ background: '#b482ff' }} /> İstif</span>
            <span className="flex items-center gap-1"><span className="inline-block h-[3px] w-4 rounded" style={{ background: '#3caa6e' }} /> Not</span>
            <span className="flex items-center gap-1"><span className="inline-block h-0 w-4 border-t-2 border-dashed border-muted" /> Kategori</span>
          </div>
        )}

        {/* kontrol ipucu */}
        <p className="pointer-events-none absolute bottom-3 left-1/2 z-20 -translate-x-1/2 text-center font-display text-[11px] text-muted">
          {mode === 'explore' ? <>WASD / oklarla gez · binaya yaklaş · <span className="text-fg">⏎ Enter</span> ile gir</> : 'Düğümü sürükle · tekerlek ile yakınlaştır · düğüme tıkla'}
        </p>

        {mode === 'explore' && <>
        {/* dokunmatik D-pad */}
        <div className="absolute bottom-5 left-5 z-20 grid grid-cols-3 grid-rows-3 gap-1" style={{ width: 132, height: 132 }}>
          {([['up', '↑', 'col-start-2'], ['left', '←', 'row-start-2'], ['right', '→', 'row-start-2 col-start-3'], ['down', '↓', 'row-start-3 col-start-2']] as const).map(([dir, sym, cls]) => (
            <button
              key={dir}
              className={`flex items-center justify-center rounded border-2 border-border bg-surface/90 font-display text-lg font-bold text-fg active:bg-primary active:text-bg ${cls}`}
              onPointerDown={(e) => { e.preventDefault(); press(dir, true) }}
              onPointerUp={() => press(dir, false)}
              onPointerLeave={() => press(dir, false)}
              onPointerCancel={() => press(dir, false)}
              aria-label={dir}
            >{sym}</button>
          ))}
        </div>

        {/* aksiyon (Gir) */}
        <button
          onClick={() => { if (nearRef.current) setOpenId(nearRef.current) }}
          disabled={!nearId}
          className="absolute bottom-9 right-6 z-20 flex h-16 w-16 items-center justify-center rounded-full border-2 border-border bg-primary font-display text-sm font-bold text-bg shadow-glow disabled:opacity-40 active:translate-y-px"
          aria-label="Gir"
        >GİR</button>
        </>}

        {/* BİNA DETAY (içine gir) */}
        {open && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setOpenId(null)} />
            <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-lg border-2 border-border bg-surface brix-bevel" style={{ animation: 'brixEnter .3s cubic-bezier(.16,1,.3,1) both' }}>
              <div className="flex items-center gap-2 border-b-2 border-border px-4 py-2.5" style={{ background: open.color + '22' }}>
                <span className="text-2xl leading-none">{open.emoji}</span>
                <div className="min-w-0">
                  <p className="truncate font-display text-sm font-bold text-fg">{open.name}</p>
                  <p className="text-[11px] text-muted">{STAGE_LABEL[open.stage]} {open.isLandmark && '· 👑 Simge yapı'}</p>
                </div>
                <button onClick={() => setOpenId(null)} className="ml-auto flex h-7 w-7 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px"><X size={14} /></button>
              </div>
              <div className="space-y-3 p-4">
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="rounded border-2 border-border bg-surface-2 py-2"><p className="font-display text-lg font-bold text-fg">{open.completions}</p><p className="text-[10px] text-muted">tamamlama</p></div>
                  <div className="rounded border-2 border-border bg-surface-2 py-2"><p className="font-display text-lg font-bold text-xp">{open.streak}</p><p className="text-[10px] text-muted">streak 🔥</p></div>
                  <div className="rounded border-2 border-border bg-surface-2 py-2"><p className="font-display text-lg font-bold text-fg">Lv{open.stage}</p><p className="text-[10px] text-muted">seviye</p></div>
                </div>
                <div>
                  <div className="mb-1 flex items-center justify-between text-[11px] text-muted">
                    <span>{oNext ? `Sonraki: ${STAGE_LABEL[open.stage + 1] ?? ''}` : 'En üst seviye 🏰'}</span>
                    {oNext && <span>{open.completions}/{oNext}</span>}
                  </div>
                  <div className="h-2.5 overflow-hidden rounded-full bg-surface-2 border border-border">
                    <div className="h-full rounded-full" style={{ width: `${oPct}%`, background: open.color }} />
                  </div>
                </div>
                <p className="text-xs text-muted">
                  {open.doneToday ? <span className="font-medium text-success">Bugün tamamlandı — yapı parlıyor! ✨</span> : 'Bugün bu yapıyı tamamla, seviye atlasın.'}
                </p>
                {(() => {
                  const cs = connOf(open.habitId)
                  return (
                    <div className="border-t border-border/60 pt-2.5">
                      <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-2">🔗 Bağlantılar</p>
                      {cs.length > 0 ? (
                        <div className="flex flex-wrap gap-1.5">
                          {cs.map((c, i) => (
                            <span key={i} className="rounded border-2 border-border bg-surface-2 px-2 py-0.5 text-[11px] text-fg">
                              {labelOf(c.other)} <span className="text-muted-2">· {c.kind}</span>
                            </span>
                          ))}
                        </div>
                      ) : (
                        <p className="text-[11px] text-muted-2">Bağlantı yok — Rutin veya Zincir&apos;e ekleyerek bu yapıyı başkalarına bağla.</p>
                      )}
                    </div>
                  )
                })()}
                <div className="flex gap-2">
                  <Link href={`/diyar/${open.habitId}`} className="flex-1 rounded px-3 py-2 text-center text-sm font-bold text-bg brix-bevel-sm font-display" style={{ background: open.color }}>Detay sayfası</Link>
                  <button onClick={() => setOpenId(null)} className="rounded border-2 border-border bg-surface px-3 py-2 text-sm font-bold text-fg font-display hover:-translate-y-px">Devam</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* NOT PANELİ (📝 düğümüne tıklayınca) */}
        {openNote !== null && (
          <div className="absolute inset-0 z-30 flex items-center justify-center p-4" role="dialog" aria-modal="true">
            <div className="absolute inset-0 bg-black/55 backdrop-blur-sm" onClick={() => setOpenNote(null)} />
            <div className="relative z-10 w-full max-w-sm overflow-hidden rounded-lg border-2 border-border bg-surface brix-bevel" style={{ animation: 'brixEnter .3s cubic-bezier(.16,1,.3,1) both' }}>
              <div className="flex items-center gap-2 border-b-2 border-border px-4 py-2.5" style={{ background: '#3caa6e22' }}>
                <span className="text-xl leading-none">📝</span>
                <p className="font-display text-sm font-bold text-fg">Not</p>
                <button onClick={() => setOpenNote(null)} className="ml-auto flex h-7 w-7 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px"><X size={14} /></button>
              </div>
              <div className="space-y-3 p-4">
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-fg">{openNote}</p>
                <div className="flex gap-2">
                  <Link href="/braindump" className="flex-1 rounded bg-primary px-3 py-2 text-center text-sm font-bold text-bg brix-bevel-sm font-display">Beyin Boşalt&apos;ta aç</Link>
                  <button onClick={() => setOpenNote(null)} className="rounded border-2 border-border bg-surface px-3 py-2 text-sm font-bold text-fg font-display hover:-translate-y-px">Kapat</button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
