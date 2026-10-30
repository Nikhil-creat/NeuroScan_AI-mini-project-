import { Section, GlassPanel, Reveal, Tag } from './ui.jsx'

const STACK = [
  ['Frontend', ['React 18', 'Vite', 'Tailwind CSS', 'hls.js', 'lucide-react']],
  ['Backend', ['FastAPI', 'Pydantic', 'SQLite → PostgreSQL', 'PyJWT', 'Uvicorn']],
  ['AI / ML', ['PyTorch', 'ResNet-18 (transfer learning)', 'Grad-CAM', 'Temperature scaling']],
  ['RAG & agents', ['BM25 retrieval', 'pypdf ingestion', 'Tool allow-lists', 'Faithfulness check']],
  ['Security', ['RBAC', 'PBKDF2-SHA256', 'Hash-chained audit log', 'Rate limiting', 'CSP headers']],
  ['DevOps', ['Docker', 'docker compose', 'nginx (non-root)', 'GitHub Actions', 'GitHub Pages']],
]

export default function TechStack() {
  return (
    <Section id="stack" eyebrow="Tech stack" title="Tools, chosen deliberately">
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {STACK.map(([group, items]) => (
          <Reveal key={group}>
            <GlassPanel className="h-full">
              <h3 className="font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-mint">{group}</h3>
              <div className="mt-4 flex flex-wrap gap-2">
                {items.map((i) => (
                  <Tag key={i}>{i}</Tag>
                ))}
              </div>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
