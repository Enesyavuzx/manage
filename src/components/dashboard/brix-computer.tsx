'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X, Power, ChevronRight, Maximize2, Minimize2, Minus } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface FileItem { id: string; emoji: string; label: string; meta?: string; href: string }
interface FolderDef { id: string; label: string; accent: string; desc: string; href: string; files: FileItem[] }
interface Pos { x: number; y: number }
interface WinState { id: string; x: number; y: number; z: number; max: boolean; min: boolean; ox: number; oy: number }

const MOOD_EMOJI = ['', '😞', '😕', '😐', '🙂', '😄']
const ICONS_KEY = 'manage_os_icon_pos'
const DEFAULT_POS: Pos[] = [
  { x: 17, y: 30 }, { x: 50, y: 30 }, { x: 83, y: 30 },
  { x: 17, y: 72 }, { x: 50, y: 72 }, { x: 83, y: 72 },
]

function fmtDay(iso: string): string {
  try { return format(new Date(iso), 'd MMM', { locale: tr }) } catch { return '' }
}

type Phase = 'boot' | 'desktop'

export function BrixComputer() {
  const { data } = useStore()
  const screenRef = useRef<HTMLDivElement>(null)
  const deskRef = useRef<HTMLDivElement>(null)
  const zRef = useRef(10)

  const [phase, setPhase] = useState<Phase>('boot')
  const [pct, setPct] = useState(0)
  const [started, setStarted] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const [clock, setClock] = useState('')
  const [positions, setPositions] = useState<Record<string, Pos>>({})
  const [wins, setWins] = useState<WinState[]>([])

  const folders = useMemo<FolderDef[]>(() => {
    const habits = (data.habits ?? []).filter(h => !h.archived)
    const moods = [...(data.moods ?? [])].slice(-6).reverse()
    const focus = [...(data.focusSessions ?? [])].slice(-6).reverse()
    const accounts = data.budgetAccounts ?? []
    return [
      { id: 'aliskanlik', label: 'Alışkanlıklar', accent: '74 124 89', href: '/habits', desc: 'Alışkanlıkların burada. Bir dosyaya dokun, takibe geç.',
        files: [{ id: 'new-h', emoji: '＋', label: 'Yeni alışkanlık', href: '/habits' }, ...habits.slice(0, 8).map(h => ({ id: h.id, emoji: h.emoji || '✅', label: h.name, meta: 'alışkanlık', href: '/habits' }))] },
      { id: 'odak', label: 'Odak', accent: '123 149 255', href: '/focus', desc: 'Derin çalışma seansların.',
        files: [{ id: 'new-f', emoji: '⏱️', label: 'Yeni odak seansı', href: '/focus' }, ...focus.map(s => ({ id: s.id, emoji: '🎯', label: `${s.minutes} dk seans`, meta: fmtDay(s.completedAt), href: '/focus' })), { id: 'flow', emoji: '🌊', label: 'Akış durumu', href: '/bugun' }] },
      { id: 'oyun', label: 'Macera', accent: '180 130 255', href: '/seferler', desc: 'XP, rütbe, seferler, ödüller.',
        files: [{ id: 's', emoji: '🚩', label: 'Seferler', href: '/seferler' }, { id: 'a', emoji: '🏆', label: 'Başarımlar', href: '/achievements' }, { id: 'sk', emoji: '🌐', label: 'Beceri Ağacı', href: '/skills' }, { id: 'r', emoji: '🎁', label: 'Ödüller', href: '/rewards' }, { id: 'g', emoji: '🎮', label: 'Mini Oyun', href: '/arcade' }] },
      { id: 'ruh', label: 'Ruh Hali', accent: '63 143 90', href: '/mood', desc: 'Son ruh hali kayıtların.',
        files: [{ id: 'new-m', emoji: '＋', label: 'Bugünü kaydet', href: '/mood' }, ...moods.map(m => ({ id: m.id, emoji: MOOD_EMOJI[m.level] || '🙂', label: (m.note && m.note.slice(0, 18)) || 'Kayıt', meta: fmtDay(m.createdAt), href: '/mood' }))] },
      { id: 'gelisim', label: 'Gelişim', accent: '249 166 32', href: '/insights', desc: 'Koç, haftalık bakış, içgörüler.',
        files: [{ id: 'c', emoji: '💬', label: 'Koç', href: '/coach' }, { id: 'w', emoji: '🗓️', label: 'Haftalık Bakış', href: '/weekly-review' }, { id: 'i', emoji: '💡', label: 'İçgörüler', href: '/insights' }, { id: 'st', emoji: '📊', label: 'İstatistik', href: '/stats' }, { id: 'fl', emoji: '✉️', label: 'Gelecek Benlik', href: '/gelecek' }] },
      { id: 'finans', label: 'Finans', accent: '183 71 42', href: '/budget', desc: 'Hesapların ve bütçen.',
        files: [{ id: 'bud', emoji: '📒', label: 'Bütçeyi aç', href: '/budget' }, ...accounts.slice(0, 6).map(a => ({ id: a.id, emoji: a.type === 'cash' ? '💵' : a.type === 'card' ? '💳' : '🏦', label: a.name, meta: 'hesap', href: '/budget' }))] },
    ]
  }, [data])

  const folderById = (id: string) => folders.find(f => f.id === id)
  const topId = wins.filter(w => !w.min).sort((a, b) => b.z - a.z)[0]?.id

  useEffect(() => {
    let saved: Record<string, Pos> = {}
    try { saved = JSON.parse(localStorage.getItem(ICONS_KEY) || '{}') } catch {}
    const next: Record<string, Pos> = {}
    folders.forEach((f, i) => { next[f.id] = saved[f.id] || DEFAULT_POS[i] || { x: 50, y: 50 } })
    setPositions(next)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folders.length])

  useEffect(() => { const s = () => setClock(format(new Date(), 'HH:mm')); s(); const t = setInterval(s, 30000); return () => clearInterval(t) }, [])

  useEffect(() => {
    const el = screenRef.current
    if (!el || started) return
    if (!('IntersectionObserver' in window)) { setStarted(true); return }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setStarted(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el); return () => io.disconnect()
  }, [started])

  useEffect(() => {
    if (!started || phase !== 'boot') return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setPct(100); const t = setTimeout(() => setPhase('desktop'), 200); return () => clearTimeout(t) }
    let raf = 0; const start = performance.now(); const DUR = 2100
    const tick = (now: number) => { const t = Math.min(1, (now - start) / DUR); setPct(Math.round((1 - Math.pow(1 - t, 2)) * 100)); if (t < 1) raf = requestAnimationFrame(tick); else setTimeout(() => setPhase('desktop'), 480) }
    raf = requestAnimationFrame(tick); return () => cancelAnimationFrame(raf)
  }, [started, phase])

  // ----- pencere yönetimi -----
  function openWindow(id: string, ox: number, oy: number) {
    const z = (zRef.current += 1)
    setWins(ws => {
      const ex = ws.find(w => w.id === id)
      if (ex) return ws.map(w => w.id === id ? { ...w, min: false, z } : w)
      const idx = ws.length
      return [...ws, { id, x: 8 + (idx % 5) * 5, y: 8 + (idx % 5) * 5, z, max: false, min: false, ox, oy }]
    })
  }
  function patchWin(id: string, patch: Partial<WinState>) { setWins(ws => ws.map(w => w.id === id ? { ...w, ...patch } : w)) }
  function focusWin(id: string) { patchWin(id, { z: (zRef.current += 1) }) }
  function closeWin(id: string) { setWins(ws => ws.filter(w => w.id !== id)) }
  function taskbarClick(id: string) {
    const w = wins.find(x => x.id === id); if (!w) return
    if (w.min) { patchWin(id, { min: false, z: (zRef.current += 1) }) }
    else if (topId === id) { patchWin(id, { min: true }) }
    else { focusWin(id) }
  }

  // ----- ikon sürükleme / tıklama -----
  function startIconDrag(id: string, e: React.PointerEvent) {
    e.preventDefault()
    const desk = deskRef.current; if (!desk) return
    const rect = desk.getBoundingClientRect()
    const startX = e.clientX, startY = e.clientY
    const base = positions[id] || { x: 50, y: 50 }
    let moved = false
    const onMove = (ev: PointerEvent) => {
      if (Math.abs(ev.clientX - startX) + Math.abs(ev.clientY - startY) > 5) moved = true
      const dx = (ev.clientX - startX) / rect.width * 100
      const dy = (ev.clientY - startY) / rect.height * 100
      setPositions(p => ({ ...p, [id]: { x: Math.max(8, Math.min(92, base.x + dx)), y: Math.max(12, Math.min(88, base.y + dy)) } }))
    }
    const onUp = (ev: PointerEvent) => {
      window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp)
      if (!moved) {
        const r = desk.getBoundingClientRect()
        openWindow(id, Math.round((ev.clientX - r.left) / r.width * 100), Math.round((ev.clientY - r.top) / r.height * 100))
      } else setPositions(p => { try { localStorage.setItem(ICONS_KEY, JSON.stringify(p)) } catch {} ; return p })
    }
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp)
  }

  // ----- pencere sürükleme -----
  function startWinDrag(id: string, e: React.PointerEvent) {
    const w = wins.find(x => x.id === id); if (!w || w.max) return
    e.preventDefault(); focusWin(id)
    const desk = deskRef.current; if (!desk) return
    const rect = desk.getBoundingClientRect()
    const startX = e.clientX, startY = e.clientY
    const base = { x: w.x, y: w.y }
    const onMove = (ev: PointerEvent) => {
      const dx = (ev.clientX - startX) / rect.width * 100
      const dy = (ev.clientY - startY) / rect.height * 100
      patchWin(id, { x: Math.max(0, Math.min(60, base.x + dx)), y: Math.max(0, Math.min(60, base.y + dy)) })
    }
    const onUp = () => { window.removeEventListener('pointermove', onMove); window.removeEventListener('pointerup', onUp) }
    window.addEventListener('pointermove', onMove); window.addEventListener('pointerup', onUp)
  }

  function reboot() { setPhase('boot'); setPct(0); setStarted(false); setWins([]) }

  const bootLines = ['manage_os başlatılıyor…', 'modüller yükleniyor…', 'klasörler hazırlanıyor…', 'hazır!']
  const bootStep = Math.min(bootLines.length - 1, Math.floor(pct / 27))

  return (
    <section className="relative">
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 rounded border-2 border-border bg-accent/20 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-fg font-display">Sistem</span>
        <h2 className="mt-3 text-2xl font-bold text-fg sm:text-3xl">Bilgisayarı aç, klasörüne gir</h2>
        <p className="mt-1 text-sm text-muted">Birden çok klasör aç, pencereleri taşı/büyüt, görev çubuğundan küçült.</p>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg bg-surface-2 p-3 brix-bevel sm:p-4">
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="h-3 w-3 rounded-full border-2 border-border" style={{ background: phase === 'boot' ? 'rgb(var(--c-danger))' : 'rgb(var(--c-success))' }} />
            <span className="font-display text-sm text-muted">manage_os v1.0</span>
            <button onClick={reboot} title="Yeniden başlat" className="ml-auto text-muted hover:text-fg"><Power size={15} /></button>
          </div>

          <div ref={screenRef} className="brix-screen brix-crt relative aspect-[16/10] select-none overflow-hidden rounded-md" style={{ background: 'rgb(var(--c-bg))' }}>
            {/* BOOT */}
            <div className={cn('absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 transition-opacity duration-500', phase === 'boot' ? 'opacity-100' : 'pointer-events-none opacity-0')} style={{ background: '#1b1410' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brix/walk.gif" alt="" width={56} height={90} className="pixelated" style={{ imageRendering: 'pixelated' }} />
              <p className="font-display text-base tracking-widest text-[#ffd9b3]" style={{ animation: 'brixBootBlink 1s steps(2) infinite' }}>{bootLines[bootStep]}</p>
              <div className="h-4 w-2/3 max-w-xs overflow-hidden rounded border-2 border-[#ffd9b3]/70 bg-black/40"><div className="h-full bg-[#f9a620] transition-[width] duration-100" style={{ width: `${pct}%` }} /></div>
              <p className="font-display text-3xl font-bold tabular-nums text-[#f9a620]">%{pct}</p>
            </div>

            {/* DESKTOP */}
            <div className={cn('absolute inset-0 flex flex-col transition-all duration-500', phase === 'desktop' ? 'opacity-100' : 'pointer-events-none scale-95 opacity-0')}>
              <div className="flex items-center gap-2 border-b-2 border-border bg-surface px-3 py-1.5">
                <span className="font-display text-sm font-bold text-fg">⌂ Masaüstü</span>
                <span className="ml-auto font-display text-sm text-muted">{folders.length} klasör</span>
              </div>

              {/* ikon + pencere alanı */}
              <div ref={deskRef} className="relative flex-1 overflow-hidden">
                {/* temaya uyumlu duvar kâğıdı */}
                <div className="pointer-events-none absolute inset-0" style={{ background: 'radial-gradient(85% 60% at 50% -5%, rgb(var(--c-primary) / 0.12), transparent 70%), radial-gradient(70% 60% at 100% 100%, rgb(var(--c-accent) / 0.10), transparent 70%)' }} />
                <div className="pointer-events-none absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(rgb(var(--c-border) / 0.55) 1px, transparent 1px)', backgroundSize: '16px 16px' }} />
                <span className="pointer-events-none absolute bottom-2 left-1/2 -translate-x-1/2 font-display text-[10px] uppercase tracking-[0.3em] text-muted/40">manage_os</span>

                {/* ikonlar */}
                {folders.map(f => {
                  const p = positions[f.id] || { x: 50, y: 50 }
                  return (
                    <button key={f.id} onPointerDown={(e) => startIconDrag(f.id, e)} onMouseEnter={() => setHover(f.id)} onMouseLeave={() => setHover(h => (h === f.id ? null : h))}
                      className="absolute z-0 flex w-20 -translate-x-1/2 -translate-y-1/2 cursor-grab touch-none flex-col items-center gap-1 rounded p-1 active:cursor-grabbing" style={{ left: `${p.x}%`, top: `${p.y}%` }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={hover === f.id || wins.some(w => w.id === f.id) ? '/brix/folder-open.png' : '/brix/folder.png'} alt="" width={52} height={52} className="pixelated h-11 w-11 sm:h-12 sm:w-12" style={{ imageRendering: 'pixelated' }} draggable={false} />
                      <span className="max-w-full truncate rounded border-2 border-border bg-surface px-1.5 py-0.5 font-display text-[11px] font-semibold text-fg" style={{ boxShadow: `2px 2px 0 0 rgb(${f.accent})` }}>{f.label}</span>
                    </button>
                  )
                })}

                {/* pencereler */}
                {wins.map(w => {
                  const f = folderById(w.id); if (!f || w.min) return null
                  return (
                    <div key={w.id} onPointerDown={() => focusWin(w.id)}
                      className={cn('absolute flex flex-col overflow-hidden rounded bg-surface brix-bevel', w.max ? 'inset-1' : '')}
                      style={w.max ? { zIndex: w.z } : { left: `${w.x}%`, top: `${w.y}%`, width: '74%', height: '82%', zIndex: w.z, transformOrigin: `${w.ox}% ${w.oy}%`, animation: 'brixWindowOpen .26s cubic-bezier(.16,1,.3,1)' }}>
                      {/* başlık çubuğu */}
                      <div onPointerDown={(e) => startWinDrag(w.id, e)} className={cn('flex items-center gap-2 border-b-2 border-border px-2.5 py-1.5', w.max ? '' : 'cursor-move')} style={{ background: `rgb(${f.accent} / 0.18)` }}>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src="/brix/folder-open.png" alt="" width={18} height={18} className="pixelated" style={{ imageRendering: 'pixelated' }} draggable={false} />
                        <span className="truncate font-display text-xs font-bold text-fg">{f.label}</span>
                        <div className="ml-auto flex items-center gap-1">
                          <button onClick={() => patchWin(w.id, { min: true })} className="flex h-5 w-5 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px" aria-label="Küçült"><Minus size={11} /></button>
                          <button onClick={() => patchWin(w.id, { max: !w.max })} className="flex h-5 w-5 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px" aria-label={w.max ? 'Küçült' : 'Büyüt'}>{w.max ? <Minimize2 size={10} /> : <Maximize2 size={10} />}</button>
                          <button onClick={() => closeWin(w.id)} className="flex h-5 w-5 items-center justify-center rounded border-2 border-border bg-surface text-fg hover:-translate-y-px" aria-label="Kapat"><X size={11} /></button>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 border-b border-border/60 px-2.5 py-1 text-[11px] text-muted font-display"><span>⌂</span><ChevronRight size={11} /><span className="text-fg">{f.label}</span></div>
                      <div className="flex-1 overflow-y-auto p-3">
                        <p className="mb-2.5 text-[11px] text-muted">{f.desc}</p>
                        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                          {f.files.map((file, i) => (
                            <Link key={file.id} href={file.href} className="flex flex-col items-center gap-1 rounded border-2 border-border bg-surface-2 p-2 text-center transition-transform hover:-translate-y-0.5 hover:border-border-hover" style={{ animation: 'brixFileIn .3s ease-out both', animationDelay: `${Math.min(i, 10) * 30}ms` }}>
                              <span className="text-xl leading-none">{file.emoji}</span>
                              <span className="w-full truncate text-[11px] font-medium text-fg">{file.label}</span>
                              {file.meta && <span className="text-[10px] text-muted-2">{file.meta}</span>}
                            </Link>
                          ))}
                        </div>
                      </div>
                      <div className="border-t-2 border-border bg-surface px-2.5 py-1.5">
                        <Link href={f.href} className="inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-bold text-bg brix-bevel-sm hover:-translate-y-px font-display" style={{ background: `rgb(${f.accent})` }}>Tümünü aç <ArrowRight size={13} /></Link>
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* görev çubuğu */}
              <div className="flex items-center gap-1.5 border-t-2 border-border bg-surface px-2 py-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brix/walk.gif" alt="" width={16} height={26} className="pixelated shrink-0" style={{ imageRendering: 'pixelated' }} />
                <div className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto">
                  {wins.map(w => {
                    const f = folderById(w.id); if (!f) return null
                    const active = topId === w.id && !w.min
                    return (
                      <button key={w.id} data-win={w.id} onClick={() => taskbarClick(w.id)} className={cn('flex shrink-0 items-center gap-1.5 rounded border-2 px-2 py-0.5 font-display text-[11px] font-semibold transition-colors', active ? 'border-border bg-surface-2 text-fg' : 'border-border/60 text-muted hover:text-fg', w.min && 'opacity-60')}>
                        <span className="h-2 w-2 rounded-sm" style={{ background: `rgb(${f.accent})` }} />
                        {f.label}
                      </button>
                    )
                  })}
                </div>
                <span className="ml-auto shrink-0 font-display text-xs font-bold text-fg tabular-nums">{clock}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mx-auto -mt-px h-5 w-16 brix-bevel-sm" style={{ background: 'rgb(var(--c-surface2))', borderTopWidth: 0 }} />
        <div className="mx-auto h-2 w-40 rounded-b bg-border-hover/70" />
      </div>
    </section>
  )
}
