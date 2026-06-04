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
