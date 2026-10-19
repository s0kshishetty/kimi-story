import { useCallback, useEffect, useRef, useState } from 'react'
import { sfx } from '../sound'
import { CATS, INTRO, ENDING, TOTAL_PAGES as TOTAL } from './data'
import { Cat, Doodle, Squiggle } from './Illustrations'

const DUR = 950 // must match the CSS transition time

function JournalPage({ n, single, hidden }) {
  let body
  if (n === 1) body = (
    <div className="pg-body intro">
      <p className="tag"><span>PRIVATE!</span><span>(please do not read)</span></p>
      <h2 className="belongs">This journal belongs to</h2>
      <div className="kimi-name">Kimi<Squiggle /></div>
      <ul className="facts">{INTRO.facts.map(t => <li key={t}>{t}</li>)}</ul>
      <p className="diary">{INTRO.text}</p>
      <Doodle type="star" className="dd0" /><Doodle type="paw" className="dd1" /><Doodle type="heart" className="dd2" />
    </div>)
  else if (n === TOTAL) body = (
    <div className="pg-body ending">
      <h2 className="belongs">{ENDING.title}</h2>
      <div className="polaroid"><i className="tape t1" /><img src="/character.png" alt="Kimi waving" loading="lazy" /><span>me!</span></div>
      <p className="diary">{ENDING.text}</p>
      <p className="sign">♡ Kimi</p>
      <Doodle type="moon" className="dd0" /><Doodle type="sparkle" className="dd1" /><Doodle type="cloud" className="dd2" />
    </div>)
  else {
    const c = CATS[n - 2]
    body = (
      <div className="pg-body cat-page">
        <p className="tag"><span>{c.title}</span><span>{c.day}</span></p>
        <div className="frame"><i className="tape t1" /><i className="tape t2" /><Cat cfg={c} /></div>
        <h3 className="cat-name" style={{ fontSize: c.name.length > 15 ? '8cqw' : c.name.length > 11 ? '9.6cqw' : '12.5cqw' }}>{c.name}<Squiggle /></h3>
        <p className="diary">{c.text}</p>
        {c.doodles.map((d, i) => <Doodle key={i} type={d} className={'dd' + i} />)}
      </div>)
  }
  return (
    <div className={'page ' + (single || n % 2 === 0 ? 'pg-right' : 'pg-left')} aria-hidden={hidden || undefined}>
      {body}<span className="pgno">{n}</span>
    </div>)
}

export default function Book({ single }) {
  const [f, setF] = useState(0) // number of leaves already turned
  const [turn, setTurn] = useState(null)
  const busy = useRef(false), timer = useRef(0), prev = useRef(single)
  const max = single ? TOTAL - 1 : (TOTAL - 2) / 2

  useEffect(() => { // keep the same page when switching between 2-page and 1-page layouts
    if (prev.current !== single) {
      prev.current = single; clearTimeout(timer.current); busy.current = false; setTurn(null)
      setF(p => single ? Math.min(p * 2, TOTAL - 1) : Math.floor(p / 2))
    }
  }, [single])
  useEffect(() => () => clearTimeout(timer.current), [])

  const flip = useCallback(dir => {
    if (busy.current) return
    const next = f + dir
    if (next < 0 || next > max) return
    busy.current = true
    setTurn({ leaf: dir > 0 ? f : next, dir, id: performance.now() }); setF(next); sfx.page()
    timer.current = setTimeout(() => { busy.current = false; setTurn(null) }, DUR)
  }, [f, max])

  useEffect(() => {
    const k = e => { if (e.key === 'ArrowRight') flip(1); else if (e.key === 'ArrowLeft') flip(-1) }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [flip])

  // tap / click + swipe
  const start = useRef(null), swiped = useRef(false)
  const onDown = e => { start.current = { x: e.clientX, y: e.clientY }; swiped.current = false }
  const onUp = e => {
    if (!start.current) return
    const dx = e.clientX - start.current.x, dy = e.clientY - start.current.y; start.current = null
    if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy) * 1.3) { swiped.current = true; flip(dx < 0 ? 1 : -1) }
  }
  const onClick = e => {
    if (swiped.current) { swiped.current = false; return }
    const r = e.currentTarget.getBoundingClientRect(), x = (e.clientX - r.left) / r.width
    flip(single ? (x < 0.3 ? -1 : 1) : (x < 0.5 ? -1 : 1))
  }

  const leaves = single
    ? Array.from({ length: TOTAL }, (_, j) => ({ j, front: j + 1, back: null }))
    : Array.from({ length: (TOTAL - 2) / 2 }, (_, j) => ({ j, front: 2 * j + 2, back: 2 * j + 3 }))
  const vis = single ? [f + 1] : [2 * f + 1, 2 * f + 2]
  const label = single ? `Page ${f + 1} of ${TOTAL}` : `Pages ${2 * f + 1}–${2 * f + 2} of ${TOTAL}`
  const pg = n => <JournalPage n={n} single={single} hidden={!vis.includes(n)} />

  return (
    <div className="book-wrap">
      <div className={'book' + (single ? ' single' : '')} onPointerDown={onDown} onPointerUp={onUp} onClick={onClick}>
        <div className="cover-back" />
        {!single && <><i className="edge l" /><i className="edge r" /></>}
        <div className="leaves">
          {!single && <><div className="base left">{pg(1)}</div><div className="base right">{pg(TOTAL)}</div></>}
          {leaves.map(({ j, front, back }) => {
            const flipped = j < f, turning = turn && turn.leaf === j
            return (
              <div key={j} className={'leaf' + (flipped ? ' flipped' : '') + (turning ? ' turning' : '')}
                style={{ zIndex: turning ? 60 : flipped ? j + 1 : leaves.length - j }}>
                <div className="face front"><div className="bend">{pg(front)}</div></div>
                <div className="face back"><div className="bend">{back ? pg(back) : <div className="page pg-right blank" />}</div></div>
              </div>)
          })}
        </div>
        {!single && <i className="spine" />}
        {turn && <i key={turn.id} className={'cast ' + (turn.dir > 0 ? 'fwd' : 'back')} />}
      </div>
      <nav className="book-nav" aria-label="Page controls">
        <button data-silent className="nav-btn" onClick={() => flip(-1)} disabled={f === 0} aria-label="Previous page">‹</button>
        <span className="book-count" aria-live="polite">{label}</span>
        <button data-silent className="nav-btn" onClick={() => flip(1)} disabled={f === max} aria-label="Next page">›</button>
      </nav>
      <p className={'j-hint' + (f > 0 ? ' gone' : '')}>{single ? 'Swipe or tap the page to turn it ✨' : 'Click the right page to turn it ✨'}</p>
    </div>)
}
