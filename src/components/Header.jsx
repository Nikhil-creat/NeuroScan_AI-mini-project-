import { useEffect, useState } from 'react'
import { Menu, X, Brain, ArrowRight } from 'lucide-react'

export const NAV = [
  { label: 'PROJECT', href: '#project' },
  { label: 'PLATFORM', href: '#platform' },
  { label: 'VISUAL LAB', href: '#visual-lab' },
  { label: 'CONSOLE', href: '#console' },
  { label: 'CREDENTIALS', href: '#credentials' },
  { label: 'SECURITY', href: '#security' },
  { label: 'CONTACT', href: '#contact' },
]

export default function Header() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-colors duration-300 ${
        scrolled ? 'border-b border-white/10 bg-ink/80 backdrop-blur-md' : 'bg-transparent'
      }`}
    >
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-10">
        <a href="#top" className="flex items-center gap-2 text-white" aria-label="NeuroScan AI home">
          <Brain className="h-6 w-6" strokeWidth={1.75} />
          <span className="font-jakarta text-lg font-extrabold tracking-tight">
            NeuroScan<span className="text-mint">.</span>AI
          </span>
        </a>

        <nav className="hidden items-center gap-8 lg:flex" aria-label="Primary">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} className="font-inter text-base text-white transition-colors hover:text-mint">
              {n.label}
            </a>
          ))}
        </nav>

        <a
          href="#console"
          className="hidden items-center gap-2 rounded-full bg-mint px-5 py-2.5 font-inter text-xs font-bold uppercase tracking-wide text-ink transition-transform hover:scale-[1.03] lg:inline-flex"
        >
          Try Console <ArrowRight className="h-3.5 w-3.5" />
        </a>

        <button className="text-white lg:hidden" onClick={() => setOpen(true)} aria-label="Open menu" aria-expanded={open}>
          <Menu className="h-7 w-7" />
        </button>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex flex-col bg-ink/95 px-6 py-5 backdrop-blur-md lg:hidden">
          <div className="flex items-center justify-between">
            <span className="font-jakarta text-lg font-extrabold">
              NeuroScan<span className="text-mint">.</span>AI
            </span>
            <button onClick={() => setOpen(false)} aria-label="Close menu" className="text-white">
              <X className="h-7 w-7" />
            </button>
          </div>
          <nav className="flex flex-1 flex-col items-start justify-center gap-6" aria-label="Mobile">
            {NAV.map((n) => (
              <a
                key={n.label}
                href={n.href}
                onClick={() => setOpen(false)}
                className="font-inter text-4xl font-extrabold tracking-tight text-white transition-colors hover:text-mint"
              >
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  )
}
