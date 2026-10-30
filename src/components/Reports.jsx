import { FileText, Download, ImageIcon, CheckSquare } from 'lucide-react'
import { SITE } from '../config.js'
import { SCREENS, DOWNLOADS, REPORT_FIXES } from '../reports.js'
import { Section, GlassPanel, Reveal } from './ui.jsx'

const base = import.meta.env.BASE_URL || './'

export default function Reports() {
  return (
    <Section
      id="reports"
      eyebrow="Reports & documents"
      title="Documentation you can open"
      intro="Project documents, a viva preparation sheet, and a screenshot gallery for the running system."
    >
      <div className="grid gap-5 md:grid-cols-3">
        {DOWNLOADS.map((d) => (
          <Reveal key={d.title}>
            <GlassPanel className="flex h-full flex-col">
              <FileText className="h-6 w-6 text-mint" strokeWidth={1.75} />
              <h3 className="mt-4 font-inter text-[15px] font-semibold">{d.title}</h3>
              <p className="mt-1 flex-1 text-[12px] leading-relaxed text-white/60">{d.note}</p>
              <a
                href={d.external ? SITE.links.repo + d.href : base + d.href}
                target="_blank"
                rel="noreferrer"
                className="mt-4 inline-flex items-center gap-2 font-inter text-[12px] font-bold uppercase tracking-wide text-mint hover:underline"
              >
                <Download className="h-3.5 w-3.5" /> {d.cta}
              </a>
            </GlassPanel>
          </Reveal>
        ))}
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <GlassPanel className="h-full">
            <h3 className="flex items-center gap-2 font-inter text-sm font-semibold uppercase tracking-wide">
              <ImageIcon className="h-4 w-4 text-mint" /> Screenshot gallery
            </h3>
            {SCREENS.length === 0 ? (
              <p className="mt-4 rounded-xl border border-dashed border-white/20 p-5 text-[12px] leading-relaxed text-white/60">
                No screenshots added yet. Run the app, take real screenshots, put them in <code className="text-mint">public/screens/</code> and list them in <code className="text-mint">src/reports.js</code>. Real captures only.
              </p>
            ) : (
              <ul className="mt-4 grid grid-cols-2 gap-3">
                {SCREENS.map((s) => (
                  <li key={s.src}>
                    <img src={base + s.src} alt={s.caption} loading="lazy" className="aspect-video w-full rounded-lg border border-white/10 object-cover" />
                    <p className="mt-1 text-[11px] text-white/60">{s.caption}</p>
                  </li>
                ))}
              </ul>
            )}
          </GlassPanel>
        </Reveal>
        <Reveal>
          <GlassPanel className="h-full">
            <h3 className="flex items-center gap-2 font-inter text-sm font-semibold uppercase tracking-wide">
              <CheckSquare className="h-4 w-4 text-mint" /> Report corrections checklist
            </h3>
            <ul className="mt-4 space-y-2">
              {REPORT_FIXES.map((f) => (
                <li key={f} className="flex gap-2 text-[12px] leading-relaxed text-white/70">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-mint" />
                  {f}
                </li>
              ))}
            </ul>
          </GlassPanel>
        </Reveal>
      </div>
    </Section>
  )
}
