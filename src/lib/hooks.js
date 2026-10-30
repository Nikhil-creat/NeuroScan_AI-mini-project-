import { useEffect, useRef, useState } from 'react'

export function usePrefersReducedMotion() {
  const [r, setR] = useState(() => {
    try { return window.matchMedia('(prefers-reduced-motion: reduce)').matches } catch { return false }
  })
  useEffect(() => {
    let mq
    try { mq = window.matchMedia('(prefers-reduced-motion: reduce)') } catch { return }
    const f = () => setR(mq.matches)
    mq.addEventListener?.('change', f)
    return () => mq.removeEventListener?.('change', f)
  }, [])
  return r
}

/** Counts from 0 to `target` once the element scrolls into view. Returns [ref, value]. */
export function useCountUp(target, ms = 1400) {
  const ref = useRef(null)
  const reduced = usePrefersReducedMotion()
  const [v, setV] = useState(reduced ? target : 0)
  useEffect(() => {
    if (reduced) { setV(target); return }
    const el = ref.current
    if (!el) return
    let raf = 0
    const io = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return
      io.disconnect()
      const t0 = performance.now()
      const step = (t) => {
        const p = Math.min(1, (t - t0) / ms)
        setV(Math.round(target * (1 - Math.pow(1 - p, 3))))
        if (p < 1) raf = requestAnimationFrame(step)
      }
      raf = requestAnimationFrame(step)
    }, { threshold: 0.4 })
    io.observe(el)
    return () => { io.disconnect(); cancelAnimationFrame(raf) }
  }, [target, ms, reduced])
  return [ref, v]
}
