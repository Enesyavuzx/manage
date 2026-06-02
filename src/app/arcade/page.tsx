'use client'
import { SpriteCatcher } from '@/components/arcade/sprite-catcher'

export default function ArcadePage() {
  return (
    <div className="mx-auto max-w-lg space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Mini Oyun</h1>
        <p className="mt-0.5 text-sm text-muted">Sprite&apos;ları yakala, dopamin kazan!</p>
      </div>
      <SpriteCatcher />
    </div>
  )
}
