import { useState } from 'react'
import { ShieldCheck, Eye, BookOpen, FileText, Scale, UserCheck } from 'lucide-react'
import { Section, GlassPanel, Tag } from './ui.jsx'

const AGENTS = [
  {
    id: 'supervisor',
    icon: UserCheck,
    name: 'Supervisor',
    role: 'Plans the case, delegates, enforces the human gate.',
    tools: ['task_graph', 'queue_for_review', 'escalate'],
    rules: 'Cannot publish a report. Only a signed-in clinician can release one.',
  },
  {
    id: 'imaging',
    icon: Eye,
    name: 'Imaging agent',
    role: 'Runs the CNN, Grad-CAM and uncertainty estimation.',
    tools: ['cnn_predict', 'gradcam', 'mc_dropout', 'ood_check'],
    rules: 'Read-only access to the scan. Abstains below the confidence threshold.',
  },
  {
    id: 'retrieval',
    icon: BookOpen,
    name: 'Retrieval agent',
    role: 'Builds queries from the finding and fetches cited guideline passages.',
    tools: ['hybrid_search', 'rerank', 'cite'],
    rules: 'Only searches the admin-approved knowledge base. Retrieved text is data, never instructions.',
  },
  {
    id: 'report',
    icon: FileText,
    name: 'Report agent',
    role: 'Drafts the structured, cited summary for the clinician.',
    tools: ['draft_report', 'render_pdf'],
    rules: 'Every clinical claim must map to a retrieved citation or it is dropped.',
  },
  {
    id: 'safety',
    icon: ShieldCheck,
    name: 'Safety guardrail',
    role: 'Screens inputs and outputs: PHI leakage, prompt injection, unsupported claims.',
    tools: ['pii_scan', 'injection_filter', 'faithfulness_check'],
    rules: 'Can veto any step. Every veto is written to the audit log.',
  },
  {
    id: 'critic',
    icon: Scale,
    name: 'Critic',
    role: 'Cross-checks the report against the heatmap and probabilities for contradictions.',
    tools: ['consistency_check'],
    rules: 'Flags disagreement (e.g. high confidence but diffuse heatmap) for priority review.',
  },
]

const TRACE = [
  ['supervisor', 'New case #1042 received → plan: image, retrieve, draft, verify'],
  ['imaging', 'CNN: Alzheimer’s 0.71, Normal 0.24, Tumor 0.05 · calibrated · uncertainty moderate'],
  ['safety', 'Input clean · no PHI in filename · OOD check passed'],
  ['retrieval', '4 passages retrieved from approved knowledge base · reranked · 3 kept'],
  ['report', 'Draft produced with 3 inline citations'],
  ['critic', 'Confidence below auto-accept threshold → priority human review'],
  ['supervisor', 'Awaiting clinician sign-off. Report NOT released.'],
]

export default function Agents() {
  const [active, setActive] = useState(AGENTS[0].id)
  const a = AGENTS.find((x) => x.id === active)

  return (
    <Section
      id="agents"
      eyebrow="Agentic AI"
      title="A team of agents, one human in charge"
      intro="Agents handle the repetitive work — retrieval, drafting, cross-checks — inside strict tool permissions. None of them can release a diagnosis."
    >
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        <div>
          <div role="tablist" aria-label="Agents" className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {AGENTS.map((x) => (
              <button
                key={x.id}
                role="tab"
                aria-selected={active === x.id}
                onClick={() => setActive(x.id)}
                className={`flex items-center gap-2 rounded-xl border px-3 py-3 text-left text-[13px] font-medium transition-colors ${
                  active === x.id
                    ? 'border-mint bg-mint/10 text-mint'
                    : 'border-white/10 text-white/70 hover:border-white/30'
                }`}
              >
                <x.icon className="h-4 w-4 shrink-0" />
                {x.name}
              </button>
            ))}
          </div>

          <GlassPanel className="mt-4">
            <h3 className="font-inter text-lg font-semibold">{a.name}</h3>
            <p className="mt-2 text-[13px] leading-relaxed text-white/70">{a.role}</p>
            <div className="mt-4 flex flex-wrap gap-2">
              {a.tools.map((t) => (
                <Tag key={t}>{t}()</Tag>
              ))}
            </div>
            <p className="mt-4 border-t border-white/10 pt-4 text-[12px] leading-relaxed text-white/60">
              <span className="font-semibold text-mint">Guardrail · </span>
              {a.rules}
            </p>
          </GlassPanel>
        </div>

        <GlassPanel>
          <div className="flex items-center justify-between">
            <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Illustrative agent trace</h3>
            <Tag>demo data</Tag>
          </div>
          <ol className="mt-5 space-y-3 font-mono text-[12px] leading-relaxed">
            {TRACE.map(([who, msg], i) => (
              <li key={i} className="flex gap-3">
                <span className={`w-20 shrink-0 ${who === 'safety' ? 'text-amber-300' : 'text-mint'}`}>{who}</span>
                <span className="text-white/70">{msg}</span>
              </li>
            ))}
          </ol>
        </GlassPanel>
      </div>
    </Section>
  )
}
