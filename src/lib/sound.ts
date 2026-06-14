// Web Audio ile sentezlenen kısa tamamlama sesi. Dosya/asset yok, tamamen
// offline ve kapalı ağda çalışır. AudioContext kullanıcı etkileşimiyle (tıklama)
// tetiklendiği için autoplay kısıtına takılmaz.

type WebkitWindow = Window & { webkitAudioContext?: typeof AudioContext }

let ctx: AudioContext | null = null

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null
  const AC = window.AudioContext || (window as WebkitWindow).webkitAudioContext
  if (!AC) return null
  if (!ctx) ctx = new AC()
  if (ctx.state === 'suspended') void ctx.resume()
  return ctx
}

// Major arpej; combo arttıkça daha çok nota çalar (yükselen kutlama hissi).
const STEPS = [0, 4, 7, 11, 12, 16]
const BASE = 523.25 // C5

export function playChime(combo: number = 1): void {
  const ac = getCtx()
  if (!ac) return
  const semitone = Math.pow(2, 1 / 12)
  const notes = Math.max(1, Math.min(combo, STEPS.length))
  const now = ac.currentTime
  for (let i = 0; i < notes; i++) {
    const osc = ac.createOscillator()
    const gain = ac.createGain()
    osc.type = 'sine'
    osc.frequency.value = BASE * Math.pow(semitone, STEPS[i])
    const t = now + i * 0.06
    gain.gain.setValueAtTime(0, t)
    gain.gain.linearRampToValueAtTime(0.11, t + 0.01)
    gain.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
    osc.connect(gain)
    gain.connect(ac.destination)
    osc.start(t)
    osc.stop(t + 0.22)
  }
}

// ---- Pixel-OS arayüz sesleri (kısa "blip"ler) ----
export function playBlip(freq = 660, dur = 0.08, type: OscillatorType = 'square', vol = 0.06): void {
  const ac = getCtx()
  if (!ac) return
  const osc = ac.createOscillator()
  const gain = ac.createGain()
  osc.type = type
  osc.frequency.value = freq
  const now = ac.currentTime
  gain.gain.setValueAtTime(0, now)
  gain.gain.linearRampToValueAtTime(vol, now + 0.005)
  gain.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  osc.connect(gain)
  gain.connect(ac.destination)
  osc.start(now)
  osc.stop(now + dur + 0.02)
}

export function playOpen(): void { playBlip(523, 0.05); setTimeout(() => playBlip(784, 0.08), 55) }
export function playClose(): void { playBlip(440, 0.05); setTimeout(() => playBlip(294, 0.08), 50) }
export function playBootDone(): void { playBlip(523, 0.05); setTimeout(() => playBlip(659, 0.05), 70); setTimeout(() => playBlip(880, 0.1), 140) }
