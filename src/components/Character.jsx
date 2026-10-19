import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import KimiFace from './KimiFace'
export default function Character() {
  const el = useRef()
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.reveal', { opacity: 0, y: 40 })
      ScrollTrigger.batch('.reveal', { start: 'top 88%', once: true,
        onEnter: b => gsap.to(b, { opacity: 1, y: 0, stagger: .12, duration: .8, ease: 'power3.out' }) })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={el} className="about" id="about" aria-label="Kimi's character sheet">
      <div className="about-grid">
        <div className="portrait reveal"><div className="orbit" /><KimiFace alt="Kimi" /></div>
        <div>
          <small className="sheet-kicker reveal">Character Sheet</small>
          <h2 className="reveal">Meet Kimi</h2>
          <p className="lead reveal">A one-year-old alien baby with pointed ears, a freckled grumpy-cute face, and zero fear of cats the size of castles.</p>
          <dl className="sheet">
            <div className="card reveal"><dt><i>1</i>Name</dt><dd><b className="big-name">Kimi</b> <span className="muted">(KEE-mee), the smallest citizen of Meoptune</span></dd></div>
            <div className="card reveal"><dt><i>2</i>What she is</dt><dd>An alien baby from a faraway star: pointed ears, a black bob, big amber eyes that follow you around, rosy freckled cheeks and a famously grumpy-cute smile.
              <div className="tags"><span>Curious</span><span>Stubbornly sweet</span><span>Giggles at danger</span><span>Cat magnet</span></div></dd></div>
            <div className="card reveal"><dt><i>3</i>What she does</dt><dd>Official Worry-Melter of Meoptune. Her special talent is the <b>Melody Quirk</b>: when Kimi hums her wobbly little tune, tense rooms soften, tails unpuff and everyone nearby feels instantly at home. Hobbies: crawling after cats, giggling at danger, collecting stars.</dd></div>
            <div className="card reveal"><dt><i>4</i>Her story</dt><dd>One midnight, baby Kimi crawled after a curious cat just as strange beams of light came down from the stars. A swirling portal swallowed them both and dropped them on <b>Meoptune</b>, a pastel cat planet of purring clouds, glowing hills and a ringed sky, ruled by the elegant Cat Queen. Nobody knew how to send her home, until she hummed, worry melted, and the kingdom decided she belongs. Now she is learning what it means to be home.</dd></div>
            <div className="card reveal tagline"><dt><i>5</i>Tagline</dt><dd><q>Hum softly, love loudly, and never fear the big cat.</q></dd></div>
          </dl>
        </div>
      </div>
      <footer className="reveal">Kimi's story has only just begun. <a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Back to the start</a></footer>
    </section>)
}
