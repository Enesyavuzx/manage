// Dopamin Menüsü: az uyarılmış hissedildiğinde, karar yorgunluğu olmadan
// "menüden seç" mantığıyla aktif dopamin kaynağı seçtiren liste. Telefona
// uzanmak yerine bilinçli bir aktiviteye yönlendirir (DEHB için kritik).

export type DopamineTierId = 'ordovr' | 'ana' | 'garnitur' | 'tatli'

export interface DopamineItem {
  id: string
  label: string
}

export interface DopamineTier {
  id: DopamineTierId
  title: string
  emoji: string
  tagline: string       // ne işe yaradığı, kısa
  durationMin: number   // önerilen süre (zamanlayıcı için); 0 = serbest
  color: string         // hex, katman rengi
  items: DopamineItem[]
}

export const DOPAMINE_TIERS: DopamineTier[] = [
  {
    id: 'ordovr',
    title: 'Ordövr',
    emoji: '🥗',
    tagline: 'Hızlı hareket, anında kıvılcım',
    durationMin: 5,
    color: '#f59e0b',
    items: [
      { id: 'ordovr-dance', label: 'Bir şarkıyı sonuna kadar, kendini bırakarak dans et' },
      { id: 'ordovr-jacks', label: '20 jumping jack + kocaman bir tam vücut esnemesi' },
      { id: 'ordovr-walk',  label: 'Dışarıda ya da evin içinde tempolu bir tur at' },
      { id: 'ordovr-shake', label: 'Gölge boks yap ya da her uzvunu silkele' },
      { id: 'ordovr-stairs', label: 'Merdivenleri birkaç kez inip çık' },
    ],
  },
  {
    id: 'ana',
    title: 'Ana Yemek',
    emoji: '🍝',
    tagline: 'Derin çalışma, doyurucu ana yemek',
    durationMin: 20,
    color: '#8b5cf6',
    items: [
      { id: 'ana-task',  label: 'En önemli tek işin, telefon başka odada, zamanlayıcı açık' },
      { id: 'ana-write', label: 'Herhangi bir konuda 500 kelime yaz' },
      { id: 'ana-learn', label: 'Merak ettiğin bir şeyin bir bölümünü / dersini öğren' },
      { id: 'ana-build', label: 'Küçük bir şey inşa et ya da tamir et' },
      { id: 'ana-organize', label: 'Bir çekmeceyi, rafı ya da klasörü derinlemesine düzenle' },
    ],
  },
  {
    id: 'garnitur',
    title: 'Garnitür',
    emoji: '🥖',
    tagline: 'Yaratıcı oyun, hafif ve eğlenceli',
    durationMin: 10,
    color: '#14b8a6',
    items: [
      { id: 'garnitur-doodle', label: 'Önündeki her neyse onu karala ya da çiz' },
      { id: 'garnitur-prompt', label: 'Tuhaf bir başlangıçtan serbest yaz ("gece açılan bir kapı")' },
      { id: 'garnitur-ideas',  label: '10 saçma fikir üret, hiçbirini yargılama' },
      { id: 'garnitur-photo',  label: 'Etrafındaki küçük ilginç detayları fotoğrafla' },
      { id: 'garnitur-play',   label: 'Bir enstrümanla hiçbir hedef olmadan oyna' },
    ],
  },
  {
    id: 'tatli',
    title: 'Tatlı',
    emoji: '🍰',
    tagline: 'Düşük efor, yüksek konfor (pili bittiğinde)',
    durationMin: 0,
    color: '#ec4899',
    items: [
      { id: 'tatli-song',   label: 'Sevdiğin bir şarkıyı gözlerin kapalı sadece dinle' },
      { id: 'tatli-drink',  label: 'Sıcak bir içecek yap, ilk yudumun tadına gerçekten var' },
      { id: 'tatli-window', label: 'Pencereden dışarıyı izle: insanlar, gökyüzü, ağaçlar' },
      { id: 'tatli-photos', label: 'Beğendiğin birkaç fotoğrafa ya da anıya bak' },
      { id: 'tatli-animal', label: 'Bir hayvanı (kendininki ya da videodaki) birkaç dakika izle' },
      { id: 'tatli-warmth', label: 'Esneyip güneşin veya lambanın sıcaklığında otur' },
    ],
  },
]

export interface DopaminePick {
  tier: DopamineTier
  item: DopamineItem
}

// Rastgele tek bir aktivite seç ("Bana sürpriz yap"). İstenirse belirli bir
// katmanla sınırlanır; yoksa tüm menüden çekilir.
export function pickRandom(tierId?: DopamineTierId): DopaminePick {
  const pool = tierId ? DOPAMINE_TIERS.filter(t => t.id === tierId) : DOPAMINE_TIERS
  const tier = pool[Math.floor(Math.random() * pool.length)]
  const item = tier.items[Math.floor(Math.random() * tier.items.length)]
  return { tier, item }
}
