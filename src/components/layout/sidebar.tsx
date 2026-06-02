'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListChecks, Gift, Trophy, BarChart3, User, Zap, Cloud, HardDrive } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/hooks/useStore'
import { getLevelInfo, getRank } from '@/lib/gamification'
import { formatXP } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'
import { ThemeSwitcher } from './theme-switcher'

const NAV = [
  { href: '/',             icon: LayoutDashboard, label: 'Panel' },
  { href: '/habits',       icon: ListChecks,      label: 'Alışkanlıklar' },
  { href: '/rewards',      icon: Gift,            label: 'Ödüller' },
  { href: '/achievements', icon: Trophy,          label: 'Başarımlar' },
  { href: '/stats',        icon: BarChart3,       label: 'İstatistik' },
  { href: '/profile',      icon: User,            label: 'Profil' },
]

export function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname()
  const { data, cloud } = useStore()
  const info = getLevelInfo(data.profile.totalXP)
  const { rank } = getRank(info.level)
  const available = data.profile.totalXP - data.profile.redeemedXP

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
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all',
                active
                  ? 'bg-primary/12 text-primary font-medium'
                  : 'text-muted hover:text-fg hover:bg-surface-2',
              )}
            >
              <Icon size={17} />
              {label}
              {active && <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary animate-glow-pulse" />}
            </Link>
          )
        })}
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
