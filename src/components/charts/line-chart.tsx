'use client'
import { useId } from 'react'

interface Point { label: string; value: number }

interface LineChartProps {
  data: Point[]
  height?: number
  color?: string
}

export function LineChart({ data, height = 160, color = 'rgb(var(--c-primary))' }: LineChartProps) {
  const id = useId()
  const w = 600
  const h = height
  const pad = { top: 12, right: 8, bottom: 22, left: 8 }
  const max = Math.max(1, ...data.map(d => d.value))
  const innerW = w - pad.left - pad.right
  const innerH = h - pad.top - pad.bottom
  const n = data.length

  const x = (i: number) => pad.left + (n <= 1 ? innerW / 2 : (i / (n - 1)) * innerW)
  const y = (v: number) => pad.top + innerH - (v / max) * innerH

  const linePath = data.map((d, i) => `${i === 0 ? 'M' : 'L'} ${x(i)} ${y(d.value)}`).join(' ')
  const areaPath = `${linePath} L ${x(n - 1)} ${pad.top + innerH} L ${x(0)} ${pad.top + innerH} Z`

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full" preserveAspectRatio="none" style={{ height }}>
      <defs>
        <linearGradient id={`grad-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      {[0.25, 0.5, 0.75].map(g => (
        <line key={g} x1={pad.left} x2={w - pad.right} y1={pad.top + innerH * g} y2={pad.top + innerH * g}
          stroke="rgb(var(--c-border))" strokeWidth="1" strokeDasharray="3 5" />
      ))}
      {n > 1 && <path d={areaPath} fill={`url(#grad-${id})`} />}
      <path d={linePath} fill="none" stroke={color} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
        style={{ filter: `drop-shadow(0 2px 6px ${color})` }} />
      {data.map((d, i) => (
        <circle key={i} cx={x(i)} cy={y(d.value)} r="3" fill={color} />
      ))}
      {data.map((d, i) => (
        (i === 0 || i === n - 1 || i === Math.floor(n / 2)) && (
          <text key={`t-${i}`} x={x(i)} y={h - 6} textAnchor="middle" fontSize="11" fill="rgb(var(--c-muted))">
            {d.label}
          </text>
        )
      ))}
    </svg>
  )
}
