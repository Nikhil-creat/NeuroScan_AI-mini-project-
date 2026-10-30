import { useState } from 'react'
import { AlertTriangle, CheckCircle2, Clock } from 'lucide-react'
import { Tag } from './ui.jsx'

const STATUS = {
  pending_clinician_review: ['Awaiting clinician review', 'text-amber-300', Clock],
  abstained: ['Model abstained · priority review', 'text-amber-300', AlertTriangle],
  rejected_input: ['Image rejected (not a brain MRI slice?)', 'text-red-300', AlertTriangle],
  released: ['Reviewed by clinician', 'text-mint', CheckCircle2],
}

export default function CaseCard({ c, role, onReview, sample = false }) {
  const [verdict, setVerdict] = useState('confirm')
  const [finalLabel, setFinalLabel] = useState('')
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [label, tone, Icon] = STATUS[c.status] || [c.status, 'text-white', Clock]
  const pred = c.prediction

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      await onReview(c.id, { verdict, final_label: finalLabel || null, notes })
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className={`flex items-center gap-2 text-[13px] font-semibold ${tone}`}>
          <Icon className="h-4 w-4" /> {label}
        </div>
        <div className="flex gap-2">
          {sample && <Tag>sample data</Tag>}
          <Tag>case {c.id}</Tag>
          {c.priority === 'high' && <Tag>priority</Tag>}
        </div>
      </div>

      {role === 'patient' ? (
        <p className="mt-4 text-[13px] leading-relaxed text-white/70">
          {c.review
            ? `Your clinician’s verdict: ${c.review.verdict}${c.review.final_label ? ` — ${c.review.final_label}` : ''}. ${c.review.notes || ''}`
            : 'Your scan is with a clinician. AI output is not shown to patients until it has been reviewed.'}
        </p>
      ) : (
        <>
          {pred?.simulated && (
            <p className="mt-4 rounded-lg border border-amber-300/40 bg-amber-300/10 px-3 py-2 text-[12px] text-amber-200">
              SIMULATED output — no trained weights are loaded on this server. Not a real prediction.
            </p>
          )}

          <div className="mt-5 grid gap-5 md:grid-cols-[1fr_180px]">
            <div>
              <p className="font-mono text-[11px] uppercase text-white/45">Model output</p>
              <div className="mt-3 space-y-2.5">
                {Object.entries(pred.probs)
                  .sort((a, b) => b[1] - a[1])
                  .map(([k, v]) => (
                    <div key={k}>
                      <div className="flex justify-between text-[12.5px]">
                        <span>{k}</span>
                        <span className="font-mono text-white/60">{(v * 100).toFixed(1)}%</span>
                      </div>
                      <div className="mt-1 h-1.5 rounded-full bg-white/10">
                        <div className="h-1.5 rounded-full bg-mint" style={{ width: `${Math.max(2, v * 100)}%` }} />
                      </div>
                    </div>
                  ))}
              </div>
            </div>
            {c.heatmap_png_b64 ? (
              <img
                src={`data:image/png;base64,${c.heatmap_png_b64}`}
                alt="Grad-CAM heatmap overlay"
                className="h-[180px] w-[180px] rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-[180px] w-[180px] items-center justify-center rounded-xl border border-dashed border-white/20 p-3 text-center text-[11px] text-white/45">
                Grad-CAM appears here when real weights are loaded
              </div>
            )}
          </div>

          {c.flags?.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {c.flags.map((f) => (
                <span key={f} className="rounded-full bg-amber-300/10 px-2.5 py-1 font-mono text-[11px] text-amber-200">
                  {f}
                </span>
              ))}
            </div>
          )}

          {c.report && (
            <div className="mt-5 border-t border-white/10 pt-4">
              <p className="text-[13px] font-medium">{c.report.finding}</p>
              {c.report.evidence.map((e) => (
                <p key={e.cite} className="mt-2 text-[12.5px] leading-relaxed text-white/65">
                  <span className="font-mono text-mint">[{e.cite}]</span> {e.text}{' '}
                  <span className="font-mono text-white/35">({e.source})</span>
                </p>
              ))}
              {c.report.evidence_note && <p className="mt-2 text-[12.5px] italic text-white/55">{c.report.evidence_note}</p>}
              <p className="mt-3 text-[11px] text-white/40">{c.report.disclaimer}</p>
            </div>
          )}

          {c.trace && (
            <details className="mt-4 text-[12px] text-white/60">
              <summary className="cursor-pointer font-mono uppercase text-white/45">Agent trace</summary>
              <ol className="mt-2 space-y-1 font-mono">
                {c.trace.map((t, i) => (
                  <li key={i}>
                    <span className="text-mint">{t.agent}</span> {t.message}
                  </li>
                ))}
              </ol>
            </details>
          )}

          {role === 'clinician' && onReview && c.status !== 'released' && (
            <form onSubmit={submit} className="mt-5 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-2">
              <label className="text-[12px] text-white/60">
                Verdict
                <select
                  value={verdict}
                  onChange={(e) => setVerdict(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-[13px] text-white"
                >
                  <option value="confirm">Confirm model output</option>
                  <option value="override">Override with my label</option>
                  <option value="reject">Reject (unusable / not applicable)</option>
                </select>
              </label>
              <label className="text-[12px] text-white/60">
                Final label (if overriding)
                <select
                  value={finalLabel}
                  onChange={(e) => setFinalLabel(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-[13px] text-white"
                >
                  <option value="">—</option>
                  {Object.keys(pred.probs).map((k) => (
                    <option key={k}>{k}</option>
                  ))}
                </select>
              </label>
              <label className="text-[12px] text-white/60 sm:col-span-2">
                Notes
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  maxLength={2000}
                  rows={2}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-[13px] text-white"
                />
              </label>
              {err && <p className="text-[12px] text-red-300 sm:col-span-2">{err}</p>}
              <button
                disabled={busy}
                className="rounded-full bg-mint px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-ink disabled:opacity-50 sm:col-span-2 sm:w-fit"
              >
                {busy ? 'Saving…' : 'Sign off & release'}
              </button>
            </form>
          )}
          {c.review && role !== 'patient' && (
            <p className="mt-4 text-[12.5px] text-mint">
              Reviewed by {c.review.reviewer}: {c.review.verdict}
              {c.review.final_label ? ` → ${c.review.final_label}` : ''}
            </p>
          )}
        </>
      )}
    </div>
  )
}
