import { UploadCloud, ScanLine, Layers, Flame, Gauge, Bot, FileText } from 'lucide-react'
import { Section, GlassPanel, Reveal, Tag } from './ui.jsx'

const STEPS = [
  {
    icon: UploadCloud,
    title: 'Secure intake',
    body: 'Validated upload of PNG/JPG, DICOM or NIfTI. Magic-byte checks, size caps, EXIF/DICOM tag scrubbing and virus scan before anything reaches the model.',
    tags: ['DICOM', 'NIfTI', 'ClamAV'],
  },
  {
    icon: ScanLine,
    title: 'Preprocessing',
    body: 'Intensity normalisation, resizing, optional skull-stripping and out-of-distribution screening so non-brain or low-quality images are rejected, not guessed at.',
    tags: ['OpenCV', 'nibabel', 'OOD gate'],
  },
  {
    icon: Layers,
    title: 'CNN classifier',
    body: 'Transfer-learned CNN (ResNet / EfficientNet family) with three classes: Brain Tumor, Alzheimer’s Disease, Normal Anatomy. Class-weighted loss and augmentation for imbalance.',
    tags: ['PyTorch / TF', '3-class', 'ONNX export'],
  },
  {
    icon: Flame,
    title: 'Explainability',
    body: 'Grad-CAM / Grad-CAM++ heatmaps overlaid on the scan so a clinician can check whether the model looked at clinically plausible regions.',
    tags: ['Grad-CAM++', 'Overlay'],
  },
  {
    icon: Gauge,
    title: 'Calibrated confidence',
    body: 'Temperature-scaled probabilities and MC-dropout uncertainty. Low-confidence or disagreeing cases are abstained and flagged for priority human review.',
    tags: ['Calibration', 'Abstain'],
  },
  {
    icon: Bot,
    title: 'Agentic review',
    body: 'A supervisor agent coordinates imaging, retrieval, report and safety agents with a hard human-in-the-loop gate before anything is released.',
    tags: ['LangGraph-style', 'HITL'],
  },
  {
    icon: FileText,
    title: 'Cited report',
    body: 'Structured report: prediction, heatmap, uncertainty, retrieved guideline excerpts with citations, and the clinician’s verdict. Exportable to PDF.',
    tags: ['PDF', 'Citations'],
  },
]

export default function Platform() {
  return (
    <Section
      id="platform"
      eyebrow="End-to-end pipeline"
      title="From raw MRI to a reviewed report"
      intro="The original Django portal already handles upload, CNN prediction, Grad-CAM and an admin review queue. This version hardens each stage and adds uncertainty handling, agents and containerised delivery."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <Reveal key={s.title}>
            <GlassPanel className="h-full">
              <div className="flex items-center justify-between">
                <s.icon className="h-6 w-6 text-mint" strokeWidth={1.75} />
                <span className="font-mono text-xs text-white/40">0{i + 1}</span>
              </div>
              <h3 className="mt-5 font-inter text-lg font-semibold">{s.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/65">{s.body}</p>
              <div className="mt-4 flex flex-wrap gap-2">
                {s.tags.map((t) => (
                  <Tag key={t}>{t}</Tag>
                ))}
              </div>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
