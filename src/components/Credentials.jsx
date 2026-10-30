import { useState } from 'react'
import { Award, Briefcase, Sparkles, BadgeCheck, ExternalLink } from 'lucide-react'
import { CREDENTIALS as C } from '../config.js'
import { CERTS, CERT_CATEGORIES, TIMELINE } from '../credentials.js'
import { useCountUp } from '../lib/hooks.js'
import { Section, GlassPanel, Reveal, Tag } from './ui.jsx'

function Counter({ value, suffix, icon: Icon, label }) {
  const [ref, v] = useCountUp(value)
  return (
    <GlassPanel className="h-full">
      <Icon className="h-6 w-6 text-mint" strokeWidth={1.75} />
      <p ref={ref} className="mt-4 font-inter text-6xl font-extrabold tracking-tight">
        {v}
        <span className="text-mint">{suffix}</span>
      </p>
      <p className="mt-1 text-[13px] text-white/65">{label}</p>
    </GlassPanel>
  )
}

const num = (s) => parseInt(String(s).replace(/\D/g, ''), 10) || 0
const plus = (s) => (String(s).includes('+') ? '+' : '')

export default function Credentials() {
  const [cat, setCat] = useState('All')
  const list = CERTS.filter((c) => cat === 'All' || c.category === cat)
  const marquee = [...C.issuers, ...C.issuers]

  return (
    <Section
      id="credentials"
      eyebrow="Builder credentials"
      title="The engineer behind the build"
      intro="Hands-on learning beyond the classroom, from cloud security to data and AI, now applied in a single end-to-end project."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Reveal>
          <Counter value={num(C.certificates)} suffix={plus(C.certificates)} icon={Award} label="certificates earned across cloud, data, AI and software" />
        </Reveal>
        <Reveal>
          <Counter value={num(C.internships)} suffix={plus(C.internships)} icon={Briefcase} label="internships and industry micro-internships" />
        </Reveal>
        <Reveal>
          <GlassPanel className="h-full">
            <Sparkles className="h-6 w-6 text-mint" strokeWidth={1.75} />
            <p className="mt-4 font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-mint">Current</p>
            <p className="mt-2 font-inter text-[15px] font-semibold leading-snug">{C.currentInternship}</p>
            <ol className="mt-4 space-y-3 border-l border-white/15 pl-4">
              {TIMELINE.map((t) => (
                <li key={t.what} className="relative">
                  <span className="absolute -left-[21px] top-1.5 h-2 w-2 rounded-full bg-mint" />
                  <p className="font-mono text-[11px] text-mint">{t.when}</p>
                  <p className="text-[13px] font-semibold">{t.what}</p>
                  <p className="text-[12px] text-white/55">{t.where}</p>
                </li>
              ))}
            </ol>
          </GlassPanel>
        </Reveal>
      </div>

      <div className="marquee-mask mt-6 overflow-hidden" aria-label="Issuers and programmes">
        <div className="marquee-track flex w-max gap-3">
          {marquee.map((i, n) => (
            <span key={n} aria-hidden={n >= C.issuers.length} className="whitespace-nowrap rounded-full border border-white/15 px-4 py-2 font-inter text-[12px] text-white/75">
              {i}
            </span>
          ))}
        </div>
      </div>

      <Reveal className="mt-8">
        <GlassPanel>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Certificate wall</h3>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filter certificates">
              {CERT_CATEGORIES.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  aria-pressed={cat === c}
                  className={`rounded-full border px-3 py-1.5 font-inter text-[11px] font-semibold transition-colors ${
                    cat === c ? 'border-mint bg-mint/15 text-mint' : 'border-white/15 text-white/70 hover:border-white/40'
                  }`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((c) => (
              <li key={c.issuer + c.title} className="rounded-xl border border-white/10 p-4 transition-colors hover:border-mint/40">
                <p className="font-inter text-[14px] font-semibold">{c.title}</p>
                <p className="text-[12px] text-white/60">{c.issuer}{c.year ? ` · ${c.year}` : ''}</p>
                <div className="mt-3 flex items-center gap-3">
                  {c.verifyUrl ? (
                    <a href={c.verifyUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 font-mono text-[11px] text-mint hover:underline">
                      <BadgeCheck className="h-3.5 w-3.5" /> Verified <ExternalLink className="h-3 w-3" />
                    </a>
                  ) : (
                    <span className="font-mono text-[11px] text-white/40">link on request</span>
                  )}
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-[12px] text-white/50">
            A selection of the {C.certificates} total. A “Verified” badge appears only where a public verification link exists.
          </p>
        </GlassPanel>
      </Reveal>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Reveal>
          <GlassPanel className="h-full">
            <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Focus areas</h3>
            <ul className="mt-4 divide-y divide-white/10">
              {C.categories.map((c) => (
                <li key={c.title} className="py-3">
                  <p className="font-inter text-[14px] font-semibold">{c.title}</p>
                  <p className="text-[12px] text-white/60">{c.note}</p>
                </li>
              ))}
            </ul>
          </GlassPanel>
        </Reveal>
        <Reveal>
          <GlassPanel className="h-full">
            <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Core skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {C.skills.map((s) => (
                <span key={s} className="rounded-full bg-mint/10 px-3 py-1 font-mono text-[11px] text-mint">{s}</span>
              ))}
            </div>
            <h3 className="mt-7 font-inter text-sm font-semibold uppercase tracking-wide">Issuers</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {C.issuers.map((i) => <Tag key={i}>{i}</Tag>)}
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </Section>
  )
}
