'use client'
import { useEffect, useState } from 'react'
import { Bookmark, ChevronDown } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { quoteForToday, type Quote } from '@/lib/quotes'

export function DailyQuote() {
  const { data, toggleSaveQuote } = useStore()
  const [quote, setQuote] = useState<Quote | null>(null)
  const [showSaved, setShowSaved] = useState(false)

  // Tarih bazlı seçim client'ta yapılır; SSR/CSR uyumsuzluğunu önlemek için mount sonrası set edilir.
  useEffect(() => {
    setQuote(quoteForToday())
  }, [])

  if (!quote) return null

  const isSaved = data.savedQuotes.includes(quote.text)
  const recentSaved = data.savedQuotes.slice(-5).reverse()

  return (
    <div className="rounded-xl border border-border bg-surface-2 p-4">
      <div className="flex items-start gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-base italic leading-relaxed text-fg">{quote.text}</p>
          <p className="mt-1.5 text-xs text-muted">{quote.author}</p>
        </div>
        <button
          type="button"
          onClick={() => toggleSaveQuote(quote.text)}
          aria-label={isSaved ? 'Alıntıyı kaldır' : 'Alıntıyı kaydet'}
          aria-pressed={isSaved}
          className="shrink-0 rounded-lg p-1.5 text-muted transition-colors hover:text-fg"
        >
          <Bookmark size={16} fill={isSaved ? 'currentColor' : 'none'} className={isSaved ? 'text-primary' : ''} />
        </button>
      </div>

      {data.savedQuotes.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <button
            type="button"
            onClick={() => setShowSaved(v => !v)}
            aria-expanded={showSaved}
            className="flex w-full items-center justify-between text-xs text-muted transition-colors hover:text-fg"
          >
            <span>Kaydedilen alıntılar ({data.savedQuotes.length})</span>
            <ChevronDown size={14} className={showSaved ? 'rotate-180 transition-transform' : 'transition-transform'} />
          </button>
          {showSaved && (
            <ul className="mt-2 space-y-1.5">
              {recentSaved.map((text, i) => (
                <li key={`${text}-${i}`} className="text-xs leading-relaxed text-muted">
                  {text}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
