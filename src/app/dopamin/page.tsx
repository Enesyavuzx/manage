'use client'
import { DopamineMenu } from '@/components/dopamine/dopamine-menu'

export default function DopaminPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Dopamin Menüsü</h1>
        <p className="mt-0.5 text-sm text-muted">Az uyarılmış hissediyorsan menüden seç — karar yok, sadece yap</p>
      </div>
      <DopamineMenu />
    </div>
  )
}
