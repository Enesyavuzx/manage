# Değişiklik Günlüğü

Bu sürüm, uygulamayı çok-temalı, animasyonlu ve oyunlaştırılmış bir arayüze dönüştürür.
Webflow **Brix** tasarım dili + **theme-factory** (ComposioHQ) preset'leri temel alınmıştır.

## [Yayınlanmamış] — Brix & Tema Sistemi

### ✨ Yeni Özellikler

**Tema sistemi (13 tema)**
- Renk önizlemeli **tema galerisi** ile tek tıkla geçiş.
- theme-factory preset'leri token sistemine birebir uyarlandı: **Botanik** (varsayılan), Orman, Altın Saat, Gün Batımı, Çöl Gülü, Arktik, Minimal, Okyanus, Galaksi, Teknoloji.
- Ek temalar: **Brix** (sıcak pixel-retro), **Pro** (koyu), **Vapor** (vaporwave).
- Açık/koyu ve serif/sans karışımı; hepsi tüm sayfalara, yan panele ve klasör-OS'a otomatik uygulanır.

**Klasör "mini-OS" (panel)**
- Bilgisayar açılış (boot) animasyonu → **%100** → masaüstü.
- **Sürüklenebilir** klasör ikonları; konumlar hatırlanır.
- Klasöre tıklayınca ikondan büyüyerek açılan **pencere**: içinde **gerçek dosyalar** (alışkanlıkların, son ruh hali/odak kayıtların, hesapların) + kısayollar.
- Pencere **taşınabilir** ve **büyütülebilir**; breadcrumb, "Tümünü aç", canlı saat, yeniden başlat.

**Animasyonlar**
- Scroll-reveal (kademeli açılım), kart/buton/yan panel hover etkileşimleri, liste satırı kademeli giriş, pencere aç/kapat.
- `prefers-reduced-motion` desteği (erişilebilirlik).

**Geliştirici araçları**
- `.claude/skills/` altına **theme-factory dahil 29 Claude skill** eklendi.

### 🎨 İyileştirmeler
- Türkçe-güvenli pixel font (**Pixelify Sans**) ve serif başlık (**Lora**).
- Pixel-bevel kart/buton/form stilleri; tema-uyumlu (token tabanlı) gölge ve çerçeveler.
- Grafik renkleri tema paletine uyarlandı.
- Gerçek pixel asset'ler: yürüyen karakter + klasör ikonları.

### 🔧 Diğer
- Mobil tarayıcı tema rengi aktif temaya göre ayarlandı.
- "Eski site" renk kalıntıları temizlendi (oyun/grafik renkleri kasıtlı korundu).
