import { Section, GlassPanel, Reveal } from './ui.jsx'

// Every row points at something that exists in this repository.
const MATRIX = [
  {
    area: 'Deep learning & explainability',
    items: [
      ['Transfer learning (ResNet-18)', 'backend/ml/train.py'],
      ['Grad-CAM with tensor hooks', 'backend/app/inference.py'],
      ['Temperature-scaling calibration + ECE', 'ml/train.py · ml/metrics.py'],
      ['Class-weighted loss for imbalance', 'ml/train.py'],
    ],
  },
  {
    area: 'GenAI & agentic systems',
    items: [
      ['Multi-agent orchestration with human gate', 'app/agents.py'],
      ['Least-privilege tool allow-lists', 'app/agents.py · tests'],
      ['RAG: chunking, BM25, citations', 'app/rag.py'],
      ['Faithfulness check, extractive reports', 'app/guardrails.py'],
    ],
  },
  {
    area: 'Security engineering',
    items: [
      ['PBKDF2 hashing, JWT, RBAC', 'app/security.py'],
      ['Prompt-injection and PII guardrails', 'app/guardrails.py'],
      ['Hash-chained tamper-evident audit log', 'app/audit.py'],
      ['Rate limiting, CSP, upload sniffing', 'main.py · nginx.conf'],
    ],
  },
  {
    area: 'Backend & API design',
    items: [
      ['FastAPI + Pydantic validation', 'app/main.py'],
      ['Role-aware response shaping', 'case_view()'],
      ['SQLite data layer (Postgres next)', 'app/db.py'],
      ['OpenAPI docs at /api/docs', 'FastAPI'],
    ],
  },
  {
    area: 'DevOps & quality',
    items: [
      ['Multi-stage, non-root Docker images', 'Dockerfile · backend/Dockerfile'],
      ['docker compose with dropped capabilities', 'docker-compose.yml'],
      ['CI: tests gate the Pages deploy', '.github/workflows/pages.yml'],
      ['27 unit tests, no GPU needed', 'backend/tests'],
    ],
  },
  {
    area: 'Frontend engineering',
    items: [
      ['React 18 + Vite + Tailwind', 'src/'],
      ['HLS video, liquid-glass UI, a11y basics', 'Hero.jsx'],
      ['Config-driven content', 'src/config.js'],
      ['Static-sample fallback when no API', 'Console.jsx'],
    ],
  },
  {
    area: 'Data & evaluation',
    items: [
      ['Dependency-free metrics (F1, ECE)', 'ml/metrics.py'],
      ['Dataset-folder → class mapping', 'ml/labels.py'],
      ['Held-out test evaluation → site', 'ml/evaluate.py'],
      ['Leakage-aware protocol', 'Evaluation section'],
    ],
  },
  {
    area: 'Responsible AI',
    items: [
      ['Abstain on low confidence / non-MRI', 'agents.py · inference.py'],
      ['Model card with intended use', 'Model Card section'],
      ['Explicit limitations in the UI', 'Limitations section'],
      ['Simulated outputs always labelled', 'Console · CaseCard'],
    ],
  },
]

export default function Skills() {
  return (
    <Section
      id="skills"
      eyebrow="Skills in action"
      title="Every skill, traceable to code"
      intro="Not a keyword list: each row points to where the skill is used in this repository, so a reviewer can open the file and check."
    >
      <div className="grid gap-5 md:grid-cols-2">
        {MATRIX.map((g) => (
          <Reveal key={g.area}>
            <GlassPanel className="h-full">
              <h3 className="font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-mint">{g.area}</h3>
              <ul className="mt-4 divide-y divide-white/10">
                {g.items.map(([skill, where]) => (
                  <li key={skill} className="flex items-baseline justify-between gap-4 py-2.5">
                    <span className="text-[13px] text-white/85">{skill}</span>
                    <span className="shrink-0 text-right font-mono text-[10.5px] text-white/40">{where}</span>
                  </li>
                ))}
              </ul>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
