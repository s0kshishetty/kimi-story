// All sounds are synthesised with the Web Audio API, so no audio files are needed.
const NOTES = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25] // C major pentatonic
const CHORDS = [[130.81, 196, 261.63, 329.63], [110, 164.81, 220, 261.63], [87.31, 130.81, 174.61, 261.63], [98, 146.83, 196, 246.94]]
const KEY = 'kimi-muted'
let ctx, master, echoBus, timer, step = 0, lastChime = 0
let muted = false
try { muted = localStorage.getItem(KEY) === '1' } catch (e) {}
const subs = new Set()

function ensure() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  master = ctx.createGain(); master.gain.value = 0.9; master.connect(ctx.destination)
  echoBus = ctx.createGain()
  const d = ctx.createDelay(1); d.delayTime.value = 0.42
  const fb = ctx.createGain(); fb.gain.value = 0.38
  const wet = ctx.createGain(); wet.gain.value = 0.5
  echoBus.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(master)
  return ctx
}
const ready = () => !muted && ctx && ctx.state === 'running'

function tone({ f, t = 0, dur = 0.4, type = 'sine', vol = 0.15, attack = 0.01, glide, echo }) {
  const now = ctx.currentTime + t
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.setValueAtTime(f, now)
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, now + dur)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(vol, now + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  o.connect(g); g.connect(master); if (echo) g.connect(echoBus)
  o.start(now); o.stop(now + dur + 0.05)
}

function tick() {
  if (!ready()) return
  if (step % 8 === 0) CHORDS[(step / 8) % CHORDS.length].forEach(f => tone({ f, dur: 7, vol: 0.035, attack: 2.5, echo: true }))
  if (Math.random() < 0.75) tone({ f: NOTES[Math.floor(Math.random() * NOTES.length)], dur: 2.2, type: 'triangle', vol: 0.05, attack: 0.02, echo: true })
  step++
}
function startAmbient() { if (!timer) { timer = setInterval(tick, 900); tick() } }
function stopAmbient() { clearInterval(timer); timer = null }

const emit = () => subs.forEach(fn => fn())

// Call on any user gesture (browsers block audio until the person interacts)
export function unlock() {
  if (muted || !ensure()) return
  if (ctx.state === 'suspended') ctx.resume().then(startAmbient)
  else startAmbient()
}
export const isMuted = () => muted
export const subscribe = fn => { subs.add(fn); return () => subs.delete(fn) }
export function toggleMute() {
  muted = !muted
  try { localStorage.setItem(KEY, muted ? '1' : '0') } catch (e) {}
  if (muted) { stopAmbient(); if (ctx) setTimeout(() => muted && ctx.suspend(), 150) }
  else unlock()
  emit()
}
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => {
  if (!ctx) return
  if (document.hidden) ctx.suspend(); else if (!muted) ctx.resume()
})

const play = fn => (...a) => { if (ready()) fn(...a) }
export const sfx = {
  click: play(() => tone({ f: 620, glide: 900, dur: 0.09, vol: 0.12 })),
  pick: play(() => tone({ f: 520, glide: 720, dur: 0.12, type: 'triangle', vol: 0.1 })),
  snap: play(() => { tone({ f: 784, dur: 0.4, type: 'triangle', vol: 0.14, echo: true }); tone({ f: 1175, t: 0.09, dur: 0.5, type: 'triangle', vol: 0.12, echo: true }) }),
  oops: play(() => { tone({ f: 392, glide: 196, dur: 0.3, type: 'triangle', vol: 0.14 }); tone({ f: 330, glide: 165, t: 0.18, dur: 0.35, type: 'triangle', vol: 0.12 }) }),
  portalOpen: play(() => {
    tone({ f: 180, glide: 900, dur: 1.1, vol: 0.14, attack: 0.2, echo: true })
    ;[523, 659, 784, 1047].forEach((f, i) => tone({ f, t: 0.3 + i * 0.12, dur: 0.7, type: 'triangle', vol: 0.09, echo: true }))
  }),
  giggle: play(() => [880, 1047, 988, 1175, 1047, 1319].forEach((f, i) => tone({ f, t: i * 0.09, dur: 0.1, type: 'triangle', vol: 0.09 }))),
  portalClose: play(() => tone({ f: 900, glide: 120, dur: 0.9, vol: 0.13, attack: 0.05, echo: true })),
  fish: play(() => { tone({ f: 880, dur: 0.25, type: 'triangle', vol: 0.14, echo: true }); tone({ f: 1318, t: 0.08, dur: 0.4, type: 'triangle', vol: 0.13, echo: true }) }),
  win: play(() => [523, 659, 784, 1047, 1319].forEach((f, i) => tone({ f, t: i * 0.12, dur: 0.6, vol: 0.12, echo: true }))),
  page: play(() => { // soft paper-flip: a short burst of filtered noise + a tiny thud
    const len = Math.floor(ctx.sampleRate * 0.42), buf = ctx.createBuffer(1, len, ctx.sampleRate), d = buf.getChannelData(0)
    for (let i = 0; i < len; i++) { const t = i / len; d[i] = (Math.random() * 2 - 1) * Math.pow(1 - t, 1.7) * Math.min(1, t * 14) * (0.55 + 0.45 * Math.sin(t * 22)) }
    const src = ctx.createBufferSource(); src.buffer = buf
    const bp = ctx.createBiquadFilter(); bp.type = 'bandpass'; bp.Q.value = 0.7
    bp.frequency.setValueAtTime(3200, ctx.currentTime); bp.frequency.exponentialRampToValueAtTime(900, ctx.currentTime + 0.4)
    const g = ctx.createGain(); g.gain.value = 0.6
    src.connect(bp); bp.connect(g); g.connect(master); src.start()
    tone({ f: 150, glide: 90, t: 0.5, dur: 0.12, vol: 0.06 })
  }),
  chime: play(x => { // x = 0..1 position across the garden
    const now = performance.now(); if (now - lastChime < 110) return; lastChime = now
    tone({ f: NOTES[Math.min(NOTES.length - 1, Math.floor(x * NOTES.length))] * 2, dur: 0.9, vol: 0.05, echo: true })
  }),
}
