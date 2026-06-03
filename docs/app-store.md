# Manage - App Store Yayın Rehberi

Bu doküman, web uygulamasını **iOS native** uygulamaya çevirip App Store'da
yayınlama adımlarını içerir. Tüm native adımlar **Mac + Xcode** gerektirir;
web tarafı (statik export) herhangi bir makinede üretilebilir.

## 0. Önkoşullar
- macOS + **Xcode** (App Store'dan)
- **Apple Developer Program** üyeliği (yıllık, yayın için zorunlu)
- Node.js 18+ ve npm
- **CocoaPods**: `sudo gem install cocoapods`

## 1. Bağımlılıkları kur
```bash
npm install
# Capacitor paketleri optionalDependencies'te tanımlı; kurulmadıysa:
npm install @capacitor/core @capacitor/cli @capacitor/ios @capacitor/local-notifications
```

## 2. iOS projesini oluştur (tek sefer)
```bash
npm run build:mobile      # statik web çıktısı -> out/
npx cap add ios           # ios/ native projesini üretir
npx cap sync              # out/ + pluginleri native projeye kopyalar
```

## 3. Geliştirme döngüsü
Web kodunu her değiştirdiğinde:
```bash
npm run cap:sync          # build:mobile + cap sync
npx cap open ios          # Xcode'da aç
```
veya kısayol: `npm run ios`

## 4. Xcode ayarları
- **Signing & Capabilities**: Team seç, otomatik imzalamayı aç.
- **Bundle Identifier**: `com.manage.habit` (capacitor.config.ts ile aynı; gerçek
  bir domain'e sahip benzersiz bir id ile değiştir).
- **Capabilities -> Push Notifications** gerekmiyor (yerel bildirim kullanıyoruz),
  ancak **Background Modes** gerekmez; LocalNotifications OS tarafından zamanlanır.
- **Display Name**: Manage
- **Deployment Target**: iOS 14+ önerilir.

## 5. İkon ve açılış ekranı
- App ikonu: 1024x1024 PNG (saydamlık yok). `static/branding` benzeri kaynak yoksa
  `public/icon-512.png` baz alınarak üretilir.
- Xcode -> `App/Assets.xcassets/AppIcon` içine yerleştir.
- Açılış (splash) arka planı `capacitor.config.ts`'teki `#081618` ile uyumlu.

## 6. Yerel bildirim doğrulaması
- Uygulama içinde Profil -> Ayarlar -> Bildirimleri aç, sabah/akşam saati ve bir
  alışkanlığa hatırlatıcı saat ver.
- `NotificationManager`, native platformda `syncNativeReminders` ile bu saatleri
  iOS'a kaydeder; uygulama **tamamen kapalıyken** de bildirim gelir.
- Test: saatlerden birini yakın bir dakikaya ayarla, uygulamayı kapat, bekle.

## 7. Arşivle ve yükle
- Xcode -> Product -> **Archive**
- Organizer -> **Distribute App** -> App Store Connect -> Upload.

## 8. App Store Connect metadata
Aşağıdaki `app-store-metadata.md` dosyasındaki hazır metinleri kullan
(isim, alt başlık, açıklama, anahtar kelimeler, gizlilik URL'si).

## 9. Gizlilik
- App Store Connect **App Privacy** bölümünde: "Data Not Collected" seçilebilir
  (varsayılan localStorage modu). Bulut senkronu opsiyonel olduğundan, kullanıcı
  kendi Supabase'ini bağlamadıkça veri toplanmaz.
- Gizlilik politikası URL'si: uygulamadaki `/privacy` sayfasını bir web adresinde
  yayınla (ör. mevcut web dağıtımının `https://<alanadi>/privacy`).

## 10. Sürüm güncelleme
- `capacitor.config.ts` veya Xcode'da `Version` ve `Build` numarasını artır.
- `npm run cap:sync`, sonra Archive -> Upload.

## Yaygın takılmalar
- **Beyaz ekran**: `webDir` `out` olmalı ve `npm run build:mobile` çalışmış olmalı.
- **Pod hatası**: `cd ios/App && pod install`.
- **Bildirim gelmiyor**: cihaz ayarlarından uygulama bildirim izni açık mı kontrol et.
