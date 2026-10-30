import { useEffect, useRef } from 'react'

/** Fades children in once when scrolled into view. */
export function Reveal({ children, className = '' }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    if (!el) return
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          el.classList.add('is-visible')
          io.disconnect()
        }
      },
      { threshold: 0.12 },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [])
  return (
    <div ref={ref} className={`reveal ${className}`}>
      {children}
    </div>
  )
}

export function Section({ id, eyebrow, title, accent, intro, children }) {
  return (
    <section id={id} className="relative border-t border-white/10 bg-ink px-6 py-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-mint">{eyebrow}</p>
          <h2 className="mt-3 max-w-3xl font-inter text-3xl font-extrabold uppercase leading-tight tracking-tight sm:text-5xl">
            {title}
            <span className="text-mint">{accent ?? '.'}</span>
          </h2>
          {intro && <p className="mt-5 max-w-2xl font-inter text-[14px] leading-relaxed text-white/70">{intro}</p>}
        </Reveal>
        <div className="mt-12">{children}</div>
      </div>
    </section>
  )
}

export function GlassPanel({ className = '', children }) {
  return <div className={`liquid-glass rounded-2xl p-6 ${className}`}>{children}</div>
}

export function Tag({ children }) {
  return (
    <span className="rounded-full border border-white/15 px-2.5 py-1 font-mono text-[11px] text-white/70">
      {children}
    </span>
  )
}
