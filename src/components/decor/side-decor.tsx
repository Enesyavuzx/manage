'use client'
import { PixelSprite, SPRITES } from './pixel-sprite'

type Name = keyof typeof SPRITES

const LEFT: { name: Name; pixel: number; delay: string }[] = [
  { name: 'star',       pixel: 6, delay: '0s' },
  { name: 'potion',     pixel: 6, delay: '1.2s' },
  { name: 'heart',      pixel: 7, delay: '0.6s' },
  { name: 'coin',       pixel: 7, delay: '1.8s' },
  { name: 'gem',        pixel: 6, delay: '0.3s' },
]

const RIGHT: { name: Name; pixel: number; delay: string }[] = [
  { name: 'ghost',      pixel: 6, delay: '0.9s' },
  { name: 'sword',      pixel: 6, delay: '0.2s' },
  { name: 'controller', pixel: 6, delay: '1.5s' },
  { name: 'star',       pixel: 5, delay: '0.7s' },
  { name: 'heart',      pixel: 6, delay: '2.1s' },
]

function Column({ items, side }: { items: typeof LEFT; side: 'left' | 'right' }) {
  return (
    <div
      className={
        'side-decor pointer-events-none fixed top-0 z-0 h-screen w-16 flex-col items-center justify-around py-20 ' +
        (side === 'left' ? 'left-[240px]' : 'right-1')
      }
      aria-hidden="true"
    >
      {items.map((it, i) => (
        <div
          key={`${it.name}-${i}`}
          className="pixelated animate-float opacity-80 drop-shadow-[0_4px_10px_rgba(0,0,0,0.4)]"
          style={{ animationDelay: it.delay, animationDuration: `${5 + (i % 3)}s` }}
        >
          <PixelSprite name={it.name} pixel={it.pixel} />
        </div>
      ))}
    </div>
  )
}

export function SideDecor() {
  return (
    <>
      <Column items={LEFT} side="left" />
      <Column items={RIGHT} side="right" />
    </>
  )
}
