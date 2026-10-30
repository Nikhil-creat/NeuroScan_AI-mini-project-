import { Section } from './ui.jsx'

const FAQ = [
  ['Can this diagnose a patient?', 'No. It is an academic research prototype. Outputs are decision support for a qualified clinician and must never replace clinical judgement.'],
  ['Why does the system sometimes refuse to answer?', 'Below the confidence threshold, or when an image doesn’t look like a brain MRI slice, it abstains and flags the case for priority human review instead of guessing.'],
  ['Where does the retrieved knowledge come from?', 'Only documents an administrator has uploaded to the approved knowledge base. If nothing relevant is found, the report says so rather than inventing content.'],
  ['What stops an AI agent from releasing a result?', 'Agents have fixed tool allow-lists and no release tool. Only an authenticated clinician can sign off, and every step is written to a tamper-evident audit log.'],
  ['Is patient data safe?', 'The design minimises data (no filenames stored, PII redacted from notes) and uses role-based access, hashed passwords and signed tokens. It has not been through a formal security audit or regulatory review.'],
  ['Why is the live console showing a sample?', 'GitHub Pages hosts static files only. The console becomes live when the FastAPI backend is running and the site is built with VITE_API_URL.'],
]

export default function Faq() {
  return (
    <Section id="faq" eyebrow="FAQ" title="Questions people ask">
      <div className="mx-auto max-w-3xl divide-y divide-white/10 rounded-2xl border border-white/10">
        {FAQ.map(([q, a]) => (
          <details key={q} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-inter text-[15px] font-semibold">
              {q}
              <span className="ml-4 text-mint transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 text-[13px] leading-relaxed text-white/65">{a}</p>
          </details>
        ))}
      </div>
    </Section>
  )
}
