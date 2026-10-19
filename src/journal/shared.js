import { useSyncExternalStore } from 'react'

// Tiny hash router: no extra dependency needed.  "#/journal" opens the journal page.
const EVT = 'kimi-route'
const sub = cb => {
  window.addEventListener('hashchange', cb); window.addEventListener('popstate', cb); window.addEventListener(EVT, cb)
  return () => { window.removeEventListener('hashchange', cb); window.removeEventListener('popstate', cb); window.removeEventListener(EVT, cb) }
}
const snap = () => window.location.hash.replace(/^#/, '') || '/'
export const useRoute = () => useSyncExternalStore(sub, snap, () => '/')
export function go(path) {
  history.pushState({ kimi: true }, '', path === '/' ? location.pathname + location.search : '#' + path)
  window.dispatchEvent(new Event(EVT))
}
export function back() {
  if (history.state && history.state.kimi) history.back()
  else { history.replaceState(null, '', location.pathname + location.search); window.dispatchEvent(new Event(EVT)) }
}

// Handwriting fonts (loaded once; falls back to system cursive fonts if offline)
let fontsLoaded = false
export function loadFonts() {
  if (fontsLoaded || typeof document === 'undefined') return
  fontsLoaded = true
  const l = document.createElement('link'); l.rel = 'stylesheet'
  l.href = 'https://fonts.googleapis.com/css2?family=Caveat:wght@500;700&family=Patrick+Hand&display=swap'
  document.head.appendChild(l)
}
export const HAND = "'Caveat','Patrick Hand','Bradley Hand','Segoe Script','Comic Sans MS',cursive"
