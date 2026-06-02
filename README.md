# Manage - Alışkanlık & Ödül Oyunu

Alışkanlık takip et, streak yap, XP kazan, seviye atla, rütbe/ünvan yükselt, 80 başarımı topla, ödülleri aç. İki tema: **Aurora** (akışkan/teknolojik) ve **Pixel** (8-bit retro).

## Çalıştırma

```bash
npm install      # ilk seferde (yeni paket eklendiyse tekrar)
npm run dev      # http://localhost:3000
```

> Not: Bu sürümde yeni bir paket (`@supabase/supabase-js`) eklendi. Kodu güncelledikten sonra **bir kez** `npm install` çalıştırman gerekir.

## Veri kaydı

- **Varsayılan:** Tüm veriler tarayıcının `localStorage`'ında tutulur. Hiçbir kurulum gerekmez, hemen çalışır. Veri o cihazda/tarayıcıda kalır.
- **Bulut (opsiyonel, Supabase):** Aşağıdaki adımları yaparsan veri buluta senkronlanır ve her cihazdan erişilebilir.

### Supabase kurulumu (opsiyonel)

1. https://supabase.com adresinde ücretsiz bir proje oluştur.
2. Sol menü **SQL Editor > New query** > `supabase-schema.sql` dosyasının içeriğini yapıştır > **Run**.
3. **Authentication > Providers > Anonymous sign-ins** seçeneğini aç.
4. **Project Settings > API** sayfasından `Project URL` ve `anon public` anahtarını kopyala.
5. Proje kökünde `.env.local.example` dosyasını `.env.local` olarak kopyala ve iki değeri doldur.
6. `npm run dev`'i yeniden başlat. Sol alttaki simge bulut ikonuna dönerse senkron aktiftir.

Bulut yapılandırması yoksa uygulama otomatik olarak localStorage'a düşer; hiçbir özellik kapanmaz.

## Yapı

- `src/lib/` - tipler, oyunlaştırma (XP/seviye/rütbe), 80 başarım, store mantığı, supabase senkron
- `src/hooks/useStore.ts` - merkezi durum + bildirimler
- `src/components/` - UI, grafikler, dashboard, profil, ödüller
- `src/app/` - sayfalar (Panel, Alışkanlıklar, Ödüller, Başarımlar, İstatistik, Profil)
