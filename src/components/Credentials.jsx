import { Award, Briefcase, Sparkles } from 'lucide-react'
import { CREDENTIALS as C } from '../config.js'
import { Section, GlassPanel, Reveal, Tag } from './ui.jsx'

export default function Credentials() {
  return (
    <Section
      id="credentials"
      eyebrow="Builder credentials"
      title="The engineer behind the build"
      intro="Hands-on learning beyond the classroom, from cloud security to data and AI, now applied in a single end-to-end project."
    >
      <div className="grid gap-5 md:grid-cols-3">
        <Reveal>
          <GlassPanel className="h-full">
            <Award className="h-6 w-6 text-mint" strokeWidth={1.75} />
            <p className="mt-4 font-inter text-5xl font-extrabold tracking-tight">{C.certificates}</p>
            <p className="mt-1 text-[13px] text-white/65">certificates earned across cloud, data, AI and software</p>
          </GlassPanel>
        </Reveal>
        <Reveal>
          <GlassPanel className="h-full">
            <Briefcase className="h-6 w-6 text-mint" strokeWidth={1.75} />
            <p className="mt-4 font-inter text-5xl font-extrabold tracking-tight">{C.internships}</p>
            <p className="mt-1 text-[13px] text-white/65">internships and industry micro-internships completed</p>
          </GlassPanel>
        </Reveal>
        <Reveal>
          <GlassPanel className="h-full">
            <Sparkles className="h-6 w-6 text-mint" strokeWidth={1.75} />
            <p className="mt-4 font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-mint">In progress</p>
            <p className="mt-2 font-inter text-[15px] font-semibold leading-snug">{C.currentInternship}</p>
          </GlassPanel>
        </Reveal>
      </div>

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
            <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Issuers & programmes</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {C.issuers.map((i) => (
                <Tag key={i}>{i}</Tag>
              ))}
            </div>
            <h3 className="mt-7 font-inter text-sm font-semibold uppercase tracking-wide">Core skills</h3>
            <div className="mt-4 flex flex-wrap gap-2">
              {C.skills.map((s) => (
                <span key={s} className="rounded-full bg-mint/10 px-3 py-1 font-mono text-[11px] text-mint">
                  {s}
                </span>
              ))}
            </div>
          </GlassPanel>
        </Reveal>
      </div>
    </Section>
  )
}
