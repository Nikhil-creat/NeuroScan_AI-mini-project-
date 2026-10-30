import { useEffect, useState } from 'react'
import { Upload, ShieldCheck, Cpu, Flame, BookOpen, UserCheck, FileText, Pause, Play } from 'lucide-react'
import { usePrefersReducedMotion } from '../lib/hooks.js'
import { GlassPanel } from './ui.jsx'

const STEPS = [
  { icon: Upload, t: 'Upload', d: 'PNG/JPEG, magic-byte checked, 8 MB cap' },
  { icon: ShieldCheck, t: 'Guardrails', d: 'Non-MRI / OOD gate, PII and injection filters' },
  { icon: Cpu, t: 'CNN', d: 'ResNet-18 with temperature-scaled confidence' },
  { icon: Flame, t: 'Grad-CAM', d: 'Heat map checked for focal vs diffuse' },
  { icon: BookOpen, t: 'RAG', d: 'BM25 passages with citations, extractive only' },
  { icon: UserCheck, t: 'Clinician', d: 'Mandatory human sign-off' },
  { icon: FileText, t: 'Report', d: 'Released only after review' },
]

export default function PipelineFlow() {
  const reduced = usePrefersReducedMotion()
  const [i, setI] = useState(0)
  const [playing, setPlaying] = useState(!reduced)

  useEffect(() => {
    if (!playing) return
    const id = setInterval(() => setI((x) => (x + 1) % STEPS.length), 1400)
    return () => clearInterval(id)
  }, [playing])

  return (
    <GlassPanel>
      <div className="flex items-center justify-between gap-3">
        <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Live pipeline walkthrough</h3>
        <button
          onClick={() => setPlaying((p) => !p)}
          aria-pressed={playing}
          className="inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-2 font-inter text-[12px] font-semibold text-white/80 hover:border-white/40"
        >
          {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
          {playing ? 'Pause' : 'Play'}
        </button>
      </div>
      <ol className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-7">
        {STEPS.map((s, n) => {
          const Icon = s.icon
          const on = n === i
          const done = n < i
          return (
            <li key={s.t}>
              <button
                onClick={() => { setI(n); setPlaying(false) }}
                aria-current={on ? 'step' : undefined}
                className={`h-full w-full rounded-xl border p-3 text-left transition-all duration-500 ${
                  on ? 'border-mint bg-mint/10 shadow-[0_0_24px_rgba(94,210,156,0.25)]' : done ? 'border-mint/30' : 'border-white/10'
                }`}
              >
                <Icon className={`h-5 w-5 ${on || done ? 'text-mint' : 'text-white/50'}`} strokeWidth={1.75} />
                <p className="mt-2 font-inter text-[13px] font-semibold">{n + 1}. {s.t}</p>
                <p className="mt-1 text-[11px] leading-snug text-white/60">{s.d}</p>
              </button>
            </li>
          )
        })}
      </ol>
      <div className="mt-4 h-1 overflow-hidden rounded-full bg-white/10">
        <div className="h-full bg-mint transition-all duration-700" style={{ width: `${((i + 1) / STEPS.length) * 100}%` }} />
      </div>
    </GlassPanel>
  )
}
