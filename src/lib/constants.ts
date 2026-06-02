import type { Category, RewardTier, MoodLevel, TemplatePack, AccountType, TxType } from './types'

export const CATEGORY_META: Record<Category, { label: string; color: string; emoji: string }> = {
  health:       { label: 'Sağlık',      color: '#22c55e', emoji: '🩺' },
  productivity: { label: 'Üretkenlik',  color: '#8b5cf6', emoji: '⚡' },
  mindfulness:  { label: 'Zihin',       color: '#06b6d4', emoji: '🧘' },
  learning:     { label: 'Öğrenme',     color: '#f59e0b', emoji: '📚' },
  fitness:      { label: 'Fitness',     color: '#ef4444', emoji: '💪' },
  social:       { label: 'Sosyal',      color: '#ec4899', emoji: '🫂' },
  creativity:   { label: 'Yaratıcılık', color: '#a855f7', emoji: '🎨' },
  other:        { label: 'Diğer',       color: '#64748b', emoji: '✨' },
}

export const HABIT_COLORS = [
  '#8b5cf6', '#22c55e', '#ef4444', '#06b6d4',
  '#f59e0b', '#ec4899', '#10b981', '#6366f1',
  '#f97316', '#14b8a6', '#a855f7', '#3b82f6',
]

export const HABIT_EMOJIS = [
  '💧', '🏃', '📖', '🧘', '💪', '🥗', '😴', '✍️',
  '🎯', '🎨', '🎵', '💊', '🧠', '☀️', '🌿', '🚶',
  '🍎', '📝', '💻', '🎸', '🌅', '🏋️', '🚴', '📱',
  '🦷', '🧹', '💰', '📷', '🎮', '🌙', '☕', '🔥',
]

// ---- Reward tiers ----
export const REWARD_TIER_META: Record<RewardTier, { label: string; color: string; order: number }> = {
  small:     { label: 'Küçük Keyif',  color: '#22c55e', order: 0 },
  medium:    { label: 'Orta Ödül',    color: '#38bdf8', order: 1 },
  large:     { label: 'Büyük Ödül',   color: '#a855f7', order: 2 },
  legendary: { label: 'Efsanevi',     color: '#f59e0b', order: 3 },
  mythic:    { label: 'Mitik',        color: '#ec4899', order: 4 },
}

export const REWARD_TIER_ORDER: RewardTier[] = ['small', 'medium', 'large', 'legendary', 'mythic']

export const DEFAULT_REWARDS: {
  id: string; name: string; description: string; xpCost: number; emoji: string; tier: RewardTier
}[] = [
  // Küçük keyifler
  { id: 'r_coffee',   name: 'Kahve Molası',    description: 'Sevdiğin kahveyi yap',         xpCost: 150,  emoji: '☕', tier: 'small' },
  { id: 'r_social',   name: 'Sosyal Medya',    description: '20 dakika serbest tarama',      xpCost: 120,  emoji: '📱', tier: 'small' },
  { id: 'r_snack',    name: 'Atıştırmalık',    description: 'Küçük bir ikram',               xpCost: 200,  emoji: '🍪', tier: 'small' },
  { id: 'r_episode',  name: 'Bir Bölüm',       description: 'Dizinden tek bölüm izle',       xpCost: 250,  emoji: '📺', tier: 'small' },
  // Orta ödüller
  { id: 'r_movie',    name: 'Film Gecesi',     description: 'Suçluluk duymadan film izle',   xpCost: 400,  emoji: '🎬', tier: 'medium' },
  { id: 'r_game',     name: 'Oyun Seansı',     description: '2 saat oyun keyfi',             xpCost: 450,  emoji: '🎮', tier: 'medium' },
  { id: 'r_cafe',     name: 'Dışarıda Kahve',  description: 'Kafede mola',                   xpCost: 550,  emoji: '🧋', tier: 'medium' },
  { id: 'r_book',     name: 'Yeni Kitap',      description: 'İstediğin kitabı al',           xpCost: 650,  emoji: '📚', tier: 'medium' },
  // Büyük ödüller
  { id: 'r_meal',     name: 'Kaçamak Öğün',    description: 'Sevdiğin yemeğin tadını çıkar', xpCost: 800,  emoji: '🍕', tier: 'large' },
  { id: 'r_spa',      name: 'Bakım Günü',      description: 'Kendine spa/bakım ısmarla',     xpCost: 1100, emoji: '🛁', tier: 'large' },
  { id: 'r_ticket',   name: 'Sinema/Konser',   description: 'Bir etkinlik bileti',           xpCost: 1300, emoji: '🎟️', tier: 'large' },
  { id: 'r_shop',     name: 'Küçük Alışveriş',  description: 'İstediğin bir şeyi al',         xpCost: 1500, emoji: '🛍️', tier: 'large' },
  // Efsanevi
  { id: 'r_bigshop',  name: 'Büyük Alışveriş', description: 'Uzun süredir istediğin şey',    xpCost: 2200, emoji: '🛒', tier: 'legendary' },
  { id: 'r_restday',  name: 'Tatil Günü',      description: 'Bütün gün dinlen',              xpCost: 2800, emoji: '🏖️', tier: 'legendary' },
  { id: 'r_hobby',    name: 'Hobi Ekipmanı',   description: 'Hobine yatırım yap',            xpCost: 3200, emoji: '🎸', tier: 'legendary' },
  // Mitik
  { id: 'r_getaway',  name: 'Hafta Sonu Kaçamağı', description: 'Kısa bir gezi planla',     xpCost: 5500, emoji: '✈️', tier: 'mythic' },
  { id: 'r_grand',    name: 'Büyük Hedef Ödülü',   description: 'Kendine büyük bir hediye',  xpCost: 9000, emoji: '🏆', tier: 'mythic' },
]

// ---- Mood ----
export const MOOD_META: Record<MoodLevel, { label: string; emoji: string; color: string }> = {
  1: { label: 'Çok Kötü', emoji: '😣', color: '#ef4444' },
  2: { label: 'Kötü',     emoji: '🙁', color: '#f97316' },
  3: { label: 'İdare',    emoji: '😐', color: '#facc15' },
  4: { label: 'İyi',      emoji: '🙂', color: '#22c55e' },
  5: { label: 'Harika',   emoji: '😄', color: '#06b6d4' },
}

export const MOOD_XP = 15

// ---- Focus / Pomodoro ----
export const FOCUS_PRESETS = [15, 25, 45, 60]          // minutes
export const FOCUS_XP_PER_MIN = 1                       // XP per focused minute

// ---- Mystery box ----
export const MYSTERY_BOX_COST = 300

// ---- Water ----
export const WATER_GOAL = 8        // glasses per day
export const WATER_XP = 12         // XP when daily goal is reached

// ---- Habit templates ----
// Hazır paketler: karar yorgunluğunu azaltmak için tek dokunuşla eklenebilir.
export const TEMPLATE_PACKS: TemplatePack[] = [
  {
    id: 'morning', name: 'Sabah Rutini', emoji: '🌅',
    description: 'Güne sağlam başla',
    habits: [
      { name: 'Bir bardak su iç', description: 'Uyanır uyanmaz', emoji: '💧', category: 'health',       difficulty: 'trivial', color: '#06b6d4' },
      { name: 'Yatağını topla',   description: 'İlk küçük zafer',  emoji: '🛏️', category: 'productivity', difficulty: 'easy',    color: '#8b5cf6' },
      { name: 'Esneme / gerinme', description: '5 dakika',         emoji: '🤸', category: 'fitness',      difficulty: 'easy',    color: '#ef4444' },
      { name: 'Güne plan yap',    description: 'En önemli 3 iş',   emoji: '📝', category: 'productivity', difficulty: 'easy',    color: '#6366f1', steps: ['En önemli işi yaz', 'İkinci işi yaz', 'Üçüncü işi yaz'] },
    ],
  },
  {
    id: 'fitness', name: 'Spor & Hareket', emoji: '💪',
    description: 'Bedenini hareket ettir',
    habits: [
      { name: '10 dk yürüyüş',  description: 'Dışarı çık',     emoji: '🚶', category: 'fitness', difficulty: 'easy',   color: '#10b981' },
      { name: 'Şınav / squat',  description: 'Kısa set',       emoji: '🏋️', category: 'fitness', difficulty: 'medium', color: '#ef4444' },
      { name: 'Esneme',         description: 'Gün sonu',       emoji: '🧎', category: 'fitness', difficulty: 'easy',   color: '#f97316' },
    ],
  },
  {
    id: 'learning', name: 'Okuma & Öğrenme', emoji: '📚',
    description: 'Her gün biraz büyü',
    habits: [
      { name: '10 sayfa oku',   description: 'Kitabını ilerlet', emoji: '📖', category: 'learning', difficulty: 'easy',   color: '#f59e0b' },
      { name: 'Dil pratiği',    description: '15 dakika',        emoji: '🗣️', category: 'learning', difficulty: 'medium', color: '#3b82f6' },
      { name: 'Bir şey öğren',  description: 'Ders / podcast',   emoji: '🧠', category: 'learning', difficulty: 'medium', color: '#a855f7' },
    ],
  },
  {
    id: 'mind', name: 'Zihin & Sakinlik', emoji: '🧘',
    description: 'Zihnini dinlendir',
    habits: [
      { name: '5 dk meditasyon', description: 'Nefesine odaklan', emoji: '🧘', category: 'mindfulness', difficulty: 'easy',    color: '#06b6d4' },
      { name: 'Nefes egzersizi', description: '4-7-8 tekniği',    emoji: '🌬️', category: 'mindfulness', difficulty: 'trivial', color: '#14b8a6' },
      { name: 'Günlük tut',      description: 'Bugünü yaz',       emoji: '✍️', category: 'mindfulness', difficulty: 'easy',    color: '#8b5cf6' },
      { name: 'Ekran molası',    description: '20 dk ekran yok',  emoji: '🌿', category: 'mindfulness', difficulty: 'easy',    color: '#22c55e' },
    ],
  },
  {
    id: 'selfcare', name: 'Düzen & Öz Bakım', emoji: '🧹',
    description: 'Kendine ve alanına bak',
    habits: [
      { name: 'Diş fırçala',   description: 'Sabah-akşam',    emoji: '🦷', category: 'health', difficulty: 'trivial', color: '#38bdf8' },
      { name: 'Vitamin / ilaç', description: 'Düzenli al',     emoji: '💊', category: 'health', difficulty: 'trivial', color: '#22c55e' },
      { name: 'Odanı topla',   description: '5 dk düzen',      emoji: '🧹', category: 'other',  difficulty: 'easy',    color: '#64748b' },
      { name: 'Bulaşık / mutfak', description: 'Lavaboyu boşalt', emoji: '🍽️', category: 'other', difficulty: 'easy', color: '#94a3b8' },
    ],
  },
  {
    id: 'evening', name: 'Akşam Rutini', emoji: '🌙',
    description: 'Günü huzurla kapat',
    habits: [
      { name: 'Yarını planla',  description: 'Listeyi hazırla',  emoji: '🗓️', category: 'productivity', difficulty: 'easy',    color: '#6366f1' },
      { name: 'Ekranı kapat',   description: 'Yatmadan 30 dk',   emoji: '📵', category: 'mindfulness',  difficulty: 'medium',  color: '#a855f7' },
      { name: 'Şükran notu',    description: '3 iyi şey yaz',    emoji: '🙏', category: 'mindfulness',  difficulty: 'trivial', color: '#f59e0b' },
      { name: 'Erken yat',      description: 'Uyku saatine sadık', emoji: '😴', category: 'health',     difficulty: 'medium',  color: '#3b82f6' },
    ],
  },
]

// ---- Budget ----
export const CURRENCY_SYMBOL = '₺'

export const ACCOUNT_TYPE_META: Record<AccountType, { label: string; emoji: string }> = {
  cash: { label: 'Nakit',  emoji: '💵' },
  bank: { label: 'Banka',  emoji: '🏦' },
  card: { label: 'Kart',   emoji: '💳' },
}

export const ACCOUNT_COLORS = ['#22c55e', '#3b82f6', '#a855f7', '#f59e0b', '#ec4899', '#06b6d4']

export interface TxCategoryDef {
  id: string
  label: string
  emoji: string
  color: string
  type: TxType
}

export const TX_CATEGORIES: TxCategoryDef[] = [
  // Gelir
  { id: 'salary', label: 'Maaş',          emoji: '💼', color: '#22c55e', type: 'income' },
  { id: 'gift',   label: 'Hediye',        emoji: '🎁', color: '#ec4899', type: 'income' },
  { id: 'extra',  label: 'Ek Gelir',      emoji: '➕', color: '#10b981', type: 'income' },
  // Gider
  { id: 'food',      label: 'Yemek',      emoji: '🍔', color: '#f97316', type: 'expense' },
  { id: 'transport', label: 'Ulaşım',     emoji: '🚌', color: '#3b82f6', type: 'expense' },
  { id: 'shopping',  label: 'Alışveriş',  emoji: '🛍️', color: '#a855f7', type: 'expense' },
  { id: 'bills',     label: 'Faturalar',  emoji: '🧾', color: '#ef4444', type: 'expense' },
  { id: 'fun',       label: 'Eğlence',    emoji: '🎮', color: '#ec4899', type: 'expense' },
  { id: 'health',    label: 'Sağlık',     emoji: '🩺', color: '#06b6d4', type: 'expense' },
  { id: 'other',     label: 'Diğer',      emoji: '✨', color: '#64748b', type: 'expense' },
]

export function txCategory(id: string): TxCategoryDef {
  return TX_CATEGORIES.find(c => c.id === id) ?? TX_CATEGORIES[TX_CATEGORIES.length - 1]
}

// Additional rewards appended to DEFAULT_REWARDS (added after initial list)
// These are exported separately and merged at app boot in store.ts
export const EXTRA_REWARDS: typeof DEFAULT_REWARDS = [
  // Küçük keyifler
  { id: 'r_nap',       name: 'Güç Uykusu',      description: '20 dakika kestir',             xpCost: 180,  emoji: '😴', tier: 'small' },
  { id: 'r_bath',      name: 'Uzun Duş / Banyo', description: 'Sıcak suyla rahatlama',        xpCost: 220,  emoji: '🛁', tier: 'small' },
  { id: 'r_music',     name: 'Müzik Molası',     description: 'Kulaklıkla dinle, sadece dinle', xpCost: 100, emoji: '🎧', tier: 'small' },
  { id: 'r_walk',      name: 'Özgür Yürüyüş',   description: 'Hedefsiz çıkma molası',        xpCost: 160,  emoji: '🌿', tier: 'small' },
  // Orta
  { id: 'r_sushi',     name: 'Favori Restoran',  description: 'Sevdiğin yerde yemek',          xpCost: 600,  emoji: '🍣', tier: 'medium' },
  { id: 'r_clothes',   name: 'Kıyafet Bakma',    description: 'Mağazada bir tur',              xpCost: 500,  emoji: '👗', tier: 'medium' },
  { id: 'r_podcast',   name: 'Podcast Günü',     description: 'İşte dinleyeceğini listele',    xpCost: 380,  emoji: '🎙️', tier: 'medium' },
  // Büyük
  { id: 'r_massage',   name: 'Masaj',            description: 'Profesyonel veya ev tipi',      xpCost: 1800, emoji: '💆', tier: 'large' },
  { id: 'r_skincare',  name: 'Cilt Bakım Seti',  description: 'Kendine bir kiti al',           xpCost: 1400, emoji: '🧴', tier: 'large' },
  { id: 'r_bookshelf', name: 'Kitap Seti',       description: 'Okuma listenin ilk 3\'ü',       xpCost: 1600, emoji: '📚', tier: 'large' },
  // Efsanevi
  { id: 'r_course',    name: 'Online Kurs',      description: 'İlgi alanında bir kurs al',     xpCost: 2500, emoji: '🎓', tier: 'legendary' },
  { id: 'r_gadget',    name: 'Küçük Gadget',     description: 'Teknoloji alışverişi',           xpCost: 3500, emoji: '🔋', tier: 'legendary' },
  // Mitik
  { id: 'r_concert',   name: 'Konser / Festival', description: 'Canlı müzik deneyimi',         xpCost: 6000, emoji: '🎤', tier: 'mythic' },
  { id: 'r_ultimate',  name: 'Hayalindeki Gün',  description: 'Kendine özel bir gün yarat',    xpCost: 12000,emoji: '🌠', tier: 'mythic' },
]
