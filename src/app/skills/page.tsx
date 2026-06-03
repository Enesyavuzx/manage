'use client'
import { SkillTree } from '@/components/skills/skill-tree'

export default function SkillsPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Beceri Ağacı</h1>
        <p className="mt-0.5 text-sm text-muted">Seviye atladıkça puan kazan, kalıcı bonuslar aç</p>
      </div>
      <SkillTree />
    </div>
  )
}
