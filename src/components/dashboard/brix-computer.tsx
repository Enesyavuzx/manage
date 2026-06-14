'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ArrowRight, Power } from 'lucide-react'
import { cn } from '@/lib/utils'

interface DetailRow { k: string; v: string }
interface FolderDef {
  id: string
  label: string
  accent: string // rgb triplet
  desc: string
  rows: DetailRow[]
  href: string
  cta: string
}

// Brix #job klasörlerinin bizim sisteme uyarlaması.
const FOLDERS: FolderDef[] = [
  {
    id: 'aliskanlik', label: 'Alışkanlıklar', accent: '255 164 71',
    desc: 'Alışkanlıklarını ekle, her gün işaretle ve streak\'ini büyüt. Zincir görünümüyle bağlı alışkanlıkları sırala.',
    rows: [{ k: 'Modül', v: 'Takip' }, { k: 'Mekanik', v: 'Streak + Zincir' }, { k: 'Koruma', v: 'Streak Freeze' }],
    href: '/habits', cta: 'Klasörü aç',
  },
  {
    id: 'odak', label: 'Odak', accent: '123 149 255',
    desc: 'Odak seansı başlat, akış (flow) durumunu izle, dağılmadan çalış. Her seans XP kazandırır.',
    rows: [{ k: 'Modül', v: 'Derin Çalışma' }, { k: 'Sayaç', v: 'Pomodoro' }, { k: 'Ödül', v: 'Akış XP' }],
    href: '/focus', cta: 'Klasörü aç',
  },
  {
    id: 'oyun', label: 'Macera', accent: '180 130 255',
    desc: 'Görevleri tamamla, XP kazan, seviye atla, rütbeni yükselt. Seferler ve sezonlarla diyarını büyüt.',
    rows: [{ k: 'Modül', v: 'Oyun' }, { k: 'İlerleme', v: 'XP · Rütbe' }, { k: 'Etkinlik', v: 'Seferler' }],
    href: '/seferler', cta: 'Klasörü aç',
  },
  {
    id: 'ruh', label: 'Ruh Hali', accent: '60 190 130',
    desc: 'Gününün ruh hâlini ve enerjini kaydet; hangi alışkanlığın seni nasıl etkilediğini gör.',
    rows: [{ k: 'Modül', v: 'Mood' }, { k: 'Ölçüm', v: 'Enerji' }, { k: 'Çıktı', v: 'İçgörü' }],
    href: '/mood', cta: 'Klasörü aç',
  },
  {
    id: 'gelisim', label: 'Gelişim', accent: '255 138 76',
    desc: 'Koçunla konuş, haftalık bakış yap, istatistiklerinle ilerlemeni zaman içinde gör.',
    rows: [{ k: 'Modül', v: 'Koç' }, { k: 'Döngü', v: 'Haftalık' }, { k: 'Veri', v: 'İstatistik' }],
    href: '/insights', cta: 'Klasörü aç',
  },
  {
    id: 'finans', label: 'Finans', accent: '236 110 160',
    desc: 'Hesaplarını ve harcamalarını takip et, bütçe hedefleri koy, grafiklerle nereye gittiğini gör.',
    rows: [{ k: 'Modül', v: 'Bütçe' }, { k: 'Plan', v: 'Hedefler' }, { k: 'Görsel', v: 'Grafikler' }],
    href: '/budget', cta: 'Klasörü aç',
  },
]

type Phase = 'boot' | 'desktop' | 'folder'

export function BrixComputer() {
  const rootRef = useRef<HTMLDivElement>(null)
  const [phase, setPhase] = useState<Phase>('boot')
  const [pct, setPct] = useState(0)
  const [active, setActive] = useState<string | null>(null)
  const [hover, setHover] = useState<string | null>(null)
  const [started, setStarted] = useState(false)

  // görünür olunca boot'u başlat
  useEffect(() => {
    const el = rootRef.current
    if (!el || started) return
    if (!('IntersectionObserver' in window)) { setStarted(true); return }
    const io = new IntersectionObserver((entries) => {
      if (entries.some(e => e.isIntersecting)) { setStarted(true); io.disconnect() }
    }, { threshold: 0.3 })
    io.observe(el)
    return () => io.disconnect()
  }, [started])

  // boot ilerlemesi 0 → %100
  useEffect(() => {
    if (!started || phase !== 'boot') return
    const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
    if (reduce) { setPct(100); const t = setTimeout(() => setPhase('desktop'), 250); return () => clearTimeout(t) }
    let raf = 0
    const start = performance.now()
    const DUR = 2100
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / DUR)
      const eased = 1 - Math.pow(1 - t, 2)
      setPct(Math.round(eased * 100))
      if (t < 1) raf = requestAnimationFrame(tick)
      else setTimeout(() => setPhase('desktop'), 500)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [started, phase])

  const activeFolder = FOLDERS.find(f => f.id === active) ?? null

  function enter(id: string) { setActive(id); setPhase('folder') }
  function back() { setPhase('desktop') }
  function reboot() { setPhase('boot'); setPct(0); setStarted(false); setActive(null) }

  return (
    <section ref={rootRef} className="relative">
      {/* başlık */}
      <div className="mb-4">
        <span className="inline-flex items-center gap-1.5 rounded border-2 border-border bg-accent/15 px-2 py-1 text-xs font-semibold uppercase tracking-wider text-fg font-display">
          Sistem
        </span>
        <h2 className="mt-3 text-2xl font-bold text-fg sm:text-3xl">Bilgisayarı aç, klasörüne gir</h2>
        <p className="mt-1 text-sm text-muted">Sistem %100 yüklendiğinde bir klasöre tıkla — içine girersin.</p>
      </div>

      {/* MONİTÖR */}
      <div className="mx-auto w-full max-w-3xl">
        <div className="rounded-lg bg-surface-2 p-3 brix-bevel sm:p-4">
          {/* üst çıta */}
          <div className="mb-2 flex items-center gap-2 px-1">
            <span className="h-3 w-3 rounded-full border-2 border-border" style={{ background: phase === 'boot' ? 'rgb(var(--c-danger))' : 'rgb(var(--c-success))' }} />
            <span className="font-display text-sm text-muted">manage_os v1.0</span>
            <button onClick={reboot} title="Yeniden başlat" className="ml-auto text-muted hover:text-fg">
              <Power size={15} />
            </button>
          </div>

          {/* EKRAN */}
          <div className="brix-screen brix-crt relative aspect-[16/10] overflow-hidden rounded-md" style={{ background: 'rgb(var(--c-bg))' }}>
            {/* --- BOOT --- */}
            <div className={cn('absolute inset-0 flex flex-col items-center justify-center gap-4 transition-opacity duration-500', phase === 'boot' ? 'opacity-100' : 'pointer-events-none opacity-0')} style={{ background: '#1b1410' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/brix/walk.gif" alt="" width={56} height={90} className="pixelated" style={{ imageRendering: 'pixelated' }} />
              <p className="font-display text-lg tracking-widest text-[#ffd9b3]" style={{ animation: 'brixBootBlink 1s steps(2) infinite' }}>
                YÜKLENİYOR…
              </p>
              <div className="h-4 w-2/3 max-w-xs overflow-hidden rounded border-2 border-[#ffd9b3]/70 bg-black/40">
                <div className="h-full bg-[#ffa447] transition-[width] duration-100" style={{ width: `${pct}%` }} />
              </div>
              <p className="font-display text-3xl font-bold tabular-nums text-[#ffa447]">%{pct}</p>
            </div>

            {/* --- DESKTOP --- */}
            <div className={cn('absolute inset-0 flex flex-col transition-all duration-500', phase === 'desktop' ? 'opacity-100' : 'pointer-events-none scale-95 opacity-0')}>
              {/* menü çubuğu */}
              <div className="flex items-center gap-2 border-b-2 border-border bg-surface px-3 py-1.5">
                <span className="font-display text-sm font-bold text-fg">⌂ Masaüstü</span>
                <span className="ml-auto font-display text-sm text-muted">{FOLDERS.length} klasör</span>
              </div>
              {/* klasör ızgarası */}
              <div className="grid flex-1 grid-cols-3 content-start gap-2 overflow-y-auto p-3 sm:gap-4 sm:p-5">
                {FOLDERS.map(f => (
                  <button
                    key={f.id}
                    onClick={() => enter(f.id)}
                    onMouseEnter={() => setHover(f.id)}
                    onMouseLeave={() => setHover(h => (h === f.id ? null : h))}
                    className="group flex flex-col items-center gap-1.5 rounded p-2 transition-transform hover:-translate-y-1 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hover === f.id ? '/brix/folder-open.png' : '/brix/folder.png'}
                      alt=""
                      width={56}
                      height={56}
                      className="pixelated h-12 w-12 sm:h-14 sm:w-14"
                      style={{ imageRendering: 'pixelated' }}
                    />
                    <span className="max-w-full truncate rounded border-2 border-border bg-surface px-1.5 py-0.5 font-display text-xs font-semibold text-fg" style={{ boxShadow: `2px 2px 0 0 rgb(${f.accent})` }}>
                      {f.label}
                    </span>
                  </button>
                ))}
              </div>
              {/* görev çubuğu */}
              <div className="flex items-center gap-2 border-t-2 border-border bg-surface px-3 py-1.5">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/brix/walk.gif" alt="" width={18} height={29} className="pixelated" style={{ imageRendering: 'pixelated' }} />
                <span className="font-display text-xs text-muted">hazır</span>
                <span className="ml-auto font-display text-xs font-bold text-success">%100</span>
              </div>
            </div>

            {/* --- FOLDER (içine girildi) --- */}
            <div className={cn('absolute inset-0 transition-opacity duration-300', phase === 'folder' ? 'opacity-100' : 'pointer-events-none opacity-0')}>
              {activeFolder && (
                <div key={activeFolder.id} className="flex h-full flex-col" style={{ animation: phase === 'folder' ? 'brixEnter .35s cubic-bezier(.16,1,.3,1) both' : undefined }}>
                  {/* pencere başlığı */}
                  <div className="flex items-center gap-2 border-b-2 border-border bg-surface px-3 py-1.5">
                    <button onClick={back} className="inline-flex items-center gap-1 rounded border-2 border-border bg-surface-2 px-2 py-0.5 font-display text-xs font-bold text-fg transition-transform hover:-translate-y-0.5">
                      <ArrowLeft size={13} /> MASAÜSTÜ
                    </button>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src="/brix/folder-open.png" alt="" width={20} height={20} className="pixelated ml-1" style={{ imageRendering: 'pixelated' }} />
                    <span className="truncate font-display text-sm font-bold text-fg">{activeFolder.label}</span>
                  </div>
                  {/* içerik */}
                  <div className="flex-1 overflow-y-auto p-4 sm:p-5" style={{ borderTop: `3px solid rgb(${activeFolder.accent})` }}>
                    <p className="text-sm leading-relaxed text-muted">{activeFolder.desc}</p>
                    <div className="mt-4 grid gap-2 sm:grid-cols-3">
                      {activeFolder.rows.map(r => (
                        <div key={r.k} className="rounded border-2 border-border bg-surface px-3 py-2 brix-bevel-sm">
                          <p className="font-display text-[11px] uppercase tracking-wide text-muted">{r.k}</p>
                          <p className="font-display text-sm font-bold text-fg">{r.v}</p>
                        </div>
                      ))}
                    </div>
                    <Link
                      href={activeFolder.href}
                      className="mt-5 inline-flex items-center gap-2 rounded px-5 py-2.5 text-sm font-bold text-bg brix-bevel transition-transform hover:-translate-y-0.5 font-display"
                      style={{ background: `rgb(${activeFolder.accent})` }}
                    >
                      {activeFolder.cta} <ArrowRight size={15} />
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* monitör ayağı */}
        <div className="mx-auto h-5 w-16 brix-bevel-sm" style={{ background: 'rgb(var(--c-surface2))', borderTopWidth: 0 }} />
        <div className="mx-auto h-2 w-40 rounded-b bg-border-hover/70" />
      </div>
    </section>
  )
}
