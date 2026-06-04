// Oturum içi combo sayacı: kısa aralıkla art arda tamamlanan alışkanlıklar
// combo'yu yükseltir. Kalıcı değil (sayfa yenilenince sıfırlanır), sadece o
// anki dopamin geri bildirimi için. ADHD beyni için "üst üste yaptım" hissi
// güçlü bir pekiştireçtir.

const WINDOW_MS = 8000 // bu süre içinde yeni tamamlama combo'yu sürdürür
const MAX_BONUS = 30

let lastAt = 0
let combo = 0

// Bir tamamlamayı kaydeder ve güncel combo sayısını döndürür.
export function registerCombo(now: number = Date.now()): number {
  combo = now - lastAt <= WINDOW_MS ? combo + 1 : 1
  lastAt = now
  return combo
}

// Combo'ya göre bonus XP (2'den itibaren artar, tavanı var).
export function comboBonus(value: number): number {
  if (value < 2) return 0
  return Math.min(MAX_BONUS, (value - 1) * 5)
}

export function comboEmoji(value: number): string {
  if (value >= 6) return '🌟'
  if (value >= 4) return '🔥'
  if (value >= 3) return '⚡'
  return '✨'
}

export function resetCombo(): void {
  combo = 0
  lastAt = 0
}
