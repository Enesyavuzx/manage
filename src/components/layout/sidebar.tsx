'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListChecks, Gift, Trophy, BarChart3, User, Zap, Cloud, HardDrive, Target, Smile, Crosshair, Wallet, Gamepad2, MessageCircle, Brain, Network, CalendarCheck, ListOrdered, Lightbulb, Castle, Dices, Flag, Sparkles, Send, ChevronDown, TrendingUp, Link2, Candy } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/hooks/useStore'
import { getLevelInfo, getRank } from '@/lib/gamification'
import { formatXP } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { ThemeSwitcher } from './theme-switcher'
import { PixelSprite } from '@/components/decor/pixel-sprite'

interface NavItem { href: string; icon: typeof LayoutDashboard; label: string }
interface NavGroup { id: string; icon: typeof LayoutDashboard; label: string; items: NavItem[] }

// En sık kullanılanlar her zaman görünür (gruplanmaz).
const PINNED: NavItem[] = [
  { href: '/',      icon: LayoutDashboard, label: 'Panel' },
  { href: '/bugun', icon: Sparkles,        label: 'Bugün' },
]

// Geri kalan her şey anlamlı kategorilere ayrılır; başlığa tıklayınca açılır.
const GROUPS: NavGroup[] = [
  {
    id: 'takip', icon: ListChecks, label: 'Takip',
    items: [
      { href: '/habits',    icon: ListChecks, label: 'Alışkanlıklar' },
      { href: '/routines',  icon: ListOrdered, label: 'Rutinlerim' },
      { href: '/one',       icon: Crosshair,  label: 'Tek Şey' },
      { href: '/focus',     icon: Target,     label: 'Odak' },
      { href: '/mood',      icon: Smile,      label: 'Ruh Hali' },
      { href: '/braindump', icon: Brain,      label: 'Beyin Boşalt' },
      { href: '/zincir',    icon: Link2,      label: 'Zincir' },
      { href: '/dopamin',   icon: Candy,      label: 'Dopamin Menüsü' },
    ],
  },
  {
    id: 'oyun', icon: Castle, label: 'Diyar & Oyun',
    items: [
      { href: '/diyar',        icon: Castle,   label: 'Diyar' },
      { href: '/seferler',     icon: Flag,     label: 'Seferler' },
      { href: '/achievements', icon: Trophy,   label: 'Başarımlar' },
      { href: '/skills',       icon: Network,  label: 'Beceri Ağacı' },
      { href: '/rewards',      icon: Gift,     label: 'Ödüller' },
      { href: '/arcade',       icon: Gamepad2, label: 'Mini Oyun' },
      { href: '/casino',       icon: Dices,    label: 'Casino' },
    ],
  },
  {
    id: 'gelisim', icon: TrendingUp, label: 'Gelişim',
    items: [
      { href: '/coach',         icon: MessageCircle, label: 'Koç' },
      { href: '/gelecek',       icon: Send,          label: 'Gelecek Benlik' },
      { href: '/weekly-review', icon: CalendarCheck, label: 'Haftalık Bakış' },
      { href: '/insights',      icon: Lightbulb,     label: 'İçgörüler' },
      { href: '/stats',         icon: BarChart3,     label: 'İstatistik' },
    ],
  },
  {
    id: 'finans', icon: Wallet, label: 'Finans',
    items: [
      { href: '/budget', icon: Wallet, label: 'Bütçe' },
    ],
  },
]

// Alt sabit (hesap).
const BOTTOM: NavItem[] = [
  { href: '/profile', icon: User, label: 'Profil' },
]

const OPEN_GROUP_KEY = 'manage_sidebar_open_group'

function groupOfPath(pathname: string): string | null {
  for (const g of GROUPS) {
    if (g.items.some(it => it.href === pathname)) return g.id
  }
  return null
}

function NavLink({ href, icon: Icon, label, active, onNavigate, nested }: NavItem & { active: boolean; onNavigate?: () => void; nested?: boolean }) {
  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        'flex items-center gap-3 rounded-lg py-2.5 text-sm transition-all',
        nested ? 'pl-9 pr-3' : 'px-3',
        active
          ? 'bg-primary/12 text-primary font-medium'
          : 'text-muted hover:text-fg hover:bg-surface-2',
      )}
    >
      <Icon size={nested ? 15 : 17} />
      {label}
      {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />}
    </Link>
  )
}

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data, cloud } = useStore()
  const info = getLevelInfo(data.profile.totalXP)
  const { rank } = getRank(info.level)
  const available = data.profile.totalXP - data.profile.redeemedXP

  // Aktif rotanın grubu varsayılan olarak açık; kullanıcı seçimini hatırla.
  const [openGroup, setOpenGroup] = useState<string | null>(null)

  useEffect(() => {
    const stored = typeof window !== 'undefined' ? localStorage.getItem(OPEN_GROUP_KEY) : null
    const activeGroup = groupOfPath(pathname)
    setOpenGroup(activeGroup ?? stored ?? GROUPS[0].id)
    // sadece ilk yüklemede çalışsın
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function toggleGroup(id: string) {
    setOpenGroup(prev => {
      const next = prev === id ? null : id
      if (typeof window !== 'undefined') {
        if (next) localStorage.setItem(OPEN_GROUP_KEY, next)
        else localStorage.removeItem(OPEN_GROUP_KEY)
      }
      return next
    })
  }

  return (
    <aside className="flex h-full w-60 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex items-center justify-between border-b border-border px-5 py-4">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-glow">
            <Zap size={16} className="text-bg" fill="currentColor" />
          </div>
          <span className="text-base font-bold tracking-tight text-fg font-display">MANAGE</span>
        </div>
        <PixelSprite name="star" pixel={3} className="pixelated animate-float opacity-90" />
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {/* Sabit üst */}
        {PINNED.map(item => (
          <NavLink key={item.href} {...item} active={pathname === item.href} onNavigate={onNavigate} />
        ))}

        <div className="my-1.5 border-t border-border/60" />

        {/* Kategoriler */}
        {GROUPS.map(group => {
          const open = openGroup === group.id
          const hasActive = group.items.some(it => it.href === pathname)
          const GroupIcon = group.icon
          return (
            <div key={group.id}>
              <button
                type="button"
                onClick={() => toggleGroup(group.id)}
                className={cn(
                  'flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                  hasActive && !open ? 'text-fg font-medium' : 'text-muted hover:text-fg hover:bg-surface-2',
                )}
                aria-expanded={open}
              >
                <GroupIcon size={17} />
                <span className="flex-1 text-left">{group.label}</span>
                {hasActive && !open && <span className="h-1.5 w-1.5 rounded-full bg-primary" />}
                <ChevronDown size={15} className={cn('transition-transform duration-200', open && 'rotate-180')} />
              </button>

              {open && (
                <div className="mt-0.5 space-y-0.5 animate-fade-in">
                  {group.items.map(item => (
                    <NavLink key={item.href} {...item} active={pathname === item.href} onNavigate={onNavigate} nested />
                  ))}
                </div>
              )}
            </div>
          )
        })}

        <div className="my-1.5 border-t border-border/60" />

        {/* Sabit alt */}
        {BOTTOM.map(item => (
          <NavLink key={item.href} {...item} active={pathname === item.href} onNavigate={onNavigate} />
        ))}
      </nav>

      {/* XP / Level card */}
      <div className="space-y-3 border-t border-border p-3">
        <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-fg font-display flex items-center gap-1">
              <span style={{ color: rank.color }}>{rank.emoji}</span> Lv {info.level}
            </span>
            <span className="text-xs text-xp font-medium">{formatXP(available)} XP</span>
          </div>
          <Progress value={info.xpInLevel} max={info.xpNeeded} color="xp" size="sm" />
        </div>

        {/* pixel mascots */}
        <div className="flex items-center justify-center gap-3 py-1 opacity-90">
          <PixelSprite name="heart" pixel={3} className="pixelated animate-float" style={{ animationDelay: '0.2s' }} />
          <PixelSprite name="coin" pixel={3} className="pixelated animate-float" style={{ animationDelay: '0.9s' }} />
          <PixelSprite name="gem" pixel={3} className="pixelated animate-float" style={{ animationDelay: '1.4s' }} />
          <PixelSprite name="potion" pixel={3} className="pixelated animate-float" style={{ animationDelay: '0.5s' }} />
        </div>

        <div className="flex items-center justify-between gap-2">
          <ThemeSwitcher compact />
          <span className="flex items-center gap-1 text-xs text-muted" title={cloud ? 'Buluta senkron' : 'Yerel kayıt'}>
            {cloud ? <Cloud size={13} /> : <HardDrive size={13} />}
          </span>
        </div>
      </div>
    </aside>
  )
}
