'use client'
import { useState } from 'react'
import Link from 'next/link'
import { Folder, FolderOpen, ArrowRight, FolderTree } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FolderItem {
  id: string
  title: string
  tags: string[]
  note: string
  href: string
  cta: string
  accent: string // rgb triplet (CSS var uyumlu)
}

// Brix "#job" klasör listesinin bizim sisteme uyarlaması:
// her klasör bir özellik alanı; tıklayınca içinden notlar/detaylar açılır.
const FOLDERS: FolderItem[] = [
  {
    id: 'aliskanlik',
    title: 'Alışkanlık Sistemi',
    tags: ['Takip', 'Streak', 'Zincir'],
    note: 'Alışkanlıklarını ekle, her gün işaretle ve streak\'ini büyüt. Zincir görünümüyle birbirine bağlı alışkanlıkları sıraya koy; bir gün kaçırınca streak donduran "streak freeze" seni korur.',
    href: '/habits',
    cta: 'Alışkanlıklara git',
    accent: '6 182 212',
  },
  {
    id: 'odak',
    title: 'Odak & Derin Çalışma',
    tags: ['Pomodoro', 'Akış'],
    note: 'Odak seansı başlat, akış durumunu (flow) izle ve dağılmadan çalış. Her tamamlanan seans XP kazandırır ve istatistiklerine işlenir.',
    href: '/focus',
    cta: 'Odağa başla',
    accent: '14 165 233',
  },
  {
    id: 'oyun',
    title: 'Oyun & Macera',
    tags: ['XP', 'Rütbe', 'Seferler'],
    note: 'Görevleri tamamla, XP kazan, seviye atla ve rütbeni yükselt. Seferler ve sezonlarla yeni hedeflerin kilidini aç, diyarını büyüt.',
    href: '/seferler',
    cta: 'Seferleri keşfet',
    accent: '139 92 246',
  },
  {
    id: 'ruh',
    title: 'Ruh Hali & Enerji',
    tags: ['Mood', 'Enerji'],
    note: 'Gününün ruh hâlini ve enerjini kaydet; hangi alışkanlığın seni nasıl etkilediğini gösteren içgörüleri gör.',
    href: '/mood',
    cta: 'Ruh hâlini kaydet',
    accent: '16 185 129',
  },
  {
    id: 'gelisim',
    title: 'Gelişim & İçgörü',
    tags: ['Koç', 'İstatistik'],
    note: 'Koçunla konuş, haftalık bakış yap ve istatistiklerinle ilerlemeni zaman içinde gör. Geleceğin benliğine mesaj bırak.',
    href: '/insights',
    cta: 'İçgörülere bak',
    accent: '217 119 6',
  },
  {
    id: 'finans',
    title: 'Finans',
    tags: ['Bütçe', 'Hedef'],
    note: 'Hesaplarını ve harcamalarını takip et, bütçe hedefleri koy ve grafiklerle nereye gittiğini gör.',
    href: '/budget',
    cta: 'Bütçeyi aç',
    accent: '236 72 153',
  },
]

function FolderRow({ item }: { item: FolderItem }) {
  const [open, setOpen] = useState(false)
  const Icon = open ? FolderOpen : Folder
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl border bg-surface transition-colors',
        open ? 'border-border-hover' : 'border-border hover:border-border-hover',
      )}
    >
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left"
      >
        <span
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg"
          style={{ background: `rgb(${item.accent} / 0.14)`, color: `rgb(${item.accent})` }}
        >
          <Icon size={18} />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block truncate text-sm font-semibold text-fg font-display">{item.title}</span>
          <span className="mt-0.5 flex flex-wrap gap-1.5">
            {item.tags.map(t => (
              <span key={t} className="text-[11px] text-muted">#{t}</span>
            ))}
          </span>
        </span>
        <ArrowRight
          size={16}
          className={cn('shrink-0 text-muted transition-transform duration-200', open ? 'rotate-90 text-primary' : 'group-hover:translate-x-0.5')}
        />
      </button>

      {/* açılır içerik (notlar) */}
      <div
        className={cn(
          'grid transition-all duration-300 ease-out',
          open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="overflow-hidden">
          <div className="border-t border-border px-4 py-3.5 pl-16">
            <p className="text-sm leading-relaxed text-muted">{item.note}</p>
            <Link
              href={item.href}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline font-display"
            >
              {item.cta} <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export function BrixFolders() {
  return (
    <section className="relative rounded-2xl border border-border bg-surface p-6 pixel-shadow sm:p-8">
      <div className="mb-5">
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-primary font-display">
          <FolderTree size={13} /> Sistem rehberi
        </span>
        <h2 className="mt-3 text-2xl font-bold text-fg sm:text-3xl">Her şey tek bir sistemde</h2>
        <p className="mt-2 text-sm text-muted">Bir klasöre dokun, içinde ne olduğunu gör.</p>
      </div>

      <div className="space-y-2.5">
        {FOLDERS.map(f => (
          <FolderRow key={f.id} item={f} />
        ))}
      </div>
    </section>
  )
}
