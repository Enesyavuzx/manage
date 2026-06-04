'use client'
import React from 'react'

// Diyar (realm) için piksel yapı kütüphanesi. decor/pixel-sprite.tsx ile aynı
// teknik: satır tabanlı ızgara + palet. Buradaki paletlerde 'M' (main) anahtarı
// alışkanlığın rengiyle çalışma zamanında boyanır; 'm' onun koyu tonu, 'h' açık
// tonudur. Böylece aynı sprite farklı alışkanlıklarda farklı renkte görünür.

export interface RealmSpriteDef {
  palette: Record<string, string>  // sabit renkler
  rows: string[]
  tintKeys?: { main: string; dark: string; light: string }  // habit rengiyle boyanacak anahtarlar
}

export const REALM_SPRITES: Record<string, RealmSpriteDef> = {
  // --- yapılar: çatısı/duvarı alışkanlık rengiyle boyanır ---
  hut: {
    palette: { k: '#2b2030', d: '#6b4a2f', D: '#503722', g: '#3a5a2e' },
    tintKeys: { main: 'M', dark: 'm', light: 'h' },
    rows: [
      '...kk...',
      '..kMMk..',
      '.kMMMMk.',
      'kMMMMMMk',
      'kmddddmk',
      'kdDkkDdk',
      'kdDkkDdk',
      'kggggggk',
    ],
  },
  house: {
    palette: { k: '#241a2c', d: '#caa06a', D: '#8a6438', w: '#bfe6ff', g: '#34512b' },
    tintKeys: { main: 'M', dark: 'm', light: 'h' },
    rows: [
      '...kkk....',
      '..kMMMk...',
      '.kMMMMMk..',
      'kMMMMMMMk.',
      'khMMMMMmk.',
      'kdddddddk.',
      'kdwwdwwdk.',
      'kdwwdwwdk.',
      'kdDdkdDdk.',
      'kggggggggk',
    ],
  },
  tower: {
    palette: { k: '#1c1626', d: '#cfa46a', D: '#7c5a32', w: '#cdeeff', g: '#2f4a27' },
    tintKeys: { main: 'M', dark: 'm', light: 'h' },
    rows: [
      '..........',
      '...kk.....',
      '..kMMk....',
      '.kMMMMk...',
      'kMMMMMMk..',
      'khMMMMmk..',
      'kdwddwdk..',
      'kddddddk..',
      'kdwddwdk..',
      'kddddddk..',
      'kdwddwdk..',
      'kdDkkDdk..',
      'kggggggk..',
    ],
  },
  // --- doğa: sabit renkli ambient ---
  tree: {
    palette: { k: '#173a1a', G: '#3fae54', g: '#2c8a40', H: '#7be08a', t: '#6b4a2f', T: '#503722' },
    rows: [
      '..kGGk..',
      '.kGHGGk.',
      'kGHGGGGk',
      'kGGGGGgk',
      '.kGGGgk.',
      '..ktTk..',
      '...tT...',
      '..kttk..',
    ],
  },
  pine: {
    palette: { k: '#0f3a2a', G: '#2f8f5a', H: '#5fcf86', t: '#503722' },
    rows: [
      '...k...',
      '..kGk..',
      '.kGHGk.',
      '..kGk..',
      '.kGHGk.',
      'kGGGGGk',
      '...t...',
      '..ktk..',
    ],
  },
  // --- gökyüzü ---
  sun: {
    palette: { Y: '#ffd24a', w: '#fff2b0', o: '#ffae3b' },
    rows: [
      '.wwww.',
      'wYYYYw',
      'wYYYYw',
      'wYYYYw',
      'oYYYYo',
      '.oooo.',
    ],
  },
  moon: {
    palette: { w: '#e8ecff', W: '#ffffff', s: '#b9c2e6' },
    rows: [
      '.WWw..',
      'WWWws.',
      'WWWws.',
      'WWWws.',
      '.WWws.',
      '..ss..',
    ],
  },
  cloud: {
    palette: { w: '#ffffff', s: '#d7def0' },
    rows: [
      '..wwww..',
      '.wwwwwws',
      'wwwwwwww',
      'sswwwwss',
    ],
  },
}

export function RealmSprite({
  name,
  pixel = 6,
  tint,
  className,
  style,
}: {
  name: keyof typeof REALM_SPRITES
  pixel?: number
  tint?: string
  className?: string
  style?: React.CSSProperties
}) {
  const sprite = REALM_SPRITES[name]
  const palette = { ...sprite.palette }

  // Habit rengini main/dark/light olarak palete enjekte et.
  if (tint && sprite.tintKeys) {
    palette[sprite.tintKeys.main] = tint
    palette[sprite.tintKeys.dark] = shade(tint, -0.28)
    palette[sprite.tintKeys.light] = shade(tint, 0.32)
  }

  const h = sprite.rows.length
  const w = sprite.rows[0]?.length ?? 0
  const rects: React.ReactNode[] = []
  sprite.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.') continue
      const fill = palette[ch]
      if (!fill) continue
      rects.push(<rect key={`${x}-${y}`} x={x} y={y} width={1.02} height={1.02} fill={fill} />)
    }
  })

  return (
    <svg
      className={className}
      style={style}
      width={w * pixel}
      height={h * pixel}
      viewBox={`0 0 ${w} ${h}`}
      shapeRendering="crispEdges"
      aria-hidden="true"
    >
      {rects}
    </svg>
  )
}

// Hex rengi açıp/koyultur (amount: -1..1).
function shade(hex: string, amount: number): string {
  const m = hex.replace('#', '')
  const full = m.length === 3 ? m.split('').map(c => c + c).join('') : m
  let r = parseInt(full.slice(0, 2), 16)
  let g = parseInt(full.slice(2, 4), 16)
  let b = parseInt(full.slice(4, 6), 16)
  const adj = (c: number) => {
    if (amount >= 0) return Math.round(c + (255 - c) * amount)
    return Math.round(c * (1 + amount))
  }
  r = Math.max(0, Math.min(255, adj(r)))
  g = Math.max(0, Math.min(255, adj(g)))
  b = Math.max(0, Math.min(255, adj(b)))
  return `#${[r, g, b].map(c => c.toString(16).padStart(2, '0')).join('')}`
}
