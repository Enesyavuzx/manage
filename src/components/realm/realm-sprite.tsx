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
  // anıt: en yüksek aşamadaki alışkanlık (stage 5). Duvarları alışkanlık rengiyle boyanır.
  castle: {
    palette: { k: '#1c1626', w: '#cdeeff', d: '#5a3a1f', g: '#2f4a27' },
    tintKeys: { main: 'M', dark: 'm', light: 'h' },
    rows: [
      'M.M.......M.M',
      'MMM.......MMM',
      'kMmk.....kMmk',
      'kMMk.MMM.kMMk',
      'kMMkMMhMMkMMk',
      'kMMMMMwMMMMMk',
      'kMhMMMMMMMmMk',
      'kMMwMMMMMwMMk',
      'kMMMMMMMMMMMk',
      'kMMMMdddMMMMk',
      'kMMMMdwdMMMMk',
      'kMhMMdddMMmMk',
      'kkkkkdddkkkkk',
      'ggggggggggggg',
    ],
  },
  // --- anıtlar / dekor: sabit renkli ---
  fountain: {
    palette: { k: '#3a3f4a', s: '#9aa3b2', S: '#7c8492', W: '#7fd0ff', w: '#cdeeff' },
    rows: [
      '..wWWw...',
      '.sWwwWs..',
      '.sWWWWs..',
      '..ssss...',
      '.SSSSSS..',
      'SsssssS..',
      'SSSSSSSS.',
      'kkkkkkkk.',
    ],
  },
  lamppost: {
    palette: { Y: '#ffd24a', w: '#fff2b0', k: '#3a3340' },
    rows: [
      '.YYY.',
      'YYwYY',
      'YkkkY',
      '.kkk.',
      '..k..',
      '..k..',
      '..k..',
      '.kkk.',
      'kkkkk',
    ],
  },
  bush: {
    palette: { G: '#3fae54', H: '#7be08a', g: '#2c8a40', k: '#173a1a' },
    rows: [
      '..GG...',
      '.GHGGg.',
      'GGGGGGG',
      'GgGGGgG',
      '.kk.kk.',
    ],
  },
  bird: {
    palette: { k: '#2a2a3a' },
    rows: [
      'k.....k',
      'kk...kk',
      '.kkkkk.',
    ],
  },
  bigtree: {
    palette: { G: '#3fae54', H: '#7be08a', t: '#6b4a2f', T: '#503722', k: '#173a1a' },
    rows: [
      '...kGGk....',
      '..kGHHGk...',
      '.kGHHHGGk..',
      'kGHGGGGGGk.',
      'kGGGGGGGGGk',
      'kGHGGGGGGGk',
      '.kGGGGGGk..',
      '..kGtTGk...',
      '...ktTk....',
      '...tTt.....',
      '..ktttk....',
    ],
  },
  // --- yeni anıtlar ---
  well: {
    palette: { k: '#1c1626', L: '#c8892a', s: '#8090a8', W: '#7fd0ff' },
    rows: [
      '...k...',
      '..kLk..',
      '.kkLkk.',
      '..sss..',
      '.ssWss.',
      '.sssss.',
      '.kkkkk.',
    ],
  },
  windmill: {
    palette: { k: '#1c1626', L: '#f5e8b0', d: '#8a5a30', r: '#c04a2a', h: '#5a3020' },
    rows: [
      'L.......L',
      '.L.....L.',
      '..L...L..',
      '...L.L...',
      '....h....',
      '...L.L...',
      '..L...L..',
      '.L.....L.',
      'L.......L',
      '...kddk..',
      '..kdddk..',
      '.kdddddk.',
      '.kkkkkkk.',
    ],
  },
  // hazine kasası — bütçe sistemi kullanılıyorsa açılır
  treasury: {
    palette: { k: '#1c1626', G: '#c8920a', g: '#a07008', w: '#ffd860', s: '#8090a0', d: '#3a2820' },
    rows: [
      '..kGGkk.',
      '.kGwGGGk',
      'kGGGGGGk',
      'kkkkkkkk',
      'kssssssk',
      'ksddssk.',
      'ks.ww.sk',
      'ksssssk.',
      'kkkkkkk.',
    ],
  },
  // saat kulesi — odak seanslarından açılır
  clocktower: {
    palette: { k: '#1c1626', d: '#7a6a4a', c: '#d8d4be', C: '#b0a880', h: '#c04a2a' },
    rows: [
      '...k...',
      '..kCk..',
      '.kCCCk.',
      '.kCCCk.',
      '..kdk..',
      '..kdk..',
      '.kcCck.',
      '.kchck.',
      '.kcCck.',
      '..kdk..',
      '..kdk..',
      '..kdk..',
      '.kdddk.',
      'kkdddkk',
    ],
  },
  // sıcak hava balonu — tintable envelope
  balloon: {
    palette: { k: '#1c1626', W: '#fffbee' },
    tintKeys: { main: 'M', dark: 'm', light: 'h' },
    rows: [
      '..MMMM..',
      '.MhMMhM.',
      'MMMhMMhM',
      'MMMmMmmM',
      '.MmmmMM.',
      '..MMMM..',
      '...kk...',
      '..k..k..',
      '..kWWk..',
      '..kWWk..',
      '..kkkk..',
    ],
  },
  // köylü — tintable gömlek
  villager: {
    palette: { k: '#1c1626', f: '#e8b87a', p: '#3a4a6a' },
    tintKeys: { main: 'S', dark: 's', light: 't' },
    rows: [
      '.kk.',
      'kffk',
      '.SS.',
      '.SS.',
      'kppk',
      'k..k',
      '.kk.',
    ],
  },
  // maskot kedi (sabit renkli, küçük)
  pet: {
    palette: { o: '#e0904a', O: '#c8783c', k: '#3a2a20' },
    rows: [
      'o....k.k',
      'oo..kooo',
      '.ooooko',
      '.ooooooo',
      '.oooooo.',
      '.k.kk.k.',
    ],
  },
  // maskot köpek
  petDog: {
    palette: { b: '#a9763f', B: '#8a5e30', k: '#3a2a20' },
    rows: [
      '......kk',
      '.....bbb',
      'b...bbbb',
      'bbbbbbbb',
      'bbbbbbbB',
      '.k.kk.k.',
    ],
  },
  // maskot kuş
  petBird: {
    palette: { y: '#f2c14e', o: '#e08a2a', k: '#3a2a20' },
    rows: [
      '.yyy..',
      'yyyyk.',
      'yyyyyo',
      '.yyyy.',
      '.k..k.',
    ],
  },
  // gezgin tüccar (sabit renkli; şapka + cüppe + mal sandığı)
  merchant: {
    palette: { k: '#1c1626', f: '#e8b87a', h: '#6b4a2f', r: '#2f7d4f', b: '#b07a3a', y: '#ffd24a' },
    rows: [
      '...hhh..',
      '..hhhhh.',
      '...fff..',
      '..krrrk.',
      'bbyrrrr.',
      'bbbrrrr.',
      'bybrrrr.',
      '...rrrr.',
      '...k..k.',
    ],
  },
  // başarım anıtı: kahraman heykeli
  statue: {
    palette: { s: '#b8b2a0', S: '#8a8474', p: '#9a9486' },
    rows: [
      '..sss..',
      '..sSs..',
      '...s...',
      '.sssss.',
      'ss.s.ss',
      '...s...',
      '..sss..',
      '..s.s..',
      '.ppppp.',
      '.ppppp.',
      'SSSSSSS',
    ],
  },
  // başarım anıtı: dikilitaş
  obelisk: {
    palette: { s: '#8a8474', S: '#6a6458', y: '#ffd24a' },
    rows: [
      '..y..',
      '.sss.',
      '.sSs.',
      '.sss.',
      '.sSs.',
      '.sss.',
      '.sSs.',
      '.sss.',
      '.sSs.',
      '.sss.',
      'sssss',
      'SSSSS',
    ],
  },
  // başarım anıtı: zafer takı
  arch: {
    palette: { s: '#b8b2a0', S: '#8a8474' },
    rows: [
      'sssssssssss',
      'sSSSSSSSSSs',
      'ssss...ssss',
      'sss.....sss',
      'sss.....sss',
      'sss.....sss',
      'sss.....sss',
      'sss.....sss',
      'sss.....sss',
      'SSS.....SSS',
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
  windowMode,
}: {
  name: keyof typeof REALM_SPRITES
  pixel?: number
  tint?: string
  className?: string
  style?: React.CSSProperties
  // Pencere durumu: 'lit' = sıcak ışık (gece, evde biri var), 'off' = karanlık.
  windowMode?: 'day' | 'lit' | 'off'
}) {
  const sprite = REALM_SPRITES[name]
  const palette = { ...sprite.palette }

  // Habit rengini main/dark/light olarak palete enjekte et.
  if (tint && sprite.tintKeys) {
    palette[sprite.tintKeys.main] = tint
    palette[sprite.tintKeys.dark] = shade(tint, -0.28)
    palette[sprite.tintKeys.light] = shade(tint, 0.32)
  }

  // Pencere ('w'/'W') renklerini gece moduna göre değiştir.
  if (windowMode === 'lit') {
    if (palette.w) palette.w = '#ffdf91'
    if (palette.W) palette.W = '#fff2c0'
  } else if (windowMode === 'off') {
    if (palette.w) palette.w = '#23202e'
    if (palette.W) palette.W = '#2c2838'
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
