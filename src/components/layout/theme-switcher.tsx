'use client'
import { Moon, Sparkles } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { cn } from '@/lib/utils'
import type { ThemeName } from '@/lib/types'

const OPTIONS: { id: ThemeName; label: string; icon: React.ElementType }[] = [
  { id: 'calm',  label: 'Sade', icon: Moon },
  { id: 'glass', label: 'Cam',  icon: Sparkles },
]

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { data, setTheme } = useStore()
  const active = data.profile.theme

  return (
    <div
      className="inline-flex items-center gap-1 rounded-lg border border-border bg-surface-2 p-1"
      role="group"
      aria-label="Tema seçici"
    >
      {OPTIONS.map(({ id, label, icon: Icon }) => (
        <button
          key={id}
          onClick={() => setTheme(id)}
          className={cn(
            'flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-xs font-medium transition-all',
            active === id ? 'bg-primary text-bg' : 'text-muted hover:text-fg',
          )}
          title={`${label} teması`}
          aria-label={`${label} teması`}
          aria-pressed={active === id}
        >
          <Icon size={13} />
          {!compact && label}
        </button>
      ))}
    </div>
  )
}
