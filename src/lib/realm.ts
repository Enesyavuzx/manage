import type { StoreData, Habit } from './types'
import { getStreak, getLongestStreak } from './store'

// "Diyar" — tutarlılığın görünür hâli. Tamamen saf fonksiyon: StoreData'nın
// deterministik yansıması. Alışkanlıklar bina olur, tamamlamalar nüfus olur,
// ruh hali hava durumunu belirler, su takibi nehri doldurur, bütçe hazineyi,
// odak seansları saat kulesini açar. Hiçbir yeni state saklanmaz.

export type RealmStage = 0 | 1 | 2 | 3 | 4 | 5
export type RealmSprite = 'hut' | 'house' | 'tower' | 'castle'
export type RealmMonumentSprite = 'fountain' | 'lamppost' | 'bigtree' | 'well' | 'windmill' | 'treasury' | 'clocktower'

export interface RealmStructure {
  habitId: string
  name: string
  emoji: string
  color: string
  completions: number
  stage: RealmStage
  sprite: RealmSprite
  streak: number
  hasFlag: boolean
  isLandmark: boolean
}

export interface RealmMonument {
  id: string
  sprite: RealmMonumentSprite
  label: string
  unlockedAt: number
  condition?: (data: StoreData) => boolean
}

export type RealmEra = 'dawn' | 'day' | 'dusk' | 'night'
export type RealmWeather = 'sunny' | 'normal' | 'cloudy' | 'rainy'

export interface RealmPhase {
  id: 'çorak' | 'köy' | 'kasaba' | 'şehir' | 'metropol'
  label: string
  next: number | null
}

export interface RealmWorld {
  structures: RealmStructure[]
  monuments: RealmMonument[]
  population: number
  buildingCount: number
  landmarkCount: number
  treeCount: number
  topStructure: RealmStructure | null
  phase: RealmPhase
  era: RealmEra
  // Yaşayan dünya özellikleri
  hasRiver: boolean
  riverSize: 0 | 1 | 2 | 3     // su takibine göre nehir boyutu
  hasBalloon: boolean
  balloonColor: string
  villagerCount: number          // nüfusa göre köylü sayısı
  weather: RealmWeather          // ruh haline göre hava durumu
  todayDoneCount: number
  todayTotalCount: number
}

// --- Yardımcı hesaplamalar ---

function stageFor(completions: number): RealmStage {
  if (completions <= 0) return 0
  if (completions < 5) return 1
  if (completions < 15) return 2
  if (completions < 40) return 3
  if (completions < 100) return 4
  return 5
}

function spriteForStage(stage: RealmStage): RealmSprite {
  if (stage <= 1) return 'hut'
  if (stage <= 3) return 'house'
  if (stage === 4) return 'tower'
  return 'castle'
}

const PHASES: RealmPhase[] = [
  { id: 'çorak', label: 'Çorak Topraklar', next: 1 },
  { id: 'köy', label: 'Küçük Köy', next: 50 },
  { id: 'kasaba', label: 'Kasaba', next: 200 },
  { id: 'şehir', label: 'Şehir', next: 600 },
  { id: 'metropol', label: 'Metropol', next: null },
]

function phaseFor(population: number): RealmPhase {
  if (population < 1) return PHASES[0]
  if (population < 50) return PHASES[1]
  if (population < 200) return PHASES[2]
  if (population < 600) return PHASES[3]
  return PHASES[4]
}

function eraFor(date: Date): RealmEra {
  const h = date.getHours()
  if (h >= 5 && h < 9) return 'dawn'
  if (h >= 9 && h < 18) return 'day'
  if (h >= 18 && h < 21) return 'dusk'
  return 'night'
}

// Ruh hali ortalamasından hava durumu — son 3 gün ağırlıklı
function weatherFor(data: StoreData, today: string): RealmWeather {
  const recent = data.moods
    .filter(m => m.date <= today)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 3)
  if (recent.length === 0) return 'normal'
  const avg = recent.reduce((s, m) => s + m.level, 0) / recent.length
  if (avg >= 4.2) return 'sunny'
  if (avg >= 2.8) return 'normal'
  if (avg >= 1.8) return 'cloudy'
  return 'rainy'
}

// Su takibinden nehir boyutu — son 7 gün
function riverSizeFor(data: StoreData, today: string): 0 | 1 | 2 | 3 {
  const d7 = new Date(today)
  d7.setDate(d7.getDate() - 7)
  const weekStr = d7.toISOString().slice(0, 10)
  const count = data.water.filter(w => w.date >= weekStr && w.date <= today).length
  if (count === 0) return 0
  if (count <= 2) return 1
  if (count <= 5) return 2
  return 3
}

// Toplam odak dakikası
function totalFocusMinutes(data: StoreData): number {
  return data.focusSessions.reduce((s, f) => s + f.minutes, 0)
}

const MONUMENT_DEFS: RealmMonument[] = [
  { id: 'well',       sprite: 'well',       label: 'Köy Kuyusu',     unlockedAt: 10 },
  { id: 'fountain',   sprite: 'fountain',   label: 'Çeşme',          unlockedAt: 25 },
  { id: 'lamppost',   sprite: 'lamppost',   label: 'Sokak Feneri',   unlockedAt: 50 },
  { id: 'windmill',   sprite: 'windmill',   label: 'Yel Değirmeni',  unlockedAt: 80 },
  { id: 'bigtree',    sprite: 'bigtree',    label: 'Kadim Ağaç',     unlockedAt: 120 },
  {
    id: 'treasury',
    sprite: 'treasury',
    label: 'Hazine Kasası',
    unlockedAt: 0,
    // Bütçe sistemi kullanılıyorsa her zaman görünür
    condition: (d) => d.budgetAccounts.length > 0,
  },
  {
    id: 'clocktower',
    sprite: 'clocktower',
    label: 'Saat Kulesi',
    unlockedAt: 0,
    // 90 dakika odak seansı tamamlandıysa açılır
    condition: (d) => totalFocusMinutes(d) >= 90,
  },
]

export function buildRealm(data: StoreData, now: Date = new Date()): RealmWorld {
  const today = now.toISOString().slice(0, 10)

  const completionsByHabit = new Map<string, number>()
  for (const c of data.completions) {
    completionsByHabit.set(c.habitId, (completionsByHabit.get(c.habitId) ?? 0) + 1)
  }

  const todayCompletions = new Set(
    data.completions.filter(c => c.date === today).map(c => c.habitId)
  )

  const activeHabits = data.habits.filter(h => !h.archived)

  const structures: RealmStructure[] = activeHabits.map((h: Habit) => {
    const completions = completionsByHabit.get(h.id) ?? 0
    const stage = stageFor(completions)
    const streak = getStreak(data.completions, h.id, data.frozenDates)
    const best = getLongestStreak(data.completions, h.id)
    return {
      habitId: h.id,
      name: h.name,
      emoji: h.emoji,
      color: h.color,
      completions,
      stage,
      sprite: spriteForStage(stage),
      streak,
      hasFlag: streak >= 3 || best >= 7,
      isLandmark: stage === 5,
    }
  })

  structures.sort((a, b) => b.completions - a.completions)

  const population = data.completions.length
  const monuments = MONUMENT_DEFS.filter(m =>
    population >= m.unlockedAt && (!m.condition || m.condition(data))
  )

  const buildingCount = structures.filter(s => s.stage >= 1).length
  const landmarkCount = structures.filter(s => s.isLandmark).length
  const topStructure = structures.find(s => s.stage >= 1) ?? null
  const treeCount = Math.min(24, Math.floor(population / 8))

  const riverSize = riverSizeFor(data, today)
  const villagerCount = Math.min(8, Math.floor(population / 6))
  const balloonColor = topStructure?.color ?? '#7c6fcd'

  return {
    structures,
    monuments,
    population,
    buildingCount,
    landmarkCount,
    treeCount,
    topStructure,
    phase: phaseFor(population),
    era: eraFor(now),
    hasRiver: riverSize > 0,
    riverSize,
    hasBalloon: population >= 30,
    balloonColor,
    villagerCount,
    weather: weatherFor(data, today),
    todayDoneCount: todayCompletions.size,
    todayTotalCount: activeHabits.length,
  }
}

export function phaseProgress(world: RealmWorld): { pct: number; remaining: number } | null {
  const { phase, population } = world
  if (phase.next === null) return null
  const idx = PHASES.findIndex(p => p.id === phase.id)
  const start = idx <= 0 ? 0 : PHASES[idx - 1].next ?? 0
  const span = phase.next - start
  const into = population - start
  return {
    pct: Math.max(0, Math.min(100, Math.round((into / span) * 100))),
    remaining: Math.max(0, phase.next - population),
  }
}
