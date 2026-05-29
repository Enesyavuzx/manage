'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ListChecks, Gift, BarChart3, Zap } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useStore } from '@/hooks/useStore'
import { getLevel } from '@/lib/constants'
import { formatXP } from '@/lib/utils'
import { Progress } from '@/components/ui/progress'

const NAV = [
  { href: '/',         icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/habits',   icon: ListChecks,      label: 'Habits'    },
  { href: '/rewards',  icon: Gift,            label: 'Rewards'   },
  { href: '/stats',    icon: BarChart3,       label: 'Stats'     },
]

export function Sidebar() {
  const pathname = usePathname()
  const { data } = useStore()
  const { level, progress, xpInLevel, xpNeeded } = getLevel(data.profile.totalXP)
  const available = data.profile.totalXP - data.profile.redeemedXP

  return (
    <aside className="flex h-full w-56 flex-col border-r border-border bg-surface">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-border px-5 py-4">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-accent">
          <Zap size={14} className="text-white" fill="white" />
        </div>
        <span className="text-sm font-bold tracking-tight text-white">Manage</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 p-2">
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = pathname === href
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-accent/10 text-accent-light font-medium'
                  : 'text-muted hover:text-white hover:bg-surface-2',
              )}
            >
              <Icon size={16} />
              {label}
            </Link>
          )
        })}
      </nav>

      {/* XP Card */}
      <div className="border-t border-border p-4">
        <div className="rounded-lg border border-border bg-surface-2 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-white">Level {level}</span>
            <span className="text-xs text-xp font-medium">{formatXP(available)} XP</span>
          </div>
          <Progress value={xpInLevel} max={xpNeeded} color="xp" size="sm" />
          <p className="text-xs text-muted">{xpInLevel} / {xpNeeded} to level {level + 1}</p>
        </div>
      </div>
    </aside>
  )
}
