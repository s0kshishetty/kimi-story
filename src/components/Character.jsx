import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
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
    <section ref={el} className="about">
      <div className="about-grid">
        <div className="portrait reveal"><div className="orbit" /><img src="/character.png" alt="Kimi" /></div>
        <div>
          <h2 className="reveal">Meet Kimi</h2>
          <p className="lead reveal">A one-year-old alien baby with pointed ears, a freckled grumpy-cute face, and zero fear of cats the size of castles.</p>
          <div className="card reveal"><h3>Personality</h3><div className="tags"><span>Curious</span><span>Stubbornly sweet</span><span>Giggles at danger</span><span>Cat magnet</span></div></div>
          <div className="card reveal"><h3>Special ability: Melody Quirk</h3><p>When Kimi hums her wobbly little tune, worry melts. Tense rooms soften, tails unpuff, and everyone nearby feels instantly at home.</p></div>
          <div className="card reveal"><h3>Her world: Meoptune</h3><p>A pastel cat planet of purring clouds, glowing hills and a ringed sky, ruled by the elegant Cat Queen. Kimi is its newest, smallest citizen.</p></div>
        </div>
      </div>
      <footer className="reveal">Kimi's story has only just begun. <a href="#top" onClick={e => { e.preventDefault(); window.scrollTo({ top: 0, behavior: 'smooth' }) }}>Back to the start</a></footer>
    </section>)
}
