import { GraduationCap, Building2, UserCheck, CalendarRange, Users, Target } from 'lucide-react'
import { SITE } from '../config.js'
import { Section, GlassPanel, Reveal } from './ui.jsx'

const OBJECTIVES = [
  'Classify brain MRI into Brain Tumor, Alzheimer’s Disease or Normal Anatomy with a CNN.',
  'Make predictions inspectable with Grad-CAM heatmaps and calibrated confidence.',
  'Ground clinical context in cited literature through retrieval-augmented generation.',
  'Keep a clinician in control: AI drafts, a qualified human decides.',
  'Protect sensitive data with role-based access, encryption and a tamper-evident audit log.',
]

export default function Project() {
  const facts = [
    { icon: GraduationCap, k: 'Programme', v: `${SITE.programme}` },
    { icon: CalendarRange, k: 'Level · Year', v: `${SITE.level} · ${SITE.academicYear}` },
    { icon: Building2, k: 'Institution', v: `${SITE.college}, ${SITE.location}` },
    { icon: UserCheck, k: 'Project guide', v: `${SITE.guide.name}, ${SITE.guide.role}` },
  ]

  return (
    <Section
      id="project"
      eyebrow="About the project"
      title="A B.Tech mini project, engineered like a product"
      intro={SITE.projectTitle}
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {facts.map((f) => (
          <Reveal key={f.k}>
            <GlassPanel className="h-full !p-5">
              <f.icon className="h-5 w-5 text-mint" strokeWidth={1.75} />
              <p className="mt-4 font-mono text-[11px] uppercase tracking-wider text-white/45">{f.k}</p>
              <p className="mt-1 font-inter text-[14px] font-medium leading-snug">{f.v}</p>
            </GlassPanel>
          </Reveal>
        ))}
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Reveal>
          <GlassPanel className="h-full">
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-mint" strokeWidth={1.75} />
              <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Objectives</h3>
            </div>
            <ol className="mt-4 space-y-3 text-[13px] leading-relaxed text-white/75">
              {OBJECTIVES.map((o, i) => (
                <li key={o} className="flex gap-3">
                  <span className="font-mono text-mint">{String(i + 1).padStart(2, '0')}</span>
                  {o}
                </li>
              ))}
            </ol>
          </GlassPanel>
        </Reveal>

        <Reveal>
          <GlassPanel className="h-full">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-mint" strokeWidth={1.75} />
              <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Team</h3>
            </div>
            <ul className="mt-4 divide-y divide-white/10">
              {SITE.team.map((m) => (
                <li key={m.name} className="py-3">
                  <p className="font-inter text-[14px] font-semibold">{m.name}</p>
                  <p className="text-[12px] text-white/60">{m.role}</p>
                </li>
              ))}
              <li className="py-3">
                <p className="font-inter text-[14px] font-semibold">{SITE.guide.name}</p>
                <p className="text-[12px] text-white/60">Project guide · {SITE.guide.role}</p>
              </li>
            </ul>
          </GlassPanel>
        </Reveal>
      </div>
    </Section>
  )
}
