import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { BookCover } from './Illustrations'
import { go, loadFonts } from './shared'
import '../styles/journal.css'

export default function JournalProject() {
  loadFonts()
  const btn = useRef(), timers = useRef([])
  const [opening, setOpening] = useState(false)
  const [wipe, setWipe] = useState(null) // null | 'grow' | 'fade'
  const [o, setO] = useState({ x: '50%', y: '50%' })
  useEffect(() => () => timers.current.forEach(clearTimeout), [])
  const open = () => {
    if (opening) return
    const r = btn.current.getBoundingClientRect()
    setO({ x: r.left + r.width / 2 + 'px', y: r.top + r.height / 2 + 'px' })
    setOpening(true); setWipe('grow')
    timers.current.push(setTimeout(() => { go('/journal'); setWipe('fade') }, 850))
    timers.current.push(setTimeout(() => { setWipe(null); setOpening(false) }, 1500))
  }
  return (
    <>
      <button ref={btn} className={'jbook' + (opening ? ' opening' : '')} onClick={open} aria-label="Open Kimi's Cat Journal">
        <span className="jbook-inner">
          <span className="jbook-pages" />
          <span className="jbook-cover"><span className="jbook-front"><BookCover /></span><span className="jbook-endpaper" /></span>
        </span>
        <span className="jbook-hint">Tap to open ✨</span>
      </button>
      {wipe && createPortal(<div className={'j-wipe ' + wipe} style={{ '--ox': o.x, '--oy': o.y }} />, document.body)}
    </>)
}
