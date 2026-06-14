import type { Metadata, Viewport } from 'next'
import './globals.css'
import { ClientLayout } from './client-layout'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#f6f8fb',
}

export const metadata: Metadata = {
  title: 'Manage - Alışkanlık & Ödül Oyunu',
  description: 'Alışkanlık takip et, streak yap, XP kazan, seviye atla, rütbe yükselt.',
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Manage',
  },
  icons: {
    apple: '/icon-192.png',
    icon: '/icon-192.png',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-theme="brix">
      <head>
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <link rel="manifest" href="/manifest.webmanifest" />
      </head>
      <body>
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-lg focus:bg-primary focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-bg"
        >
          İçeriğe geç
        </a>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
