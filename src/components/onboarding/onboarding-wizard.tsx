'use client'
import { useState } from 'react'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import { Button } from '@/components/ui/button'
import { ThemeSwitcher } from '@/components/layout/theme-switcher'
import { TEMPLATE_PACKS } from '@/lib/constants'
import { fireConfetti, haptic } from '@/lib/confetti'
import { cn } from '@/lib/utils'

type Step = 0 | 1 | 2

export function OnboardingWizard() {
  const { data, setProfileName, addTemplatePack, completeOnboarding } = useStore()
  const [step, setStep] = useState<Step>(0)
  const [name, setName] = useState(data.profile.name === 'Kahraman' ? '' : data.profile.name)
  const [picked, setPicked] = useState<Set<string>>(new Set())

  function next() {
    if (step === 0 && name.trim()) setProfileName(name.trim())
    setStep(s => Math.min(2, s + 1) as Step)
  }

  function togglePack(id: string) {
    setPicked(prev => {
      const n = new Set(prev)
      n.has(id) ? n.delete(id) : n.add(id)
      return n
    })
    haptic(12)
  }

  function finish(e: React.MouseEvent) {
    TEMPLATE_PACKS.filter(p => picked.has(p.id)).forEach(p => addTemplatePack(p))
    fireConfetti({ count: 90, origin: { x: e.clientX, y: e.clientY }, power: 1.1 })
    haptic([20, 40, 20, 40])
    completeOnboarding()
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-bg/95 p-4 backdrop-blur-sm">
      <div className="w-full max-w-lg rounded-2xl border border-border bg-surface p-6 shadow-2xl">
        {/* Step dots */}
        <div className="mb-6 flex items-center justify-center gap-2">
          {[0, 1, 2].map(i => (
            <span key={i} className={cn('h-1.5 rounded-full transition-all', i === step ? 'w-6 bg-primary' : 'w-1.5 bg-border')} />
          ))}
        </div>

        {step === 0 && (
          <div className="space-y-5 text-center">
            <div className="flex justify-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/12 text-3xl">👋</div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-fg">MANAGE'e hoş geldin</h2>
              <p className="mt-1 text-sm text-muted">DEHB dostu, oyunlaştırılmış alışkanlık takibi. Sana nasıl hitap edelim?</p>
            </div>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Adın..."
              autoFocus
              onKeyDown={e => e.key === 'Enter' && name.trim() && next()}
              className="h-12 w-full rounded-lg border border-border bg-surface-2 px-4 text-center text-base text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
            />
            <Button variant="primary" className="w-full" onClick={next} disabled={!name.trim()}>
              Devam <ArrowRight size={15} />
            </Button>
          </div>
        )}

        {step === 1 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-fg">Bir tema seç</h2>
              <p className="mt-1 text-sm text-muted">Sonra Profil'den değiştirebilirsin.</p>
            </div>
            <div className="flex justify-center py-2">
              <ThemeSwitcher />
            </div>
            <Button variant="primary" className="w-full" onClick={next}>
              Devam <ArrowRight size={15} />
            </Button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-5">
            <div className="text-center">
              <h2 className="text-xl font-bold text-fg">Başlangıç paketleri</h2>
              <p className="mt-1 text-sm text-muted">İstediklerini seç, hazır alışkanlıklarla başla. Sonra ekleyebilir/silebilirsin.</p>
            </div>
            <div className="grid max-h-[40vh] grid-cols-1 gap-2 overflow-y-auto sm:grid-cols-2">
              {TEMPLATE_PACKS.map(pack => {
                const on = picked.has(pack.id)
                return (
                  <button key={pack.id} onClick={() => togglePack(pack.id)}
                    className={cn(
                      'flex items-center gap-3 rounded-xl border p-3 text-left transition-all',
                      on ? 'border-primary bg-primary/8' : 'border-border bg-surface-2 hover:border-border-hover',
                    )}>
                    <span className="text-2xl">{pack.emoji}</span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-fg">{pack.name}</span>
                      <span className="block text-xs text-muted">{pack.habits.length} alışkanlık</span>
                    </span>
                    <span className={cn(
                      'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border',
                      on ? 'border-primary bg-primary text-bg' : 'border-border',
                    )}>
                      {on && <Check size={12} />}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={finish}>Boş başla</Button>
              <Button variant="primary" className="flex-1" onClick={finish}>
                <Sparkles size={15} /> {picked.size > 0 ? `${picked.size} paketle başla` : 'Hazırım'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
