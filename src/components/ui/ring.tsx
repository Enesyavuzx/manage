'use client'

interface RingProps {
  progress: number       // 0..1
  size?: number
  stroke?: number
  color?: string         // css color; defaults to primary
  trackColor?: string
  children?: React.ReactNode
  glow?: boolean
}

export function Ring({
  progress, size = 120, stroke = 10,
  color = 'rgb(var(--c-primary))',
  trackColor = 'rgb(var(--c-surface2))',
  children, glow = true,
}: RingProps) {
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(1, Math.max(0, progress)))

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={trackColor} strokeWidth={stroke} />
        <circle
          cx={size / 2} cy={size / 2} r={r} fill="none"
          stroke={color} strokeWidth={stroke} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          style={{
            transition: 'stroke-dashoffset 0.8s cubic-bezier(0.16,1,0.3,1)',
            filter: glow ? `drop-shadow(0 0 6px ${color})` : undefined,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
