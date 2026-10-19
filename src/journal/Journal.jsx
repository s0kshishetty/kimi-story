import { useEffect, useState } from 'react'
import Book from './Book'
import { back, loadFonts } from './shared'
import '../styles/journal.css'

const Q = '(max-width: 820px), (max-aspect-ratio: 5/4)'
function useSingle() {
  const [m, setM] = useState(() => window.matchMedia(Q).matches)
  useEffect(() => {
    const mq = window.matchMedia(Q), f = () => setM(mq.matches)
    mq.addEventListener('change', f); return () => mq.removeEventListener('change', f)
  }, [])
  return m
}

export default function Journal() {
  loadFonts()
  const single = useSingle()
  const [out, setOut] = useState(false)
  const close = () => { if (out) return; setOut(true); setTimeout(back, 420) }
  useEffect(() => {
    const k = e => { if (e.key === 'Escape') close() }
    window.addEventListener('keydown', k); return () => window.removeEventListener('keydown', k)
  }, [out])
  return (
    <div className={'journal' + (out ? ' out' : '')} role="region" aria-label="Kimi's Cat Journal">
      <button className="j-back" onClick={close}><span aria-hidden="true">←</span> Back to Portfolio</button>
      <h2 className="j-title">Kimi's Cat Journal</h2>
      <Book single={single} />
    </div>)
}
