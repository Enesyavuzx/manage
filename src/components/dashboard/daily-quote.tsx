'use client'
import { useEffect, useState } from 'react'
import { Quote as QuoteIcon } from 'lucide-react'
import { quoteForToday, type Quote } from '@/lib/quotes'
import { Card } from '@/components/ui/card'

export function DailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null)

  // Tarih bazlı seçim client'ta yapılır; SSR/CSR uyumsuzluğunu önlemek için mount sonrası set edilir.
  useEffect(() => {
    setQuote(quoteForToday())
  }, [])

  if (!quote) return null

  return (
    <Card className="p-4">
      <div className="flex gap-3">
        <QuoteIcon size={16} className="mt-0.5 shrink-0 text-muted" />
        <div className="min-w-0">
          <p className="text-sm leading-relaxed text-fg">{quote.text}</p>
          <p className="mt-1 text-xs text-muted">{quote.author}</p>
        </div>
      </div>
    </Card>
  )
}
