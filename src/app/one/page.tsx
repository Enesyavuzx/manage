'use client'
import { OneThing } from '@/components/one/one-thing'

export default function OnePage() {
  return (
    <div className="mx-auto max-w-xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Tek Şey</h1>
        <p className="mt-0.5 text-sm text-muted">Her seferinde sadece bir göreve odaklan</p>
      </div>
      <OneThing />
    </div>
  )
}
