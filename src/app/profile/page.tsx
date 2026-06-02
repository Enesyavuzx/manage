'use client'
import { LevelHero } from '@/components/profile/level-hero'
import { ProfileSettings } from '@/components/profile/profile-settings'
import { TitlesPanel } from '@/components/profile/titles-panel'
import { RanksLadder } from '@/components/profile/ranks-ladder'

export default function ProfilePage() {
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Profil</h1>
        <p className="mt-0.5 text-sm text-muted">Rütben, ünvanların ve ayarların</p>
      </div>
      <LevelHero />
      <div className="grid gap-4 lg:grid-cols-2">
        <RanksLadder />
        <div className="space-y-4">
          <ProfileSettings />
          <TitlesPanel />
        </div>
      </div>
    </div>
  )
}
