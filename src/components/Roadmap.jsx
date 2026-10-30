import { Section, GlassPanel, Reveal } from './ui.jsx'

const PHASES = [
  {
    tag: 'Done',
    title: 'v1 · Django mini project',
    items: ['CNN 3-class classifier', 'Grad-CAM overlays', 'Patient / admin portals', 'PDF knowledge ingestion for RAG'],
  },
  {
    tag: 'Done',
    title: 'v2 · Platform',
    items: ['FastAPI + RBAC + audit log', 'Agent orchestrator with human gate', 'Training & evaluation pipeline', 'Docker, CI and Pages deploy'],
  },
  {
    tag: 'Next',
    title: 'v3 · Quality & scale',
    items: ['Train, evaluate, publish real metrics', 'Embeddings + reranker for RAG', 'PostgreSQL, Redis queue', 'Prometheus / Grafana, Trivy in CI'],
  },
  {
    tag: 'Later',
    title: 'v4 · Research',
    items: ['ConvNeXt / ViT comparison', 'MC-dropout uncertainty', '3D volumetric (NIfTI) models', 'Federated learning, multi-site validation'],
  },
]

export default function Roadmap() {
  return (
    <Section id="roadmap" eyebrow="Roadmap" title="Where this goes next">
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {PHASES.map((p) => (
          <Reveal key={p.title}>
            <GlassPanel className="h-full">
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[11px] ${
                  p.tag === 'Done' ? 'bg-mint text-ink' : 'border border-white/20 text-white/70'
                }`}
              >
                {p.tag}
              </span>
              <h3 className="mt-4 font-inter text-base font-semibold">{p.title}</h3>
              <ul className="mt-3 space-y-1.5 text-[12.5px] text-white/65">
                {p.items.map((i) => (
                  <li key={i}>— {i}</li>
                ))}
              </ul>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
