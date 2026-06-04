'use client'
import { RealmView } from '@/components/realm/realm-view'

export default function DiyarPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Diyar</h1>
        <p className="mt-0.5 text-sm text-muted">Tutarlılığınla büyüyen şehir. Her alışkanlık bir yapı, her tamamlama bir tuğla.</p>
      </div>
      <RealmView />
    </div>
  )
}
