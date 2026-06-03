'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn, generateId } from '@/lib/utils'
import { useStore } from '@/hooks/useStore'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { coachBriefing, coachAnswer, COACH_ACTIONS, type CoachContext } from '@/lib/coach'

interface ChatMessage {
  id: string
  from: 'user' | 'bot'
  text: string
  ts: number
}

export function CoachChat() {
  const { data, todayCompletedIds, ready } = useStore()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [botTyping, setBotTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // En güncel context'i ref'te tut ki gecikmeli yanıtta taze veri kullanılsın.
  const ctxRef = useRef<CoachContext>({ data, doneToday: todayCompletedIds })
  ctxRef.current = { data, doneToday: todayCompletedIds }

  // Kişiselleştirilmiş açılış brifingi (veri hazır olunca bir kez).
  useEffect(() => {
    if (!ready || messages.length > 0) return
    setMessages([{ id: 'briefing', from: 'bot', text: coachBriefing(ctxRef.current), ts: Date.now() }])
  }, [ready, messages.length])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, botTyping])

  const ask = useCallback((text: string) => {
    const q = text.trim()
    if (!q || botTyping) return
    const userMsg: ChatMessage = { id: generateId(), from: 'user', text: q, ts: Date.now() }
    setMessages(prev => [...prev, userMsg])
    setInput('')
    setBotTyping(true)
    setTimeout(() => {
      const answer = coachAnswer(ctxRef.current, q)
      setMessages(prev => [...prev, { id: generateId(), from: 'bot', text: answer, ts: Date.now() }])
      setBotTyping(false)
    }, 350)
  }, [botTyping])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      ask(input)
    }
  }

  return (
    <Card glow>
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <CardTitle>KOÇUM</CardTitle>
        </div>
        <span className="text-xs text-muted">Verinden konuşur, çevrimdışı</span>
      </CardHeader>

      <CardBody className="p-0">
        <div className="flex flex-col gap-3 overflow-y-auto px-4 py-4" style={{ minHeight: 320, maxHeight: 420 }}>
          {messages.map(msg => (
            <div key={msg.id} className={cn('flex', msg.from === 'user' ? 'justify-end' : 'justify-start')}>
              <div
                className={cn(
                  'max-w-[80%] whitespace-pre-line rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.from === 'user'
                    ? 'bg-primary text-bg rounded-br-sm'
                    : 'bg-surface-2 border border-border text-fg rounded-bl-sm',
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {botTyping && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-xl rounded-bl-sm border border-border bg-surface-2 px-4 py-3">
                <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:0ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 rounded-full bg-muted animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Hızlı aksiyonlar */}
        <div className="flex flex-wrap gap-1.5 border-t border-border px-4 pt-3">
          {COACH_ACTIONS.map(a => (
            <button
              key={a.query}
              onClick={() => ask(a.query)}
              disabled={botTyping}
              className="rounded-lg border border-border bg-surface-2 px-2.5 py-1.5 text-xs text-muted transition-colors hover:text-fg disabled:opacity-50"
            >
              {a.label}
            </button>
          ))}
        </div>

        {/* Giriş alanı */}
        <div className="flex gap-2 px-4 py-3">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Bir şey sor..."
            disabled={botTyping}
            className={cn(
              'flex-1 rounded-lg border border-border bg-surface-2 px-3.5 py-2 text-sm text-fg placeholder:text-muted-2',
              'focus:outline-none focus:border-border-hover transition-colors duration-150 disabled:opacity-50',
            )}
          />
          <Button variant="primary" size="sm" onClick={() => ask(input)} disabled={!input.trim() || botTyping} aria-label="Gönder">
            ↑
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
