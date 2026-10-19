// All sound is synthesised with the Web Audio API, so no audio files are needed.
// Two layers: (1) a story-aware generative MUSIC engine that crossfades between scenes,
// (2) short SFX. Audio only starts after a visitor gesture (the "Begin Kimi's Story" button or the speaker button).
const NOTES = [261.63, 293.66, 329.63, 392, 440, 523.25, 587.33, 659.25] // C major pentatonic
const KEY = 'kimi-muted', VKEY = 'kimi-volume', SKEY = 'kimi-sfx'
const store = {
  get: (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : v } catch (e) { return d } },
  set: (k, v) => { try { localStorage.setItem(k, v) } catch (e) {} },
}
let ctx, master, musicMaster, sfxBus, echoBus, musicEcho, noiseBuf
let started = false, lastChime = 0, version = 0
let muted = store.get(KEY, '0') === '1'
let volume = Math.min(1, Math.max(0, parseFloat(store.get(VKEY, '0.6')) || 0.6))
let sfxOn = store.get(SKEY, '1') !== '0'
const subs = new Set()
const emit = () => { version++; subs.forEach(fn => fn()) }

/* ---------- audio graph ---------- */
function delayNet(into, time, fbk, wetAmt) {
  const input = ctx.createGain(), d = ctx.createDelay(1.5), fb = ctx.createGain(), wet = ctx.createGain()
  d.delayTime.value = time; fb.gain.value = fbk; wet.gain.value = wetAmt
  input.connect(d); d.connect(fb); fb.connect(d); d.connect(wet); wet.connect(into)
  return input
}
function ensure() {
  if (ctx) return ctx
  const AC = window.AudioContext || window.webkitAudioContext
  if (!AC) return null
  ctx = new AC()
  const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -18; comp.ratio.value = 4
  master = ctx.createGain(); master.gain.value = muted ? 0 : volume; master.connect(comp); comp.connect(ctx.destination)
  sfxBus = ctx.createGain(); sfxBus.gain.value = 0.9; sfxBus.connect(master)
  echoBus = delayNet(sfxBus, 0.42, 0.38, 0.5)
  const soft = ctx.createBiquadFilter(); soft.type = 'lowpass'; soft.frequency.value = 5200; soft.Q.value = 0.4
  musicMaster = ctx.createGain(); musicMaster.gain.value = 0.55; musicMaster.connect(soft); soft.connect(master)
  musicEcho = delayNet(musicMaster, 0.46, 0.42, 0.55)
  const len = ctx.sampleRate * 2; noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate)
  const d = noiseBuf.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
  return ctx
}
const live = () => !muted && ctx && ctx.state === 'running'

// one oscillator note. dest = bus to play into, send = echo amount (0..1)
function tone({ f, t = 0, dur = 0.4, type = 'sine', vol = 0.15, attack = 0.01, glide, echo, dest, send, detune = 0, when }) {
  const now = (when ?? ctx.currentTime) + t
  const o = ctx.createOscillator(), g = ctx.createGain()
  o.type = type; o.frequency.setValueAtTime(f, now); if (detune) o.detune.value = detune
  if (glide) o.frequency.exponentialRampToValueAtTime(glide, now + dur)
  g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(vol, now + attack)
  g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  o.connect(g); g.connect(dest || sfxBus)
  if (echo) g.connect(echoBus)
  if (send && dest && dest.send) { const s = ctx.createGain(); s.gain.value = send; g.connect(s); s.connect(dest.send) }
  o.start(now); o.stop(now + dur + 0.05)
}
// filtered-noise sweep (whooshes, shimmer, shaker)
function noise({ t = 0, dur = 1, vol = 0.1, f0 = 400, f1 = 2000, q = 1, attack = 0.2, dest, when, type = 'bandpass' }) {
  const now = (when ?? ctx.currentTime) + t
  const s = ctx.createBufferSource(); s.buffer = noiseBuf; s.loop = true
  const bp = ctx.createBiquadFilter(); bp.type = type; bp.Q.value = q
  bp.frequency.setValueAtTime(f0, now); bp.frequency.exponentialRampToValueAtTime(f1, now + dur)
  const g = ctx.createGain(); g.gain.setValueAtTime(0.0001, now)
  g.gain.exponentialRampToValueAtTime(vol, now + attack); g.gain.exponentialRampToValueAtTime(0.0001, now + dur)
  s.connect(bp); bp.connect(g); g.connect(dest || sfxBus); s.start(now); s.stop(now + dur + 0.05)
}

/* ---------- MUSIC: scenes ---------- */
// Each scene is a generative loop: a chord progression (pad + bass) and a melody/sparkle function
// called once per 8th-note step. All scenes share one scheduler, so nothing ever overlaps or restarts.
const hz = m => 440 * Math.pow(2, (m - 69) / 12) // midi -> Hz
const pick = a => a[Math.floor(Math.random() * a.length)]
const SCENES = {
  // Opening: soft, dreamy, playful music-box lullaby (C major)
  curious: {
    bpm: 84, level: 0.9, chordSteps: 16,
    chords: [[48, 55, 64, 71], [45, 52, 64, 72], [41, 48, 65, 69], [43, 50, 62, 71]],
    pad: { type: 'sine', vol: 0.05, att: 2.2 },
    bass: s => s % 8 === 0 ? { vol: 0.07, dur: 1.2 } : null,
    melody(s, ch, o, t) {
      const sc = [72, 74, 76, 79, 81, 84]
      if (s % 2 === 0 && Math.random() < 0.7) o.bell(pick(sc), t, 0.06, 1.4)
      if (s % 8 === 3 && Math.random() < 0.5) o.bell(pick(sc) + 12, t, 0.035, 1.8)   // playful high "boop"
    },
  },
  // Light beams: gentle suspense, ethereal shimmer (A minor / suspended)
  mystery: {
    bpm: 60, level: 0.85, chordSteps: 16,
    chords: [[45, 52, 59, 64], [41, 48, 55, 64], [43, 50, 57, 62], [40, 47, 55, 62]],
    pad: { type: 'sine', vol: 0.06, att: 3, detune: 7 },
    bass: s => s % 16 === 0 ? { vol: 0.08, dur: 3.5 } : null,
    melody(s, ch, o, t) {
      if (s % 4 === 0 && Math.random() < 0.55) o.bell(pick([81, 83, 84, 88, 91]), t, 0.04, 3, 0.7)
      if (s % 16 === 8) o.shimmer(t, 2.8, 0.025)
    },
  },
  // Journey: otherworldly atmosphere, chimes + soft whooshes (F lydian)
  journey: {
    bpm: 72, level: 0.85, chordSteps: 12,
    chords: [[41, 53, 60, 64], [43, 55, 62, 66], [38, 50, 57, 64], [41, 53, 60, 69]],
    pad: { type: 'triangle', vol: 0.035, att: 2.4, detune: 9 },
    bass: s => s % 12 === 0 ? { vol: 0.06, dur: 3 } : null,
    melody(s, ch, o, t) {
      if (s % 3 === 0 && Math.random() < 0.8) o.bell(pick([77, 79, 81, 84, 86, 88, 91]), t, 0.045, 2.5, 0.7)
      if (s % 12 === 0) o.whoosh(t, 2.4, 0.03)
    },
  },
  // Arrival: mysterious, slightly tense, never scary (D minor add9, low drone, soft pulse)
  arrival: {
    bpm: 66, level: 0.8, chordSteps: 16,
    chords: [[38, 45, 53, 64], [38, 46, 53, 62], [36, 43, 51, 60], [38, 45, 52, 62]],
    pad: { type: 'sine', vol: 0.055, att: 2.6, detune: 5 },
    bass: s => s % 16 === 0 ? { vol: 0.09, dur: 4 } : null,
    melody(s, ch, o, t) {
      if (s % 4 === 0) o.pulse(t, 0.05)                                             // soft heartbeat
      if (s % 8 === 2 && Math.random() < 0.6) o.bell(pick([74, 77, 81, 82, 86]), t, 0.04, 2.2, 0.8)
      if (s % 16 === 11) o.bell(pick([65, 69]), t, 0.03, 2.8, 0.8)                  // lonely low note
    },
  },
  // Accepted: warm, joyful, friendly (C / G / Am / F, bouncy bells + shaker)
  joy: {
    bpm: 108, level: 1, chordSteps: 8,
    chords: [[48, 55, 64, 67], [43, 55, 62, 67], [45, 57, 64, 69], [41, 53, 60, 69]],
    pad: { type: 'triangle', vol: 0.04, att: 0.6 },
    bass: s => s % 4 === 0 ? { vol: 0.09, dur: 0.5 } : null,
    melody(s, ch, o, t) {
      const MEL = [[79, 0], [84, 1], [83, 2], [79, 3], [76, 4], [79, 5], [81, 6], [79, 7]]
      const m = MEL[s % 8]; if (Math.random() < 0.88) o.bell(m[0] + (ch === 3 && s % 8 === 6 ? 3 : 0), t, 0.065, 1.3)
      if (s % 2 === 1) o.shaker(t, 0.018)
      if (s % 16 === 15) o.sparkle(t, 0.03)
    },
  },
  // Ending: the same happy theme, slower, softer, lingering
  ending: {
    bpm: 80, level: 0.75, chordSteps: 8,
    chords: [[48, 55, 64, 67], [43, 55, 62, 67], [45, 57, 64, 69], [41, 53, 60, 69]],
    pad: { type: 'sine', vol: 0.055, att: 1.4 },
    bass: s => s % 8 === 0 ? { vol: 0.07, dur: 1.6 } : null,
    melody(s, ch, o, t) {
      if (s % 2 === 0 && Math.random() < 0.55) o.bell(pick([76, 79, 81, 84, 88]), t, 0.045, 2.2)
      if (s % 16 === 14) o.sparkle(t, 0.022)
    },
  },
}
let cur = null, prev = null, nextTime = 0, stepNo = 0, sched = null
function makeScene(name) {
  const def = SCENES[name], out = ctx.createGain(); out.gain.value = 0.0001
  out.connect(musicMaster)
  const send = ctx.createGain(); send.gain.value = 0.35; out.connect(send); send.connect(musicEcho)
  out.send = ctx.createGain(); out.send.gain.value = 1; out.send.connect(musicEcho) // for per-note sends
  return { name, def, out, step: 0, born: ctx.currentTime }
}
function voices(sc) {
  const o = sc.out, L = sc.def.level
  return {
    bell: (m, t, v, d, atk) => tone({ f: hz(m), when: t, dur: d, type: 'triangle', vol: v * L, attack: atk ? 0.15 : 0.008, dest: o, send: 0.55 }),
    pulse: (t, v) => tone({ f: 62, glide: 48, when: t, dur: 0.4, vol: v * L, attack: 0.03, dest: o }),
    shimmer: (t, d, v) => [84, 88, 91, 95].forEach((m, i) => tone({ f: hz(m), when: t + i * 0.18, dur: d, vol: v * L, attack: 1, dest: o, send: 0.7 })),
    whoosh: (t, d, v) => noise({ when: t, dur: d, vol: v * L, f0: 300, f1: 3000, q: 0.8, attack: d * 0.5, dest: o }),
    shaker: (t, v) => noise({ when: t, dur: 0.07, vol: v * L, f0: 6000, f1: 7500, q: 1.5, attack: 0.005, dest: o, type: 'highpass' }),
    sparkle: (t, v) => [88, 91, 93, 96].forEach((m, i) => tone({ f: hz(m), when: t + i * 0.07, dur: 0.9, vol: v * L, dest: o, send: 0.6 })),
  }
}
function scheduleChord(sc, t, chord, durSec) {
  const L = sc.def.level, p = sc.def.pad
  chord.forEach((m, i) => {
    if (m < 40 && i === 0 && !sc.def.bass) return
    const isBass = i === 0
    tone({ f: hz(m + (isBass ? 0 : 0)), when: t, dur: durSec * 1.15, type: isBass ? 'sine' : p.type, vol: (isBass ? 0.06 : p.vol) * L,
      attack: Math.min(p.att, durSec * 0.6), dest: sc.out, send: 0.3, detune: isBass ? 0 : (p.detune || 0) * (i % 2 ? 1 : -1) })
  })
}
function tickMusic() {
  if (!live() || !cur) return
  const sc = cur
  const stepDur = 60 / sc.def.bpm / 2
  if (nextTime < ctx.currentTime) nextTime = ctx.currentTime + 0.05
  while (nextTime < ctx.currentTime + 0.6) {
    const s = sc.step, def = sc.def
    const ch = Math.floor(s / def.chordSteps) % def.chords.length
    if (s % def.chordSteps === 0) scheduleChord(sc, nextTime, def.chords[ch], def.chordSteps * stepDur)
    const b = def.bass(s)
    if (b) tone({ f: hz(def.chords[ch][0] - 12), when: nextTime, dur: b.dur, vol: b.vol * def.level, attack: 0.02, dest: sc.out })
    def.melody(s, ch, voices(sc), nextTime)
    sc.step++; nextTime += stepDur
  }
}
function fadeOutScene(sc, secs) {
  const g = sc.out.gain, now = ctx.currentTime
  g.cancelScheduledValues(now); g.setValueAtTime(Math.max(g.value, 0.0001), now); g.linearRampToValueAtTime(0.0001, now + secs)
  setTimeout(() => { try { sc.out.disconnect() } catch (e) {} }, secs * 1000 + 3500) // let echo tails finish
}
let wanted = null, lastSceneChange = 0
function applyScene() {
  if (!ctx || !started || !wanted || (cur && cur.name === wanted)) return
  const fade = 3.2, now = ctx.currentTime
  if (prev) fadeOutScene(prev, 0.4)
  if (cur) { fadeOutScene(cur, fade); prev = cur }
  cur = makeScene(wanted)
  cur.out.gain.setValueAtTime(0.0001, now); cur.out.gain.linearRampToValueAtTime(1, now + fade)
  nextTime = now + 0.05
  lastSceneChange = performance.now()
  emit()
}
function startMusic() { if (!sched) sched = setInterval(tickMusic, 120); applyScene() }
function stopMusic() { clearInterval(sched); sched = null }

/* ---------- public API ---------- */
export const setScene = name => { wanted = name; if (started) applyScene() }
export const getScene = () => cur ? cur.name : wanted
export const hasStarted = () => started
export const isMuted = () => muted
export const getVolume = () => volume
export const sfxEnabled = () => sfxOn
export const getVersion = () => version
export const subscribe = fn => { subs.add(fn); return () => subs.delete(fn) }

function applyGain(fast) {
  if (!ctx) return
  const now = ctx.currentTime, g = master.gain
  g.cancelScheduledValues(now); g.setValueAtTime(g.value, now)
  g.linearRampToValueAtTime(muted ? 0 : volume, now + (fast ? 0.04 : 0.15))
}
// Start (or resume) audio. Must be called from a user gesture.
export function begin({ unmute = false } = {}) {
  if (unmute && muted) { muted = false; store.set(KEY, '0') }
  if (!ensure()) return
  const go = () => { started = true; applyGain(); if (!muted) startMusic(); emit() }
  if (ctx.state === 'suspended') ctx.resume().then(go); else go()
}
export const unlock = () => { if (started && !muted) begin() }
export function toggleMute() {
  if (!started) { begin({ unmute: true }); return }   // first press on the speaker = start
  muted = !muted; store.set(KEY, muted ? '1' : '0')
  if (muted) { applyGain(true); stopMusic(); setTimeout(() => muted && ctx && ctx.suspend(), 120) }  // everything stops immediately
  else { ctx.resume().then(() => { applyGain(); startMusic() }) }
  emit()
}
export function setVolume(v) {
  volume = Math.min(1, Math.max(0, v)); store.set(VKEY, String(volume))
  applyGain(true); emit()
}
export function setSfxEnabled(on) { sfxOn = !!on; store.set(SKEY, on ? '1' : '0'); emit() }
if (typeof document !== 'undefined') document.addEventListener('visibilitychange', () => {
  if (!ctx || !started) return
  if (document.hidden) { ctx.suspend() } else if (!muted) { ctx.resume(); nextTime = 0 }
})

/* ---------- SFX ---------- */
const play = fn => (...a) => { if (live() && sfxOn) fn(...a) }
const sp = (f, t, o = {}) => tone({ f, t, dur: 0.7, type: 'triangle', vol: 0.08, echo: true, ...o })
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
    src.connect(bp); bp.connect(g); g.connect(sfxBus); src.start()
    tone({ f: 150, glide: 90, t: 0.5, dur: 0.12, vol: 0.06 })
  }),
  chime: play(x => { // x = 0..1 position across the garden
    const now = performance.now(); if (now - lastChime < 110) return; lastChime = now
    tone({ f: NOTES[Math.min(NOTES.length - 1, Math.floor(x * NOTES.length))] * 2, dur: 0.9, vol: 0.05, echo: true })
  }),
  // ---- story moments ----
  sparkle: play(() => [1568, 2093, 1760, 2349, 2637, 3136, 2349].forEach((f, i) => sp(f, i * 0.08, { dur: 0.9, vol: 0.05 + (i % 2) * 0.01, type: 'sine' }))),
  whoosh: play(() => {
    noise({ dur: 1.5, vol: 0.16, f0: 250, f1: 4200, q: 0.9, attack: 0.9 })
    tone({ f: 220, glide: 880, dur: 1.4, vol: 0.05, attack: 0.8, echo: true })
  }),
  land: play(() => { tone({ f: 330, glide: 180, dur: 0.18, type: 'triangle', vol: 0.1 }); tone({ f: 523, t: 0.12, dur: 0.5, type: 'triangle', vol: 0.05, echo: true }) }),
  murmur: play(() => [392, 349, 415, 370, 330].forEach((f, i) => tone({ f, glide: f * 1.12, t: i * 0.13, dur: 0.14, type: 'triangle', vol: 0.045 }))),
  hum: play(() => { // Kimi's wobbly little tune
    ;[392, 440, 392, 494, 440, 523].forEach((f, i) => {
      const t = i * 0.3; tone({ f, t, dur: 0.34, type: 'sine', vol: 0.07, attack: 0.05, echo: true })
      tone({ f: f * 1.006, t, dur: 0.34, type: 'sine', vol: 0.04, attack: 0.05, detune: 14 })
    })
  }),
  welcome: play(() => { // cheerful chimes when the cats accept her
    ;[1047, 1319, 1568, 2093, 1568, 2349, 2637].forEach((f, i) => sp(f, i * 0.11, { dur: 1.2, vol: 0.075 }))
    ;[523, 659, 784].forEach(f => tone({ f, t: 0.1, dur: 1.8, type: 'triangle', vol: 0.05, attack: 0.1, echo: true }))
  }),
}
