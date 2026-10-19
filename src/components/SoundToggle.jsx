import { useEffect, useSyncExternalStore } from 'react'
import { isMuted, subscribe, toggleMute, unlock, sfx } from '../sound'
export default function SoundToggle() {
  const muted = useSyncExternalStore(subscribe, isMuted)
  useEffect(() => {
    const un = () => unlock()
    const click = e => { if (e.target.closest && e.target.closest('button, a')) sfx.click() }
    window.addEventListener('pointerdown', un, { passive: true })
    window.addEventListener('keydown', un)
    document.addEventListener('click', click)
    return () => { window.removeEventListener('pointerdown', un); window.removeEventListener('keydown', un); document.removeEventListener('click', click) }
  }, [])
  return (
    <button className={'sound-toggle' + (muted ? ' off' : '')} onClick={toggleMute} aria-pressed={!muted}
      aria-label={muted ? 'Unmute sound' : 'Mute sound'} title={muted ? 'Unmute' : 'Mute'}>
      {muted ? '🔇' : '🔊'}
    </button>)
}
