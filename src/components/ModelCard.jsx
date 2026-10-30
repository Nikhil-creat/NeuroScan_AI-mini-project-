import { Section, GlassPanel, Reveal } from './ui.jsx'

const CARD = [
  ['Model', 'ResNet-18 (torchvision) fine-tuned for 3 classes: Alzheimer’s Disease, Brain Tumor, Normal Anatomy.'],
  ['Intended use', 'Education and research demonstration of explainable decision support, reviewed by a clinician.'],
  ['Out of scope', 'Diagnosis, triage of real patients, other pathologies, 3D volumes, paediatric scans, non-brain images.'],
  ['Input', '2D MRI slices, PNG or JPEG, resized to 224×224. Non-grayscale or blank images are rejected.'],
  ['Training data', 'Public brain-MRI datasets (record names, versions and licences here after training). Class counts are logged by the training script.'],
  ['Evaluation', 'Held-out test split with per-class precision/recall/F1, confusion matrix and calibration error (see Evaluation).'],
  ['Explainability', 'Grad-CAM on the last convolutional block. A visual aid, not proof of causality.'],
  ['Known risks', 'Dataset bias, scanner/site shift, slice-level leakage if patient IDs are unavailable, over-trust in confident outputs.'],
  ['Human oversight', 'Mandatory. No result is released without an authenticated clinician’s sign-off, recorded in the audit log.'],
  ['Maintenance', 'Re-evaluate after any retraining; keep the model card, metrics and calibration file versioned together.'],
]

export default function ModelCard() {
  return (
    <Section
      id="model-card"
      eyebrow="Responsible AI"
      title="Model card"
      intro="A short, standard-style disclosure of what the model is for, what it isn’t, and how it should be checked."
    >
      <Reveal>
        <GlassPanel>
          <dl className="divide-y divide-white/10">
            {CARD.map(([k, v]) => (
              <div key={k} className="grid gap-1 py-3.5 sm:grid-cols-[170px_1fr] sm:gap-6">
                <dt className="font-mono text-[11px] uppercase tracking-wider text-mint">{k}</dt>
                <dd className="text-[13px] leading-relaxed text-white/75">{v}</dd>
              </div>
            ))}
          </dl>
        </GlassPanel>
      </Reveal>
    </Section>
  )
}
