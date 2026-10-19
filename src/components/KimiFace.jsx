import { useEffect, useRef } from 'react'
import { registerFace } from '../eyes'
// Kimi's artwork in 3 layers: the original painting with the irises lifted out (character-base.png),
// then two iris sprites clipped to the eye openings. Positions are % of the 1024x1024 source so it scales with any size.
const S = 1024
const EYES = {
  L: { box: [285, 387, 133, 124], spr: [312, 392, 91, 99] },
  R: { box: [522, 409, 163, 115], spr: [526, 415, 106, 94] },
}
const pc = (v, of = S) => (v / of * 100).toFixed(3) + '%'
export default function KimiFace({ alt = '', className = '' }) {
  const root = useRef()
  useEffect(() => {
    const irises = [...root.current.querySelectorAll('.kimi-iris')]
    return registerFace(root.current, irises)
  }, [])
  return (
    <span ref={root} className={'kimi ' + className}>
      <img src="/character-base.png" alt={alt} draggable="false" />
      {Object.entries(EYES).map(([k, { box: [bx, by, bw, bh], spr: [sx, sy, sw, sh] }]) => (
        <span key={k} className="kimi-eye" aria-hidden="true"
          style={{ left: pc(bx), top: pc(by), width: pc(bw), height: pc(bh), WebkitMaskImage: `url(/eye-mask-${k}.png)`, maskImage: `url(/eye-mask-${k}.png)` }}>
          <img className="kimi-iris" src={`/iris-${k}.png`} alt="" draggable="false" data-w={sw} data-h={sh}
            style={{ left: pc(sx - bx, bw), top: pc(sy - by, bh), width: pc(sw, bw), height: pc(sh, bh) }} />
        </span>))}
    </span>)
}
