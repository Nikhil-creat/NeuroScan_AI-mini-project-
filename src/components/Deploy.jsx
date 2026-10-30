import { Section, GlassPanel, Tag } from './ui.jsx'

const SERVICES = [
  ['web', 'Built · React + Tailwind UI served by nginx, proxies /api'],
  ['api', 'Built · FastAPI: auth, RBAC, upload, audit log'],
  ['inference', 'Built · ResNet-18 + Grad-CAM inside the API (weights you train)'],
  ['agents', 'Built · orchestrator with tool allow-lists and human gate'],
  ['rag', 'Built · BM25 retriever; upgrade path: pgvector / Qdrant'],
  ['db', 'Built on SQLite · planned: PostgreSQL'],
  ['queue', 'Planned · Redis + Celery for async inference'],
  ['observability', 'Planned · Prometheus + Grafana'],
]

const COMPOSE = `services:
  web:                      # React build + nginx (non-root)
    build: .
    ports: ["8080:8080"]
    read_only: true
    cap_drop: [ALL]
    security_opt: ["no-new-privileges:true"]

  api:                      # FastAPI: auth, CNN, agents, RAG
    build: ./backend
    # no published ports: only nginx can reach it
    volumes:
      - api-data:/srv/data
      - ./backend/models:/srv/models:ro
    cap_drop: [ALL]

  # next: postgres, redis + worker, qdrant, grafana`

export default function Deploy() {
  return (
    <Section
      id="deploy"
      eyebrow="Docker & architecture"
      title="One command, isolated services"
      intro="Each concern runs in its own container on a private network. Only the web tier is exposed; the model, agents and databases are not reachable from outside."
    >
      <div className="grid gap-6 lg:grid-cols-2">
        <GlassPanel>
          <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Service map</h3>
          <ul className="mt-5 divide-y divide-white/10">
            {SERVICES.map(([n, d]) => (
              <li key={n} className="flex items-baseline gap-4 py-3">
                <span className="w-28 shrink-0 font-mono text-[12px] text-mint">{n}</span>
                <span className="text-[13px] text-white/70">{d}</span>
              </li>
            ))}
          </ul>
        </GlassPanel>

        <GlassPanel>
          <div className="flex items-center justify-between">
            <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">docker-compose.yml</h3>
            <Tag>hardened</Tag>
          </div>
          <pre className="mt-5 overflow-x-auto font-mono text-[11.5px] leading-relaxed text-white/75">{COMPOSE}</pre>
          <p className="mt-4 border-t border-white/10 pt-4 font-mono text-[12px] text-white/60">
            $ docker compose up --build
          </p>
        </GlassPanel>
      </div>
    </Section>
  )
}
