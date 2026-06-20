'use client'
import React from 'react'

export interface SpriteDef {
  palette: Record<string, string>
  rows: string[]
}

// ---- 8-bit sprite library (hand-drawn pixel grids) ----
export const SPRITES: Record<string, SpriteDef> = {
  heart: {
    palette: { k: '#7a1733', R: '#ff5c8a', w: '#ffd0df' },
    rows: [
      '.kk..kk.',
      'kRwkkRRk',
      'kRRRRRRk',
      'kRRRRRRk',
      '.kRRRRk.',
      '..kRRk..',
      '...kk...',
    ],
  },
  star: {
    palette: { k: '#8a5a00', Y: '#ffd24a', w: '#fff2b0' },
    rows: [
      '....k....',
      '...kYk...',
      '...kwk...',
      'kkkYYYkkk',
      '.kYYYYYk.',
      '..kYYYk..',
      '.kYk.kYk.',
      '.k.....k.',
    ],
  },
  gem: {
    palette: { k: '#0b4a8a', C: '#7fdfff', w: '#d6f6ff' },
    rows: [
      '.kkkkk.',
      'kCwwwCk',
      '.kCCCk.',
      '.kCCCk.',
      '..kCk..',
      '..kCk..',
      '...k...',
    ],
  },
  ghost: {
    palette: { k: '#2a1d4a', G: '#b39dff', E: '#15152a' },
    rows: [
      '.kGGGk.',
      'kGGGGGk',
      'kGEGEGk',
      'kGEGEGk',
      'kGGGGGk',
      'kGGGGGk',
      'kGkGkGk',
    ],
  },
  sword: {
    palette: { B: '#dfe6f0', w: '#ffffff', G: '#caa14a', H: '#7a4a1f', k: '#2a2a3a' },
    rows: [
      '...B...',
      '..BwB..',
      '..BwB..',
      '..BwB..',
      '.GGGGG.',
      '...H...',
      '...H...',
      '..HHH..',
    ],
  },
  potion: {
    palette: { k: '#3a3a5a', P: '#54defc', w: '#d6f6ff' },
    rows: [
      '..k.k..',
      '..k.k..',
      '.kk.kk.',
      '.kPwPk.',
      '.kPPPk.',
      '.kPPPk.',
      '.kPPPk.',
      '.kkkkk.',
      '..kkk..',
    ],
  },
  coin: {
    palette: { k: '#8a5a00', Y: '#ffd24a', w: '#fff2b0' },
    rows: [
      '.kkkk.',
      'kYwwYk',
      'kYkYYk',
      'kYYkYk',
      'kYwwYk',
      '.kkkk.',
    ],
  },
  controller: {
    palette: { k: '#22243f', P: '#9b6dff', w: '#e7deff', B: '#54defc' },
    rows: [
      '.kkkkkkk.',
      'kPwPPPwPk',
      'kPPPPPPPk',
      'kwPBPBPwk',
      'kPPPPPPPk',
      '.kk...kk.',
    ],
  },
  // Brix imza "yürüyen karakter" — bizim pixel diline uyarlanmış küçük kahraman.
  hero: {
    palette: { k: '#14233b', s: '#f3c79a', h: '#7a4a1f', c: '#06b6d4', d: '#0e7490', p: '#334155', b: '#0f172a' },
    rows: [
      '..kkkk..',
      '.khhhhk.',
      '.kssssk.',
      '.kskssk.',
      '.kssssk.',
      '..kcck..',
      'kccddcck',
      'kccddcck',
      '.kcccsk.',
      '.kp..pk.',
      '.kp..pk.',
      '.bb..bb.',
    ],
  },
}

export function PixelSprite({
  name,
  pixel = 6,
  className,
  style,
}: {
  name: keyof typeof SPRITES
  pixel?: number
  className?: string
  style?: React.CSSProperties
}) {
  const sprite = SPRITES[name]
  const h = sprite.rows.length
  const w = sprite.rows[0]?.length ?? 0
  const rects: React.ReactNode[] = []
  sprite.rows.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      const ch = row[x]
      if (ch === '.' ) continue
      const fill = sprite.palette[ch]
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
