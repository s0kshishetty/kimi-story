// Kimi's eyes follow the cursor (or a gentle touch). One shared rAF loop drives every visible Kimi on the page.
// Pupils are separate sprites clipped to the eye opening, so they can never leave the eye or distort the artwork.
const MAX_X = 8, MAX_Y = 5.5        // max travel in artwork pixels (1024px source) - subtle on purpose
const SMOOTH = 0.11                 // 0..1 easing per frame (lower = softer)
const TOUCH_GAIN = 0.7, TOUCH_IDLE = 1600
const faces = new Map()             // element -> { eyes:[{el,cx,cy}], visible }
const ptr = { x: 0, y: 0, on: false, touch: false, last: 0 }
let raf = 0, bound = false
const reduce = typeof matchMedia !== 'undefined' ? matchMedia('(prefers-reduced-motion: reduce)') : { matches: false }

function onMove(x, y, touch) { ptr.x = x; ptr.y = y; ptr.on = true; ptr.touch = touch; ptr.last = performance.now(); kick() }
function bind() {
  if (bound || typeof window === 'undefined') return; bound = true
  const o = { passive: true }                                  // passive = never blocks scrolling
  window.addEventListener('pointermove', e => onMove(e.clientX, e.clientY, e.pointerType === 'touch'), o)
  window.addEventListener('touchmove', e => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY, true) }, o)
  window.addEventListener('touchstart', e => { const t = e.touches[0]; if (t) onMove(t.clientX, t.clientY, true) }, o)
  document.addEventListener('mouseleave', () => { ptr.on = false; kick() })
  window.addEventListener('blur', () => { ptr.on = false; kick() })
  window.addEventListener('scroll', () => { if (ptr.on) kick() }, o)   // faces move under a still cursor
}
function kick() { if (!raf) raf = requestAnimationFrame(frame) }

function frame() {
  raf = 0
  let busy = false
  const idleTouch = ptr.touch && performance.now() - ptr.last > TOUCH_IDLE
  const active = ptr.on && !idleTouch && !reduce.matches
  faces.forEach(f => {
    if (!f.visible) return
    const gain = ptr.touch ? TOUCH_GAIN : 1
    f.eyes.forEach(e => {
      let tx = 0, ty = 0
      if (active) {
        const r = e.box.getBoundingClientRect()
        const dx = ptr.x - (r.left + r.width / 2), dy = ptr.y - (r.top + r.height / 2)
        const d = Math.hypot(dx, dy) || 1
        const k = Math.tanh(d / Math.max(120, r.width * 3.2))  // far away => full look, very close => centred
        tx = (dx / d) * k * MAX_X * gain; ty = (dy / d) * k * MAX_Y * gain
      }
      e.x += (tx - e.x) * SMOOTH; e.y += (ty - e.y) * SMOOTH
      if (Math.abs(tx - e.x) < 0.01 && Math.abs(ty - e.y) < 0.01) { e.x = tx; e.y = ty } else busy = true
      e.el.style.transform = `translate3d(${(e.x / e.sw * 100).toFixed(2)}%,${(e.y / e.sh * 100).toFixed(2)}%,0)`
    })
  })
  if (busy || active) raf = requestAnimationFrame(frame)       // keep polling only while there is something to do
}

export function registerFace(root, eyeEls) {
  bind()
  const eyes = eyeEls.map(el => ({ el, box: el.parentElement, x: 0, y: 0, sw: +el.dataset.w, sh: +el.dataset.h }))
  const f = { eyes, visible: true }
  faces.set(root, f)
  const io = new IntersectionObserver(([en]) => { f.visible = en.isIntersecting; if (f.visible) kick() }, { rootMargin: '100px' })
  io.observe(root)
  kick()
  return () => { io.disconnect(); faces.delete(root) }
}
