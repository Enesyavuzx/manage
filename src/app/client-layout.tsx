'use client'
import { StoreProvider } from '@/hooks/useStore'
import { Sidebar } from '@/components/layout/sidebar'
import { useState } from 'react'
import { Menu, X } from 'lucide-react'

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const [sideOpen, setSideOpen] = useState(false)

  return (
    <StoreProvider>
      <div className="flex h-screen overflow-hidden">
        {/* Mobile overlay */}
        {sideOpen && (
          <div
            className="fixed inset-0 z-30 bg-black/60 lg:hidden"
            onClick={() => setSideOpen(false)}
          />
        )}

        {/* Sidebar desktop */}
        <div className="hidden lg:flex">
          <Sidebar />
        </div>

        {/* Sidebar mobile */}
        <div className={`fixed inset-y-0 left-0 z-40 transition-transform duration-300 lg:hidden ${sideOpen ? 'translate-x-0' : '-translate-x-full'}`}>
          <Sidebar />
        </div>

        {/* Main */}
        <div className="flex flex-1 flex-col overflow-hidden">
          {/* Mobile header */}
          <div className="flex items-center justify-between border-b border-border bg-surface px-4 py-3 lg:hidden">
            <button onClick={() => setSideOpen(o => !o)} className="text-muted hover:text-white">
              {sideOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="text-sm font-bold text-white">Manage</span>
            <div className="w-5" />
          </div>

          <main className="flex-1 overflow-y-auto bg-background p-4 lg:p-6">
            {children}
          </main>
        </div>
      </div>
    </StoreProvider>
  )
}
