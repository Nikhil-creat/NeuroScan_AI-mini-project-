import { FileUp, Scissors, Binary, Database, Search, ArrowUpDown, MessageSquareQuote, CheckCheck } from 'lucide-react'
import { Section, GlassPanel, Reveal } from './ui.jsx'

const FLOW = [
  { icon: FileUp, t: 'Ingest', d: 'Admin uploads clinical PDFs (already in the Django dashboard).' },
  { icon: Scissors, t: 'Chunk', d: 'Section-aware splitting with source, page and version metadata.' },
  { icon: Binary, t: 'Embed', d: 'Sentence-transformer embeddings, run locally — no PHI leaves the host.' },
  { icon: Database, t: 'Index', d: 'pgvector or Qdrant with BM25 side-index for exact terms.' },
  { icon: Search, t: 'Hybrid retrieve', d: 'Dense + keyword search merged by reciprocal rank fusion.' },
  { icon: ArrowUpDown, t: 'Rerank', d: 'Cross-encoder keeps only the most relevant passages.' },
  { icon: MessageSquareQuote, t: 'Grounded answer', d: 'LLM answers only from retrieved passages, with inline citations.' },
  { icon: CheckCheck, t: 'Verify', d: 'Faithfulness check drops any sentence without evidence.' },
]

export default function Rag() {
  return (
    <Section
      id="rag"
      eyebrow="Retrieval-Augmented Generation"
      title="Knowledge you can cite"
      intro="The RAG layer turns the CNN’s label into context a clinician can verify. If nothing relevant is retrieved, the system says so instead of improvising."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FLOW.map((f, i) => (
          <Reveal key={f.t}>
            <GlassPanel className="h-full !p-5">
              <div className="flex items-center gap-3">
                <f.icon className="h-5 w-5 text-mint" strokeWidth={1.75} />
                <span className="font-mono text-[11px] text-white/40">STEP {i + 1}</span>
              </div>
              <h3 className="mt-3 font-inter text-base font-semibold">{f.t}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/65">{f.d}</p>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
