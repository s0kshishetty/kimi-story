import { useLayoutEffect, useRef } from 'react'
import gsap from 'gsap'
import Stars from './Stars'
import Cat from './Cat'
import KimiFace from './KimiFace'
import { CHAPTERS } from '../chapters'
import { setScene, sfx } from '../sound'
const CITIZENS = ['#ffb3d9', '#a8f0e6', '#ffe08a', '#c7b8ff', '#ffc29e']
const REVEAL = 'brightness(1) drop-shadow(0 0 18px rgba(255,200,230,0.7))'
const SHADOW = 'brightness(0) drop-shadow(0 0 14px rgba(120,160,255,0.6))'

export default function Story() {
  const root = useRef()
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      gsap.set('.sky-planet,.hills-planet,.planet-big,.portal,.glow,.flash,.queen,.citizen,.note,.heart', { opacity: 0 })
      gsap.set('.beams', { scaleY: 0 })
      gsap.set('.portal', { xPercent: -50, scale: 0 })
      gsap.set('.queen', { xPercent: -50, x: '15vw', yPercent: 40, scale: .7 })
      gsap.set('.citizen', { scale: 0 }); gsap.set('.bub', { scale: 0 })
      gsap.set('.cat', { xPercent: -50, x: '-34vw', color: '#04060f' })
      gsap.set('.baby', { xPercent: -50, x: '-46vw' })
      gsap.set('.baby .kimi', { filter: SHADOW })
      gsap.set('.cat svg', { filter: 'drop-shadow(0 0 0px rgba(255,240,170,0))' })

      const tl = gsap.timeline({
        defaults: { ease: 'none' },
        scrollTrigger: { trigger: root.current, start: 'top top', end: () => '+=' + window.innerHeight * 9,
          pin: true, scrub: 0.7, anticipatePin: 1, invalidateOnRefresh: true } })

      // global parallax + progress
      tl.to('.clouds', { x: '-16vw', duration: 16 }, 0).to('.story .stars', { y: '-5vh', duration: 16 }, 0)
        .to('.progress', { scaleX: 1, duration: 16 }, 0)
      // captions
      gsap.utils.toArray('.cap').forEach((c, i) => {
        tl.fromTo(c, { opacity: 0, y: 24 }, { opacity: 1, y: 0, duration: .4 }, i * 2 + .1)
        if (i < 7) tl.to(c, { opacity: 0, y: -24, duration: .4 }, i * 2 + 1.6)
      })
      // 1 · midnight crawl
      tl.to('.cat', { x: '0vw', duration: 2 }, 0).to('.baby', { x: '-9vw', duration: 2 }, .15)
      // 2 · beams find the cat
      tl.to('.beams', { scaleY: 1, duration: 1 }, 2)
        .to('.cat', { y: '-9vh', color: '#fff6c9', duration: 1.5 }, 2.4)
        .to('.cat svg', { filter: 'drop-shadow(0 0 22px rgba(255,240,170,0.95))', duration: 1.5 }, 2.4)
      // 3 · portal + flash
      tl.to('.portal', { scale: 1, opacity: 1, rotation: 360, duration: 1.2 }, 4)
        .to('.beams', { opacity: 0, duration: .6 }, 4.4)
        .to(['.cat', '.baby'], { scale: 0, rotation: 540, duration: 1, ease: 'power2.in' }, 4.9)
        .to('.portal', { scale: 14, duration: .9, ease: 'power2.in' }, 5.2)
        .to('.flash', { opacity: 1, duration: .5 }, 5.3)
        .set('.sky-earth,.moon,.hills-earth', { opacity: 0 }, 5.8)
        .set('.sky-planet,.hills-planet,.planet-big', { opacity: 1 }, 5.8)
        .set('.portal', { opacity: 0 }, 5.8)
        .to('.flash', { opacity: 0, duration: .5 }, 5.9)
      // 4 · Meoptune + Cat Queen (arrivals still in shadow)
      tl.set('.cat', { x: '-27vw', y: '-30vh', rotation: 0, color: '#150b33' }, 6)
        .set('.baby', { x: '-5vw', y: '-30vh', rotation: 0 }, 6)
        .set('.cat svg', { filter: 'none' }, 6)
        .to(['.cat', '.baby'], { scale: 1, y: 0, duration: .9, ease: 'bounce.out' }, 6)
        .to('.queen', { opacity: 1, yPercent: 0, scale: 1, duration: 1.3, ease: 'power2.out' }, 6.4)
      // 5 · accident: baby is revealed in colour
      tl.to('.baby .kimi', { filter: REVEAL, duration: 1 }, 8.2).to('.cat', { color: '#cdb8ff', duration: 1 }, 8.2)
        .to('.q', { opacity: 1, y: -10, duration: .5 }, 8.8)
        .to('.baby', { rotation: -6, duration: .5, yoyo: true, repeat: 1 }, 8.8)
      // 6 · panic
      tl.to('.citizen', { opacity: 1, scale: 1, duration: .5, stagger: .12, ease: 'back.out(2)' }, 10)
        .to('.bub', { scale: 1, duration: .4, stagger: .12, ease: 'back.out(3)' }, 10.4)
        .to('.citizen', { rotation: 8, duration: .15, yoyo: true, repeat: 9, stagger: .05 }, 10.8)
        .to('.q', { opacity: 0, duration: .2 }, 11.9)
      // 7 · the melody
      tl.to('.bub', { scale: 0, duration: .3 }, 12).to('.glow', { opacity: 1, duration: 1 }, 12.4)
        .to('.baby', { rotation: 7, duration: .25, yoyo: true, repeat: 7 }, 12.2)
        .to('.note', { keyframes: { opacity: [0, 1, 1, 0], y: ['0vh', '-12vh', '-24vh', '-34vh'], easeEach: 'none' }, duration: 1.6, stagger: .18 }, 12.3)
      // 8 · she stays
      tl.to('.citizen', { y: '-2vh', duration: .2, yoyo: true, repeat: 5, stagger: .06 }, 14)
        .to('.queen', { scale: 1.06, duration: 1.5 }, 14)
        .to('.heart', { keyframes: { opacity: [0, 1, 0], y: ['0vh', '-14vh', '-30vh'], easeEach: 'none' }, duration: 1.5, stagger: .15 }, 14.3)

      // ---- story-synced audio (nothing is random: scene = current position in the story) ----
      const SCENES = [[0, 'curious'], [2, 'mystery'], [4, 'journey'], [6, 'arrival'], [12.4, 'joy'], [15, 'ending']]
      const CUES = [[2.1, 'sparkle'], [4.0, 'portalOpen'], [4.9, 'whoosh'], [6.5, 'land'], [10.4, 'murmur'], [12.3, 'hum'], [14.1, 'welcome']]
      let last = 0
      tl.eventCallback('onUpdate', () => {
        const t = tl.time()
        let s = SCENES[0][1]; for (const [at, name] of SCENES) if (t >= at) s = name
        setScene(s)
        if (t > last && t - last < 1.2) CUES.forEach(([at, fx]) => { if (last < at && t >= at) sfx[fx]() }) // forward, normal scrolling only
        last = t
      })
    }, root)
    return () => ctx.revert()
  }, [])

  return (
    <section ref={root} className="story" aria-label="Kimi's origin story">
      <div className="sky sky-earth" /><div className="sky sky-planet" />
      <Stars count={70} /><div className="moon" /><div className="planet-big" />
      <div className="clouds"><i /><i /><i /><i /></div>
      <div className="hills hills-earth" /><div className="hills hills-planet" />
      <div className="glow" /><div className="portal" />
      <div className="queen"><div className="crown">♛</div><Cat /></div>
      {CITIZENS.map((c, i) => (<div key={i} className={'citizen c' + (i + 1)} style={{ color: c }}><span className="bub">{i % 2 ? '!?' : '?!'}</span><Cat /></div>))}
      <div className="actor cat"><div className="beams"><b /><b /><b /></div><Cat /></div>
      <div className="actor baby"><div className="bob"><KimiFace /><span className="q">?</span></div></div>
      {['♪', '♫', '♪', '♫', '♪', '♫'].map((n, i) => <span key={i} className="note">{n}</span>)}
      {[0, 1, 2, 3, 4, 5].map(i => <span key={i} className="heart">♥</span>)}
      <div className="flash" />
      {CHAPTERS.map((c, i) => (<div className="cap" key={i}><small>Chapter {i + 1}</small><h2>{c.title}</h2><p>{c.text}</p></div>))}
      <div className="progress" />
    </section>)
}
