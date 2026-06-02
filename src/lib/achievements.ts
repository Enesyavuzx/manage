import type { AchievementDef, TitleDef, Category } from './types'

type Tier = AchievementDef['tier']

function tierFor(index: number, total: number): Tier {
  const r = index / Math.max(1, total - 1)
  if (r >= 0.85) return 'diamond'
  if (r >= 0.6) return 'platinum'
  if (r >= 0.4) return 'gold'
  if (r >= 0.2) return 'silver'
  return 'bronze'
}

const TIER_BONUS: Record<Tier, number> = {
  bronze: 50, silver: 120, gold: 300, platinum: 700, diamond: 1500,
}

// ---- Titles unlocked by milestone achievements ----
export const TITLES: TitleDef[] = [
  { id: 'beginner',     label: 'Yola Çıkan',         emoji: '👣' },
  { id: 'consistent',   label: 'İstikrar Abidesi',   emoji: '📌' },
  { id: 'streaker',     label: 'Streak Avcısı',      emoji: '🔥' },
  { id: 'unstoppable',  label: 'Durdurulamaz',       emoji: '🚀' },
  { id: 'xp_lord',      label: 'XP Lordu',           emoji: '💎' },
  { id: 'centurion',    label: 'Yüzbaşı',            emoji: '💯' },
  { id: 'perfectionist',label: 'Mükemmeliyetçi',     emoji: '✨' },
  { id: 'early_riser',  label: 'Sabahın Efendisi',   emoji: '🌅' },
  { id: 'night_lord',   label: 'Gece Bekçisi',       emoji: '🌙' },
  { id: 'machine',      label: 'Disiplin Makinesi',  emoji: '🤖' },
  { id: 'legend_title', label: 'Canlı Efsane',       emoji: '🌟' },
  { id: 'godmode',      label: 'Tanrı Modu',         emoji: '⚡' },
  { id: 'focused',      label: 'Odak Ustası',        emoji: '🎯' },
  { id: 'zen',          label: 'Zen Bilgesi',        emoji: '🧘' },
]

const CATEGORY_LABELS: Partial<Record<Category, string>> = {
  health: 'Sağlık', fitness: 'Fitness', mindfulness: 'Zihin',
  learning: 'Öğrenme', productivity: 'Üretkenlik',
}

function build(): AchievementDef[] {
  const list: AchievementDef[] = []

  // 1) Completion milestones (12)
  const completions = [1, 5, 10, 25, 50, 100, 200, 365, 500, 750, 1000, 2000]
  const compNames = ['İlk Adım', 'Beşli', 'Onluk', 'Çeyrek Yüz', 'Yarım Yüz', 'Yüzbaşı', 'İki Yüz', 'Bir Yıl Değeri', 'Beş Yüz Kulübü', 'Yedi Yüz Elli', 'Bin Görev', 'İki Bin Efsanesi']
  completions.forEach((v, i) => {
    const tier = tierFor(i, completions.length)
    list.push({
      id: `comp_${v}`, name: compNames[i], emoji: '✅',
      description: `Toplam ${v} görev tamamla`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'total_completions', value: v },
      titleReward: v === 100 ? 'centurion' : undefined,
    })
  })

  // 2) Streak milestones (13)
  const streaks = [3, 5, 7, 10, 14, 21, 30, 50, 75, 100, 150, 250, 365]
  const streakNames = ['Üç Gün', 'Beş Gün', 'Bir Hafta', 'On Gün', 'İki Hafta', 'Üç Hafta', 'Bir Ay', 'Elli Gün', 'Yetmiş Beş', 'Yüz Gün', 'Yüz Elli', 'İki Yüz Elli', 'Bir Yıl Streak']
  streaks.forEach((v, i) => {
    const tier = tierFor(i, streaks.length)
    list.push({
      id: `streak_${v}`, name: streakNames[i], emoji: '🔥',
      description: `${v} gün üst üste tamamla`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'streak', value: v },
      titleReward: v === 7 ? 'streaker' : v === 100 ? 'unstoppable' : undefined,
    })
  })

  // 3) XP milestones (10)
  const xps = [100, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000, 250000]
  xps.forEach((v, i) => {
    const tier = tierFor(i, xps.length)
    list.push({
      id: `xp_${v}`, name: `${v >= 1000 ? (v / 1000) + 'K' : v} XP`, emoji: '⭐',
      description: `Toplam ${v} XP kazan`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'xp_earned', value: v },
      titleReward: v === 25000 ? 'xp_lord' : undefined,
    })
  })

  // 4) Level milestones (11)
  const levels = [5, 10, 15, 20, 25, 30, 40, 50, 65, 80, 100]
  levels.forEach((v, i) => {
    const tier = tierFor(i, levels.length)
    list.push({
      id: `lvl_${v}`, name: `Seviye ${v}`, emoji: '🎖️',
      description: `${v}. seviyeye ulaş`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'level', value: v },
      titleReward: v === 50 ? 'legend_title' : v === 100 ? 'godmode' : undefined,
    })
  })

  // 5) Habits created (6)
  const habitsC = [1, 3, 5, 10, 15, 25]
  habitsC.forEach((v, i) => {
    const tier = tierFor(i, habitsC.length)
    list.push({
      id: `habits_${v}`, name: `${v} Alışkanlık`, emoji: '🌱',
      description: `${v} alışkanlık oluştur`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'habits_created', value: v },
      titleReward: v === 1 ? 'beginner' : undefined,
    })
  })

  // 6) Perfect days (7)
  const perfect = [1, 3, 7, 14, 30, 60, 100]
  perfect.forEach((v, i) => {
    const tier = tierFor(i, perfect.length)
    list.push({
      id: `perfect_${v}`, name: `Kusursuz x${v}`, emoji: '💠',
      description: `${v} gün tüm alışkanlıkları tamamla`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'perfect_days', value: v },
      titleReward: v === 30 ? 'perfectionist' : undefined,
    })
  })

  // 7) Rewards redeemed (4)
  const rewards = [1, 5, 15, 40]
  rewards.forEach((v, i) => {
    const tier = tierFor(i, rewards.length)
    list.push({
      id: `reward_${v}`, name: `${v} Ödül`, emoji: '🎁',
      description: `${v} ödül satın al`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'rewards_redeemed', value: v },
    })
  })

  // 8) Category completions (5 categories x 2 = 10)
  const cats: Category[] = ['health', 'fitness', 'mindfulness', 'learning', 'productivity']
  const catEmoji: Record<string, string> = { health: '🩺', fitness: '💪', mindfulness: '🧘', learning: '📚', productivity: '⚡' }
  cats.forEach(cat => {
    ;[25, 100].forEach((v, i) => {
      const tier: Tier = i === 0 ? 'silver' : 'gold'
      list.push({
        id: `cat_${cat}_${v}`, name: `${CATEGORY_LABELS[cat]} ${v}`, emoji: catEmoji[cat],
        description: `${CATEGORY_LABELS[cat]} kategorisinde ${v} görev tamamla`,
        xpBonus: TIER_BONUS[tier], tier,
        requirement: { type: 'category_completions', value: v, category: cat },
      })
    })
  })

  // 9) Time-based special (early bird x3, night owl x3, weekend x1 = 7)
  const early = [5, 20, 50]
  early.forEach((v, i) => {
    const tier = tierFor(i, early.length)
    list.push({
      id: `early_${v}`, name: `Erken Kuş ${v}`, emoji: '🌅',
      description: `Sabah 08:00'den önce ${v} görev tamamla`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'early_bird', value: v },
      titleReward: v === 50 ? 'early_riser' : undefined,
    })
  })
  const night = [5, 20, 50]
  night.forEach((v, i) => {
    const tier = tierFor(i, night.length)
    list.push({
      id: `night_${v}`, name: `Gece Kuşu ${v}`, emoji: '🌙',
      description: `Gece 22:00'den sonra ${v} görev tamamla`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'night_owl', value: v },
      titleReward: v === 50 ? 'night_lord' : undefined,
    })
  })
  list.push({
    id: 'weekend_20', name: 'Hafta Sonu Savaşçısı', emoji: '🛡️',
    description: 'Hafta sonu 20 görev tamamla', xpBonus: TIER_BONUS.gold, tier: 'gold',
    requirement: { type: 'weekend', value: 20 },
  })

  // 10) Focus minutes (5)
  const focus = [60, 300, 1000, 3000, 10000]
  const focusNames = ['İlk Odak Saati', 'Beş Saat Odak', 'Bin Dakika', 'Üç Bin Dakika', 'On Bin Dakika']
  focus.forEach((v, i) => {
    const tier = tierFor(i, focus.length)
    list.push({
      id: `focus_${v}`, name: focusNames[i], emoji: '🎯',
      description: `Toplam ${v} dakika odaklan`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'focus_minutes', value: v },
      titleReward: v === 1000 ? 'focused' : undefined,
    })
  })

  // 11) Mood logs (5)
  const moods = [1, 7, 30, 100, 365]
  const moodNames = ['İlk Kayıt', 'Bir Hafta', 'Bir Ay', 'Yüz Gün', 'Bir Yıl']
  moods.forEach((v, i) => {
    const tier = tierFor(i, moods.length)
    list.push({
      id: `mood_${v}`, name: `Ruh Hali: ${moodNames[i]}`, emoji: '🧘',
      description: `${v} gün ruh halini kaydet`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'mood_logs', value: v },
      titleReward: v === 30 ? 'zen' : undefined,
    })
  })

  // 12) Water goal days (4)
  const water = [1, 7, 30, 100]
  const waterNames = ['İlk Gün', 'Bir Hafta', 'Bir Ay', 'Yüz Gün']
  water.forEach((v, i) => {
    const tier = tierFor(i, water.length)
    list.push({
      id: `water_${v}`, name: `Su: ${waterNames[i]}`, emoji: '💧',
      description: `${v} gün su hedefine ulaş`, xpBonus: TIER_BONUS[tier], tier,
      requirement: { type: 'water_days', value: v },
    })
  })

  return list
}

export const ACHIEVEMENTS: AchievementDef[] = build()

// Final count guard (94 total: 80 core + 5 focus + 5 mood + 4 water)
export const ACHIEVEMENT_COUNT = ACHIEVEMENTS.length

export const TIER_META: Record<Tier, { label: string; color: string; ring: string }> = {
  bronze:   { label: 'Bronz',   color: '#cd7f32', ring: 'rgba(205,127,50,0.4)' },
  silver:   { label: 'Gümüş',   color: '#c0c0c0', ring: 'rgba(192,192,192,0.4)' },
  gold:     { label: 'Altın',   color: '#facc15', ring: 'rgba(250,204,21,0.45)' },
  platinum: { label: 'Platin',  color: '#67e8f9', ring: 'rgba(103,232,249,0.45)' },
  diamond:  { label: 'Elmas',   color: '#a78bfa', ring: 'rgba(167,139,250,0.5)' },
}

export function titleById(id: string | null): TitleDef | null {
  if (!id) return null
  return TITLES.find(t => t.id === id) ?? null
}
