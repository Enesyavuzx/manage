'use client'
import { FocusTimer } from '@/components/focus/focus-timer'
import { FocusHistory } from '@/components/focus/focus-history'

export default function FocusPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Odak</h1>
        <p className="mt-0.5 text-sm text-muted">Bir işe kilitlen, dakika başına XP kazan</p>
      </div>
      <FocusTimer />
      <FocusHistory />
    </div>
  )
}
