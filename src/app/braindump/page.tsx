'use client'
import { BrainDump } from '@/components/braindump/brain-dump'

export default function BrainDumpPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Beyin Boşaltma</h1>
        <p className="mt-0.5 text-sm text-muted">Kafandakini dök, sonra düzene sok</p>
      </div>
      <BrainDump />
    </div>
  )
}
