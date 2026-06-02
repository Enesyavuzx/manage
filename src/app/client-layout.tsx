'use client'
import { useState, useEffect } from 'react'
import { Menu, X } from 'lucide-react'
import { StoreProvider, useStore } from '@/hooks/useStore'
import { Sidebar } from '@/components/layout/sidebar'
import { ThemeApplier } from '@/components/layout/theme-applier'
import { ToastHost } from '@/components/layout/toast-host'
import { ThemeSwitcher } from '@/components/layout/theme-switcher'
import { SideDecor } from '@/components/decor/side-decor'
import { NotificationManager } from '@/components/layout/notification-manager'

function Shell({ children }: { children: React.ReactNode }) {
  const [sideOpen, setSideOpen] = useState(false)
  const { ready } = useStore()

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }
  }, [])

  return (
    <>
      <ThemeApplier />
      <NotificationManager />
      <SideDecor />
      <div className="relative z-10 flex h-screen overflow-hidden">
        {sideOpen && <div className="fixed inset-0 z-30 bg-black/60 lg:hidden" onClick={() => setSideOpen(false)} />}

        <div className="hidden lg:flex"><Sidebar /></div>

        <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:hidden ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar onNavigate={() => setSideOpen(false)} />
        </div>

        <div className="flex flex-1 flex-col overflow-hidden">
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
            <button onClick={() => setSideOpen(o => !o)} className="text-muted hover:text-fg">
              {sideOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="text-sm font-bold text-fg font-display">MANAGE</span>
            <ThemeSwitcher compact />
          </div>

          <main className="flex-1 overflow-y-auto p-4 lg:p-6">
            <div className={ready ? 'animate-fade-in' : 'opacity-0'}>{children}</div>
          </main>
        </div>
      </div>
      <ToastHost />
    </>
  )
}

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <StoreProvider>
      <Shell>{children}</Shell>
    </StoreProvider>
  )
}
