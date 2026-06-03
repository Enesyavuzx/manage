'use client'
import { RoutinePlanner } from '@/components/routines/routine-planner'

export default function RoutinesPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Rutinlerim</h1>
        <p className="mt-0.5 text-sm text-muted">Alışkanlıklarını sıralı akışa dönüştür</p>
      </div>
      <RoutinePlanner />
    </div>
  )
}
