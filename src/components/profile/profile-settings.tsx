'use client'
import { useState, useRef } from 'react'
import { Cloud, HardDrive, Check, Bell, BellOff, Download, Upload, AlertTriangle } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/layout/theme-switcher'
import { showAppNotification } from '@/lib/notify'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

const STORAGE_KEY = 'manage_app_data_v2'

export function ProfileSettings() {
  const { data, setProfileName, setNotificationsEnabled, setMorningReminder, setEveningReminder, cloud } = useStore()
  const [name, setName] = useState(data.profile.name)
  const [saved, setSaved] = useState(false)
  const [importMsg, setImportMsg] = useState<{ ok: boolean; text: string } | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const notifEnabled = !!data.profile.notificationsEnabled

  function save() {
    if (name.trim()) { setProfileName(name.trim()); setSaved(true); setTimeout(() => setSaved(false), 1500) }
  }

  function exportData() {
    const json = JSON.stringify(data, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `manage-backup-${format(new Date(), 'yyyy-MM-dd')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  function importData(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const parsed = JSON.parse(ev.target?.result as string)
        if (!parsed?.profile || !Array.isArray(parsed?.habits)) throw new Error('Geçersiz dosya')
        localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed))
        setImportMsg({ ok: true, text: 'İçe aktarma başarılı! Sayfa yenileniyor...' })
        setTimeout(() => window.location.reload(), 1200)
      } catch {
        setImportMsg({ ok: false, text: 'Dosya okunamadı. Geçerli bir yedek dosyası seçin.' })
        setTimeout(() => setImportMsg(null), 3000)
      }
    }
    reader.readAsText(file)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function toggleNotifs() {
    if (notifEnabled) { setNotificationsEnabled(false); return }
    if (typeof window === 'undefined' || !('Notification' in window)) return
    let perm = Notification.permission
    if (perm === 'default') perm = await Notification.requestPermission()
    if (perm === 'granted') {
      setNotificationsEnabled(true)
      void showAppNotification('Bildirimler açık', 'Hatırlatıcıların artık burada görünecek.', 'notif-enabled')
    }
  }

  function sendTest() {
    void showAppNotification('Test bildirimi', 'Bildirimler çalışıyor! 🎉', 'notif-test')
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
          {notifEnabled && (
            <button onClick={sendTest} className="mt-2 text-xs text-muted underline-offset-2 hover:text-fg hover:underline">
              Test bildirimi gönder
            </button>
          )}
        </div>

        {notifEnabled && (
          <div className="space-y-3">
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted font-display">Sabah özeti saati</label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={data.profile.morningReminderTime ?? ''}
                  onChange={e => setMorningReminder(e.target.value || null)}
                  className="h-10 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg focus:border-primary focus:outline-none"
                />
                {data.profile.morningReminderTime && (
                  <button onClick={() => setMorningReminder(null)} className="text-xs text-muted hover:text-danger">Kaldır</button>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">Kaç alışkanlığın olduğunu hatırlatır.</p>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-medium text-muted font-display">Akşam özeti saati</label>
              <div className="flex items-center gap-2">
                <input
                  type="time"
                  value={data.profile.eveningReminderTime ?? ''}
                  onChange={e => setEveningReminder(e.target.value || null)}
                  className="h-10 flex-1 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg focus:border-primary focus:outline-none"
                />
                {data.profile.eveningReminderTime && (
                  <button onClick={() => setEveningReminder(null)} className="text-xs text-muted hover:text-danger">Kaldır</button>
                )}
              </div>
              <p className="mt-1 text-xs text-muted">Bugün kaçını tamamladığını gösterir.</p>
            </div>
          </div>
        )}

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted font-display">Veri kaydı</label>
          <div className="flex items-center gap-2 rounded-lg border border-border bg-surface-2 px-3 py-2.5 text-sm text-fg">
            {cloud ? <Cloud size={16} className="text-success" /> : <HardDrive size={16} className="text-muted" />}
            {cloud ? 'Buluta senkron (Supabase)' : 'Bu cihazda (localStorage)'}
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-medium text-muted font-display">Veri yedekle / geri yükle</label>
          <div className="flex gap-2">
            <Button variant="secondary" className="flex-1" onClick={exportData}>
              <Download size={14} /> Dışa aktar
            </Button>
            <Button variant="secondary" className="flex-1" onClick={() => fileRef.current?.click()}>
              <Upload size={14} /> İçe aktar
            </Button>
            <input ref={fileRef} type="file" accept=".json" className="hidden" onChange={importData} />
          </div>
          {importMsg && (
            <div className={cn(
              'mt-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs',
              importMsg.ok ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger',
            )}>
              {importMsg.ok ? <Check size={13} /> : <AlertTriangle size={13} />}
              {importMsg.text}
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )
}
