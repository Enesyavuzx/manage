'use client'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { QuickHabitList } from '@/components/quick/quick-habit-list'

export default function QuickPage() {
  return (
    <div className="mx-auto max-w-lg space-y-5">
      <div className="flex items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm text-muted hover:text-fg transition-colors"
        >
          <ArrowLeft size={15} /> Geri
        </Link>
        <span className="text-sm font-bold text-fg font-display tracking-wider">HIZLI MOD</span>
        <div className="w-12" />
      </div>

      <QuickHabitList />
    </div>
  )
}
