'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, X, Power, ChevronRight } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'

interface FileItem { id: string; emoji: string; label: string; meta?: string; href: string }
interface FolderDef { id: string; label: string; accent: string; desc: string; href: string; files: FileItem[] }

const MOOD_EMOJI = ['', '😞', '😕', '😐', '🙂', '😄']

function fmtDay(iso: string): string {
  try { return format(new Date(iso), 'd MMM', { locale: tr }) } catch { return '' }
}

type Phase = 'boot' | 'desktop'

export function BrixComputer() {
  const { data } = useStore()
  const screenRef = useRef<HTMLDivElement>(null)

  const [phase, setPhase] = useState<Phase>('boot')
  const [pct, setPct] = useState(0)
  const [started, setStarted] = useState(false)
  const [openId, setOpenId] = useState<string | null>(null)
  const [origin, setOrigin] = useState({ x: 50, y: 50 })
  const [hover, setHover] = useState<string | null>(null)
  const [clock, setClock] = useState('')

  // klasörler + gerçek "dosyalar" (app verisinden)
  const folders = useMemo<FolderDef[]>(() => {
    const habits = (data.habits ?? []).filter(h => !h.archived)
    const moods = [...(data.moods ?? [])].slice(-6).reverse()
    const focus = [...(data.focusSessions ?? [])].slice(-6).reverse()
    const accounts = data.budgetAccounts ?? []
    return [
      {
        id: 'aliskanlik', label: 'Alışkanlıklar', accent: '74 124 89', href: '/habits',
        desc: 'Alışkanlıkların burada. Bir dosyaya dokun, takibe geç.',
        files: [
          { id: 'new-h', emoji: '＋', label: 'Yeni alışkanlık', href: '/habits' },
          ...habits.slice(0, 8).map(h => ({ id: h.id, emoji: h.emoji || '✅', label: h.name, meta: 'alışkanlık', href: '/habits' })),
        ],
      },
      {
        id: 'odak', label: 'Odak', accent: '123 149 255', href: '/focus',
        desc: 'Derin çalışma seansların.',
        files: [
          { id: 'new-f', emoji: '⏱️', label: 'Yeni odak seansı', href: '/focus' },
          ...focus.map(s => ({ id: s.id, emoji: '🎯', label: `${s.minutes} dk seans`, meta: fmtDay(s.completedAt), href: '/focus' })),
          { id: 'flow', emoji: '🌊', label: 'Akış durumu', href: '/bugun' },
        ],
      },
      {
        id: 'oyun', label: 'Macera', accent: '180 130 255', href: '/seferler',
        desc: 'XP, rütbe, seferler, ödüller.',
        files: [
          { id: 's', emoji: '🚩', label: 'Seferler', href: '/seferler' },
          { id: 'a', emoji: '🏆', label: 'Başarımlar', href: '/achievements' },
          { id: 'sk', emoji: '🌐', label: 'Beceri Ağacı', href: '/skills' },
          { id: 'r', emoji: '🎁', label: 'Ödüller', href: '/rewards' },
          { id: 'g', emoji: '🎮', label: 'Mini Oyun', href: '/arcade' },
        ],
      },
      {
        id: 'ruh', label: 'Ruh Hali', accent: '63 143 90', href: '/mood',
        desc: 'Son ruh hali kayıtların.',
        files: [
          { id: 'new-m', emoji: '＋', label: 'Bugünü kaydet', href: '/mood' },
          ...moods.map(m => ({ id: m.id, emoji: MOOD_EMOJI[m.level] || '🙂', label: (m.note && m.note.slice(0, 18)) || 'Kayıt', meta: fmtDay(m.createdAt), href: '/mood' })),
        ],
      },
      {
        id: 'gelisim', label: 'Gelişim', accent: '249 166 32', href: '/insights',
        desc: 'Koç, haftalık bakış, içgörüler.',
        files: [
          { id: 'c', emoji: '💬', label: 'Koç', href: '/coach' },
          { id: 'w', emoji: '🗓️', label: 'Haftalık Bakış', href: '/weekly-review' },
          { id: 'i', emoji: '💡', label: 'İçgörüler', href: '/insights' },
          { id: 'st', emoji: '📊', label: 'İstatistik', href: '/stats' },
          { id: 'fl', emoji: '✉️', label: 'Gelecek Benlik', href: '/gelecek' },
        ],
      },
      {
        id: 'finans', label: 'Finans', accent: '183 71 42', href: '/budget',
        desc: 'Hesapların ve bütçen.',
        files: [
          { id: 'bud', emoji: '📒', label: 'Bütçeyi aç', href: '/budget' },
          ...accounts.slice(0, 6).map(a => ({ id: a.id, emoji: a.type === 'cash' ? '💵' : a.type === 'card' ? '💳' : '🏦', label: a.name, meta: 'hesap', href: '/budget' })),
        ],
      },
    ]
  }, [data])

  const openFolder = folders.find(f => f.id === openId) ?? null

  // canlı saat (SSR uyumsuzluğu olmasın diye boş başlar)
  useEffect(() => {
    const set = () => setClock(format(new Date(), 'HH:mm'))
    set()
    const t = setInterval(set, 30000)
    return () => clearInterval(t)
  }, [])

  // görünür olunca boot başlasın
  useEffect(() => {
    const el = screenRef.current
    if (!el || started) return
    if (!('IntersectionObserver' in window)) { setStarted(true); return }
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { setStarted(true); io.disconnect() } }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [started])

  // boot 0 -> %100
  useEffect(() => {
    if (!started || phase !== 'boot') return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setPct(100); const t = setTimeout(() => setPhase('desktop'), 200); return () => clearTimeout(t) }
    let raf = 0
    const start = performance.now()
    const DUR = 2100
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR)
      setPct(Math.round((1 - Math.pow(1 - t, 2)) * 100))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setTimeout(() => setPhase('desktop'), 480)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, phase])

  function clickFolder(id: string, e: React.MouseEvent<HTMLButtonElement>) {
    const screen = screenRef.current
    const btn = e.currentTarget
    if (screen) {
      const sr = screen.getBoundingClientRect()
      const br = btn.getBoundingClientRect()
      setOrigin({
        x: Math.round(((br.left + br.width / 2) - sr.left) / sr.width * 100),
        y: Math.round(((br.top + br.height / 2) - sr.top) / sr.height * 100),
      })
    }
    setOpenId(id)
  }

  function reboot() { setPhase('boot'); setPct(0); setStarted(false); setOpenId(null) }

  const bootLines = ['manage_os başlatılıyor…', 'modüller yükleniyor…', 'klasörler hazırlanıyor…', 'hazır!']
  const bootStep = Math.min(bootLines.length - 1, Math.floor(pct / 27))

  return (
    <section className="relative">
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 rounded border-2 border-border bg-accent/20 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-fg font-display">
          Sistem
        </span>
        <h2 className="mt-3 text-2xl font-bold text-fg sm:text-3xl">Bilgisayarı aç, klasörüne gir</h2>
        <p className="mt-1 text-sm text-muted">Sistem %100 yüklenince bir klasöre tıkla — pencere açılır, dosyalarına girersin.</p>
      </div>

      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg bg-surface-2 p-3 brix-bevel sm:p-4">
          {/* üst çıta */}
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="h-3 w-3 rounded-full border-2 border-border" style={{ background: phase === 'boot' ? 'rgb(var(--c-danger))' : 'rgb(var(--c-success))' }} />
            <span className="font-display text-sm text-muted">manage_os v1.0</span>
            <button onClick={reboot} title="Yeniden başlat" className="ml-auto text-muted hover:text-fg"><Power size={15} /></button>
          </div>

          {/* EKRAN */}
          <div ref={screenRef} className="brix-screen brix-crt relative aspect-[16/10] overflow-hidden rounded-md" style={{ background: 'rgb(var(--c-bg))' }}>
            {/* BOOT */}
            <div className={cn('absolute inset-0 z-30 flex flex-col items-center justify-center gap-4 transition-opacity duration-500', phase === 'boot' ? 'opacity-100' : 'pointer-events-none opacity-0')} style={{ background: '#1b1410' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brix/walk.gif" alt="" width={56} height={90} className="pixelated" style={{ imageRendering: 'pixelated' }} />
              <p className="font-display text-base tracking-widest text-[#ffd9b3]" style={{ animation: 'brixBootBlink 1s steps(2) infinite' }}>
                {bootLines[bootStep]}
              </p>
              <div className="h-4 w-2/3 max-w-xs overflow-hidden rounded border-2 border-[#ffd9b3]/70 bg-black/40">
                <div className="h-full bg-[#f9a620] transition-[width] duration-100" style={{ width: `${pct}%` }} />
              </div>
              <p className="font-display text-3xl font-bold tabular-nums text-[#f9a620]">%{pct}</p>
            </div>

            {/* DESKTOP */}
            <div className={cn('absolute inset-0 flex flex-col transition-all duration-500', phase === 'desktop' ? 'opacity-100' : 'pointer-events-none scale-95 opacity-0')}>
              <div className="flex items-center gap-2 border-b-2 border-border bg-surface px-3 py-1.5">
                <span className="font-display text-sm font-bold text-fg">⌂ Masaüstü</span>
                <span className="ml-auto font-display text-sm text-muted">{folders.length} klasör</span>
              </div>

              <div className="grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto p-3 sm:gap-4 sm:p-5">
                {folders.map(f => (
                  <button
                    key={f.id}
                    onClick={(e) => clickFolder(f.id, e)}
                    onMouseEnter={() => setHover(f.id)}
                    onMouseLeave={() => setHover(h => (h === f.id ? null : h))}
                    className="group flex flex-col items-center gap-1.5 rounded p-2 transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={hover === f.id ? '/brix/folder-open.png' : '/brix/folder.png'} alt="" width={56} height={56} className="pixelated h-12 w-12 sm:h-14 sm:w-14" style={{ imageRendering: 'pixelated' }} />
                    <span className="max-w-full truncate rounded border-2 border-border bg-surface px-1.5 py-0.5 font-display text-xs font-semibold text-fg" style={{ boxShadow: `2px 2px 0 0 rgb(${f.accent})` }}>
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 border-t-2 border-border bg-surface px-3 py-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brix/walk.gif" alt="" width={18} height={29} className="pixelated" style={{ imageRendering: 'pixelated' }} />
                <span className="font-display text-xs text-muted">hazır</span>
                <span className="ml-auto font-display text-xs font-bold text-fg tabular-nums">{clock}</span>
              </div>
            </div>

            {/* PENCERE (klasör içi) */}
            {openFolder && (
              <div className="absolute inset-0 z-40">
                {/* karartma */}
                <div className="absolute inset-0 bg-black/40" onClick={() => setOpenId(null)} />
                {/* pencere */}
                <div
                  className="absolute inset-2 flex flex-col overflow-hidden rounded bg-surface brix-bevel"
                  style={{ transformOrigin: `${origin.x}% ${origin.y}%`, animation: 'brixWindowOpen .28s cubic-bezier(.16,1,.3,1)' }}
                >
                  {/* başlık çubuğu */}
                  <div className="flex items-center gap-2 border-b-2 border-border px-3 py-2" style={{ background: `rgb(${openFolder.accent} / 0.16)` }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brix/folder-open.png" alt="" width={22} height={22} className="pixelated" style={{ imageRendering: 'pixelated' }} />
                    <span className="font-display text-sm font-bold text-fg">{openFolder.label}</span>
                    <button onClick={() => setOpenId(null)} className="ml-auto flex h-6 w-6 items-center justify-center rounded border-2 border-border bg-surface text-fg transition-transform hover:-translate-y-0.5" aria-label="Kapat">
                      <X size={13} />
                    </button>
                  </div>

                  {/* breadcrumb */}
                  <div className="flex items-center gap-1 border-b border-border/60 px-3 py-1.5 text-xs text-muted font-display">
                    <span>⌂ Masaüstü</span><ChevronRight size={12} /><span className="text-fg">{openFolder.label}</span>
                  </div>

                  {/* dosyalar */}
                  <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                    <p className="mb-3 text-xs text-muted">{openFolder.desc}</p>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 sm:gap-3">
                      {openFolder.files.map((file, i) => (
                        <Link
                          key={file.id}
                          href={file.href}
                          className="flex flex-col items-center gap-1 rounded border-2 border-border bg-surface-2 p-2 text-center transition-transform hover:-translate-y-0.5 hover:border-border-hover"
                          style={{ animation: `brixFileIn .3s ease-out both`, animationDelay: `${Math.min(i, 10) * 35}ms` }}
                        >
                          <span className="text-2xl leading-none">{file.emoji}</span>
                          <span className="w-full truncate text-[11px] font-medium text-fg">{file.label}</span>
                          {file.meta && <span className="text-[10px] text-muted-2">{file.meta}</span>}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* alt: tümünü aç */}
                  <div className="border-t-2 border-border bg-surface px-3 py-2">
                    <Link
                      href={openFolder.href}
                      className="inline-flex items-center gap-2 rounded px-4 py-2 text-sm font-bold text-bg brix-bevel-sm transition-transform hover:-translate-y-0.5 font-display"
                      style={{ background: `rgb(${openFolder.accent})` }}
                    >
                      Tümünü aç <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* monitör ayağı */}
        <div className="mx-auto -mt-px h-5 w-16 brix-bevel-sm" style={{ background: 'rgb(var(--c-surface2))', borderTopWidth: 0 }} />
        <div className="mx-auto h-2 w-40 rounded-b bg-border-hover/70" />
      </div>
    </section>
  )
}
