import { useId } from 'react'
import { HAND } from './shared'

const INK = '#3b2a22'
const S = { stroke: INK, strokeWidth: 3.4, strokeLinejoin: 'round', strokeLinecap: 'round' }
const BODIES = { chubby: { rx: 64, ry: 52, cy: 220 }, tall: { rx: 44, ry: 66, cy: 228 }, fluffy: { rx: 74, ry: 54, cy: 220 }, small: { rx: 48, ry: 40, cy: 232 } }
const TAILS = { curl: 'M206 238 Q266 236 260 182 Q257 154 234 160', up: 'M204 242 Q256 226 246 150', fluffy: 'M204 236 Q272 240 266 170', short: 'M206 246 Q230 250 234 232' }
const EARS = {
  point: { o: ['M64 120 L68 54 Q70 46 79 50 L126 84 Z', 'M236 120 L232 54 Q230 46 221 50 L174 84 Z'], i: ['M76 108 L78 68 L110 90 Z', 'M224 108 L222 68 L190 90 Z'] },
  tall: { o: ['M64 120 L54 26 Q56 18 66 24 L128 80 Z', 'M236 120 L246 26 Q244 18 234 24 L172 80 Z'], i: ['M74 108 L68 48 L110 88 Z', 'M226 108 L232 48 L190 88 Z'] },
  fold: { o: ['M66 106 Q72 60 120 78 L100 102 Z', 'M234 106 Q228 60 180 78 L200 102 Z'], i: [] },
}
const starPts = (cx, cy, R, r) => Array.from({ length: 10 }, (_, k) => {
  const a = (-90 + k * 36) * Math.PI / 180, q = k % 2 ? r : R
  return `${(cx + q * Math.cos(a)).toFixed(1)},${(cy + q * Math.sin(a)).toFixed(1)}`
}).join(' ')

/* A hand-drawn style cat. Everything is configured by the `cfg` object (see data.js). */
export function Cat({ cfg, className = '', ...rest }) {
  const id = useId().replace(/:/g, '')
  if (cfg.src) return <img src={cfg.src} alt={cfg.name} className={className} />
  const B = BODIES[cfg.body || 'chubby'], fur = cfg.fur, belly = cfg.belly || '#fff3e0', mark = cfg.mark || '#c9803f', paw = cfg.paws || fur
  const acc = cfg.acc || [], pat = cfg.pattern, tail = cfg.tail || 'curl', tw = tail === 'fluffy' ? 34 : 24, floor = B.cy + B.ry
  const eyes = cfg.eyes || 'round', mouth = cfg.mouth || 'smile'
  const F = `url(#${id}f)`
  return (
    <svg viewBox="0 20 300 285" className={'cat ' + className} role="img" aria-label={'Drawing of ' + cfg.name} {...rest}>
      <defs>
        <filter id={id + 'f'}><feTurbulence type="fractalNoise" baseFrequency="0.03" numOctaves="2" seed={cfg.seed || 2} result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="4.5" xChannelSelector="R" yChannelSelector="G" /></filter>
        <clipPath id={id + 'h'}><ellipse cx="150" cy="142" rx="90" ry="72" /></clipPath>
        <clipPath id={id + 'b'}><ellipse cx="150" cy={B.cy} rx={B.rx} ry={B.ry} /></clipPath>
        <radialGradient id={id + 'g'}><stop offset="0" stopColor="#fff3b0" stopOpacity=".95" /><stop offset="1" stopColor="#fff3b0" stopOpacity="0" /></radialGradient>
      </defs>
      <ellipse cx="150" cy={floor + 4} rx="88" ry="9" fill="rgba(90,55,30,.16)" />
      <g filter={F}>
        {/* tail */}
        <path d={TAILS[tail]} fill="none" stroke={INK} strokeWidth={tw + 7} strokeLinecap="round" />
        <path d={TAILS[tail]} fill="none" stroke={fur} strokeWidth={tw} strokeLinecap="round" />
        {pat === 'tabby' && <path d={TAILS[tail]} fill="none" stroke={mark} strokeWidth={tw} strokeDasharray="9 20" />}
        {/* body */}
        <ellipse cx="150" cy={B.cy} rx={B.rx} ry={B.ry} fill={fur} {...S} />
        <g clipPath={`url(#${id}b)`}>
          <ellipse cx="150" cy={B.cy + 8} rx={B.rx * 0.58} ry={B.ry * 0.7} fill={belly} />
          {pat === 'tabby' && <path d={`M96 ${B.cy - 30} Q108 ${B.cy - 18} 104 ${B.cy - 4} M204 ${B.cy - 30} Q192 ${B.cy - 18} 196 ${B.cy - 4} M90 ${B.cy + 6} L106 ${B.cy + 10} M210 ${B.cy + 6} L194 ${B.cy + 10}`} stroke={mark} strokeWidth="7" fill="none" strokeLinecap="round" />}
          {pat === 'spots' && <><ellipse cx="108" cy={B.cy + 4} rx="26" ry="22" fill="#f0a25a" /><ellipse cx="196" cy={B.cy - 4} rx="24" ry="20" fill={mark} /></>}
        </g>
        {pat === 'star' && <polygon points={starPts(150, B.cy + 6, 13, 6)} fill="#ffe27a" stroke={INK} strokeWidth="2.2" strokeLinejoin="round" />}
        {/* paws */}
        <ellipse cx="116" cy={floor - 8} rx="21" ry="14" fill={paw} {...S} />
        <ellipse cx="184" cy={floor - 8} rx="21" ry="14" fill={paw} {...S} />
        {/* fluffy cheeks */}
        {cfg.fluff && <>
          <path d="M66 138 L48 146 L64 154 L50 166 L72 168 Z" fill={fur} {...S} /><path d="M234 138 L252 146 L236 154 L250 166 L228 168 Z" fill={fur} {...S} />
        </>}
        {/* ears */}
        {cfg.ear === 'round' ? <>
          <circle cx="82" cy="80" r="27" fill={fur} {...S} /><circle cx="218" cy="80" r="27" fill={fur} {...S} />
          <circle cx="82" cy="82" r="14" fill="#ffc2cc" /><circle cx="218" cy="82" r="14" fill="#ffc2cc" />
        </> : <>
          {EARS[cfg.ear || 'point'].o.map((d, i) => <path key={i} d={d} fill={fur} {...S} />)}
          {EARS[cfg.ear || 'point'].i.map((d, i) => <path key={i} d={d} fill="#ffc2cc" />)}
        </>}
        {/* head */}
        <ellipse cx="150" cy="142" rx="90" ry="72" fill={fur} {...S} />
        <g clipPath={`url(#${id}h)`}>
          {pat === 'tabby' && <path d="M150 70 L150 100 M126 74 Q130 92 136 102 M174 74 Q170 92 164 102 M60 128 L90 134 M58 146 L88 148 M240 128 L210 134 M242 146 L212 148" stroke={mark} strokeWidth="7" fill="none" strokeLinecap="round" />}
          {pat === 'spots' && <><ellipse cx="92" cy="100" rx="38" ry="30" fill="#f0a25a" /><ellipse cx="212" cy="98" rx="34" ry="28" fill={mark} /></>}
        </g>
        {pat === 'star' && <><circle cx="150" cy="92" r="30" fill={`url(#${id}g)`} /><polygon points={starPts(150, 92, 15, 7)} fill="#ffe27a" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" /></>}
        {/* cheeks */}
        <ellipse cx="78" cy="174" rx="15" ry="9" fill="#ffb0c0" opacity=".85" /><ellipse cx="222" cy="174" rx="15" ry="9" fill="#ffb0c0" opacity=".85" />
        {/* eyes */}
        {eyes === 'round' && <>
          <ellipse cx="112" cy="150" rx="19" ry="24" fill={INK} /><ellipse cx="188" cy="150" rx="19" ry="24" fill={INK} />
          <circle cx="105" cy="140" r="7.5" fill="#fff" /><circle cx="181" cy="140" r="7.5" fill="#fff" /><circle cx="119" cy="160" r="3.2" fill="#fff" /><circle cx="195" cy="160" r="3.2" fill="#fff" />
        </>}
        {eyes === 'sparkle' && <>
          <ellipse cx="112" cy="150" rx="22" ry="27" fill={INK} /><ellipse cx="188" cy="150" rx="22" ry="27" fill={INK} />
          <circle cx="104" cy="138" r="9" fill="#fff" /><circle cx="180" cy="138" r="9" fill="#fff" /><circle cx="121" cy="162" r="4" fill="#fff" /><circle cx="197" cy="162" r="4" fill="#fff" />
          <polygon points={starPts(122, 144, 4, 1.8)} fill="#fff" /><polygon points={starPts(198, 144, 4, 1.8)} fill="#fff" />
        </>}
        {eyes === 'sleepy' && <>
          <path d="M92 152 Q112 174 132 152" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" /><path d="M168 152 Q188 174 208 152" fill="none" stroke={INK} strokeWidth="5.5" strokeLinecap="round" />
          <path d="M96 160 L90 168 M110 166 L110 176 M126 160 L132 168 M172 160 L166 168 M190 166 L190 176 M204 160 L210 168" stroke={INK} strokeWidth="3" strokeLinecap="round" />
        </>}
        {eyes === 'grumpy' && <>
          <ellipse cx="112" cy="154" rx="16" ry="20" fill={INK} /><ellipse cx="188" cy="154" rx="16" ry="20" fill={INK} />
          <circle cx="106" cy="147" r="6" fill="#fff" /><circle cx="182" cy="147" r="6" fill="#fff" />
          <path d="M88 124 L132 138 M212 124 L168 138" stroke={INK} strokeWidth="6" strokeLinecap="round" />
        </>}
        {/* nose + mouth */}
        <path d="M144 168 Q150 165 156 168 Q153 175 150 176 Q147 175 144 168Z" fill="#e8838d" stroke={INK} strokeWidth="1.8" strokeLinejoin="round" />
        {mouth === 'smile' && <path d="M136 180 Q143 191 150 181 Q157 191 164 180" fill="none" stroke={INK} strokeWidth="3.2" strokeLinecap="round" />}
        {mouth === 'frown' && <path d="M137 192 Q150 176 163 192" fill="none" stroke={INK} strokeWidth="3.4" strokeLinecap="round" />}
        {mouth === 'open' && <><path d="M138 180 Q150 206 162 180 Z" fill="#c4575f" {...S} strokeWidth="3" /><ellipse cx="150" cy="193" rx="6" ry="4" fill="#ff9aa8" /></>}
        {/* whiskers */}
        <path d="M74 164 L24 152 M72 176 L22 178 M76 188 L30 202 M226 164 L276 152 M228 176 L278 178 M224 188 L270 202" stroke={INK} strokeWidth="2.6" strokeLinecap="round" fill="none" />
        {/* accessories */}
        {acc.includes('scarf') && <>
          <path d="M92 204 Q150 232 208 204 L212 224 Q150 252 88 224 Z" fill="#f08a8a" {...S} />
          <path d="M176 232 L186 272 L208 264 L198 226 Z" fill="#f08a8a" {...S} />
          <path d="M122 218 L120 240 M152 224 L152 246 M182 218 L184 238" stroke="#fff3e0" strokeWidth="4" strokeLinecap="round" />
        </>}
        {acc.includes('bell') && <>
          <path d="M104 198 Q150 216 196 198 L196 208 Q150 226 104 208 Z" fill="#ff8fa3" {...S} />
          <circle cx="150" cy="226" r="9" fill="#ffd45e" {...S} strokeWidth="2.6" /><path d="M150 222 V231" stroke={INK} strokeWidth="2" />
        </>}
        {acc.includes('glasses') && <>
          <circle cx="112" cy="150" r="28" fill="rgba(255,255,255,.28)" stroke={INK} strokeWidth="4" /><circle cx="188" cy="150" r="28" fill="rgba(255,255,255,.28)" stroke={INK} strokeWidth="4" />
          <path d="M140 146 Q150 138 160 146 M84 144 L66 136 M216 144 L234 136" stroke={INK} strokeWidth="4" fill="none" strokeLinecap="round" />
        </>}
        {acc.includes('crown') && <>
          <path d="M108 84 L112 44 L132 64 L150 34 L168 64 L188 44 L192 84 Z" fill="#ffd45e" {...S} />
          <path d="M108 84 L192 84 L190 94 L110 94 Z" fill="#f2b630" {...S} />
          <circle cx="150" cy="62" r="5" fill="#ff8fa3" stroke={INK} strokeWidth="2" /><circle cx="124" cy="82" r="3.5" fill="#a8f0e6" /><circle cx="176" cy="82" r="3.5" fill="#a8f0e6" />
        </>}
        {acc.includes('sailor') && <>
          <path d="M100 90 Q102 40 150 38 Q198 40 200 90 Z" fill="#f6f1e6" {...S} />
          <path d="M92 88 Q150 106 208 88 L206 100 Q150 118 94 100 Z" fill="#3b5b8a" {...S} />
          <circle cx="150" cy="42" r="5" fill="#ffd45e" stroke={INK} strokeWidth="2" />
        </>}
        {acc.includes('nightcap') && <>
          <path d="M200 56 Q256 62 250 112" fill="none" stroke={INK} strokeWidth="21" strokeLinecap="round" /><path d="M200 56 Q256 62 250 112" fill="none" stroke="#ffb99a" strokeWidth="14" strokeLinecap="round" />
          <path d="M98 92 Q104 34 160 34 Q212 36 204 92 Z" fill="#ffb99a" {...S} />
          <path d="M96 90 Q150 106 206 90 L206 102 Q150 118 96 102 Z" fill="#fff3e0" {...S} />
          <circle cx="250" cy="116" r="11" fill="#fff" {...S} strokeWidth="2.6" />
        </>}
        {acc.includes('flowerEar') && <g transform="translate(86 84)">
          {[[0, -11], [10, -3], [6, 9], [-6, 9], [-10, -3]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r="7.5" fill="#ffc2d4" stroke={INK} strokeWidth="2" />)}
          <circle r="5.5" fill="#ffd45e" stroke={INK} strokeWidth="2" />
        </g>}
      </g>
    </svg>)
}

/* Small hand-drawn doodles (40x40) */
const D = {
  star: <path d="M20 4 L24.5 14.5 L36 15.5 L27.3 23 L30 34 L20 28 L10 34 L12.7 23 L4 15.5 L15.5 14.5Z" fill="#ffd45e" />,
  heart: <path d="M20 34 C6 24 4 14 11 10 C16 7 19 11 20 14 C21 11 24 7 29 10 C36 14 34 24 20 34Z" fill="#ffb0c0" />,
  paw: <g fill="#d9a67f"><ellipse cx="20" cy="26" rx="9" ry="7" /><ellipse cx="9" cy="17" rx="3.6" ry="4.6" /><ellipse cx="16" cy="11" rx="3.6" ry="4.6" /><ellipse cx="24" cy="11" rx="3.6" ry="4.6" /><ellipse cx="31" cy="17" rx="3.6" ry="4.6" /></g>,
  fish: <g fill="#bfe3f0"><path d="M5 20 Q16 8 28 20 Q16 32 5 20Z" /><path d="M28 20 L37 12 L37 28Z" /><circle cx="12" cy="18" r="1.6" fill="#3b2a22" stroke="none" /></g>,
  yarn: <g><circle cx="20" cy="20" r="14" fill="#f6b3a0" /><path d="M8 16 Q20 22 32 14 M7 24 Q20 30 33 22 M14 8 Q22 20 16 33" fill="none" /><path d="M30 31 Q37 36 38 28" fill="none" /></g>,
  moon: <path d="M26 5 A15 15 0 1 0 35 27 A12 12 0 1 1 26 5Z" fill="#ffe6a0" />,
  flower: <g><g fill="#ffc2d4"><circle cx="20" cy="9" r="6.5" /><circle cx="31" cy="17" r="6.5" /><circle cx="27" cy="30" r="6.5" /><circle cx="13" cy="30" r="6.5" /><circle cx="9" cy="17" r="6.5" /></g><circle cx="20" cy="20" r="5" fill="#ffd45e" /></g>,
  note: <g><path d="M14 30 V8 L30 5 V26" fill="none" /><ellipse cx="11" cy="31" rx="5" ry="4" fill="#3b2a22" /><ellipse cx="27" cy="27" rx="5" ry="4" fill="#3b2a22" /></g>,
  zzz: <g fill="#8a5a3c" stroke="none" fontFamily={HAND} fontWeight="700"><text x="4" y="34" fontSize="22">z</text><text x="16" y="24" fontSize="18">z</text><text x="27" y="15" fontSize="14">z</text></g>,
  sparkle: <path d="M20 3 Q22 18 37 20 Q22 22 20 37 Q18 22 3 20 Q18 18 20 3Z" fill="#fff3b0" />,
  cloud: <path d="M10 30 Q2 30 4 22 Q6 16 13 18 Q14 8 24 9 Q32 10 31 19 Q38 19 37 26 Q36 30 30 30Z" fill="#fff" />,
  toast: <g><path d="M8 32 V16 Q4 8 12 6 Q20 3 28 6 Q36 8 32 16 V32Z" fill="#f4c88a" /><path d="M13 31 V17 Q10 12 16 11 H24 Q30 12 27 17 V31Z" fill="#fbe3b6" stroke="none" /></g>,
}
export function Doodle({ type, className = '' }) {
  return (
    <svg viewBox="0 0 40 40" className={'dd ' + className} aria-hidden="true" stroke="#5a3b2a" strokeWidth="2" strokeLinejoin="round" strokeLinecap="round">{D[type]}</svg>)
}
export const Squiggle = () => (
  <svg className="squig" viewBox="0 0 200 14" preserveAspectRatio="none" aria-hidden="true"><path d="M3 8 Q20 1 38 8 T74 8 T110 8 T146 8 T197 7" fill="none" stroke="#f08a6a" strokeWidth="3.5" strokeLinecap="round" /></svg>)

/* Hand-drawn book cover used on the portfolio page */
export function BookCover() {
  const id = useId().replace(/:/g, '')
  const st = (x, y, s) => <polygon points={starPts(x, y, s, s * 0.45)} fill="#ffe27a" stroke={INK} strokeWidth="2.4" strokeLinejoin="round" />
  return (
    <svg viewBox="0 0 300 400" className="cover-svg" role="img" aria-label="Kimi's Cat Journal book cover">
      <defs>
        <filter id={id + 'r'}><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="5" result="n" /><feDisplacementMap in="SourceGraphic" in2="n" scale="3.5" /></filter>
        <linearGradient id={id + 'l'} x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#bf8057" /><stop offset="1" stopColor="#7d4b31" /></linearGradient>
      </defs>
      <g filter={`url(#${id}r)`}>
        <rect x="6" y="6" width="288" height="388" rx="18" fill={`url(#${id}l)`} stroke={INK} strokeWidth="4" />
        <path d="M24 6 H40 V394 H24 Q6 394 6 376 V24 Q6 6 24 6Z" fill="#6b3f28" stroke={INK} strokeWidth="4" />
        <path d="M6 76 H40 M6 324 H40 M6 200 H40" stroke={INK} strokeWidth="3" />
        <path d="M58 24 H276 V376 H58 Z" fill="none" stroke="#ffd9b3" strokeWidth="2.6" strokeDasharray="7 7" />
        <g transform="rotate(-2 170 108)"><rect x="74" y="50" width="196" height="116" rx="10" fill="#fbefd9" stroke={INK} strokeWidth="3.5" />
          <text x="172" y="100" textAnchor="middle" fontSize="42" fontWeight="700" fill={INK} style={{ fontFamily: HAND }}>Kimi's</text>
          <text x="172" y="146" textAnchor="middle" fontSize="34" fontWeight="700" fill="#c9692f" style={{ fontFamily: HAND }}>Cat Journal</text></g>
        <rect x="64" y="40" width="46" height="16" fill="#ffc9a8" opacity=".85" transform="rotate(-28 87 48)" /><rect x="238" y="44" width="46" height="16" fill="#ffc9a8" opacity=".85" transform="rotate(30 261 52)" />
        {st(76, 214, 13)}{st(262, 224, 10)}{st(246, 360, 12)}{st(84, 364, 9)}
        <g fill="#e8b895" stroke="none">
          <ellipse cx="150" cy="364" rx="7" ry="6" /><circle cx="141" cy="354" r="2.6" /><circle cx="147" cy="350" r="2.6" /><circle cx="154" cy="350" r="2.6" /><circle cx="160" cy="354" r="2.6" />
          <ellipse cx="196" cy="346" rx="6" ry="5" /><circle cx="188" cy="338" r="2.2" /><circle cx="193" cy="335" r="2.2" /><circle cx="199" cy="335" r="2.2" /><circle cx="204" cy="338" r="2.2" />
        </g>
      </g>
      <Cat cfg={{ name: 'Biscuit', fur: '#f0a25a', belly: '#ffe9cc', mark: '#c97a35', pattern: 'tabby', ear: 'point', eyes: 'round', mouth: 'smile', body: 'chubby', tail: 'curl', seed: 2 }} x="88" y="178" width="170" height="156" />
    </svg>)
}
