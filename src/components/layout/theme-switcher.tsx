'use client'
import { useEffect, useState } from 'react'
import { Check, Palette } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { cn } from '@/lib/utils'
import { THEMES } from '@/lib/themes'

export function ThemeSwitcher({ compact = false }: { compact?: boolean }) {
  const { data, setTheme } = useStore()
  const active = data.profile.theme
  const [open, setOpen] = useState(false)
  const current = THEMES.find(t => t.id === active) ?? THEMES[0]

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false) }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs font-medium text-fg transition-colors hover:border-border-hover"
        aria-label="Tema seç"
        title={`Tema: ${current.label}`}
      >
        <span className="flex shrink-0 overflow-hidden rounded border border-border/40">
          {current.swatch.map((c, i) => (
            <span key={i} className="h-3.5 w-2" style={{ background: c }} />
          ))}
        </span>
        {!compact && <span>{current.label}</span>}
      </button>

      {open && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-label="Tema seç">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in" onClick={() => setOpen(false)} />
          <div className="ui-card relative z-10 max-h-[85vh] w-full max-w-md overflow-y-auto rounded-xl border border-border bg-surface p-4 shadow-2xl animate-slide-up">
            <div className="mb-3 flex items-center gap-2">
              <Palette size={16} className="text-primary" />
              <h2 className="text-sm font-semibold text-fg font-display">Tema seç</h2>
              <span className="ml-auto text-xs text-muted">{THEMES.length} tema</span>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {THEMES.map(t => (
                <button
                  key={t.id}
                  onClick={() => { setTheme(t.id); setOpen(false) }}
                  className={cn(
                    'group relative flex flex-col gap-2 rounded-lg border p-2.5 text-left transition-all hover:-translate-y-0.5',
                    active === t.id ? 'border-primary ring-2 ring-primary/40' : 'border-border hover:border-border-hover',
                  )}
                  aria-pressed={active === t.id}
                >
                  <span className="flex h-9 w-full overflow-hidden rounded-md border border-border/40">
                    {t.swatch.map((c, i) => (
                      <span key={i} className="h-full flex-1" style={{ background: c }} />
                    ))}
                  </span>
                  <span className="flex items-center gap-1 text-xs font-medium text-fg">
                    {active === t.id && <Check size={12} className="shrink-0 text-primary" />}
                    {t.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
