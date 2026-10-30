import { AlertTriangle } from 'lucide-react'
import { Section, GlassPanel, Reveal } from './ui.jsx'

const LIMITS = [
  ['Not a medical device', 'NeuroScan AI is an academic research prototype. It must not be used for real diagnosis or treatment decisions.'],
  ['Dataset bias', 'Public MRI datasets are small, curated and demographically narrow. Performance on other scanners or populations is unproven.'],
  ['2D slices, three classes', 'The model sees single slices and only three labels. It cannot recognise other pathologies and will be wrong on them — hence the out-of-distribution gate.'],
  ['Heatmaps are not proof', 'Grad-CAM shows where the network looked, not why a disease exists. A plausible heatmap can still accompany a wrong prediction.'],
  ['LLM hallucination risk', 'RAG reduces but does not remove it. Citations and a faithfulness check are mitigations; clinician review remains mandatory.'],
  ['Regulatory gap', 'Clinical use would need prospective validation, ethics approval and regulatory clearance (e.g. CDSCO in India).'],
]

export default function Limits() {
  return (
    <Section
      id="limits"
      eyebrow="Limitations & safeguards"
      title="What it can’t do — stated plainly"
      intro="Trust comes from naming the boundaries. These limits are surfaced in the product, not buried in a footnote."
    >
      <div className="grid gap-4 md:grid-cols-2">
        {LIMITS.map(([t, d]) => (
          <Reveal key={t}>
            <GlassPanel className="flex h-full gap-4 !p-5">
              <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-300" strokeWidth={1.75} />
              <div>
                <h3 className="font-inter text-base font-semibold">{t}</h3>
                <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/65">{d}</p>
              </div>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
