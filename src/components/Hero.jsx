import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Stars from './Stars'
import KimiFace from './KimiFace'
import BeginButton from './BeginButton'
export default function Hero() {
  const el = useRef()
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const st = { trigger: el.current, start: 'top top', end: 'bottom top', scrub: true }
      gsap.from('.hero-title', { opacity: 0, y: 40, duration: 1.2, ease: 'power3.out' })
      gsap.from('.hero-baby', { opacity: 0, scale: .85, duration: 1.2, delay: .3, ease: 'back.out(1.6)' })
      gsap.to('.hero-title', { yPercent: 80, scrollTrigger: st })
      gsap.to('.hero-baby', { yPercent: -18, scale: 1.08, scrollTrigger: st })
      gsap.to('.hero .stars', { y: 120, scrollTrigger: st })
      gsap.to('.hero-foot', { opacity: 0, scrollTrigger: { ...st, end: '40% top' } })
    }, el)
    return () => ctx.revert()
  }, [])
  return (
    <section ref={el} className="hero">
      <Stars count={80} />
      <h1 className="hero-title">Kimi</h1>
      <div className="hero-baby"><KimiFace alt="Kimi, a baby alien with pointed ears and big brown eyes" /></div>
      <div className="hero-foot"><p>An alien baby. A cat kingdom. One accidental adventure.</p><BeginButton />
        <a className="sheet-link" href="#about" onClick={e => { e.preventDefault(); document.getElementById("about")?.scrollIntoView({ behavior: "smooth" }) }}>Meet Kimi’s character sheet ↓</a><span className="cue">Scroll to begin her story ↓</span></div>
    </section>)
}
