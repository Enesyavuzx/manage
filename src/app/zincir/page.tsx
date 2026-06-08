'use client'
import { ZincirPlanner } from '@/components/zincir/zincir-planner'

export default function ZincirPage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Zincir</h1>
        <p className="mt-0.5 text-sm text-muted">Alışkanlıkları sıralı adımlara bağla, her gün aynı akışı takip et</p>
      </div>
      <ZincirPlanner />
    </div>
  )
}
