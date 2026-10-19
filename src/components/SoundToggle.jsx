import { useEffect, useState, useSyncExternalStore } from 'react'
import { isMuted, subscribe, toggleMute, sfx, getVersion, hasStarted, getVolume, setVolume, sfxEnabled, setSfxEnabled } from '../sound'
export default function SoundToggle() {
  useSyncExternalStore(subscribe, getVersion)
  const [open, setOpen] = useState(false)
  const muted = isMuted(), started = hasStarted(), off = muted || !started
  useEffect(() => {
    // button clicks get a soft click sound (only once audio has been started by the visitor)
    const click = e => { const el = e.target.closest && e.target.closest('button, a'); if (el && !el.hasAttribute('data-silent')) sfx.click() }
    const away = e => { if (!e.target.closest || !e.target.closest('.sound-wrap')) setOpen(false) }
    document.addEventListener('click', click); document.addEventListener('pointerdown', away)
    return () => { document.removeEventListener('click', click); document.removeEventListener('pointerdown', away) }
  }, [])
  const vol = Math.round(getVolume() * 100)
  return (
    <div className="sound-wrap">
      <button className={'sound-toggle' + (off ? ' off' : '') + (!started ? ' hint' : '')} onClick={toggleMute} data-silent aria-pressed={!off}
        aria-label={!started ? 'Start sound' : muted ? 'Unmute sound' : 'Mute sound'} title={!started ? 'Start sound' : muted ? 'Unmute' : 'Mute'}>
        {off ? '🔇' : '🔊'}
      </button>
      <button className="sound-more" onClick={() => setOpen(o => !o)} data-silent aria-expanded={open} aria-label="Sound settings" title="Volume & effects">⚙</button>
      {open && (
        <div className="sound-panel" role="group" aria-label="Sound settings">
          <label>Volume <b>{vol}%</b>
            <input type="range" min="0" max="100" value={vol} onChange={e => setVolume(e.target.value / 100)} aria-label="Volume" />
          </label>
          <label className="row"><input type="checkbox" checked={sfxEnabled()} onChange={e => setSfxEnabled(e.target.checked)} /> Sound effects</label>
        </div>)}
    </div>)
}
