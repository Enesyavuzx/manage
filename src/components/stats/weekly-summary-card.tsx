'use client'
import { useRef, useCallback } from 'react'
import { Download, Share2 } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Card, CardHeader, CardTitle, CardBody } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getLevelInfo, getRank } from '@/lib/gamification'
import { maxCurrentStreak, perfectDayCount } from '@/lib/store'
import { format, startOfWeek, subDays } from 'date-fns'
import { tr } from 'date-fns/locale'

function weeklyStats(completions: { date: string; xpAwarded: number }[]) {
  const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
  const start = format(monday, 'yyyy-MM-dd')
  const end = format(new Date(), 'yyyy-MM-dd')
  const week = completions.filter(c => c.date >= start && c.date <= end)
  return {
    count: week.length,
    xp: week.reduce((s, c) => s + c.xpAwarded, 0),
    days: new Set(week.map(c => c.date)).size,
  }
}

export function WeeklySummaryCard() {
  const { data } = useStore()
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const info = getLevelInfo(data.profile.totalXP)
  const { rank } = getRank(info.level)
  const streak = maxCurrentStreak(data)
  const perfect = perfectDayCount(data)
  const { count, xp, days } = weeklyStats(data.completions)
  const weekLabel = format(startOfWeek(new Date(), { weekStartsOn: 1 }), "'Hf.' d MMM", { locale: tr })

  const drawCard = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const W = 800, H = 420
    canvas.width = W
    canvas.height = H

    // Background
    const bg = ctx.createLinearGradient(0, 0, W, H)
    bg.addColorStop(0, '#0b0b10')
    bg.addColorStop(1, '#16161c')
    ctx.fillStyle = bg
    ctx.roundRect(0, 0, W, H, 24)
    ctx.fill()

    // Glow orb top-right
    const grd = ctx.createRadialGradient(W - 80, 60, 0, W - 80, 60, 200)
    grd.addColorStop(0, 'rgba(108,99,255,0.25)')
    grd.addColorStop(1, 'rgba(108,99,255,0)')
    ctx.fillStyle = grd
    ctx.fillRect(0, 0, W, H)

    // Border
    ctx.strokeStyle = 'rgba(108,99,255,0.35)'
    ctx.lineWidth = 1.5
    ctx.roundRect(1, 1, W - 2, H - 2, 23)
    ctx.stroke()

    // App label top-left
    ctx.fillStyle = 'rgba(108,99,255,0.9)'
    ctx.font = 'bold 14px Inter, system-ui'
    ctx.textBaseline = 'top'
    ctx.fillText('⚡ MANAGE', 32, 28)

    // Week label top-right
    ctx.fillStyle = 'rgba(138,138,150,0.8)'
    ctx.font = '13px Inter, system-ui'
    ctx.textAlign = 'right'
    ctx.fillText(weekLabel + ' özeti', W - 32, 28)
    ctx.textAlign = 'left'

    // Name + rank
    const name = data.profile.name ?? 'Kahraman'
    ctx.fillStyle = '#f0f1ff'
    ctx.font = 'bold 32px Inter, system-ui'
    ctx.fillText(`${rank.emoji} ${name}`, 32, 72)
    ctx.fillStyle = 'rgba(108,99,255,0.8)'
    ctx.font = '14px Inter, system-ui'
    ctx.fillText(`${rank.label}  ·  Seviye ${info.level}`, 32, 116)

    // Divider
    ctx.strokeStyle = 'rgba(39,39,46,0.8)'
    ctx.lineWidth = 1
    ctx.beginPath(); ctx.moveTo(32, 148); ctx.lineTo(W - 32, 148); ctx.stroke()

    // Stats grid (4 cells)
    const stats = [
      { emoji: '✅', label: 'Bu Hafta', value: `${count} görev` },
      { emoji: '⚡', label: 'Kazanılan XP', value: `${xp} XP` },
      { emoji: '🔥', label: 'Streak', value: `${streak} gün` },
      { emoji: '📅', label: 'Aktif Gün', value: `${days}/7` },
    ]
    const cellW = (W - 64) / 4
    stats.forEach((s, i) => {
      const x = 32 + i * cellW
      const cx = x + cellW / 2
      ctx.textAlign = 'center'
      ctx.font = '28px serif'
      ctx.fillStyle = '#f0f1ff'
      ctx.fillText(s.emoji, cx, 195)
      ctx.font = 'bold 22px Inter, system-ui'
      ctx.fillStyle = '#6c63ff'
      ctx.fillText(s.value, cx, 240)
      ctx.font = '12px Inter, system-ui'
      ctx.fillStyle = 'rgba(138,138,150,0.8)'
      ctx.fillText(s.label, cx, 264)
    })

    // Day grid for this week
    ctx.textAlign = 'left'
    const dayLabels = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']
    const monday = startOfWeek(new Date(), { weekStartsOn: 1 })
    const today = format(new Date(), 'yyyy-MM-dd')
    const dotW = (W - 64) / 7
    ctx.font = '11px Inter, system-ui'
    dayLabels.forEach((label, i) => {
      const d = format(new Date(monday.getTime() + i * 86400000), 'yyyy-MM-dd')
      const done = data.completions.some(c => c.date === d)
      const isToday = d === today
      const x = 32 + i * dotW + dotW / 2
      const y = 320

      ctx.textAlign = 'center'
      ctx.beginPath()
      ctx.arc(x, y, 16, 0, Math.PI * 2)
      if (done) {
        ctx.fillStyle = 'rgba(108,99,255,0.85)'
        ctx.fill()
      } else if (d > today) {
        ctx.fillStyle = 'rgba(32,33,64,0.8)'
        ctx.fill()
        ctx.strokeStyle = 'rgba(39,39,46,0.6)'
        ctx.lineWidth = 1
        ctx.stroke()
      } else {
        ctx.fillStyle = 'rgba(50,20,20,0.8)'
        ctx.fill()
      }
      if (isToday) {
        ctx.strokeStyle = 'rgba(255,209,64,0.8)'
        ctx.lineWidth = 2
        ctx.stroke()
      }

      ctx.fillStyle = done ? '#fff' : 'rgba(138,138,150,0.6)'
      ctx.font = done ? 'bold 10px Inter, system-ui' : '10px Inter, system-ui'
      ctx.fillText(done ? '✓' : label.slice(0, 1), x, y + 4)
      ctx.fillStyle = 'rgba(138,138,150,0.6)'
      ctx.font = '10px Inter, system-ui'
      ctx.fillText(label, x, y + 34)
    })

    // Footer
    ctx.textAlign = 'center'
    ctx.fillStyle = 'rgba(110,114,150,0.6)'
    ctx.font = '11px Inter, system-ui'
    ctx.fillText('manage app · alışkanlık takibi', W / 2, H - 18)
  }, [data, count, xp, days, streak, rank, info, weekLabel])

  function download() {
    drawCard()
    const canvas = canvasRef.current
    if (!canvas) return
    const link = document.createElement('a')
    link.download = `manage-hafta-${format(new Date(), 'yyyy-MM-dd')}.png`
    link.href = canvas.toDataURL('image/png')
    link.click()
  }

  async function shareCard() {
    drawCard()
    const canvas = canvasRef.current
    if (!canvas) return
    canvas.toBlob(async blob => {
      if (!blob) return
      if (navigator.share && navigator.canShare({ files: [new File([blob], 'manage.png', { type: 'image/png' })] })) {
        await navigator.share({ files: [new File([blob], 'manage.png', { type: 'image/png' })], title: 'Manage - Haftalık Özet' })
      } else {
        const url = URL.createObjectURL(blob)
        window.open(url, '_blank')
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Haftalık Özet Kartı</CardTitle>
        <div className="flex gap-2">
          <Button size="sm" variant="secondary" onClick={download}>
            <Download size={13} /> İndir
          </Button>
          <Button size="sm" variant="primary" onClick={shareCard}>
            <Share2 size={13} /> Paylaş
          </Button>
        </div>
      </CardHeader>
      <CardBody>
        <canvas ref={canvasRef} className="hidden" />
        <div className="rounded-lg border border-border bg-surface-2 p-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { emoji: '✅', label: 'Bu Hafta', value: `${count} görev` },
              { emoji: '⚡', label: 'Kazanılan XP', value: `${xp} XP` },
              { emoji: '🔥', label: 'Streak', value: `${streak} gün` },
              { emoji: '📅', label: 'Aktif Gün', value: `${days}/7` },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className="text-2xl">{s.emoji}</p>
                <p className="mt-1 text-base font-bold text-fg font-display">{s.value}</p>
                <p className="text-xs text-muted">{s.label}</p>
              </div>
            ))}
          </div>
          <p className="mt-3 text-center text-xs text-muted-2">
            {rank.emoji} {data.profile.name} · {rank.label} · Seviye {info.level}
          </p>
        </div>
        <p className="mt-2 text-xs text-muted-2">PNG olarak indirebilir veya doğrudan paylaşabilirsin.</p>
      </CardBody>
    </Card>
  )
}
