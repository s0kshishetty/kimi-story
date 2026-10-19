import { useEffect, useRef, useState } from 'react'
import { sfx } from '../sound'
const COLORS = ['#ffb3d9', '#a8f0e6', '#ffe08a', '#c7b8ff', '#ffc29e']
const C = 250, R = 150
const OOPS = ['Oops. Again.', 'Hehe… wrong star!', 'Whoopsie! Try again.', 'Oops. Again. (still cute)', 'Meoptune says: nope~']
const slotPos = i => { const a = (-90 + i * 72) * Math.PI / 180; return { x: C + R * Math.cos(a), y: C + R * Math.sin(a) } }
const arc = i => {
  const a0 = (-90 + i * 72 - 26) * Math.PI / 180, a1 = (-90 + i * 72 + 26) * Math.PI / 180
  return `M${C + R * Math.cos(a0)} ${C + R * Math.sin(a0)} A${R} ${R} 0 0 1 ${C + R * Math.cos(a1)} ${C + R * Math.sin(a1)}`
}
const STAR = Array.from({ length: 10 }, (_, k) => {
  const r = k % 2 ? 9 : 21, a = (-90 + k * 36) * Math.PI / 180
  return `${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`
}).join(' ')
const STARTS = [[60, 70], [440, 80], [50, 430], [450, 430], [250, 462]]
const initStars = () => {
  const s = [...STARTS].sort(() => Math.random() - .5)
  return s.map(([x, y]) => ({ x, y, sx: x, sy: y, placed: false }))
}
export default function PortalPuzzle() {
  const [stars, setStars] = useState(initStars)
  const [drag, setDrag] = useState(null)
  const [msg, setMsg] = useState('Drag each star to the matching colour on the portal ring.')
  const [oops, setOops] = useState(0)
  const [phase, setPhase] = useState('play') // play | peek | giggle | close | done
  const svg = useRef()

  useEffect(() => {
    if (phase !== 'peek') return
    setMsg('Kimi peeks through the portal…'); sfx.portalOpen()
    const t1 = setTimeout(() => { setPhase('giggle'); setMsg('*giggles*'); sfx.giggle() }, 1500)
    const t2 = setTimeout(() => { setPhase('close'); setMsg('“Not today. The cats need me.”'); sfx.portalClose() }, 2900)
    const t3 = setTimeout(() => setPhase('done'), 4300)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [phase === 'peek'])

  const toSvg = e => {
    const r = svg.current.getBoundingClientRect()
    return { x: (e.clientX - r.left) * 500 / r.width, y: (e.clientY - r.top) * 500 / r.height }
  }
  const down = (i, e) => {
    if (stars[i].placed || phase !== 'play') return
    e.currentTarget.setPointerCapture(e.pointerId); setDrag(i); sfx.pick()
  }
  const move = (i, e) => {
    if (drag !== i) return
    const p = toSvg(e)
    setStars(s => s.map((st, k) => k === i ? { ...st, x: Math.max(14, Math.min(486, p.x)), y: Math.max(14, Math.min(486, p.y)) } : st))
  }
  const up = i => {
    if (drag !== i) return
    setDrag(null)
    const s = stars[i], t = slotPos(i)
    if (Math.hypot(s.x - t.x, s.y - t.y) < 34) {
      const next = stars.map((st, k) => k === i ? { ...st, x: t.x, y: t.y, placed: true } : st)
      setStars(next); sfx.snap()
      if (next.every(st => st.placed)) setPhase('peek')
      else setMsg('Click! ' + next.filter(st => st.placed).length + ' of 5 aligned.')
      return
    }
    const wrong = [0, 1, 2, 3, 4].some(j => j !== i && Math.hypot(s.x - slotPos(j).x, s.y - slotPos(j).y) < 40)
    if (wrong) {
      setStars(st => st.map((x, k) => k === i ? { ...x, x: x.sx, y: x.sy } : x))
      setMsg(OOPS[oops % OOPS.length]); setOops(o => o + 1); sfx.oops()
    }
  }
  const reset = () => { setStars(initStars()); setPhase('play'); setOops(0); setMsg('Drag each star to the matching colour on the portal ring.') }

  return (
    <div className={'pp ' + phase}>
      <div className="pp-stage">
        <svg ref={svg} viewBox="0 0 500 500" className="pp-svg" role="img" aria-label="Portal puzzle: drag the stars to the matching colours on the ring">
          <defs><radialGradient id="ppg"><stop offset="0" stopColor="#ffd6f2" /><stop offset=".4" stopColor="#a46bff" /><stop offset="1" stopColor="#1a0b3d" /></radialGradient></defs>
          <g className="pp-portal">
            <circle cx="250" cy="250" r="215" fill="url(#ppg)" opacity=".85" />
            <g className="pp-spin"><circle cx="250" cy="250" r="95" fill="none" stroke="#fff" strokeOpacity=".35" strokeWidth="3" strokeDasharray="10 14" /><circle cx="250" cy="250" r="200" fill="none" stroke="#fff" strokeOpacity=".3" strokeWidth="3" strokeDasharray="4 16" /></g>
            {COLORS.map((c, i) => <path key={i} d={arc(i)} stroke={c} strokeWidth="18" strokeLinecap="round" fill="none" opacity=".6" />)}
            {COLORS.map((c, i) => { const p = slotPos(i); return <circle key={i} cx={p.x} cy={p.y} r="26" fill="none" stroke="#fff" strokeOpacity=".7" strokeWidth="2" strokeDasharray="5 5" /> })}
            {stars.map((s, i) => (
              <g key={i} transform={`translate(${s.x} ${s.y})`} className={'pp-star' + (s.placed ? ' placed' : '') + (drag === i ? ' drag' : '')}
                onPointerDown={e => down(i, e)} onPointerMove={e => move(i, e)} onPointerUp={() => up(i)} onPointerCancel={() => up(i)}>
                <circle r="30" fill="transparent" />
                <polygon points={STAR} fill={COLORS[i]} stroke="#fff" strokeWidth="2.5" strokeLinejoin="round" style={{ filter: `drop-shadow(0 0 8px ${COLORS[i]})` }} />
              </g>))}
          </g>
        </svg>
        <img className="pp-kimi" src="/character.png" alt="" />
      </div>
      <p className="pp-msg" aria-live="polite">{msg}</p>
      <div className="pp-bar"><span>Oops count: {oops}</span>{(phase === 'done' || oops > 0) && <button onClick={reset}>{phase === 'done' ? 'Play again' : 'Shuffle stars'}</button>}</div>
    </div>)
}
