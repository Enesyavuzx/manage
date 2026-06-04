'use client'
import { useMemo } from 'react'

// Tüm sitenin arkasında duran gerçek piksel-art katmanı. Temadan bağımsız her
// zaman görünür (aurora/neon/pixel hepsinde). İçerik okunabilirliğini bozmamak
// için düşük opaklıkta ve tema renkleriyle (currentColor / CSS değişkeni) çizilir.
// crispEdges + tam sayı koordinatlar = sert, "piksel piksel" kenarlar.

function rng(seed: number) {
  let s = seed % 2147483647
  if (s <= 0) s += 2147483646
  return () => (s = (s * 16807) % 2147483647) / 2147483647
}

const VW = 320 // sanal piksel genişliği (viewBox)
const VH = 200

export function PixelBackdrop() {
  // Yıldızlar
  const stars = useMemo(() => {
    const r = rng(101)
    return Array.from({ length: 70 }).map((_, i) => ({
      x: Math.floor(r() * VW),
      y: Math.floor(r() * (VH * 0.55)),
      big: r() > 0.82,
      delay: (i % 7) * 0.4,
    }))
  }, [])

  // Uzak tepe silüeti: basamaklı (pixelated) tepe çizgisi -> polygon noktaları
  const farHills = useMemo(() => buildHillPath(VW, VH, 0.72, 26, 9001, 14), [])
  const nearHills = useMemo(() => buildHillPath(VW, VH, 0.82, 18, 4242, 10), [])

  // Kayan yıldızlar — uzun periyotlu, aynı anda birden görünmez
  const shootingStars = useMemo(() => [
    { x: 40, y: 18, delay: 0 },
    { x: 180, y: 8, delay: 6 },
    { x: 260, y: 22, delay: 12 },
  ], [])

  // Uzak şehir silüeti (ufukta minik binalar)
  const skyline = useMemo(() => {
    const r = rng(555)
    const baseY = Math.floor(VH * 0.74)
    const blocks: { x: number; y: number; w: number; h: number }[] = []
    let x = 10
    while (x < VW - 10) {
      const w = 6 + Math.floor(r() * 8)
      const h = 8 + Math.floor(r() * 26)
      blocks.push({ x, y: baseY - h, w, h })
      x += w + 1 + Math.floor(r() * 4)
    }
    return { baseY, blocks }
  }, [])

  return (
    <div className="pixel-backdrop pointer-events-none fixed inset-0 -z-10" aria-hidden="true">
      <svg
        className="h-full w-full"
        viewBox={`0 0 ${VW} ${VH}`}
        preserveAspectRatio="xMidYMax slice"
        shapeRendering="crispEdges"
      >
        {/* yıldızlar */}
        <g className="text-fg">
          {stars.map((st, i) => (
            <rect
              key={i}
              x={st.x}
              y={st.y}
              width={st.big ? 2 : 1}
              height={st.big ? 2 : 1}
              fill="currentColor"
              opacity={st.big ? 0.5 : 0.3}
              className="animate-twinkle"
              style={{ animationDelay: `${st.delay}s` }}
            />
          ))}
        </g>

        {/* kayan yıldızlar */}
        <g className="text-fg">
          {shootingStars.map((ss, i) => (
            <rect
              key={`shoot-${i}`}
              x={ss.x}
              y={ss.y}
              width={2}
              height={1}
              fill="currentColor"
              opacity={0}
              className="animate-shoot"
              style={{ animationDelay: `${ss.delay}s` }}
            />
          ))}
        </g>

        {/* uzak şehir silüeti */}
        <g className="text-primary-2" opacity={0.1}>
          {skyline.blocks.map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="currentColor" />
          ))}
        </g>

        {/* uzak tepeler */}
        <path d={farHills} className="text-primary" fill="currentColor" opacity={0.12} />
        {/* yakın tepeler */}
        <path d={nearHills} className="text-primary" fill="currentColor" opacity={0.18} />
      </svg>
    </div>
  )
}

// Basamaklı (pixelated) tepe silüeti üretir. step = piksel basamak genişliği.
function buildHillPath(w: number, h: number, baseRatio: number, amp: number, seed: number, step: number): string {
  const r = rng(seed)
  const baseY = Math.floor(h * baseRatio)
  let y = baseY - Math.floor(r() * amp)
  const pts: string[] = [`M0 ${h}`, `L0 ${y}`]
  for (let x = 0; x <= w; x += step) {
    // rastgele yukarı/aşağı basamak
    y += Math.floor((r() - 0.5) * amp * 0.9)
    y = Math.max(Math.floor(h * (baseRatio - 0.18)), Math.min(Math.floor(h * (baseRatio + 0.12)), y))
    pts.push(`L${x} ${y}`)
  }
  pts.push(`L${w} ${h}`, 'Z')
  return pts.join(' ')
}
