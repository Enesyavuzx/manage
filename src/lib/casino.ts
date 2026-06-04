// Casino mini oyunları için saf mantık. Hiçbir React/DOM bağımlılığı yok;
// tüm rastgelelik Math.random ile (gerçek para yok, bahis birimi XP).

// ---- Kart destesi & Blackjack ----
export type Suit = '♠' | '♥' | '♦' | '♣'
export interface Card {
  rank: string   // 'A','2'..'10','J','Q','K'
  suit: Suit
}

const SUITS: Suit[] = ['♠', '♥', '♦', '♣']
const RANKS = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K']

export function isRed(suit: Suit): boolean {
  return suit === '♥' || suit === '♦'
}

export function freshDeck(): Card[] {
  const deck: Card[] = []
  for (const s of SUITS) for (const r of RANKS) deck.push({ rank: r, suit: s })
  // Fisher-Yates
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[deck[i], deck[j]] = [deck[j], deck[i]]
  }
  return deck
}

export function cardValue(rank: string): number {
  if (rank === 'A') return 11
  if (rank === 'K' || rank === 'Q' || rank === 'J') return 10
  return parseInt(rank, 10)
}

// As'ları gerektiğinde 1 sayan en iyi el toplamı.
export function handValue(cards: Card[]): { total: number; soft: boolean } {
  let total = 0
  let aces = 0
  for (const c of cards) {
    total += cardValue(c.rank)
    if (c.rank === 'A') aces++
  }
  let soft = aces > 0
  while (total > 21 && aces > 0) {
    total -= 10
    aces--
    if (aces === 0) soft = false
  }
  if (aces === 0) soft = false
  return { total, soft }
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards).total === 21
}

// ---- Slot makinesi (Jackpot) ----
// 6 sembol; ağırlıklı olarak seçilir, üç eşleşme katsayıyla ödüllendirilir.
export interface SlotSymbol {
  id: string
  emoji: string
  weight: number    // çekiliş ağırlığı (büyük = sık)
  three: number     // üçlü eşleşme bahis katsayısı
  two: number       // ikili eşleşme bahis katsayısı
}

export const SLOT_SYMBOLS: SlotSymbol[] = [
  { id: 'cherry',  emoji: '🍒', weight: 30, three: 3,   two: 1 },
  { id: 'lemon',   emoji: '🍋', weight: 26, three: 4,   two: 1 },
  { id: 'bell',    emoji: '🔔', weight: 20, three: 6,   two: 0 },
  { id: 'star',    emoji: '⭐', weight: 12, three: 10,  two: 0 },
  { id: 'gem',     emoji: '💎', weight: 8,  three: 20,  two: 0 },
  { id: 'seven',   emoji: '7️⃣', weight: 4,  three: 50,  two: 0 },
]

const SLOT_TOTAL_WEIGHT = SLOT_SYMBOLS.reduce((s, x) => s + x.weight, 0)

export function spinReel(): SlotSymbol {
  let r = Math.random() * SLOT_TOTAL_WEIGHT
  for (const sym of SLOT_SYMBOLS) {
    r -= sym.weight
    if (r <= 0) return sym
  }
  return SLOT_SYMBOLS[0]
}

export interface SlotResult {
  reels: [SlotSymbol, SlotSymbol, SlotSymbol]
  multiplier: number     // bahis çarpanı (0 = kayıp)
  payout: number         // bahis * çarpan
  jackpot: boolean       // üç adet 7
  label: string
}

export function spinSlots(bet: number): SlotResult {
  const reels: [SlotSymbol, SlotSymbol, SlotSymbol] = [spinReel(), spinReel(), spinReel()]
  const [a, b, c] = reels
  let multiplier = 0
  let label = 'Tekrar dene'
  let jackpot = false

  if (a.id === b.id && b.id === c.id) {
    multiplier = a.three
    jackpot = a.id === 'seven'
    label = jackpot ? 'JACKPOT! 7-7-7' : `Üçlü ${a.emoji}`
  } else if (a.id === b.id || b.id === c.id || a.id === c.id) {
    // ikili eşleşmede en yüksek two değerini bul
    const pairSym = a.id === b.id ? a : b.id === c.id ? b : a
    if (pairSym.two > 0) {
      multiplier = pairSym.two
      label = `İkili ${pairSym.emoji}`
    }
  }

  return { reels, multiplier, payout: bet * multiplier, jackpot, label }
}

// ---- Yazı-tura (Coin Flip): basit 2x ----
export function coinFlip(): 'heads' | 'tails' {
  return Math.random() < 0.5 ? 'heads' : 'tails'
}

// ---- Çark (Wheel of Fortune) ----
export interface WheelSlice {
  id: string
  label: string
  multiplier: number     // bahis çarpanı (0 = kayıp)
  weight: number
  color: string
}

export const WHEEL_SLICES: WheelSlice[] = [
  { id: 'x0a',  label: 'Boş',  multiplier: 0,   weight: 30, color: '#3a3a4a' },
  { id: 'x1.5', label: '1.5x', multiplier: 1.5, weight: 22, color: '#3b82f6' },
  { id: 'x0b',  label: 'Boş',  multiplier: 0,   weight: 18, color: '#2a2a38' },
  { id: 'x2',   label: '2x',   multiplier: 2,   weight: 14, color: '#22c55e' },
  { id: 'x3',   label: '3x',   multiplier: 3,   weight: 9,  color: '#a855f7' },
  { id: 'x5',   label: '5x',   multiplier: 5,   weight: 5,  color: '#f59e0b' },
  { id: 'x10',  label: '10x',  multiplier: 10,  weight: 2,  color: '#ec4899' },
]

const WHEEL_TOTAL_WEIGHT = WHEEL_SLICES.reduce((s, x) => s + x.weight, 0)

export function spinWheel(): WheelSlice {
  let r = Math.random() * WHEEL_TOTAL_WEIGHT
  for (const slice of WHEEL_SLICES) {
    r -= slice.weight
    if (r <= 0) return slice
  }
  return WHEEL_SLICES[0]
}
