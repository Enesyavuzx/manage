'use client'
import { useState, useEffect, useRef, useCallback } from 'react'
import { cn, generateId } from '@/lib/utils'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ChatMessage {
  id: string
  from: 'user' | 'bot'
  text: string
  ts: number
}

// ─── Rule-based response engine ───────────────────────────────────────────────

interface Rule {
  pattern: RegExp
  responses: string[]
}

const RULES: Rule[] = [
  {
    pattern: /merhaba|selam|hey|naber|nasılsın/i,
    responses: [
      'Merhaba! 👋 Bugün seninle birlikte harika şeyler başarabiliriz. Ne hakkında konuşmak istersin?',
    ],
  },
  {
    pattern: /alışkanlık|nasıl başla|başlamak|yeni alışkanlık/i,
    responses: [
      'Küçük başla! 🌱 İki dakika kuralı: bir alışkanlığı o kadar küçük yap ki yapmamak saçma gelsin. Büyük değişimler küçük adımlardan doğar.',
    ],
  },
  {
    pattern: /motivasyon|istek yok|isteksiz|hevesim|enerji yok/i,
    responses: [
      'Motivasyon her zaman önce gelmez, bazen eylem önce gelir. ⚡ Sadece 5 dakika dene, başlamak en zor kısım!',
    ],
  },
  {
    pattern: /streak|seri|günlük seri|günlük zincir/i,
    responses: [
      'ADHD beyni tutarlılıkla gelişir! 🔥 Seriyi kırmamak güçlü bir dopamin döngüsü kurar. Küçük bir seri bile büyük bir zafer.',
    ],
  },
  {
    pattern: /odak|konsantre|dağıldım|dikkat|odaklanamıyorum/i,
    responses: [
      'Pomodoro dene: 25 dakika tek görev, 5 dakika mola. ⏱️ Telefonu görünmez yere koy ve sadece bir şeye odaklan. Beyin tek işte çok daha verimli!',
    ],
  },
  {
    pattern: /kötü hissediyorum|moralim yok|üzgün|kötüyüm|berbat|mutsuz/i,
    responses: [
      'Seni duyuyorum, bu his gerçek ve geçerli. 💙 Küçük bir şeyi tamamlamak bile beyni iyi hissettirmeye başlar. Bugün ne yapabilirsin?',
    ],
  },
  {
    pattern: /zor|yapamıyorum|başaramıyorum|olmadı|olmaz/i,
    responses: [
      'Her zorlu şey başta böyle görünür. 💪 Sen bugüne kadar pek çok zor şeyi aştın. Bu da geçer, adım adım gidelim!',
    ],
  },
  {
    pattern: /erteliyorum|erteleme|yarın yaparım|sonra yaparım|procrastination/i,
    responses: [
      'Erteleme genellikle korku veya bunalmaktan kaynaklanır. 🎯 Görevi en küçük adıma böl: "Dosyayı aç" bile sayılır. Başlamak bitirir!',
    ],
  },
  {
    pattern: /ödül|puan|xp|rozet|seviye|gamification/i,
    responses: [
      'Ödüller ADHD beyni için çok önemli! 🏆 Her tamamlanan görev için kendine küçük bir ödül belirle. Beyin dopamini sever, sistemimiz de bunu destekliyor!',
    ],
  },
  {
    pattern: /su|su iç|içmek|susamak|dehidrasyon/i,
    responses: [
      'Su içmeyi hatırlattım, hemen bir yudum al! 💧 Beyin susuz kaldığında odak ve ruh hali çarpıcı biçimde düşer. Şimdi tam zamanı!',
    ],
  },
  {
    pattern: /uyku|yorgunum|uykum|uyuyamadım|gece/i,
    responses: [
      'Uyku ADHD yönetiminin temelidir. 😴 Yatmadan önce 30 dakika ekrandan uzaklaş ve aynı saatte yatmayı dene. Beyin ritim sever!',
    ],
  },
  {
    pattern: /nefes|meditasyon|sakin|sakinleşmek|rahatlamak/i,
    responses: [
      '4-7-8 nefesi dene: 4 san nefes al, 7 san tut, 8 san ver. 🌬️ Üç kez tekrarla. Sinir sistemi anında sakinleşir. Şimdi deneyelim mi?',
    ],
  },
  {
    pattern: /spor|egzersiz|hareket|yürüyüş|koşu/i,
    responses: [
      'Hareket ADHD için ilaç gibi çalışır! 🏃 Sadece 10 dakika yürüyüş bile odak ve dopamini artırır. Bugün küçük bir hareket mümkün mü?',
    ],
  },
  {
    pattern: /stres|kaygı|endişe|gergin|panik/i,
    responses: [
      'Stresi tanımak zaten güçlü bir adım. 🧘 Şu an değiştirebileceğin bir şey var mı? Küçük bir kontrol hissi kaygıyı azaltır. Seninle buradayım!',
    ],
  },
  {
    pattern: /övgü|aferin|harika|tebrik|başardım|yaptım|bitirdim/i,
    responses: [
      'BU MUHTEŞEM! 🎉 Bu an için gerçekten gururlu olabilirsin. ADHD ile bir şeyi tamamlamak süper güç gerektirir. Devam et!',
    ],
  },
  {
    pattern: /teşekkür|sağ ol|mersi/i,
    responses: [
      'Ne demek, her zaman buradayım! 🤖 Başka ne konuşmak istersin?',
    ],
  },
  {
    pattern: /plan|hedef|program|takvim/i,
    responses: [
      'Plan yaparken 3 görev kuralını dene: günde en fazla 3 ana görev seç. 📋 ADHD beyni uzun listelerden bunalır, kısa liste güç verir!',
    ],
  },
]

const FALLBACKS = [
  'Seni anlıyorum! 💙 Biraz daha anlatır mısın, seninle birlikte çözelim.',
  'Güzel bir soru! 🤔 Şimdilik net bir cevabım yok ama seninle düşünmeye devam edebiliriz.',
  'Her gün küçük bir adım büyük değişimler yaratır. 🌟 Bugün ne yapabilirsin?',
  'Buradayım! 🤖 Alışkanlık, motivasyon veya odak hakkında sormak istediğin bir şey var mı?',
]

const GREETING: ChatMessage = {
  id: 'greeting',
  from: 'bot',
  text: 'Merhaba! 🤖 Ben KOÇUM, senin kişisel ADHD alışkanlık koçun. Alışkanlık, motivasyon, odak veya ruh halin hakkında konuşabiliriz. Bugün nasıl yardımcı olabilirim?',
  ts: Date.now(),
}

function getBotResponse(input: string): string {
  const text = input.trim()
  for (const rule of RULES) {
    if (rule.pattern.test(text)) {
      const idx = Math.floor(Math.random() * rule.responses.length)
      return rule.responses[idx]
    }
  }
  return FALLBACKS[Math.floor(Math.random() * FALLBACKS.length)]
}

// ─── Component ────────────────────────────────────────────────────────────────

export function CoachChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([GREETING])
  const [input, setInput] = useState('')
  const [botTyping, setBotTyping] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Auto-scroll on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, botTyping])

  const sendMessage = useCallback(() => {
    const text = input.trim()
    if (!text || botTyping) return

    const userMsg: ChatMessage = {
      id: generateId(),
      from: 'user',
      text,
      ts: Date.now(),
    }

    setMessages(prev => [...prev, userMsg])
    setInput('')
    setBotTyping(true)

    // Fake 400ms delay for natural feel
    setTimeout(() => {
      const botMsg: ChatMessage = {
        id: generateId(),
        from: 'bot',
        text: getBotResponse(text),
        ts: Date.now(),
      }
      setMessages(prev => [...prev, botMsg])
      setBotTyping(false)
    }, 400)
  }, [input, botTyping])

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  return (
    <Card glow>
      {/* Header */}
      <CardHeader>
        <div className="flex items-center gap-2">
          <span className="text-lg">🤖</span>
          <CardTitle>KOÇUM</CardTitle>
        </div>
        <span className="text-xs text-muted">Tamamen çevrimdışı</span>
      </CardHeader>

      {/* Message list */}
      <CardBody className="p-0">
        <div
          className="flex flex-col gap-3 overflow-y-auto px-4 py-4"
          style={{ minHeight: 320, maxHeight: 420 }}
        >
          {messages.map(msg => (
            <div
              key={msg.id}
              className={cn(
                'flex',
                msg.from === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[78%] rounded-xl px-3.5 py-2.5 text-sm leading-relaxed',
                  msg.from === 'user'
                    ? 'bg-primary text-bg rounded-br-sm'
                    : 'bg-surface-2 border border-border text-fg rounded-bl-sm',
                )}
              >
                {msg.text}
              </div>
            </div>
          ))}

          {/* Typing indicator */}
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

        {/* Input area */}
        <div className="border-t border-border px-4 py-3 flex gap-2">
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
              'focus:outline-none focus:border-border-hover transition-colors duration-150',
              'disabled:opacity-50',
            )}
          />
          <Button
            variant="primary"
            size="sm"
            onClick={sendMessage}
            disabled={!input.trim() || botTyping}
            aria-label="Gönder"
          >
            ↑
          </Button>
        </div>
      </CardBody>
    </Card>
  )
}
