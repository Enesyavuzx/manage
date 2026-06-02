'use client'
import { useState } from 'react'
import { Cloud, HardDrive, Check, Bell, BellOff } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/layout/theme-switcher'
import { cn } from '@/lib/utils'

export function ProfileSettings() {
  const { data, setProfileName, setNotificationsEnabled, cloud } = useStore()
  const [name, setName] = useState(data.profile.name)
  const [saved, setSaved] = useState(false)

  const notifEnabled = !!data.profile.notificationsEnabled

  function save() {
    if (name.trim()) { setProfileName(name.trim()); setSaved(true); setTimeout(() => setSaved(false), 1500) }
  }

  async function toggleNotifs() {
    if (notifEnabled) { setNotificationsEnabled(false); return }
    if (typeof window === 'undefined' || !('Notification' in window)) return
    let perm = Notification.permission
    if (perm === 'default') perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setNotificationsEnabled(true)
      new Notification('Bildirimler açık', { body: 'Hatırlatıcıların artık burada görünecek.' })
    }
  }

  return (
    <Card>
      <CardHeader><CardTitle>Ayarlar</CardTitle></CardHeader>
      <CardBody className="space-y-5">
        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted font-display">Görünen ad</label>
          <div className="flex gap-2">
            <input value={name} onChange={e => setName(e.target.value)}
              className="h-10 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg focus:border-primary focus:outline-none" />
            <Button variant="primary" onClick={save}>{saved ? <Check size={15} /> : 'Kaydet'}</Button>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted font-display">Tema</label>
          <ThemeSwitcher />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted font-display">Hatırlatıcı bildirimleri</label>
          <button onClick={toggleNotifs}
            className={cn(
              'flex w-full items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition-all',
              notifEnabled ? 'border-success/40 bg-success/5 text-fg' : 'border-border bg-surface-2 text-muted hover:text-fg',
            )}>
            {notifEnabled ? <Bell size={16} className="text-success" /> : <BellOff size={16} />}
            {notifEnabled ? 'Açık (uygulama açıkken hatırlatır)' : 'Kapalı, açmak için dokun'}
          </button>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted font-display">Veri kaydı</label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-fg">
            {cloud ? <Cloud size={16} className="text-success" /> : <HardDrive size={16} className="text-muted" />}
            {cloud ? 'Buluta senkron (Supabase)' : 'Bu cihazda (localStorage)'}
          </div>
        </div>
      </CardBody>
    </Card>
  )
}
