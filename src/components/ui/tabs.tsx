'use client'
import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'

export interface TabDef {
  id: string
  label: string
  icon?: React.ElementType
  content: ReactNode
}

/** Tema-uyumlu, sade sekme bileşeni. İçerik sekme değişince yumuşak geçer. */
export function Tabs({ tabs, initial, className }: { tabs: TabDef[]; initial?: string; className?: string }) {
  const [active, setActive] = useState(initial ?? tabs[0]?.id)
  return (
    <div className={className}>
      <div className="mb-5 flex flex-wrap gap-1 rounded-lg border border-border bg-surface-2 p-1">
        {tabs.map(t => {
          const Icon = t.icon
          return (
            <button
              key={t.id}
              onClick={() => setActive(t.id)}
              aria-pressed={active === t.id}
              className={cn(
                'inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium font-display transition-all',
                active === t.id ? 'bg-primary text-bg shadow-glow' : 'text-muted hover:text-fg hover:bg-surface',
              )}
            >
              {Icon && <Icon size={14} />}
              {t.label}
            </button>
          )
        })}
      </div>
      {/* Tüm paneller canlı kalır (form/yerel state korunur); yalnızca aktif görünür.
          display:none -> block geçişi animate-fade-in'i yeniden tetikler. */}
      {tabs.map(t => (
        <div key={t.id} className={cn(t.id === active ? 'animate-fade-in' : 'hidden')}>{t.content}</div>
      ))}
    </div>
  )
}
