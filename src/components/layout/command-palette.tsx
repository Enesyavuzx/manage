'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Search, CornerDownLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Cmd { emoji: string; label: string; href: string; kw: string }

const COMMANDS: Cmd[] = [
  { emoji: '🏠', label: 'Panel', href: '/', kw: 'dashboard ana home' },
  { emoji: '✨', label: 'Bugün', href: '/bugun', kw: 'today gün' },
  { emoji: '🏰', label: 'Diyar', href: '/diyar', kw: 'realm şehir sefer' },
  { emoji: '⚡', label: 'Temel Mod', href: '/basic', kw: 'basic sade' },
  { emoji: '✅', label: 'Alışkanlıklar', href: '/habits', kw: 'habit streak' },
  { emoji: '📋', label: 'Rutinlerim', href: '/routines', kw: 'routine rutin' },
  { emoji: '🎯', label: 'Tek Şey', href: '/one', kw: 'one thing tek' },
  { emoji: '⏱️', label: 'Odak', href: '/focus', kw: 'focus pomodoro derin' },
  { emoji: '🙂', label: 'Ruh Hali', href: '/mood', kw: 'mood ruh enerji' },
  { emoji: '🧠', label: 'Beyin Boşalt', href: '/braindump', kw: 'brain dump not' },
  { emoji: '🔗', label: 'Zincir', href: '/zincir', kw: 'chain zincir' },
  { emoji: '🍬', label: 'Dopamin Menüsü', href: '/dopamin', kw: 'dopamine ödül' },
  { emoji: '🚩', label: 'Seferler', href: '/seferler', kw: 'season sezon harika' },
  { emoji: '🏆', label: 'Başarımlar', href: '/achievements', kw: 'achievement rozet' },
  { emoji: '🌐', label: 'Beceri Ağacı', href: '/skills', kw: 'skill tree beceri' },
  { emoji: '🎁', label: 'Ödüller', href: '/rewards', kw: 'reward shop mağaza' },
  { emoji: '🎮', label: 'Mini Oyun', href: '/arcade', kw: 'arcade oyun' },
  { emoji: '💬', label: 'Koç', href: '/coach', kw: 'coach danışman' },
  { emoji: '✉️', label: 'Gelecek Benlik', href: '/gelecek', kw: 'future mektup' },
  { emoji: '🗓️', label: 'Haftalık Bakış', href: '/weekly-review', kw: 'weekly review hafta' },
  { emoji: '💡', label: 'İçgörüler', href: '/insights', kw: 'insight içgörü' },
  { emoji: '📊', label: 'İstatistik', href: '/stats', kw: 'stats istatistik grafik' },
  { emoji: '📒', label: 'Bütçe', href: '/budget', kw: 'budget finans para' },
  { emoji: '👤', label: 'Profil', href: '/profile', kw: 'profile ayar rütbe' },
]

export function CommandPalette() {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')
  const [idx, setIdx] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)

  const results = useMemo(() => {
    const s = q.trim().toLowerCase()
    if (!s) return COMMANDS
    return COMMANDS.filter(c => c.label.toLowerCase().includes(s) || c.kw.includes(s))
  }, [q])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault(); setOpen(o => !o); setQ(''); setIdx(0)
      }
    }
    const onOpen = () => { setOpen(true); setQ(''); setIdx(0) }
    window.addEventListener('keydown', onKey)
    window.addEventListener('open-cmdk', onOpen)
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('open-cmdk', onOpen) }
  }, [])

  useEffect(() => { if (open) setTimeout(() => inputRef.current?.focus(), 30) }, [open])
  useEffect(() => { setIdx(0) }, [q])
  useEffect(() => {
    if (!open) return
    const el = listRef.current?.children[idx] as HTMLElement | undefined
    el?.scrollIntoView({ block: 'nearest' })
  }, [idx, open])

  if (!open) return null

  const go = (href: string) => { setOpen(false); router.push(href) }
  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') { e.preventDefault(); setIdx(i => Math.min(results.length - 1, i + 1)) }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setIdx(i => Math.max(0, i - 1)) }
    else if (e.key === 'Enter') { e.preventDefault(); const r = results[idx]; if (r) go(r.href) }
    else if (e.key === 'Escape') { e.preventDefault(); setOpen(false) }
  }

  return (
    <div className="fixed inset-0 z-[200] flex items-start justify-center p-4 pt-[12vh]" role="dialog" aria-modal="true" aria-label="Komut paleti">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
      <div className="ui-card relative z-10 w-full max-w-lg overflow-hidden rounded-xl border border-border bg-surface shadow-2xl animate-slide-up">
        <div className="flex items-center gap-2 border-b-2 border-border px-3 py-2.5">
          <Search size={16} className="text-muted" />
          <input
            ref={inputRef}
            value={q}
            onChange={e => setQ(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Sayfa ara… (örn. odak, bütçe, diyar)"
            className="w-full bg-transparent text-sm text-fg outline-none placeholder:text-muted-2"
          />
          <kbd className="rounded border border-border px-1.5 py-0.5 text-[10px] text-muted">ESC</kbd>
        </div>
        <div ref={listRef} className="max-h-[52vh] overflow-y-auto p-1.5">
          {results.length === 0 && <p className="px-3 py-6 text-center text-sm text-muted">Eşleşme yok</p>}
          {results.map((c, i) => (
            <button
              key={c.href}
              onClick={() => go(c.href)}
              onMouseEnter={() => setIdx(i)}
              className={cn('flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors', i === idx ? 'bg-primary/15 text-fg' : 'text-muted hover:text-fg')}
            >
              <span className="text-lg">{c.emoji}</span>
              <span className="flex-1 font-medium">{c.label}</span>
              {i === idx && <CornerDownLeft size={13} className="text-primary" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
