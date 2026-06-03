import type { CapacitorConfig } from '@capacitor/cli'

// Capacitor yapılandırması (iOS/Android native kabuk).
// Web çıktısı statik export ile `out/` klasörüne üretilir: `npm run build:mobile`.
// Ardından `npx cap sync` ile native projeye kopyalanır.
const config: CapacitorConfig = {
  appId: 'com.manage.habit',
  appName: 'Manage',
  webDir: 'out',
  backgroundColor: '#081618',
  ios: {
    contentInset: 'always',
    backgroundColor: '#081618',
  },
  plugins: {
    LocalNotifications: {
      smallIcon: 'ic_stat_icon',
      iconColor: '#2DE2C4',
    },
  },
}

export default config
