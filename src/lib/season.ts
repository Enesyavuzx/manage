import type { StoreData } from './types'
import { format } from 'date-fns'

// Sezonlar: 4 haftalık tekrar eden ilerleme dönemi. DEHB için "taze başlangıç"
// etkisi: her sezon sıfırdan bir hedef çizelgesi sunar (Diyar kalıcıdır, sezon
// çizelgesi döner). Tamamen tarih + tamamlama verisinden hesaplanır.

const ANCHOR = Date.UTC(2025, 0, 6) // Pazartesi
const SEASON_DAYS = 28

export interface SeasonTier {
  at: number
  label: string
  reached: boolean
}

export interface SeasonInfo {
  index: number
  label: string
  startKey: string
  endKey: string
  dayInSeason: number
  daysLeft: number
  completions: number
  lastSeasonCompletions: number
  tiers: SeasonTier[]
  nextTier: SeasonTier | null
}

const TIERS: { at: number; label: string }[] = [
  { at: 15, label: 'Köy Şenliği' },
  { at: 40, label: 'Kasaba Bayramı' },
  { at: 80, label: 'Şehir Töreni' },
  { at: 150, label: 'Büyük Geçit' },
  { at: 260, label: 'Efsane Sezon' },
]

function dayIndexUTC(date: Date): number {
  const utc = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())
  return Math.floor((utc - ANCHOR) / 86400000)
}

function keyFromDayIndex(idx: number): string {
  return format(new Date(ANCHOR + idx * 86400000), 'yyyy-MM-dd')
}

export function getSeason(data: StoreData, now: Date = new Date()): SeasonInfo {
  const di = Math.max(0, dayIndexUTC(now))
  const seasonNo = Math.floor(di / SEASON_DAYS)
  const startIdx = seasonNo * SEASON_DAYS
  const startKey = keyFromDayIndex(startIdx)
  const endKey = keyFromDayIndex(startIdx + SEASON_DAYS - 1)
  const today = format(now, 'yyyy-MM-dd')
  const dayInSeason = di - startIdx + 1
  const daysLeft = SEASON_DAYS - dayInSeason

  const inRange = (d: string, a: string, b: string) => d >= a && d <= b
  const completions = data.completions.filter(c => inRange(c.date, startKey, today)).length

  const prevStartKey = keyFromDayIndex(startIdx - SEASON_DAYS)
  const prevEndKey = keyFromDayIndex(startIdx - 1)
  const lastSeasonCompletions = startIdx >= SEASON_DAYS
    ? data.completions.filter(c => inRange(c.date, prevStartKey, prevEndKey)).length
    : 0

  const tiers: SeasonTier[] = TIERS.map(t => ({ ...t, reached: completions >= t.at }))
  const nextTier = tiers.find(t => !t.reached) ?? null

  return {
    index: seasonNo + 1,
    label: `Sezon ${seasonNo + 1}`,
    startKey, endKey,
    dayInSeason, daysLeft,
    completions,
    lastSeasonCompletions,
    tiers,
    nextTier,
  }
}
