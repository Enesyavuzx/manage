'use client'
import { CoachChat } from '@/components/coach/coach-chat'

export default function CoachPage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">ADHD Koçu</h1>
        <p className="mt-0.5 text-sm text-muted">Alışkanlık, motivasyon ve odak için kişisel koçun.</p>
      </div>
      <CoachChat />
    </div>
  )
}
