'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Crosshair, Search } from 'lucide-react'

export type GNodeType = 'habit' | 'note' | 'rutin' | 'zincir' | 'wonder' | 'hero' | 'kategori' | 'basari' | 'mektup' | 'soz'
export interface GNode { id: string; type: GNodeType; label: string; emoji: string; color: string; stage?: number }
export interface GEdge { a: string; b: string; kind: 'rutin' | 'zincir' | 'kategori' | 'istif' | 'not' | 'wonder' | 'kok' }

const EDGE_COL: Record<GEdge['kind'], string> = {
  rutin: '#7b95ff', zincir: '#ffa447', kategori: 'rgb(var(--c-muted))', istif: '#b482ff', not: '#3caa6e', wonder: '#e0b341', kok: 'rgb(var(--c-muted))',
}
const DIRECTED = new Set(['rutin', 'zincir', 'istif', 'not', 'wonder'])
const BOXY = new Set(['rutin', 'zincir', 'wonder', 'hero', 'kategori'])
const POS_KEY = 'manage_mind_pos'

export function RealmGraph({ nodes, edges, onOpen }: { nodes: GNode[]; edges: GEdge[]; onOpen: (n: GNode) => void }) {
  const viewRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const nodeEls = useRef<Map<string, HTMLButtonElement>>(new Map())
  const lineEls = useRef<(SVGLineElement | null)[]>([])
  const pos = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map())
  const view = useRef({ scale: 1, ox: 0, oy: 0 })
  const drag = useRef<{ id: string | null; moved: boolean; px: number; py: number }>({ id: null, moved: false, px: 0, py: 0 })
  const pan = useRef({ on: false, px: 0, py: 0 })
  const hovered = useRef<string | null>(null)
  const qRef = useRef('')
  const [q, setQ] = useState('')
  const [reduce, setReduce] = useState(false)
  useEffect(() => { setReduce(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false) }, [])
  useEffect(() => { qRef.current = q.trim().toLowerCase() }, [q])

  const adj = useMemo(() => {
    const m = new Map<string, Set<string>>()
    for (const e of edges) { (m.get(e.a) ?? m.set(e.a, new Set()).get(e.a)!).add(e.b); (m.get(e.b) ?? m.set(e.b, new Set()).get(e.b)!).add(e.a) }
    return m
  }, [edges])
  const sizeOf = useMemo(() => {
    const deg = new Map<string, number>()
    for (const e of edges) { deg.set(e.a, (deg.get(e.a) || 0) + 1); deg.set(e.b, (deg.get(e.b) || 0) + 1) }
    return (n: GNode) => {
      const base = n.type === 'hero' ? 54 : n.type === 'kategori' ? 38 : BOXY.has(n.type) ? 44 : n.type === 'habit' ? 34 : 26
      return Math.round(base + Math.min((deg.get(n.id) || 0) * 2.5, 18))
    }
  }, [edges])

  // konumlar: kayıtlıysa yükle, yoksa çember
  useEffect(() => {
    let saved: Record<string, { x: number; y: number }> = {}
    try { saved = JSON.parse(localStorage.getItem(POS_KEY) || '{}') } catch {}
    const m = pos.current
    nodes.forEach((n, i) => {
      if (m.has(n.id)) return
      if (saved[n.id]) m.set(n.id, { x: saved[n.id].x, y: saved[n.id].y, vx: 0, vy: 0 })
      else { const a = (i / Math.max(1, nodes.length)) * Math.PI * 2; m.set(n.id, { x: Math.cos(a) * 190 + (Math.random() * 24 - 12), y: Math.sin(a) * 190 + (Math.random() * 24 - 12), vx: 0, vy: 0 }) }
    })
    for (const id of Array.from(m.keys())) if (!nodes.find(n => n.id === id)) m.delete(id)
  }, [nodes])

  const savePos = () => {
    const out: Record<string, { x: number; y: number }> = {}
    for (const [id, p] of pos.current) out[id] = { x: Math.round(p.x), y: Math.round(p.y) }
    try { localStorage.setItem(POS_KEY, JSON.stringify(out)) } catch {}
  }

  // simülasyon + render
  useEffect(() => {
    let raf = 0
    const ids = nodes.map(n => n.id)
    const baseOp = edges.map(e => (e.kind === 'kategori' ? 0.3 : 0.62))
    const step = () => {
      raf = requestAnimationFrame(step)
      const m = pos.current
      if (!reduce) {
        for (let i = 0; i < ids.length; i++) {
          const A = m.get(ids[i]); if (!A) continue
          for (let j = i + 1; j < ids.length; j++) {
            const B = m.get(ids[j]); if (!B) continue
            let dx = A.x - B.x, dy = A.y - B.y, d2 = dx * dx + dy * dy
            if (d2 < 1) { d2 = 1; dx = Math.random(); dy = Math.random() }
            const d = Math.sqrt(d2), f = 5400 / d2
            A.vx += (dx / d) * f; A.vy += (dy / d) * f; B.vx -= (dx / d) * f; B.vy -= (dy / d) * f
          }
        }
        for (const e of edges) {
          const A = m.get(e.a), B = m.get(e.b); if (!A || !B) continue
          const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1
          const f = (d - 158) * 0.016
          A.vx += (dx / d) * f; A.vy += (dy / d) * f; B.vx -= (dx / d) * f; B.vy -= (dy / d) * f
        }
        for (const id of ids) {
          const P = m.get(id); if (!P || drag.current.id === id) continue
          P.vx -= P.x * 0.0035; P.vy -= P.y * 0.0035
          P.vx *= 0.82; P.vy *= 0.82
          const sp = Math.hypot(P.vx, P.vy); if (sp > 14) { P.vx *= 14 / sp; P.vy *= 14 / sp }
          P.x += P.vx; P.y += P.vy
        }
      }
      // odak kümesi (hover ya da arama)
      let focus: Set<string> | null = null
      if (hovered.current) { focus = new Set([hovered.current, ...(adj.get(hovered.current) || [])]) }
      else if (qRef.current) {
        const ms = nodes.filter(n => n.label.toLowerCase().includes(qRef.current)).map(n => n.id)
        if (ms.length) { focus = new Set(ms); for (const id of ms) for (const nb of adj.get(id) || []) focus.add(nb) }
      }
      for (const n of nodes) {
        const el = nodeEls.current.get(n.id); const P = m.get(n.id); if (!el || !P) continue
        el.style.transform = `translate(${P.x}px, ${P.y}px) translate(-50%, -50%)`
        el.style.opacity = focus ? (focus.has(n.id) ? '1' : '0.16') : '1'
      }
      edges.forEach((e, i) => {
        const ln = lineEls.current[i]; const A = m.get(e.a), B = m.get(e.b); if (!ln || !A || !B) return
        ln.setAttribute('x1', String(A.x)); ln.setAttribute('y1', String(A.y)); ln.setAttribute('x2', String(B.x)); ln.setAttribute('y2', String(B.y))
        ln.style.opacity = focus ? ((focus.has(e.a) && focus.has(e.b)) ? '1' : '0.05') : String(baseOp[i])
      })
      if (stageRef.current) stageRef.current.style.transform = `translate(${view.current.ox}px, ${view.current.oy}px) scale(${view.current.scale})`
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [nodes, edges, reduce, adj])

  function toGraph(cx: number, cy: number) {
    const v = viewRef.current!.getBoundingClientRect()
    return { x: (cx - (v.left + v.width / 2 + view.current.ox)) / view.current.scale, y: (cy - (v.top + v.height / 2 + view.current.oy)) / view.current.scale }
  }

  useEffect(() => {
    const move = (e: PointerEvent) => {
      if (drag.current.id) {
        if (Math.abs(e.clientX - drag.current.px) + Math.abs(e.clientY - drag.current.py) > 4) drag.current.moved = true
        const g = toGraph(e.clientX, e.clientY); const P = pos.current.get(drag.current.id)
        if (P) { P.x = g.x; P.y = g.y; P.vx = 0; P.vy = 0 }
      } else if (pan.current.on) {
        view.current.ox += e.clientX - pan.current.px; view.current.oy += e.clientY - pan.current.py
        pan.current.px = e.clientX; pan.current.py = e.clientY
      }
    }
    const up = () => {
      if (drag.current.id) { if (!drag.current.moved) { const n = nodes.find(x => x.id === drag.current.id); if (n) onOpen(n) } else savePos() }
      drag.current = { id: null, moved: false, px: 0, py: 0 }; pan.current.on = false
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  }, [nodes, onOpen])

  useEffect(() => {
    const el = viewRef.current; if (!el) return
    const onWheel = (e: WheelEvent) => { e.preventDefault(); const s = view.current.scale * (e.deltaY < 0 ? 1.12 : 0.89); view.current.scale = Math.max(0.35, Math.min(3, s)) }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const zoom = (f: number) => { view.current.scale = Math.max(0.35, Math.min(3, view.current.scale * f)) }
  const reset = () => { view.current = { scale: 1, ox: 0, oy: 0 } }

  return (
    <div ref={viewRef} data-lenis-prevent onPointerDown={(e) => { pan.current = { on: true, px: e.clientX, py: e.clientY } }} className="absolute inset-0 cursor-grab touch-none overflow-hidden active:cursor-grabbing">
      <div ref={stageRef} className="absolute left-1/2 top-1/2" style={{ width: 0, height: 0 }}>
        <svg className="absolute overflow-visible" style={{ left: 0, top: 0 }} width="1" height="1" aria-hidden="true">
          <defs>
            {(['rutin', 'zincir', 'istif', 'not', 'wonder'] as const).map(k => (
              <marker key={k} id={`g-${k}`} markerWidth="7" markerHeight="7" refX="9" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={EDGE_COL[k]} /></marker>
            ))}
          </defs>
          {edges.map((e, i) => {
            const dashed = e.kind === 'kategori'
            return <line key={i} ref={el => { lineEls.current[i] = el }} stroke={EDGE_COL[e.kind]} strokeWidth={dashed ? 1.4 : 2.4} strokeOpacity={dashed ? 0.3 : 0.62} strokeDasharray={dashed ? '4 6' : undefined} strokeLinecap="round" markerEnd={DIRECTED.has(e.kind) ? `url(#g-${e.kind})` : undefined} />
          })}
        </svg>
        {nodes.map(n => {
          const r = sizeOf(n)
          const hub = BOXY.has(n.type)
          return (
            <button
              key={n.id}
              ref={el => { if (el) nodeEls.current.set(n.id, el); else nodeEls.current.delete(n.id) }}
              onPointerDown={(e) => { e.stopPropagation(); drag.current = { id: n.id, moved: false, px: e.clientX, py: e.clientY } }}
              onPointerEnter={() => { hovered.current = n.id }}
              onPointerLeave={() => { if (hovered.current === n.id) hovered.current = null }}
              className="absolute left-0 top-0 flex cursor-pointer flex-col items-center gap-1"
              style={{ touchAction: 'none' }}
            >
              <span
                className={`flex items-center justify-center border-[3px] ${hub ? 'rounded-xl' : 'rounded-full'}`}
                style={{
                  width: r, height: r,
                  background: 'rgb(var(--c-surface))',
                  borderColor: n.color,
                  borderStyle: n.type === 'note' ? 'dashed' : 'solid',
                  boxShadow: `0 0 0 4px ${n.color}22, 0 0 12px ${n.color}88, 0 2px 5px rgb(0 0 0 / 0.25)`,
                  fontSize: Math.round(r * 0.52),
                }}
              >{n.emoji}</span>
              <span
                className="line-clamp-2 max-w-[140px] rounded border-2 border-border bg-surface px-1.5 py-0.5 text-center font-display text-[11px] font-semibold leading-tight text-fg"
                style={{ boxShadow: `0 2px 0 0 ${n.color}` }}
              >{n.label}</span>
            </button>
          )
        })}
      </div>

      {/* arama */}
      <div className="absolute left-4 top-16 z-10 flex items-center gap-1.5 rounded border-2 border-border bg-surface/90 px-2 py-1">
        <Search size={13} className="text-muted" />
        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Düğüm ara…" className="w-32 bg-transparent text-xs text-fg outline-none placeholder:text-muted-2" />
      </div>
      <span className="absolute left-4 bottom-5 z-10 rounded border-2 border-border bg-surface/90 px-2 py-1 font-display text-[10px] text-muted">{nodes.length} düğüm · {edges.length} bağ</span>

      {/* zoom kontrolleri */}
      <div className="absolute bottom-5 right-5 z-10 flex flex-col gap-1.5">
        <button onClick={() => zoom(1.2)} aria-label="Yakınlaştır" className="flex h-9 w-9 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px"><ZoomIn size={16} /></button>
        <button onClick={() => zoom(0.83)} aria-label="Uzaklaştır" className="flex h-9 w-9 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px"><ZoomOut size={16} /></button>
        <button onClick={reset} aria-label="Sıfırla" className="flex h-9 w-9 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px"><Crosshair size={16} /></button>
      </div>
    </div>
  )
}
