'use client'
import { EventsCard } from '@/components/seferler/events-card'
import { SeasonPanel } from '@/components/seferler/season-panel'
import { SeasonSummary } from '@/components/seferler/season-summary'
import { WonderPanel } from '@/components/seferler/wonder-panel'

export default function SeferlerPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Seferler</h1>
        <p className="mt-0.5 text-sm text-muted">Diyarının olayları, sezon yolculuğu ve uzun vadeli harikaların.</p>
      </div>
      <EventsCard />
      <SeasonSummary />
      <SeasonPanel />
      <WonderPanel />
    </div>
  )
}
