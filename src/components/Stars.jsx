import { useMemo } from 'react'
export default function Stars({ count = 60 }) {
  const stars = useMemo(() => Array.from({ length: count }, () => ({
    x: Math.random() * 100, y: Math.random() * 100, s: 1 + Math.random() * 2.5,
    d: 2 + Math.random() * 4, l: Math.random() * 5 })), [count])
  return (<div className="stars" aria-hidden="true">{stars.map((s, i) => (
    <i key={i} style={{ left: s.x + '%', top: s.y + '%', width: s.s, height: s.s, animationDuration: s.d + 's', animationDelay: s.l + 's' }} />))}</div>)
}
