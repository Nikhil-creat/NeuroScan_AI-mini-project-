import { KeyRound, Lock, EyeOff, ScrollText, Gauge, Bug, FileWarning, Users } from 'lucide-react'
import { Section, GlassPanel, Reveal } from './ui.jsx'

const ITEMS = [
  { icon: Users, t: 'Role-based access', d: 'Patient, clinician and admin roles with least privilege. Patients see only their own cases.' },
  { icon: KeyRound, t: 'Strong authentication', d: 'Hashed passwords (Argon2/PBKDF2), short-lived JWT or secure sessions, optional TOTP multi-factor.' },
  { icon: Lock, t: 'Encryption', d: 'TLS in transit; encrypted volumes and field-level encryption for stored scans and reports.' },
  { icon: EyeOff, t: 'PHI minimisation', d: 'DICOM header and EXIF scrubbing, pseudonymous case IDs, no patient identifiers sent to any external API.' },
  { icon: ScrollText, t: 'Tamper-evident audit log', d: 'Every view, prediction, agent step and sign-off is recorded in an append-only, hash-chained log.' },
  { icon: Gauge, t: 'Abuse controls', d: 'Rate limiting, upload quotas, CSRF protection, strict CORS and security headers (CSP, HSTS).' },
  { icon: Bug, t: 'LLM-specific defences', d: 'Prompt-injection filtering on retrieved text, output schema validation, tool allow-lists per agent.' },
  { icon: FileWarning, t: 'Supply-chain hygiene', d: 'Pinned dependencies, image scanning (Trivy), secret scanning, non-root containers.' },
]

export default function Security() {
  return (
    <Section
      id="security"
      eyebrow="Security & privacy"
      title="Built as if the data were real"
      intro="Medical images are sensitive. These controls follow the principles of India’s DPDP Act 2023 and HIPAA-style safeguards; they are a design baseline, not a compliance certificate."
    >
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {ITEMS.map((s) => (
          <Reveal key={s.t}>
            <GlassPanel className="h-full !p-5">
              <s.icon className="h-5 w-5 text-mint" strokeWidth={1.75} />
              <h3 className="mt-4 font-inter text-base font-semibold">{s.t}</h3>
              <p className="mt-1.5 text-[12.5px] leading-relaxed text-white/65">{s.d}</p>
            </GlassPanel>
          </Reveal>
        ))}
      </div>
    </Section>
  )
}
