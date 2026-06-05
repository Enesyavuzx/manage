import type { StoreData, Habit } from './types'
import { getStreak, getLongestStreak, wonderProgress } from './store'

// "Diyar" — tutarlılığın görünür hâli. Tamamen saf fonksiyon: StoreData'nın
// deterministik yansıması. Alışkanlıklar bina olur, tamamlamalar nüfus olur,
// ruh hali hava durumunu belirler, su takibi nehri doldurur, bütçe hazineyi,
// odak seansları saat kulesini açar. Hiçbir yeni state saklanmaz.

export type RealmStage = 0 | 1 | 2 | 3 | 4 | 5
export type RealmSprite = 'hut' | 'house' | 'tower' | 'castle'
export type RealmMonumentSprite =
  | 'fountain' | 'lamppost' | 'bigtree' | 'well' | 'windmill' | 'treasury' | 'clocktower'
  | 'statue' | 'obelisk' | 'arch' | 'cathedral' | 'library'

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
  doneToday: boolean     // bugün tamamlandı mı (hızlı tamamla / parlama için)
  damaged: boolean       // bir zamanlar seri vardı ama koptu (yıkıntı görünümü)
}

export interface RealmMonument {
  id: string
  sprite: RealmMonumentSprite
  label: string
  unlockedAt: number
  condition?: (data: StoreData) => boolean
  fromAchievement?: string   // bir başarımdan açıldıysa başarım id'si
  fromWonder?: boolean        // tamamlanmış bir Harika'dan kalıcı anıt
  emoji?: string              // özel etiket emojisi (Harika anıtları için)
  tint?: string               // özel renk (Harika anıtları için)
}

export type RealmEra = 'dawn' | 'day' | 'dusk' | 'night'
export type RealmWeather = 'sunny' | 'normal' | 'cloudy' | 'rainy'
export type RealmSeason = 'kış' | 'ilkbahar' | 'yaz' | 'sonbahar'

export interface RealmMerchant {
  costXP: number         // bir dondurma jetonu (freeze token) fiyatı
}

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
  season: RealmSeason            // gerçek aya göre mevsim
  todayDoneCount: number
  todayTotalCount: number
  perfectDay: boolean            // bugünün tüm alışkanlıkları bitti mi (havai fişek)
  hasPet: boolean                // maskot açıldı mı
  merchant: RealmMerchant | null // gezgin tüccar bugün var mı
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

// Kuzey yarımküre takvimine göre mevsim.
function seasonFor(date: Date): RealmSeason {
  const m = date.getMonth() // 0-11
  if (m === 11 || m <= 1) return 'kış'
  if (m <= 4) return 'ilkbahar'
  if (m <= 7) return 'yaz'
  return 'sonbahar'
}

// Yılın günü (1-366) — tüccar gibi gün bazlı deterministik olaylar için.
function dayOfYear(date: Date): number {
  const start = Date.UTC(date.getUTCFullYear(), 0, 0)
  const now = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
  return Math.floor((now - start) / 86400000)
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
  // --- başarıma bağlı eşsiz anıtlar ---
  {
    id: 'statue', sprite: 'statue', label: 'Kahraman Heykeli', unlockedAt: 0,
    fromAchievement: 'habit_king',
    condition: (d) => !!d.unlockedAchievements['habit_king'],
  },
  {
    id: 'arch', sprite: 'arch', label: 'Zafer Takı', unlockedAt: 0,
    fromAchievement: 'legend_title',
    condition: (d) => !!d.unlockedAchievements['legend_title'],
  },
  {
    id: 'obelisk', sprite: 'obelisk', label: 'Dikilitaş', unlockedAt: 0,
    fromAchievement: 'godmode',
    condition: (d) => !!d.unlockedAchievements['godmode'],
  },
]

const MERCHANT_COST_XP = 220

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
      doneToday: todayCompletions.has(h.id),
      // Bir zamanlar 3+ gün seri yapılmış ama bugün seri kopmuş: yıkıntı görünümü.
      damaged: best >= 3 && streak === 0,
    }
  })

  structures.sort((a, b) => b.completions - a.completions)

  const population = data.completions.length
  const monuments = MONUMENT_DEFS.filter(m =>
    population >= m.unlockedAt && (!m.condition || m.condition(data))
  )

  // Akademide kaydedilen sözler bir Bilgelik Kütüphanesi inşa eder (3+ söz).
  // Saf türev: yeni state yok, yalnızca savedQuotes sayısını yansıtır.
  const savedCount = data.savedQuotes?.length ?? 0
  if (savedCount >= 3) {
    monuments.push({
      id: 'library', sprite: 'library',
      label: `Kütüphane · ${savedCount} söz`, unlockedAt: 0,
      emoji: '📚',
    })
  }

  // Tamamlanmış Harikalar kalıcı birer anıt olarak diyara eklenir.
  const wonderTint = data.profile.realmBanner || '#d9a441'
  for (const w of data.wonders) {
    if (wonderProgress(data, w) >= w.target) {
      monuments.push({
        id: `wonder:${w.id}`, sprite: 'cathedral', label: w.name, unlockedAt: 0,
        fromWonder: true, emoji: w.emoji, tint: wonderTint,
      })
    }
  }

  const buildingCount = structures.filter(s => s.stage >= 1).length
  const landmarkCount = structures.filter(s => s.isLandmark).length
  const topStructure = structures.find(s => s.stage >= 1) ?? null
  const treeCount = Math.min(24, Math.floor(population / 8))

  const riverSize = riverSizeFor(data, today)
  const villagerCount = Math.min(8, Math.floor(population / 6))
  const balloonColor = topStructure?.color ?? '#7c6fcd'

  const todayTotalCount = activeHabits.length
  const todayDoneCount = todayCompletions.size
  const perfectDay = todayTotalCount > 0 && todayDoneCount >= todayTotalCount

  // Gezgin tüccar: yeterli nüfusta ve günün ~3'te 1'inde uğrar (deterministik).
  const merchant: RealmMerchant | null =
    population >= 30 && dayOfYear(now) % 3 === 0 ? { costXP: MERCHANT_COST_XP } : null

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
    season: seasonFor(now),
    todayDoneCount,
    todayTotalCount,
    perfectDay,
    hasPet: population >= 20,
    merchant,
  }
}

// ---- Köylü diyaloğu ----
// Köylüler diyarın "sesi"dir: söyledikleri tamamen mevcut duruma bağlıdır
// (bugünkü ilerleme, faz, hava, en büyük yapı, seri, anıtlar). Saf fonksiyon;
// her çağrıda eligible havuzdan rastgele bir replik seçer (tekrar dokununca değişir).

export const VILLAGER_NAMES = ['Aslı', 'Demir', 'Eylül', 'Kerem', 'Mavi', 'Poyraz', 'Derya', 'Toprak']

export function villagerName(index: number): string {
  return VILLAGER_NAMES[index % VILLAGER_NAMES.length]
}

export function villagerLine(world: RealmWorld): string {
  const pool: string[] = []
  const { todayDoneCount: done, todayTotalCount: total } = world

  // Bugünkü ilerleme
  if (total > 0) {
    if (done >= total) {
      pool.push('Bugün her şeyi tamamladın, meydanda şenlik var!')
      pool.push('Bütün işler bitti! Bu akşam kutlama yapacağız.')
    } else if (done === 0) {
      pool.push('Bugün henüz kimse işe koyulmadı. Bir tane yapsak mı?')
      pool.push('Güne başlamak için harika bir an, ne dersin?')
    } else {
      pool.push(`Bugün ${done}/${total} iş bitti, kalanları da bekliyoruz.`)
      pool.push(`${total - done} işin daha kaldı, sana güveniyoruz.`)
    }
  }

  // Hava
  if (world.weather === 'sunny') pool.push('Bugün hava harika, içim açıldı.')
  else if (world.weather === 'rainy') pool.push('Yağmur moralleri bozdu ama geçer, hep geçer.')
  else if (world.weather === 'cloudy') pool.push('Gökyüzü biraz kapalı, yine de yürümeye devam.')

  // En büyük yapı
  if (world.topStructure) {
    if (world.topStructure.isLandmark) {
      pool.push(`${world.topStructure.name} kalesi ufukta heybetle duruyor.`)
    } else {
      pool.push(`${world.topStructure.name} her gün biraz daha büyüyor.`)
    }
  }

  // Seri
  const maxStreak = world.structures.reduce((m, s) => Math.max(m, s.streak), 0)
  if (maxStreak >= 7) pool.push(`Birileri ${maxStreak} gündür hiç aksatmıyor, efsane!`)
  else if (maxStreak >= 3) pool.push(`${maxStreak} günlük seri var, sakın bozma.`)

  // Anıtlar / dünya öğeleri
  if (world.monuments.find(m => m.sprite === 'treasury')) pool.push('Hazine kasası dolup taşıyor, bütçene iyi bakıyorsun.')
  if (world.monuments.find(m => m.sprite === 'clocktower')) pool.push('Saat kulesi her odak seansında çalışıyor.')
  if (world.monuments.find(m => m.sprite === 'library')) {
    pool.push('Kütüphanedeki sözleri okudum, her biri bir hazine.')
    pool.push('Akademiden topladığın bilgelik kütüphaneyi büyütüyor.')
  }
  if (world.monuments.find(m => m.fromAchievement)) pool.push('Meydandaki anıtlar başarılarının hatırası, ne gurur.')
  if (world.hasRiver) pool.push('Nehir bugün gürül gürül akıyor, suyunu içmeyi unutma.')
  if (world.hasBalloon) pool.push('Balon yine havalandı, yukarıdan diyar çok güzelmiş.')
  if (world.hasPet) pool.push('Maskotumuz yine sokaklarda dolaşıyor, çok sevimli.')

  // Yıkıntı / kopan seri
  const damaged = world.structures.find(s => s.damaged)
  if (damaged) pool.push(`${damaged.name} biraz harap oldu, bir tamamlama onu yeniden ayağa kaldırır.`)

  // Mevsim
  if (world.season === 'kış') pool.push('Kar yağıyor, içerisi sıcacık ama disiplin sıcak tutar.')
  else if (world.season === 'ilkbahar') pool.push('İlkbahar geldi, her yer çiçek açtı.')
  else if (world.season === 'yaz') pool.push('Yaz sıcağı bastırdı, gölgede biraz dinlenelim.')
  else if (world.season === 'sonbahar') pool.push('Yapraklar dökülüyor, sonbahar diyara çok yakışıyor.')

  // Tüccar
  if (world.merchant) pool.push('Gezgin tüccar geldi! Tezgahına bir göz at derim.')

  // Mükemmel gün
  if (world.perfectDay) pool.push('Bugün kusursuz geçti, akşam havai fişek var!')

  // Faz / nüfus
  pool.push(`Burası artık ${world.phase.label}, gurur duyuyorum.`)
  if (world.population >= 50) pool.push(`Nüfusumuz ${world.population} kişi, kalabalıklaşıyoruz!`)

  // Genel flavor (her zaman seçilebilir)
  pool.push('Selam yolcu! Diyarımıza hoş geldin.')
  pool.push('Bir kahve molası iyi giderdi, değil mi?')
  pool.push('Duydum ki komşu yeni bir ev dikiyormuş.')
  pool.push('Sen çalıştıkça biz büyüyoruz, teşekkürler.')

  return pool[Math.floor(Math.random() * pool.length)]
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
