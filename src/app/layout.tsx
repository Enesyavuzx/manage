import type { Metadata } from 'next'
import './globals.css'
import { ClientLayout } from './client-layout'

export const metadata: Metadata = {
  title: 'Manage - Alışkanlık & Ödül Oyunu',
  description: 'Alışkanlık takip et, streak yap, XP kazan, seviye atla, rütbe yükselt.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" data-theme="aurora">
      <body>
        <ClientLayout>{children}</ClientLayout>
      </body>
    </html>
  )
}
