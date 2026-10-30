import { useState } from 'react'
import { Github, Linkedin, Mail, Send } from 'lucide-react'
import { SITE } from '../config.js'
import { Section, GlassPanel } from './ui.jsx'

export default function Contact() {
  const [f, setF] = useState({ name: '', email: '', message: '' })
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value })

  // Static site: the form opens the visitor's mail app (no server, no data stored).
  function submit(e) {
    e.preventDefault()
    const subject = encodeURIComponent(`NeuroScan AI — message from ${f.name}`)
    const body = encodeURIComponent(`${f.message}\n\n— ${f.name} (${f.email})`)
    window.location.href = `mailto:${SITE.links.email}?subject=${subject}&body=${body}`
  }

  const input = 'mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2.5 text-[14px] text-white'
  return (
    <Section
      id="contact"
      eyebrow="Contact"
      title="Let’s talk"
      intro="Feedback from clinicians, researchers, recruiters and fellow students is welcome."
    >
      <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
        <GlassPanel>
          <form onSubmit={submit} className="grid gap-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="text-[12px] text-white/60">
                Name
                <input className={input} value={f.name} onChange={set('name')} required maxLength={80} />
              </label>
              <label className="text-[12px] text-white/60">
                Email
                <input type="email" className={input} value={f.email} onChange={set('email')} required maxLength={120} />
              </label>
            </div>
            <label className="text-[12px] text-white/60">
              Message
              <textarea className={input} rows={4} value={f.message} onChange={set('message')} required maxLength={2000} />
            </label>
            <button className="inline-flex w-fit items-center gap-2 rounded-full bg-mint px-6 py-3 text-xs font-bold uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]">
              Send <Send className="h-3.5 w-3.5" />
            </button>
          </form>
        </GlassPanel>

        <GlassPanel>
          <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Find me</h3>
          <ul className="mt-5 space-y-4 text-[14px]">
            {[
              [Github, 'GitHub', SITE.links.github],
              [Linkedin, 'LinkedIn', SITE.links.linkedin],
              [Mail, SITE.links.email, `mailto:${SITE.links.email}`],
            ].map(([Icon, label, href]) => (
              <li key={label}>
                <a href={href} target={href.startsWith('http') ? '_blank' : undefined} rel="noreferrer" className="flex items-center gap-3 text-white/80 transition-colors hover:text-mint">
                  <Icon className="h-5 w-5" strokeWidth={1.75} /> {label}
                </a>
              </li>
            ))}
          </ul>
          <p className="mt-6 border-t border-white/10 pt-4 text-[12px] text-white/50">{SITE.college}, {SITE.location}</p>
        </GlassPanel>
      </div>
    </Section>
  )
}
