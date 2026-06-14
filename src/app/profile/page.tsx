'use client'
import { Award, Crown, Settings } from 'lucide-react'
import { LevelHero } from '@/components/profile/level-hero'
import { ProfileSettings } from '@/components/profile/profile-settings'
import { TitlesPanel } from '@/components/profile/titles-panel'
import { RanksLadder } from '@/components/profile/ranks-ladder'
import { usePageTitle } from '@/hooks/usePageTitle'
import { Tabs } from '@/components/ui/tabs'

export default function ProfilePage() {
  usePageTitle('Profil')
  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-fg text-gradient">Profil</h1>
        <p className="mt-0.5 text-sm text-muted">Rütben, ünvanların ve ayarların</p>
      </div>

      <LevelHero />

      <Tabs
        tabs={[
          { id: 'rutbe', label: 'Rütbeler', icon: Award, content: <RanksLadder /> },
          { id: 'unvan', label: 'Ünvanlar', icon: Crown, content: <TitlesPanel /> },
          { id: 'ayar', label: 'Ayarlar', icon: Settings, content: <ProfileSettings /> },
        ]}
      />
    </div>
  )
}
