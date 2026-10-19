import { useEffect } from 'react'
import Hero from './components/Hero'
import Story from './components/Story'
import Character from './components/Character'
import Projects from './components/Projects'
import SoundToggle from './components/SoundToggle'
import Journal from './journal/Journal'
import { useRoute } from './journal/shared'
import './styles/extras.css'
import './styles/audio.css'
export default function App() {
  const journal = useRoute() === '/journal'
  useEffect(() => { // while the journal is open, freeze + hide the portfolio underneath (scroll position is kept)
    const m = document.getElementById('portfolio')
    if (m) { if (journal) m.setAttribute('inert', ''); else m.removeAttribute('inert') }
    document.documentElement.classList.toggle('journal-open', journal)
  }, [journal])
  return (
    <>
      <main id="portfolio"><Hero /><Story /><Projects /><Character /></main>
      {journal && <Journal />}
      <SoundToggle />
    </>)
}
