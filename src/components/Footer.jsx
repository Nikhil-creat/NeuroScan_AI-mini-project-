import { ArrowUp, Brain } from 'lucide-react'
import { SITE } from '../config.js'
import { NAV } from './Header.jsx'

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-ink px-6 pb-8 pt-14 lg:px-10">
      <div className="mx-auto grid max-w-7xl gap-10 md:grid-cols-4">
        <div className="md:col-span-2">
          <p className="flex items-center gap-2 font-jakarta text-lg font-extrabold">
            <Brain className="h-6 w-6" strokeWidth={1.75} />
            NeuroScan<span className="text-mint">.</span>AI
          </p>
          <p className="mt-3 max-w-md text-[12.5px] leading-relaxed text-white/55">
            {SITE.level} · {SITE.programme}, {SITE.college}. An academic research prototype — not a medical device and
            not for clinical use. Every output requires review by a qualified clinician.
          </p>
        </div>

        <div>
          <h4 className="font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-mint">Explore</h4>
          <ul className="mt-4 space-y-2 text-[13px] text-white/70">
            {NAV.map((n) => (
              <li key={n.label}>
                <a href={n.href} className="hover:text-mint">
                  {n.label.charAt(0) + n.label.slice(1).toLowerCase()}
                </a>
              </li>
            ))}
            {[['#architecture', 'Architecture'], ['#model-card', 'Model card'], ['#skills', 'Skills'], ['#faq', 'FAQ']].map(([h, l]) => (
              <li key={h}>
                <a href={h} className="hover:text-mint">
                  {l}
                </a>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-mint">Connect</h4>
          <ul className="mt-4 space-y-2 text-[13px] text-white/70">
            <li>
              <a href={SITE.links.repo} target="_blank" rel="noreferrer" className="hover:text-mint">
                Source code
              </a>
            </li>
            <li>
              <a href={SITE.links.github} target="_blank" rel="noreferrer" className="hover:text-mint">
                GitHub
              </a>
            </li>
            <li>
              <a href={SITE.links.linkedin} target="_blank" rel="noreferrer" className="hover:text-mint">
                LinkedIn
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.links.email}`} className="hover:text-mint">
                Email
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-7xl flex-col items-start justify-between gap-4 border-t border-white/10 pt-6 text-[12px] text-white/45 sm:flex-row sm:items-center">
        <p>
          © 2026 {SITE.team[0].name}. Guided by {SITE.guide.name}. Built with React, Tailwind, FastAPI and PyTorch.
        </p>
        <a href="#top" className="inline-flex items-center gap-1.5 hover:text-mint">
          Back to top <ArrowUp className="h-3.5 w-3.5" />
        </a>
      </div>
    </footer>
  )
}
