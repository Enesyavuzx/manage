'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Pencil, Check, X, BookOpen } from 'lucide-react'
import { useStore } from '@/hooks/useStore'
import {
  buildRealm, phaseProgress,
  type RealmStructure, type RealmMonument, type RealmSeason,
} from '@/lib/realm'
import {
  philosopherOf, philosopherLine, philosopherLesson, getWeeklyTheme,
  PHILOSOPHERS, type Philosopher, type WeeklyTheme,
} from '@/lib/advisor'
import { cn } from '@/lib/utils'

const STAGE_LABEL: Record<number, string> = {
  0: 'Boş arsa', 1: 'Kulübe', 2: 'Küçük ev', 3: 'Ev', 4: 'Kule', 5: 'Kale',
}

const MONUMENT_EMOJI: Record<string, string> = {
  fountain: '⛲', lamppost: '🏮', bigtree: '🌳', well: '🪣',
  windmill: '⚙️', treasury: '💰', clocktower: '🕰️',
  statue: '🗽', obelisk: '🪨', arch: '🏛️', cathedral: '⛪', library: '📚',
}

const SEASON_EMOJI: Record<RealmSeason, string> = {
  kış: '❄️', ilkbahar: '🌸', yaz: '🌞', sonbahar: '🍂',
}

const BANNER_COLORS = ['#e0b341', '#e03c52', '#3b82f6', '#22c55e', '#a855f7', '#ec4899', '#06b6d4', '#f97316']

const STAGE_NEXT = [5, 15, 40, 100]
const STAGE_PREV = [0, 5, 15, 40]

function ProgressPip({ completions, stage, color }: { completions: number; stage: number; color: string }) {
  const next = STAGE_NEXT[stage - 1] ?? 100
  const prev = STAGE_PREV[stage - 1] ?? 0
  const pct = Math.min(100, Math.max(0, ((completions - prev) / (next - prev)) * 100))
  return (
    <div className="h-0.5 w-full overflow-hidden rounded-full" style={{ backgroundColor: color + '20' }}>
      <div className="h-full rounded-full" style={{ backgroundColor: color, width: `${pct}%` }} />
    </div>
  )
}

function BuildingTile({ structure }: { structure: RealmStructure }) {
  return (
    <Link
      href={`/diyar/${structure.habitId}`}
      className="group relative flex flex-col items-center gap-1 rounded-xl border-2 p-2.5 text-center transition-all duration-150 active:scale-95"
      style={{
        backgroundColor: structure.color + (structure.stage === 0 ? '0e' : '1c'),
        borderColor: structure.doneToday ? structure.color + 'cc' : structure.color + '44',
        boxShadow: structure.doneToday ? `0 0 10px 1px ${structure.color}30` : undefined,
      }}
    >
      {/* Streak + level */}
      <div className="flex w-full items-center justify-between">
        <span className="text-[9px] leading-none">{structure.streak >= 2 ? `🔥${structure.streak}` : ' '}</span>
        <span className="rounded px-1 py-0.5 text-[8px] font-bold leading-none"
          style={{ backgroundColor: structure.color + '28', color: structure.color }}>
          Lv{structure.stage}
        </span>
      </div>

      {/* Emoji — scales with stage */}
      <span className={cn(
        'leading-none transition-transform duration-150 group-hover:scale-110',
        structure.stage === 0 ? 'text-3xl opacity-30' :
        structure.stage <= 2 ? 'text-4xl' :
        structure.stage <= 4 ? 'text-5xl' : 'text-6xl'
      )}>
        {structure.emoji}
      </span>

      {/* Name + type label */}
      <div className="w-full min-w-0">
        <p className="truncate text-[10px] font-semibold leading-tight text-fg">{structure.name}</p>
        <p className="text-[8px] leading-none text-muted-2">{STAGE_LABEL[structure.stage]}</p>
      </div>

      {/* Progress bar toward next stage */}
      {structure.stage > 0 && structure.stage < 5 && (
        <ProgressPip completions={structure.completions} stage={structure.stage} color={structure.color} />
      )}

      {/* Bottom row: done status + landmark badge */}
      <div className="flex w-full items-center justify-between leading-none">
        {structure.doneToday ? (
          <span className="text-[9px] font-bold text-success">✓ bugün</span>
        ) : (
          <span className="text-[9px] text-muted-2">{structure.completions}×</span>
        )}
        <span className="text-[10px]">
          {structure.isLandmark ? '👑' : structure.damaged ? '🛠' : ''}
        </span>
      </div>
    </Link>
  )
}

function MonumentBadge({ monument }: { monument: RealmMonument }) {
  return (
    <div className="flex items-center gap-1.5 rounded-lg bg-white/10 px-2.5 py-1.5">
      <span className="text-sm">{monument.emoji ?? MONUMENT_EMOJI[monument.sprite] ?? '🏛'}</span>
      <span className="text-[10px] leading-tight text-white/70">{monument.label}</span>
    </div>
  )
}

function Stat({ value, label }: { value: number; label: string }) {
  return (
    <div className="rounded-lg border border-border bg-surface-2 p-3 text-center">
      <p className="text-xl font-bold text-fg font-display tabular-nums">{value}</p>
      <p className="text-xs text-muted">{label}</p>
    </div>
  )
}

function UnlockHints({ world, savedQuotes }: { world: ReturnType<typeof buildRealm>; savedQuotes: number }) {
  const hints: string[] = []
  if (!world.hasRiver) hints.push('Su takibini başlat → nehir belirir')
  if (!world.monuments.find(m => m.sprite === 'treasury')) hints.push('Bütçe hesabı ekle → hazine kasası')
  if (!world.monuments.find(m => m.sprite === 'clocktower')) hints.push('90 dk odak seansı → saat kulesi')
  if (!world.monuments.find(m => m.sprite === 'library')) hints.push(`${Math.max(0, 3 - savedQuotes)} söz daha → bilgelik kütüphanesi`)
  if (!world.monuments.find(m => m.fromAchievement)) hints.push('Büyük başarımlar → eşsiz anıtlar (heykel, zafer takı)')
  if (hints.length === 0) return null
  return (
    <div className="rounded-lg border border-border bg-surface-2/60 px-3 py-2">
      <p className="mb-1.5 text-xs font-semibold text-muted">Henüz açılmadı</p>
      <div className="space-y-0.5">
        {hints.slice(0, 4).map((h, i) => <p key={i} className="text-xs text-muted-2">· {h}</p>)}
      </div>
    </div>
  )
}

function WisdomModal({ philosophers, current, theme, quotes, currentAdvisorId, onSaveQuote, onSetAdvisor, onClose }: {
  philosophers: Philosopher[]; current: Philosopher; theme: WeeklyTheme; quotes: string[]
  currentAdvisorId?: string
  onSaveQuote: (text: string) => void; onSetAdvisor: (id: string | null) => void; onClose: () => void
}) {
  const [copied, setCopied] = useState(false)
  const [sel, setSel] = useState<Philosopher>(current)
  const line = philosopherLine(sel)
  const isSaved = quotes.includes(line)
  const isAdvisor = currentAdvisorId === sel.id

  function copyQuote() {
    navigator.clipboard.writeText(`"${line}" — ${sel.name}`).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    }).catch(() => {})
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={onClose}>
      <div className="max-h-[90dvh] w-full max-w-sm overflow-y-auto rounded-2xl border border-border bg-surface p-4 shadow-xl" onClick={e => e.stopPropagation()}>
        <div className="mb-3 flex items-center justify-between">
          <p className="text-sm font-bold text-fg font-display">📜 Bilgelik Akademisi</p>
          <button onClick={onClose} className="text-muted hover:text-fg"><X size={16} /></button>
        </div>

        <div className="mb-3 flex items-start gap-2.5 rounded-xl border border-border bg-surface-2 p-3">
          <span className="text-xl">{theme.emoji}</span>
          <div>
            <p className="text-xs font-semibold text-fg">Bu haftanın teması: {theme.title}</p>
            <p className="mt-0.5 text-[11px] leading-snug text-muted">{theme.desc}</p>
          </div>
        </div>

        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Filozoflar</p>
        <div className="-mx-1 mb-3 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {philosophers.map(p => (
            <button key={p.id} onClick={() => setSel(p)}
              className={cn('flex shrink-0 flex-col items-center gap-0.5 rounded-lg border px-2 py-1.5 transition-all',
                sel.id === p.id ? 'border-primary bg-primary/10' : 'border-border bg-surface-2 hover:border-muted-2')}>
              <span className="text-lg leading-none">{p.emoji}</span>
              <span className={cn('text-[9px] leading-none', sel.id === p.id ? 'text-primary' : 'text-muted')}>{p.name.split(' ')[0]}</span>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-3xl">{sel.emoji}</span>
          <div className="min-w-0 flex-1">
            <p className="text-base font-bold text-fg font-display">{sel.name}</p>
            <p className="text-[11px] text-muted-2">
              {sel.era}
              {currentAdvisorId === sel.id ? ' · danışmanın' : current.id === sel.id && !currentAdvisorId ? ' · günün filozofu' : ''}
            </p>
          </div>
          <button onClick={() => onSetAdvisor(isAdvisor ? null : sel.id)}
            className={cn('shrink-0 rounded-lg border px-2.5 py-1.5 text-[11px] font-medium transition-all',
              isAdvisor ? 'border-primary bg-primary/10 text-primary' : 'border-border text-muted hover:text-fg')}>
            {isAdvisor ? '✓ Danışmanın' : 'Danışmanım yap'}
          </button>
        </div>

        <p className="mt-3 text-sm italic leading-snug text-muted">&ldquo;{line}&rdquo;</p>
        <div className="mt-2 flex items-center gap-2">
          <button onClick={() => onSaveQuote(line)}
            className={cn('flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all',
              isSaved ? 'border-xp/40 bg-xp/10 text-xp' : 'border-border text-muted hover:text-fg')}>
            {isSaved ? '✓ Kaydedildi' : '📌 Kaydet'}
          </button>
          <button onClick={copyQuote}
            className="flex items-center gap-1 rounded-lg border border-border px-2.5 py-1 text-xs font-medium text-muted transition-all hover:text-fg">
            {copied ? '✓ Kopyalandı' : '📋 Kopyala'}
          </button>
        </div>

        <div className="mt-3 rounded-xl border border-border bg-surface-2 p-3">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-2">{sel.name} der ki</p>
          <p className="text-sm leading-relaxed text-fg">{philosopherLesson(sel)}</p>
        </div>

        {quotes.length > 0 && (
          <div className="mt-3">
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-2">Kaydettiğin sözler ({quotes.length})</p>
            <div className="space-y-1.5">
              {quotes.slice(-6).reverse().map((q, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border border-border bg-surface-2 px-2.5 py-1.5">
                  <p className="min-w-0 flex-1 text-xs italic leading-snug text-muted">&ldquo;{q}&rdquo;</p>
                  <button onClick={() => onSaveQuote(q)} className="shrink-0 text-muted-2 hover:text-danger"><X size={11} /></button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export function RealmView() {
  const { data, setRealmName, setRealmBanner, toggleSaveQuote, setAdvisor } = useStore()
  const world = useMemo(() => buildRealm(data), [data])
  const prog = phaseProgress(world)

  const realmName = data.profile.realmName || 'Diyarım'
  const banner = data.profile.realmBanner || '#e0b341'

  const [editing, setEditing] = useState(false)
  const [nameDraft, setNameDraft] = useState(realmName)
  const [wisdomOpen, setWisdomOpen] = useState(false)

  const philosopher = useMemo(() => philosopherOf(data), [data])
  const weeklyTheme = useMemo(() => getWeeklyTheme(), [])

  function saveName() {
    setRealmName(nameDraft)
    setEditing(false)
  }

  const todayPct = world.todayTotalCount > 0
    ? Math.round(world.todayDoneCount / world.todayTotalCount * 100)
    : 0

  const weatherLabel = world.weather === 'sunny' ? '☀️ Güneşli'
    : world.weather === 'rainy' ? '🌧 Yağmurlu'
    : world.weather === 'cloudy' ? '☁️ Bulutlu'
    : '🌤 Açık'

  return (
    <div className="space-y-4">
      {/* Realm header */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          {editing ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <input
                  value={nameDraft}
                  onChange={e => setNameDraft(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') saveName(); if (e.key === 'Escape') setEditing(false) }}
                  placeholder="Diyarına bir ad ver"
                  autoFocus
                  className="h-9 w-48 rounded-lg border border-border bg-surface-2 px-3 text-sm text-fg placeholder:text-muted-2 focus:border-primary focus:outline-none"
                />
                <button onClick={saveName} className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-bg">
                  <Check size={15} />
                </button>
                <button onClick={() => setEditing(false)} className="flex h-9 w-9 items-center justify-center rounded-lg border border-border text-muted hover:text-fg">
                  <X size={15} />
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {BANNER_COLORS.map(c => (
                  <button key={c} onClick={() => setRealmBanner(c)}
                    className={cn('h-6 w-6 rounded-full transition-all', banner === c && 'ring-2 ring-offset-2 ring-offset-surface ring-fg')}
                    style={{ backgroundColor: c }} />
                ))}
              </div>
            </div>
          ) : (
            <>
              <p className="text-xs font-medium text-muted font-display">{world.phase.label}</p>
              <h2 className="flex items-center gap-2 text-xl font-bold text-fg font-display">
                <span className="inline-block h-3 w-3 rounded-sm" style={{ backgroundColor: banner }} />
                <span className="truncate">{realmName}</span>
                <button onClick={() => { setNameDraft(data.profile.realmName || ''); setEditing(true) }}
                  className="text-muted-2 hover:text-fg" aria-label="Düzenle">
                  <Pencil size={14} />
                </button>
              </h2>
              {world.todayTotalCount > 0 && (
                <p className="mt-0.5 text-xs text-muted">
                  Bugün:{' '}
                  <span className={cn('font-semibold', todayPct === 100 ? 'text-success' : 'text-fg')}>
                    {world.todayDoneCount}/{world.todayTotalCount}
                  </span>
                  {todayPct === 100 && ' · diyar çiçek açıyor!'}
                </p>
              )}
            </>
          )}
        </div>
        <div className="text-right">
          <p className="text-2xl font-bold text-fg font-display tabular-nums">{world.population.toLocaleString('tr-TR')}</p>
          <p className="text-xs text-muted">nüfus</p>
        </div>
      </div>

      {/* Phase progress */}
      {prog && (
        <div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <div className="h-full rounded-full bg-primary transition-all duration-700" style={{ width: `${prog.pct}%` }} />
          </div>
          <p className="mt-1 text-xs text-muted">
            Sonraki faza <span className="font-semibold text-fg">{prog.remaining}</span> tamamlama kaldı
          </p>
        </div>
      )}

      {/* Interactive map */}
      <div className="overflow-hidden rounded-2xl border border-border"
        style={{ background: 'linear-gradient(160deg, #0e2710 0%, #0c1c0d 50%, #101e0f 100%)' }}>

        {/* Map header bar */}
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-2">
          <span className="text-xs text-white/50">
            {weatherLabel}{' · '}{SEASON_EMOJI[world.season]}
          </span>
          <button onClick={() => setWisdomOpen(true)}
            className="flex items-center gap-1 rounded-md bg-white/10 px-2.5 py-1 text-[11px] text-white/70 transition-colors hover:bg-white/20">
            <BookOpen size={11} /> Akademi
          </button>
        </div>

        {/* Buildings grid */}
        <div className="p-4">
          {world.structures.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <span className="text-4xl opacity-40">🏗</span>
              <p className="mt-3 text-sm font-semibold text-white/60">Diyarın henüz çorak</p>
              <p className="mt-1 text-xs text-white/40">İlk alışkanlığını tamamla, bu toprak sana ait olacak.</p>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
              {world.structures.map(s => (
                <BuildingTile key={s.habitId} structure={s} />
              ))}
            </div>
          )}
        </div>

        {/* Monuments strip */}
        {world.monuments.length > 0 && (
          <div className="border-t border-white/10 px-4 pb-4 pt-3">
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-white/40">Anıtlar</p>
            <div className="flex flex-wrap gap-2">
              {world.monuments.map(m => <MonumentBadge key={m.id} monument={m} />)}
            </div>
          </div>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        <Stat value={world.buildingCount} label="yapı" />
        <Stat value={world.landmarkCount} label="kale" />
        <Stat value={world.monuments.length} label="eser" />
        <Stat value={world.villagerCount} label="köylü" />
      </div>

      <UnlockHints world={world} savedQuotes={data.savedQuotes.length} />

      {wisdomOpen && (
        <WisdomModal
          philosophers={PHILOSOPHERS}
          current={philosopher}
          theme={weeklyTheme}
          quotes={data.savedQuotes}
          currentAdvisorId={data.profile.advisorId}
          onSaveQuote={toggleSaveQuote}
          onSetAdvisor={setAdvisor}
          onClose={() => setWisdomOpen(false)}
        />
      )}
    </div>
  )
}
