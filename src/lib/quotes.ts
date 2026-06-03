export interface Quote {
  text: string
  author: string
  saved?: boolean
}

export function quoteForToday(): Quote {
  const quotes = QUOTES
  const dateStr = new Date().toISOString().slice(0, 10) // YYYY-MM-DD
  let hash = 0
  for (let i = 0; i < dateStr.length; i++) {
    hash = (hash * 31 + dateStr.charCodeAt(i)) & 0xffffffff
  }
  return quotes[Math.abs(hash) % quotes.length]
}

const QUOTES: Quote[] = [
  { text: 'Mükemmel değil, yeterince iyi ol.', author: 'Voltaire\'den uyarlama' },
  { text: 'Küçük adımlar, büyük değişimlerin başlangıcıdır.', author: 'Bilinmeyen' },
  { text: 'Bugün bitiremediklerin yarının fırsatlarıdır.', author: 'Bilinmeyen' },
  { text: 'Beynin farklı çalışması, zayıflık değil; farklı bir güçtür.', author: 'Bilinmeyen' },
  { text: 'Odaklanmak bir yetenek değil, pratik yapılan bir beceridir.', author: 'Bilinmeyen' },
  { text: 'Başlamak, tamamlamanın yarısıdır.', author: 'Aristoteles\'ten uyarlama' },
  { text: 'Kendine karşı nazik ol; büyüme zaman ister.', author: 'Bilinmeyen' },
  { text: 'Her gün küçük bir şey yap. Küçük şeyler birikerek büyük olur.', author: 'Bilinmeyen' },
  { text: 'Dikkatini toplamak için önce kendini kabul etmen gerekir.', author: 'Bilinmeyen' },
  { text: 'Karmaşa içinde bile, bir sonraki adımı görmen yeterlidir.', author: 'Bilinmeyen' },
  { text: 'Başarı, her gün tekrarlanan küçük çabaların toplamıdır.', author: 'Robert Collier\'dan uyarlama' },
  { text: 'Düşüncelerini seç; onlar eylemlerin tohumlarıdır.', author: 'Bilinmeyen' },
  { text: 'İlerleme mükemmeliyetten üstündür.', author: 'Bilinmeyen' },
  { text: 'Bugün kendine bir şans ver; belki tam da bunu hak ediyorsun.', author: 'Bilinmeyen' },
  { text: 'Zihnini dinle ama sınırlarına inanma.', author: 'Bilinmeyen' },
  { text: 'Her yeni gün, yeniden başlamanın bir fırsatıdır.', author: 'Bilinmeyen' },
  { text: 'Dağınık bir zihin, yaratıcı bir zihnin işaretidir.', author: 'Bilinmeyen' },
  { text: 'Kendini olduğun gibi sev; büyüme oradan başlar.', author: 'Bilinmeyen' },
  { text: 'Bir adım at. Yolu yürürken öğrenirsin.', author: 'Bilinmeyen' },
  { text: 'Hata yapmak, öğrenmenin bir parçasıdır.', author: 'Bilinmeyen' },
  { text: 'Bugün yapabileceğin en küçük şey nedir? Onu yap.', author: 'Bilinmeyen' },
  { text: 'Sabır, en büyük güçtür.', author: 'Platon\'dan uyarlama' },
  { text: 'Kendine verdiğin her söz, güveni inşa eder.', author: 'Bilinmeyen' },
  { text: 'Odaklanamamak bir karakter kusuru değil; öğrenilebilir bir beceridir.', author: 'Bilinmeyen' },
  { text: 'Rutinler, özgürlüğün sessiz temelleridir.', author: 'Bilinmeyen' },
  { text: 'Bugün bitirdiğin her şey, yarın seni daha güçlü kılar.', author: 'Bilinmeyen' },
  { text: 'Farklı düşünmek, farklı çözümler üretmek demektir.', author: 'Bilinmeyen' },
  { text: 'Zihnini düzenlemek için önce ona alan aç.', author: 'Bilinmeyen' },
  { text: 'Hayat kısa; gerçekten önemli olana odaklan.', author: 'Marcus Aurelius\'tan uyarlama' },
  { text: 'Her gün biraz daha iyi olmak yeterlidir.', author: 'Bilinmeyen' },
]
