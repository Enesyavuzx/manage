'use client'
import { Sparkles, Sun, Gamepad2 } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { cn } from '@/lib/utils'
import type { ThemeName } from '@/lib/types'

const OPTIONS: { id: ThemeName; label: string; icon: React.ElementType }[] = [
  { id: 'aurora', label: 'Aurora', icon: Sparkles },
  { id: 'neon',   label: 'Neon',   icon: Sun },
  { id: 'pixel',  label: 'Pixel',  icon: Gamepad2 },
]

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { data, setTheme } = useStore()
  const active = data.profile.theme

  return (
    <div className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1">
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
            active === id ? 'bg-primary text-bg' : 'text-muted hover:text-fg',
          )}
          title={`${label} teması`}
        >
          <Icon size={13} />
          {!compact && label}
        </button>
      ))}
    </div>
  )
}
