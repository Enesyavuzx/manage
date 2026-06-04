import type { StoreData, Habit } from './types'
import { getStreak, getLongestStreak } from './store'

// "Diyar" — tutarlılığın görünür hâli. Bu modül tamamen saf bir fonksiyondur:
// dünya, mevcut completion geçmişinin deterministik bir yansımasıdır. Hiçbir yeni
// state saklanmaz; her alışkanlık bir yapıya, her tamamlama o yapının büyümesine
// dönüşür. Nüfus (toplam tamamlama) arttıkça diyar anıtlar kazanır ve faz atlar.

export type RealmStage = 0 | 1 | 2 | 3 | 4 | 5
export type RealmSprite = 'hut' | 'house' | 'tower' | 'castle'

export interface RealmStructure {
  habitId: string
  name: string
  emoji: string
  color: string
  completions: number
  stage: RealmStage
  sprite: RealmSprite
  streak: number
  hasFlag: boolean       // aktif seri varsa bayrak
  isLandmark: boolean    // en yüksek aşama (kale)
}

export interface RealmMonument {
  id: string
  sprite: 'fountain' | 'lamppost' | 'bigtree'
  label: string
  unlockedAt: number     // hangi nüfusta açıldı
}

export type RealmEra = 'dawn' | 'day' | 'dusk' | 'night'

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
}

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

const MONUMENT_DEFS: RealmMonument[] = [
  { id: 'fountain', sprite: 'fountain', label: 'Çeşme', unlockedAt: 15 },
  { id: 'lamppost', sprite: 'lamppost', label: 'Sokak Feneri', unlockedAt: 45 },
  { id: 'bigtree', sprite: 'bigtree', label: 'Kadim Ağaç', unlockedAt: 90 },
]

export function buildRealm(data: StoreData, now: Date = new Date()): RealmWorld {
  const completionsByHabit = new Map<string, number>()
  for (const c of data.completions) {
    completionsByHabit.set(c.habitId, (completionsByHabit.get(c.habitId) ?? 0) + 1)
  }

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

  // En gelişmiş yapılar önce (diyarın merkezinde dururlar).
  structures.sort((a, b) => b.completions - a.completions)

  const population = data.completions.length
  const monuments = MONUMENT_DEFS.filter(m => population >= m.unlockedAt)
  const buildingCount = structures.filter(s => s.stage >= 1).length
  const landmarkCount = structures.filter(s => s.isLandmark).length
  const topStructure = structures.find(s => s.stage >= 1) ?? null
  const treeCount = Math.min(20, Math.floor(population / 10))

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
