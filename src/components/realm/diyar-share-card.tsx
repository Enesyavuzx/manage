'use client'
import { useState } from 'react'
import { Download } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { buildRealm } from '@/lib/realm'
import { REALM_SPRITES } from './realm-sprite'
import { Button } from '@/components/ui/button'

// Diyarın anlık görüntüsünü paylaşılabilir bir PNG karta dönüştürür.
// Harici kütüphane yok: SVG string üretip canvas üzerinden PNG'ye çeviriyoruz,
// böylece tamamen çevrimdışı çalışır.

const W = 640
const H = 400

function shade(hex: string, amount: number): string {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m
  let r = parseInt(full.slice(0, 2), 16)
  let g = parseInt(full.slice(2, 4), 16)
  let b = parseInt(full.slice(4, 6), 16)
  const adj = (c: number) => (amount >= 0 ? Math.round(c + (255 - c) * amount) : Math.round(c * (1 + amount)))
  r = Math.max(0, Math.min(255, adj(r)))
  g = Math.max(0, Math.min(255, adj(g)))
  b = Math.max(0, Math.min(255, adj(b)))
  return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`
}

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// Bir sprite'ı verilen taban çizgisine oturacak şekilde <rect> dizisine çevirir.
function spriteRects(name: string, tint: string | undefined, px: number, baseX: number, baselineY: number): { svg: string; width: number } {
  const sp = REALM_SPRITES[name]
  if (!sp) return { svg: '', width: 0 }
  const palette: Record<string, string> = { ...sp.palette }
  if (tint && sp.tintKeys) {
    palette[sp.tintKeys.main] = tint
    palette[sp.tintKeys.dark] = shade(tint, -0.28)
    palette[sp.tintKeys.light] = shade(tint, 0.32)
  }
  const h = sp.rows.length
  const w = (sp.rows[0]?.length ?? 0)
  const topY = baselineY - h * px
  let out = ''
  sp.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      const fill = palette[ch]
      if (!fill) continue
      out += `<rect x="${baseX + x * px}" y="${topY + y * px}" width="${px + 0.5}" height="${px + 0.5}" fill="${fill}"/>`
    }
  })
  return { svg: out, width: w * px }
}

function buildSvg(data: ReturnType<typeof useStore>['data']): string {
  const world = buildRealm(data)
  const name = data.profile.realmName || 'Diyarım'
  const banner = data.profile.realmBanner || '#e0b341'
  const date = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' })

  const bg = '#0c0e14'
  const card = '#13151d'
  const text = '#f4f4f6'
  const muted = '#9aa0ad'

  // Stat kutuları
  const stats = [
    { v: world.population.toLocaleString('tr-TR'), l: 'NÜFUS' },
    { v: `${world.buildingCount}`, l: 'YAPI' },
    { v: `${world.landmarkCount}`, l: 'KALE' },
    { v: `${world.monuments.length}`, l: 'ESER' },
  ]
  const pad = 28
  const gap = 12
  const boxW = (W - pad * 2 - gap * 3) / 4
  const boxY = 112
  const boxH = 70
  let statsSvg = ''
  stats.forEach((s, i) => {
    const x = pad + i * (boxW + gap)
    statsSvg += `<rect x="${x}" y="${boxY}" width="${boxW}" height="${boxH}" rx="10" fill="${card}" stroke="#262a36"/>`
    statsSvg += `<text x="${x + boxW / 2}" y="${boxY + 34}" text-anchor="middle" fill="${text}" font-size="24" font-weight="700" font-family="ui-sans-serif,system-ui,Arial,sans-serif">${esc(s.v)}</text>`
    statsSvg += `<text x="${x + boxW / 2}" y="${boxY + 54}" text-anchor="middle" fill="${muted}" font-size="11" letter-spacing="1" font-family="ui-sans-serif,system-ui,Arial,sans-serif">${s.l}</text>`
  })

  // Zemin + skyline
  const groundTop = H - 66
  const baselineY = H - 40
  let ground = ''
  ground += `<rect x="0" y="${groundTop}" width="${W}" height="${H - groundTop}" fill="#1b2a18"/>`
  ground += `<rect x="0" y="${groundTop}" width="${W}" height="8" fill="#2f5a2a"/>`

  const built = world.structures.filter(s => s.stage >= 1).slice(0, 9)
  const px = 4
  // Toplam genişliği hesapla, ortala
  const widths = built.map(s => (REALM_SPRITES[s.sprite]?.rows[0]?.length ?? 8) * px)
  const sgap = 10
  const total = widths.reduce((a, b) => a + b, 0) + sgap * Math.max(0, built.length - 1)
  let cx = Math.max(pad, (W - total) / 2)
  let skyline = ''
  if (built.length === 0) {
    skyline += `<text x="${W / 2}" y="${baselineY - 18}" text-anchor="middle" fill="${muted}" font-size="14" font-family="ui-sans-serif,system-ui,Arial,sans-serif">İlk alışkanlığını tamamla, diyarın yükselsin</text>`
  } else {
    built.forEach((s, i) => {
      const { svg } = spriteRects(s.sprite, s.color, px, cx, baselineY)
      skyline += svg
      cx += widths[i] + sgap
    })
  }

  // Üstte birkaç piksel yıldız
  let stars = ''
  const sr = [[60, 40], [120, 60], [520, 36], [580, 64], [300, 30], [440, 54]]
  sr.forEach(([x, y]) => { stars += `<rect x="${x}" y="${y}" width="2" height="2" fill="#ffffff" opacity="0.5"/>` })

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" shape-rendering="crispEdges">
    <defs>
      <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stop-color="#0c1430"/>
        <stop offset="100%" stop-color="${bg}"/>
      </linearGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#sky)"/>
    ${stars}
    <rect x="${pad}" y="38" width="18" height="18" rx="3" fill="${banner}"/>
    <text x="${pad + 28}" y="56" fill="${text}" font-size="30" font-weight="800" font-family="ui-sans-serif,system-ui,Arial,sans-serif">${esc(name)}</text>
    <text x="${pad}" y="86" fill="${muted}" font-size="14" font-family="ui-sans-serif,system-ui,Arial,sans-serif">${esc(world.phase.label)} · ${world.population.toLocaleString('tr-TR')} nüfus · ${esc(date)}</text>
    ${statsSvg}
    ${ground}
    ${skyline}
    <text x="${pad}" y="${H - 14}" fill="${muted}" font-size="12" font-family="ui-sans-serif,system-ui,Arial,sans-serif">MANAGE · alışkanlık diyarı</text>
  </svg>`
}

export function DiyarShareCard() {
  const { data } = useStore()
  const [busy, setBusy] = useState(false)

  function download() {
    setBusy(true)
    try {
      const svg = buildSvg(data)
      const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' })
      const url = URL.createObjectURL(blob)
      const img = new Image()
      img.onload = () => {
        const scale = 2
        const canvas = document.createElement('canvas')
        canvas.width = W * scale
        canvas.height = H * scale
        const ctx = canvas.getContext('2d')
        if (!ctx) { URL.revokeObjectURL(url); setBusy(false); return }
        ctx.scale(scale, scale)
        ctx.drawImage(img, 0, 0)
        URL.revokeObjectURL(url)
        canvas.toBlob(png => {
          if (png) {
            const a = document.createElement('a')
            const href = URL.createObjectURL(png)
            const safe = (data.profile.realmName || 'diyar').replace(/[^\p{L}\p{N}]+/gu, '-').toLowerCase()
            a.href = href
            a.download = `${safe || 'diyar'}-diyar.png`
            document.body.appendChild(a)
            a.click()
            a.remove()
            setTimeout(() => URL.revokeObjectURL(href), 1000)
          }
          setBusy(false)
        }, 'image/png')
      }
      img.onerror = () => { URL.revokeObjectURL(url); setBusy(false) }
      img.src = url
    } catch {
      setBusy(false)
    }
  }

  return (
    <Button variant="secondary" className="w-full gap-2" onClick={download} disabled={busy}>
      <Download size={15} /> {busy ? 'Kart hazırlanıyor...' : 'Diyar kartını indir'}
    </Button>
  )
}
