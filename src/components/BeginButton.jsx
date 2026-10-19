import { useSyncExternalStore } from 'react'
import { begin, hasStarted, subscribe, getVersion } from '../sound'
// Visible start button: the click is the user gesture that lets the browser play audio.
export default function BeginButton() {
  useSyncExternalStore(subscribe, getVersion)
  const go = () => {
    begin({ unmute: true })
    const story = document.querySelector('.story')
    if (story) window.scrollTo({ top: story.getBoundingClientRect().top + window.scrollY, behavior: 'smooth' })
  }
  return (
    <button className="begin-btn" onClick={go} data-silent>
      <span aria-hidden="true">♪</span> {hasStarted() ? 'Continue Kimi’s Story' : 'Begin Kimi’s Story'}
      <small>{hasStarted() ? 'music on' : 'best with sound on'}</small>
    </button>)
}
