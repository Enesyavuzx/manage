import type { ThemeName } from './types'

export interface ThemeMeta {
  id: ThemeName
  label: string
  swatch: [string, string, string] // önizleme: [primary, accent, bg]
  dark?: boolean
}

// Sıra = tema galerisindeki gösterim sırası. İlk = varsayılan.
export const THEMES: ThemeMeta[] = [
  { id: 'botanic', label: 'Botanik',     swatch: ['#4a7c59', '#f9a620', '#f5f3ed'] },
  { id: 'forest',  label: 'Orman',       swatch: ['#2d4a2b', '#a4ac86', '#faf9f6'] },
  { id: 'golden',  label: 'Altın Saat',  swatch: ['#f4a900', '#c1666b', '#efe2cf'] },
  { id: 'sunset',  label: 'Gün Batımı',  swatch: ['#e76f51', '#e9c46a', '#fdf4ea'] },
  { id: 'desert',  label: 'Çöl Gülü',    swatch: ['#b87d6d', '#d4a5a5', '#f3e7da'] },
  { id: 'arctic',  label: 'Arktik',      swatch: ['#4a6fa5', '#6aa0e0', '#f3f7fc'] },
  { id: 'minimal', label: 'Minimal',     swatch: ['#36454f', '#708090', '#ffffff'] },
  { id: 'ocean',   label: 'Okyanus',     swatch: ['#2d8b8b', '#a8dadc', '#1a2332'], dark: true },
  { id: 'galaxy',  label: 'Galaksi',     swatch: ['#6b6fc0', '#a490c2', '#2b1e3e'], dark: true },
  { id: 'tech',    label: 'Teknoloji',   swatch: ['#0066ff', '#00ffff', '#1e1e1e'], dark: true },
  { id: 'brix',    label: 'Brix',        swatch: ['#ffa447', '#7b95ff', '#fff7f1'] },
  { id: 'pro',     label: 'Pro',         swatch: ['#5e6ad2', '#62c0f5', '#08090a'], dark: true },
  { id: 'pixel',   label: 'Vapor',       swatch: ['#01cdfe', '#ff71ce', '#1a1430'], dark: true },
]

export const THEME_IDS: ThemeName[] = THEMES.map(t => t.id)
