'use client'
import { useEffect, useRef, useState } from 'react'
import { ZoomIn, ZoomOut, Crosshair } from 'lucide-react'

export interface GNode { id: string; type: 'habit' | 'note'; label: string; emoji: string; color: string; stage?: number }
export interface GEdge { a: string; b: string; kind: 'rutin' | 'zincir' | 'kategori' | 'istif' | 'not' }

const EDGE_COL: Record<GEdge['kind'], string> = {
  rutin: '#7b95ff', zincir: '#ffa447', kategori: 'rgb(var(--c-muted))', istif: '#b482ff', not: '#3caa6e',
}
const DIRECTED = new Set(['rutin', 'zincir', 'istif', 'not'])

/** Obsidian tarzı force-directed graf: sürüklenebilir node, zoom, pan, fizik yerleşimi. */
export function RealmGraph({ nodes, edges, onOpen }: { nodes: GNode[]; edges: GEdge[]; onOpen: (n: GNode) => void }) {
  const viewRef = useRef<HTMLDivElement>(null)
  const stageRef = useRef<HTMLDivElement>(null)
  const nodeEls = useRef<Map<string, HTMLButtonElement>>(new Map())
  const lineEls = useRef<(SVGLineElement | null)[]>([])
  const pos = useRef<Map<string, { x: number; y: number; vx: number; vy: number }>>(new Map())
  const view = useRef({ scale: 1, ox: 0, oy: 0 })
  const drag = useRef<{ id: string | null; moved: boolean; px: number; py: number }>({ id: null, moved: false, px: 0, py: 0 })
  const pan = useRef({ on: false, px: 0, py: 0 })
  const [reduce, setReduce] = useState(false)
  useEffect(() => { setReduce(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false) }, [])

  // ilk konumlar (çember) + eski düğümleri temizle
  useEffect(() => {
    const m = pos.current
    nodes.forEach((n, i) => {
      if (!m.has(n.id)) {
        const a = (i / Math.max(1, nodes.length)) * Math.PI * 2
        m.set(n.id, { x: Math.cos(a) * 170 + (Math.random() * 24 - 12), y: Math.sin(a) * 170 + (Math.random() * 24 - 12), vx: 0, vy: 0 })
      }
    })
    for (const id of Array.from(m.keys())) if (!nodes.find(n => n.id === id)) m.delete(id)
  }, [nodes])

  // simülasyon + render
  useEffect(() => {
    let raf = 0
    const ids = nodes.map(n => n.id)
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
            const d = Math.sqrt(d2), f = 4200 / d2
            const fx = (dx / d) * f, fy = (dy / d) * f
            A.vx += fx; A.vy += fy; B.vx -= fx; B.vy -= fy
          }
        }
        for (const e of edges) {
          const A = m.get(e.a), B = m.get(e.b); if (!A || !B) continue
          const dx = B.x - A.x, dy = B.y - A.y, d = Math.hypot(dx, dy) || 1
          const f = (d - 135) * 0.016, fx = (dx / d) * f, fy = (dy / d) * f
          A.vx += fx; A.vy += fy; B.vx -= fx; B.vy -= fy
        }
        for (const id of ids) {
          const P = m.get(id); if (!P || drag.current.id === id) continue
          P.vx -= P.x * 0.0035; P.vy -= P.y * 0.0035
          P.vx *= 0.82; P.vy *= 0.82
          const sp = Math.hypot(P.vx, P.vy); if (sp > 14) { P.vx *= 14 / sp; P.vy *= 14 / sp }
          P.x += P.vx; P.y += P.vy
        }
      }
      for (const n of nodes) { const el = nodeEls.current.get(n.id); const P = m.get(n.id); if (el && P) el.style.transform = `translate(${P.x}px, ${P.y}px) translate(-50%, -50%)` }
      edges.forEach((e, i) => { const ln = lineEls.current[i]; const A = m.get(e.a), B = m.get(e.b); if (ln && A && B) { ln.setAttribute('x1', String(A.x)); ln.setAttribute('y1', String(A.y)); ln.setAttribute('x2', String(B.x)); ln.setAttribute('y2', String(B.y)) } })
      if (stageRef.current) stageRef.current.style.transform = `translate(${view.current.ox}px, ${view.current.oy}px) scale(${view.current.scale})`
    }
    raf = requestAnimationFrame(step)
    return () => cancelAnimationFrame(raf)
  }, [nodes, edges, reduce])

  function toGraph(cx: number, cy: number) {
    const v = viewRef.current!.getBoundingClientRect()
    return { x: (cx - (v.left + v.width / 2 + view.current.ox)) / view.current.scale, y: (cy - (v.top + v.height / 2 + view.current.oy)) / view.current.scale }
  }

  // node sürükleme / arka plan pan
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
      if (drag.current.id && !drag.current.moved) { const n = nodes.find(x => x.id === drag.current.id); if (n) onOpen(n) }
      drag.current = { id: null, moved: false, px: 0, py: 0 }; pan.current.on = false
    }
    window.addEventListener('pointermove', move); window.addEventListener('pointerup', up)
    return () => { window.removeEventListener('pointermove', move); window.removeEventListener('pointerup', up) }
  }, [nodes, onOpen])

  // wheel zoom (non-passive)
  useEffect(() => {
    const el = viewRef.current; if (!el) return
    const onWheel = (e: WheelEvent) => { e.preventDefault(); const s = view.current.scale * (e.deltaY < 0 ? 1.12 : 0.89); view.current.scale = Math.max(0.4, Math.min(2.8, s)) }
    el.addEventListener('wheel', onWheel, { passive: false })
    return () => el.removeEventListener('wheel', onWheel)
  }, [])

  const zoom = (f: number) => { view.current.scale = Math.max(0.4, Math.min(2.8, view.current.scale * f)) }
  const reset = () => { view.current = { scale: 1, ox: 0, oy: 0 } }

  return (
    <div ref={viewRef} data-lenis-prevent onPointerDown={(e) => { pan.current = { on: true, px: e.clientX, py: e.clientY } }} className="absolute inset-0 cursor-grab touch-none overflow-hidden active:cursor-grabbing">
      <div ref={stageRef} className="absolute left-1/2 top-1/2" style={{ width: 0, height: 0 }}>
        <svg className="absolute overflow-visible" style={{ left: 0, top: 0 }} width="1" height="1" aria-hidden="true">
          <defs>
            {(['rutin', 'zincir', 'istif', 'not'] as const).map(k => (
              <marker key={k} id={`g-${k}`} markerWidth="7" markerHeight="7" refX="9" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill={EDGE_COL[k]} /></marker>
            ))}
          </defs>
          {edges.map((e, i) => {
            const dashed = e.kind === 'kategori'
            return <line key={i} ref={el => { lineEls.current[i] = el }} stroke={EDGE_COL[e.kind]} strokeWidth={dashed ? 1.4 : 2.4} strokeOpacity={dashed ? 0.3 : 0.6} strokeDasharray={dashed ? '4 6' : undefined} strokeLinecap="round" markerEnd={DIRECTED.has(e.kind) ? `url(#g-${e.kind})` : undefined} />
          })}
        </svg>
        {nodes.map(n => (
          <button
            key={n.id}
            ref={el => { if (el) nodeEls.current.set(n.id, el); else nodeEls.current.delete(n.id) }}
            onPointerDown={(e) => { e.stopPropagation(); drag.current = { id: n.id, moved: false, px: e.clientX, py: e.clientY } }}
            className="absolute left-0 top-0 flex cursor-pointer flex-col items-center gap-0.5"
            style={{ touchAction: 'none' }}
          >
            <span className="flex items-center justify-center rounded-full border-2 border-border"
              style={{ width: n.type === 'note' ? 32 : 44, height: n.type === 'note' ? 32 : 44, background: n.type === 'note' ? 'rgb(var(--c-surface))' : `${n.color}33`, boxShadow: `0 0 12px ${n.type === 'note' ? '#3caa6e' : n.color}99`, fontSize: n.type === 'note' ? 13 : 20 }}>
              {n.emoji}
            </span>
            <span className="max-w-[96px] truncate rounded border border-border bg-surface/90 px-1 font-display text-[10px] text-fg">{n.label}</span>
          </button>
        ))}
      </div>

      {/* zoom kontrolleri */}
      <div className="absolute bottom-5 right-5 z-10 flex flex-col gap-1.5">
        <button onClick={() => zoom(1.2)} aria-label="Yakınlaştır" className="flex h-9 w-9 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px"><ZoomIn size={16} /></button>
        <button onClick={() => zoom(0.83)} aria-label="Uzaklaştır" className="flex h-9 w-9 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px"><ZoomOut size={16} /></button>
        <button onClick={reset} aria-label="Sıfırla" className="flex h-9 w-9 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px"><Crosshair size={16} /></button>
      </div>
    </div>
  )
}
