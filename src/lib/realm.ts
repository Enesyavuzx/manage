import type { StoreData, Habit } from './types'
import { getStreak, getLongestStreak } from './store'

// "Diyar" — tutarlılığın görünür hâli. Bu modül tamamen saf bir fonksiyondur:
// dünya, mevcut completion geçmişinin deterministik bir yansımasıdır. Hiçbir yeni
// state saklanmaz; her alışkanlık bir yapıya, her tamamlama o yapının büyümesine
// dönüşür. Üç ay sonra açtığında aylarca emeğinin bir silüetini görürsün.

export type RealmStage = 0 | 1 | 2 | 3 | 4 | 5

export interface RealmStructure {
  habitId: string
  name: string
  emoji: string
  color: string
  completions: number
  stage: RealmStage
  sprite: 'hut' | 'house' | 'tower'
  streak: number
  hasFlag: boolean       // aktif seri varsa bayrak
  isLandmark: boolean    // en yüksek aşama
}

export type RealmEra = 'dawn' | 'day' | 'dusk' | 'night'

export interface RealmPhase {
  id: 'çorak' | 'köy' | 'kasaba' | 'şehir' | 'metropol'
  label: string
  next: number | null   // bir sonraki faza geçiş için gereken nüfus (null = son faz)
}

export interface RealmWorld {
  structures: RealmStructure[]
  population: number     // tüm zamanların toplam tamamlaması
  buildingCount: number  // stage >= 1 yapı sayısı
  landmarkCount: number
  treeCount: number      // ambient ağaç sayısı
  topStructure: RealmStructure | null
  phase: RealmPhase
  era: RealmEra
}

// Tamamlama sayısı -> büyüme aşaması.
function stageFor(completions: number): RealmStage {
  if (completions <= 0) return 0
  if (completions < 5) return 1
  if (completions < 15) return 2
  if (completions < 40) return 3
  if (completions < 100) return 4
  return 5
}

function spriteForStage(stage: RealmStage): 'hut' | 'house' | 'tower' {
  if (stage <= 1) return 'hut'
  if (stage <= 3) return 'house'
  return 'tower'
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

  // Yapılar büyüklüğe göre sıralanır; en gelişmişler diyarın merkezinde durur.
  structures.sort((a, b) => b.completions - a.completions)

  const population = data.completions.length
  const buildingCount = structures.filter(s => s.stage >= 1).length
  const landmarkCount = structures.filter(s => s.isLandmark).length
  const topStructure = structures.find(s => s.stage >= 1) ?? null
  // Her 8 tamamlamaya bir ağaç, en fazla 24 ağaç (sahne kalabalaşmasın).
  const treeCount = Math.min(24, Math.floor(population / 8))

  return {
    structures,
    population,
    buildingCount,
    landmarkCount,
    treeCount,
    topStructure,
    phase: phaseFor(population),
    era: eraFor(now),
  }
}

// Bir sonraki faza ne kadar kaldığı (yüzde + kalan nüfus). Son fazda null döner.
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
