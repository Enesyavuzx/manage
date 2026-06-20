'use client'
import { Castle, Flag, Share2 } from 'lucide-react'
import { RealmView } from '@/components/realm/realm-view'
import { DiyarShareCard } from '@/components/realm/diyar-share-card'
import { EventsCard } from '@/components/seferler/events-card'
import { SeasonSummary } from '@/components/seferler/season-summary'
import { SeasonPanel } from '@/components/seferler/season-panel'
import { WonderPanel } from '@/components/seferler/wonder-panel'
import { Tabs } from '@/components/ui/tabs'

export default function DiyarPage() {
  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Diyar</h1>
        <p className="mt-0.5 text-sm text-muted">Tutarlılığınla büyüyen şehir. Her alışkanlık bir yapı, her tamamlama bir tuğla.</p>
      </div>

      <Tabs
        tabs={[
          { id: 'harita', label: 'Diyar', icon: Castle, content: <RealmView /> },
          {
            id: 'sefer', label: 'Seferler & Sezon', icon: Flag,
            content: (
              <div className="space-y-5">
                <EventsCard />
                <SeasonSummary />
                <SeasonPanel />
                <WonderPanel />
              </div>
            ),
          },
          { id: 'paylas', label: 'Paylaş', icon: Share2, content: <DiyarShareCard /> },
        ]}
      />
    </div>
  )
}
