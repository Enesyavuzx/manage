'use client'
import { useMemo, useState } from 'react'
import { Download } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { getSeasonSummary } from '@/lib/season'
import { downloadSvgAsPng, escapeXml } from '@/lib/share'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

const W = 600
const H = 320

export function SeasonSummary() {
  const { data } = useStore()
  const summary = useMemo(() => getSeasonSummary(data), [data])
  const [busy, setBusy] = useState(false)

  if (!summary) return null

  const realm = data.profile.realmName || 'Diyarın'
  const banner = data.profile.realmBanner || '#e0b341'

  function buildSvg(): string {
    const s = summary!
    const bg = '#0c0e14', card = '#13151d', text = '#f4f4f6', muted = '#9aa0ad'
    const deltaStr = s.hadBefore ? `${s.delta >= 0 ? '+' : ''}${s.delta} (önceki sezona göre)` : 'ilk dolu sezonun'
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
      <rect width="${W}" height="${H}" fill="${bg}"/>
      <rect x="24" y="28" width="16" height="16" rx="3" fill="${banner}"/>
      <text x="50" y="42" fill="${text}" font-size="22" font-weight="800" font-family="ui-sans-serif,system-ui,Arial,sans-serif">${escapeXml(realm)}</text>
      <text x="24" y="78" fill="${muted}" font-size="14" font-family="ui-sans-serif,system-ui,Arial,sans-serif">${escapeXml(s.label)} özeti</text>
      <rect x="24" y="96" width="${W - 48}" height="96" rx="14" fill="${card}" stroke="#262a36"/>
      <text x="44" y="150" fill="${text}" font-size="46" font-weight="800" font-family="ui-sans-serif,system-ui,Arial,sans-serif">${s.completions}</text>
      <text x="44" y="174" fill="${muted}" font-size="13" font-family="ui-sans-serif,system-ui,Arial,sans-serif">tamamlama · ${escapeXml(deltaStr)}</text>
      <rect x="24" y="208" width="${W - 48}" height="64" rx="14" fill="${card}" stroke="#262a36"/>
      <text x="44" y="240" fill="${text}" font-size="16" font-weight="700" font-family="ui-sans-serif,system-ui,Arial,sans-serif">${s.tiersReached} kademe açıldı</text>
      <text x="44" y="260" fill="${muted}" font-size="13" font-family="ui-sans-serif,system-ui,Arial,sans-serif">${s.topTierLabel ? escapeXml('En yüksek: ' + s.topTierLabel) : 'Yeni sezon, yeni başlangıç'}</text>
      <text x="24" y="${H - 16}" fill="${muted}" font-size="12" font-family="ui-sans-serif,system-ui,Arial,sans-serif">MANAGE · sezon kartı</text>
    </svg>`
  }

  function download() {
    setBusy(true)
    const safe = (data.profile.realmName || 'diyar').replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()
    downloadSvgAsPng(buildSvg(), W, H, `${safe || 'diyar'}-${summary!.label.toLowerCase().replace(/\s/g, '-')}.png`, () => setBusy(false))
  }

  return (
    <Card className={cn('overflow-hidden', summary.justStarted && 'border-xp/40')}>
      <div className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="text-base">📊</span>
          <span className="text-sm font-bold text-fg font-display">
            {summary.justStarted ? 'Yeni sezon başladı!' : `${summary.label} özeti`}
          </span>
        </div>
        <span className="text-xs text-muted">{summary.label}</span>
      </div>
      <div className="p-4">
        {summary.justStarted && (
          <p className="mb-3 text-xs text-muted">Taze bir başlangıç. Geçen sezon böyleydi:</p>
        )}
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className="text-2xl font-bold text-fg font-display tabular-nums">{summary.completions}</p>
            <p className="text-xs text-muted">tamamlama</p>
          </div>
          <div className="rounded-xl border border-border bg-surface-2 p-3">
            <p className={cn('text-2xl font-bold font-display tabular-nums', !summary.hadBefore ? 'text-fg' : summary.delta >= 0 ? 'text-success' : 'text-danger')}>
              {summary.hadBefore ? `${summary.delta >= 0 ? '+' : ''}${summary.delta}` : '—'}
            </p>
            <p className="text-xs text-muted">{summary.hadBefore ? 'önceki sezona göre' : 'ilk dolu sezon'}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-fg">
          <span className="font-semibold">{summary.tiersReached} kademe</span> açıldı
          {summary.topTierLabel && <span className="text-muted"> · en yüksek: {summary.topTierLabel}</span>}
        </p>
        <button onClick={download} disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-surface-2 py-2.5 text-sm font-medium text-fg transition-colors hover:border-border-hover disabled:opacity-50">
          <Download size={15} /> {busy ? 'Hazırlanıyor...' : 'Sezon kartını indir'}
        </button>
      </div>
    </Card>
  )
}
