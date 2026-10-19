import { useEffect, useRef, useState } from 'react'
import { sfx } from '../sound'
const W = 900, H = 520, GOAL = 12, SPEED = 230, NEAR = 130
const PAL = ['#ffb3d9', '#a8f0e6', '#ffe08a', '#c7b8ff', '#ffc29e', '#9fd2ff']
const rnd = (a, b) => a + Math.random() * (b - a)
const clamp = (v, a, b) => Math.max(a, Math.min(b, v))
const makeFlowers = () => Array.from({ length: 95 }, () => ({
  x: rnd(20, W - 20), y: rnd(40, H - 20), r: rnd(7, 13), n: 5 + Math.floor(Math.random() * 3),
  c: PAL[Math.floor(Math.random() * PAL.length)], a: rnd(0, 6.28), s: 0, g: 0, dir: Math.random() < .5 ? -1 : 1 }))
const makeFish = () => ({ x: rnd(50, W - 50), y: rnd(70, H - 50), t: rnd(0, 6) })
const KEYMAP = { ArrowLeft: 'l', a: 'l', ArrowRight: 'r', d: 'r', ArrowUp: 'u', w: 'u', ArrowDown: 'd', s: 'd' }

export default function FlowerWalk() {
  const cv = useRef(), box = useRef()
  const [score, setScore] = useState(0)
  const [won, setWon] = useState(false)
  const st = useRef(null)
  if (!st.current) st.current = { k: { x: W / 2, y: H / 2 }, flowers: makeFlowers(), fish: [makeFish(), makeFish(), makeFish()],
    keys: {}, target: null, trail: [], pops: [], score: 0, pressed: false }

  useEffect(() => {
    const c = cv.current, ctx = c.getContext('2d'), s = st.current
    const img = new Image(); img.src = '/character.png'
    const sky = Array.from({ length: 70 }, () => ({ x: rnd(0, W), y: rnd(0, H * .7), r: rnd(.6, 1.6), p: rnd(0, 6) }))
    let raf, last = performance.now(), visible = true
    const io = new IntersectionObserver(([e]) => { visible = e.isIntersecting; last = performance.now() }, { threshold: .1 })
    io.observe(c)

    function update(dt) {
      const k = s.k
      let dx = (s.keys.r ? 1 : 0) - (s.keys.l ? 1 : 0), dy = (s.keys.d ? 1 : 0) - (s.keys.u ? 1 : 0)
      if (dx || dy) s.target = null
      else if (s.target) {
        const vx = s.target.x - k.x, vy = s.target.y - k.y, d = Math.hypot(vx, vy)
        if (d < 6 && !s.pressed) s.target = null
        else if (d >= 6) { dx = vx / d; dy = vy / d }
      }
      const len = Math.hypot(dx, dy)
      if (len) {
        k.x = clamp(k.x + dx / len * SPEED * dt, 30, W - 30); k.y = clamp(k.y + dy / len * SPEED * dt, 50, H - 20)
        s.trail.push({ x: k.x, y: k.y + 24, l: 1 })
      }
      s.trail.forEach(p => p.l -= dt * 1.1); s.trail = s.trail.filter(p => p.l > 0)
      s.flowers.forEach(f => {
        const d = Math.hypot(f.x - k.x, f.y - (k.y + 20)), t = d < NEAR ? 1 - d / NEAR : 0
        const pg = f.g, rate = t > f.g ? 7 : 1.1
        f.g += (t - f.g) * Math.min(1, dt * rate)
        f.s += (t * 10 * f.dir - f.s) * Math.min(1, dt * (t > 0 ? 6 : 1.4))
        f.a += (f.s + .25 * f.dir) * dt
        if (pg < .3 && f.g >= .3) sfx.chime(f.x / W)
      })
      s.fish.forEach((f, i) => {
        if (Math.hypot(f.x - k.x, f.y - k.y) < 36) {
          s.score++; setScore(s.score); sfx.fish(); if (s.score === GOAL) { setWon(true); sfx.win() }
          s.pops.push({ x: f.x, y: f.y, l: 1 }); s.fish[i] = makeFish()
        }
      })
      s.pops.forEach(p => { p.l -= dt * 1.2; p.y -= 30 * dt }); s.pops = s.pops.filter(p => p.l > 0)
    }

    function draw(t) {
      const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#070a1e'); g.addColorStop(1, '#1d1450')
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = g; ctx.fillRect(0, 0, W, H)
      sky.forEach(q => { ctx.globalAlpha = .3 + .7 * Math.abs(Math.sin(t * 1.3 + q.p)); ctx.fillStyle = '#fff'; ctx.beginPath(); ctx.arc(q.x, q.y, q.r, 0, 6.3); ctx.fill() })
      ctx.globalAlpha = 1; ctx.fillStyle = '#fff8dc'; ctx.shadowColor = 'rgba(255,248,220,.6)'; ctx.shadowBlur = 40
      ctx.beginPath(); ctx.arc(80, 70, 26, 0, 6.3); ctx.fill(); ctx.shadowBlur = 0
      // flowers
      s.flowers.forEach(f => {
        if (f.g > .02) {
          const R = f.r * (2.2 + f.g * 3.6), gr = ctx.createRadialGradient(f.x, f.y, 0, f.x, f.y, R)
          gr.addColorStop(0, f.c); gr.addColorStop(1, 'rgba(0,0,0,0)')
          ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = f.g * .65; ctx.fillStyle = gr
          ctx.beginPath(); ctx.arc(f.x, f.y, R, 0, 6.3); ctx.fill(); ctx.globalCompositeOperation = 'source-over'
        }
        ctx.save(); ctx.translate(f.x, f.y); ctx.rotate(f.a); ctx.globalAlpha = .5 + f.g * .5; ctx.fillStyle = f.c
        for (let i = 0; i < f.n; i++) { ctx.rotate(6.2832 / f.n); ctx.beginPath(); ctx.ellipse(0, -f.r * .65, f.r * .38, f.r * .7, 0, 0, 6.3); ctx.fill() }
        ctx.globalAlpha = 1; ctx.fillStyle = f.g > .1 ? '#fff6c9' : '#ffd86b'; ctx.beginPath(); ctx.arc(0, 0, f.r * .28, 0, 6.3); ctx.fill(); ctx.restore()
      })
      // starlight trail
      ctx.globalCompositeOperation = 'lighter'
      s.trail.forEach(p => { ctx.globalAlpha = p.l * .4; ctx.fillStyle = '#cdb8ff'; ctx.beginPath(); ctx.arc(p.x, p.y, 4 + 9 * p.l, 0, 6.3); ctx.fill() })
      // fish
      s.fish.forEach(f => {
        const y = f.y + Math.sin(t * 3 + f.t) * 4
        ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .35; ctx.fillStyle = '#7fe0ff'; ctx.beginPath(); ctx.arc(f.x, y, 26, 0, 6.3); ctx.fill()
        ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = 1; ctx.fillStyle = '#8fe8ff'
        ctx.beginPath(); ctx.ellipse(f.x, y, 15, 9, 0, 0, 6.3); ctx.fill()
        ctx.beginPath(); ctx.moveTo(f.x + 12, y); ctx.lineTo(f.x + 24, y - 9); ctx.lineTo(f.x + 24, y + 9); ctx.fill()
        ctx.fillStyle = '#10204a'; ctx.beginPath(); ctx.arc(f.x - 8, y - 2, 2, 0, 6.3); ctx.fill()
      })
      // kimi
      const k = s.k, bob = Math.sin(t * 4) * 2
      ctx.globalCompositeOperation = 'lighter'; ctx.globalAlpha = .28
      const hg = ctx.createRadialGradient(k.x, k.y, 0, k.x, k.y, 90); hg.addColorStop(0, '#ffe6ff'); hg.addColorStop(1, 'rgba(0,0,0,0)')
      ctx.fillStyle = hg; ctx.beginPath(); ctx.arc(k.x, k.y, 90, 0, 6.3); ctx.fill()
      ctx.globalCompositeOperation = 'source-over'; ctx.globalAlpha = .3; ctx.fillStyle = '#000'
      ctx.beginPath(); ctx.ellipse(k.x, k.y + 38, 26, 7, 0, 0, 6.3); ctx.fill(); ctx.globalAlpha = 1
      if (img.complete && img.naturalWidth) ctx.drawImage(img, k.x - 40, k.y - 40 + bob, 80, 80)
      else { ctx.fillStyle = '#ffb3d9'; ctx.beginPath(); ctx.arc(k.x, k.y, 24, 0, 6.3); ctx.fill() }
      // +1 pops
      ctx.font = '700 20px Fredoka, sans-serif'; ctx.textAlign = 'center'
      s.pops.forEach(p => { ctx.globalAlpha = p.l; ctx.fillStyle = '#ffe08a'; ctx.fillText('+1 🐟', p.x, p.y) })
      ctx.globalAlpha = 1
    }

    const frame = now => {
      raf = requestAnimationFrame(frame)
      if (!visible) return
      const dt = Math.min(.05, (now - last) / 1000); last = now
      update(dt); draw(now / 1000)
    }
    raf = requestAnimationFrame(frame)
    return () => { cancelAnimationFrame(raf); io.disconnect() }
  }, [])

  const key = (e, v) => {
    const m = KEYMAP[e.key] || KEYMAP[e.key.toLowerCase()]
    if (m) { st.current.keys[m] = v; e.preventDefault() }
  }
  const point = e => {
    const r = cv.current.getBoundingClientRect()
    st.current.target = { x: (e.clientX - r.left) * W / r.width, y: (e.clientY - r.top) * H / r.height }
  }
  const restart = () => { st.current.score = 0; setScore(0); setWon(false); box.current.focus() }

  return (
    <div className="fw">
      <div className="fw-hud"><span>🐟 Fish for the Cat Queen: <b>{score}</b> / {GOAL}</span><button onClick={restart}>Restart</button></div>
      <div ref={box} className="fw-box" tabIndex={0} role="application" aria-label="Starlight Garden Walk. Use arrow keys or WASD to walk."
        onKeyDown={e => key(e, true)} onKeyUp={e => key(e, false)} onBlur={() => { st.current.keys = {} }}>
        <canvas ref={cv} width={W} height={H}
          onPointerDown={e => { box.current.focus(); st.current.pressed = true; e.currentTarget.setPointerCapture(e.pointerId); point(e) }}
          onPointerMove={e => { if (st.current.pressed) point(e) }}
          onPointerUp={() => { st.current.pressed = false }} onPointerCancel={() => { st.current.pressed = false }} />
        {won && <div className="fw-win"><h4>The Cat Queen is purring! 😻</h4><p>You gathered {GOAL} fish. Keep wandering if you like, the flowers aren't done twirling.</p><button onClick={() => setWon(false)}>Keep walking</button></div>}
      </div>
      <p className="fw-hint">Click the garden, then use <b>arrow keys / WASD</b>, or tap &amp; drag on your phone.</p>
    </div>)
}
