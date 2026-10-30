import { useCallback, useEffect, useState } from 'react'
import { LogOut, Upload } from 'lucide-react'
import { api, session } from '../api.js'
import { SITE } from '../config.js'
import { Section, GlassPanel } from './ui.jsx'
import CaseCard from './CaseCard.jsx'

// Illustrative only — shown when no backend is connected (e.g. on GitHub Pages).
const SAMPLE = {
  id: 'sample',
  status: 'pending_clinician_review',
  priority: 'high',
  prediction: {
    label: 'Alzheimer’s Disease',
    confidence: 0.71,
    probs: { 'Alzheimer’s Disease': 0.71, 'Normal Anatomy': 0.24, 'Brain Tumor': 0.05 },
    simulated: true,
  },
  flags: ['narrow_margin_between_top_classes'],
  report: {
    finding: 'Model output: Alzheimer’s Disease (calibrated confidence 71%).',
    evidence: [],
    evidence_note: 'No supporting passages found in the approved knowledge base.',
    disclaimer: 'AI-generated decision support for a qualified clinician. Not a diagnosis.',
  },
  trace: [
    { agent: 'imaging', message: 'Alzheimer’s Disease at 0.71' },
    { agent: 'retrieval', message: '0 passage(s) kept, 0 sanitised' },
    { agent: 'critic', message: 'flags: narrow_margin_between_top_classes' },
    { agent: 'supervisor', message: 'pending_clinician_review; priority=high; NOT released' },
  ],
  heatmap_png_b64: null,
}

function AuthForm({ onAuthed }) {
  const [mode, setMode] = useState('login')
  const [u, setU] = useState('')
  const [p, setP] = useState('')
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)

  async function submit(e) {
    e.preventDefault()
    setBusy(true)
    setErr('')
    try {
      if (mode === 'register') await api.register(u, p)
      const r = await api.login(u, p)
      onAuthed({ token: r.access_token, role: r.role, username: u })
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  const input = 'mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2.5 text-[14px] text-white'
  return (
    <form onSubmit={submit} className="mx-auto max-w-sm space-y-4">
      <label className="block text-[12px] text-white/60">
        Username
        <input className={input} value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" required minLength={3} />
      </label>
      <label className="block text-[12px] text-white/60">
        Password
        <input
          type="password"
          className={input}
          value={p}
          onChange={(e) => setP(e.target.value)}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          required
        />
      </label>
      {mode === 'register' && (
        <p className="text-[11px] text-white/45">At least 10 characters with upper and lower case letters and a digit. New accounts are patients.</p>
      )}
      {err && <p className="text-[12px] text-red-300">{err}</p>}
      <button disabled={busy} className="w-full rounded-full bg-mint px-5 py-3 text-xs font-bold uppercase tracking-wide text-ink disabled:opacity-50">
        {busy ? 'Please wait…' : mode === 'login' ? 'Sign in' : 'Create account'}
      </button>
      <button type="button" onClick={() => setMode(mode === 'login' ? 'register' : 'login')} className="w-full text-center text-[12px] text-white/60 hover:text-mint">
        {mode === 'login' ? 'New here? Create a patient account' : 'Have an account? Sign in'}
      </button>
    </form>
  )
}

function Workspace({ auth, onLogout }) {
  const [cases, setCases] = useState([])
  const [file, setFile] = useState(null)
  const [notes, setNotes] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

  const load = useCallback(async () => {
    try {
      setCases(await api.cases(auth.token))
    } catch (ex) {
      if (/token|authenticated/i.test(ex.message)) onLogout()
      else setErr(ex.message)
    }
  }, [auth.token, onLogout])

  useEffect(() => {
    load()
  }, [load])

  async function upload(e) {
    e.preventDefault()
    if (!file) return
    setBusy(true)
    setErr('')
    try {
      await api.upload(auth.token, file, notes)
      setFile(null)
      setNotes('')
      await load()
    } catch (ex) {
      setErr(ex.message)
    } finally {
      setBusy(false)
    }
  }

  async function review(id, payload) {
    await api.review(auth.token, id, payload)
    await load()
  }

  return (
    <div>
      <div className="flex items-center justify-between">
        <p className="text-[13px] text-white/70">
          Signed in as <span className="font-semibold text-white">{auth.username}</span> · <span className="font-mono text-mint">{auth.role}</span>
        </p>
        <button onClick={onLogout} className="flex items-center gap-1.5 text-[12px] text-white/60 hover:text-mint">
          <LogOut className="h-4 w-4" /> Sign out
        </button>
      </div>

      {auth.role !== 'admin' && (
        <form onSubmit={upload} className="mt-5 grid gap-3 rounded-2xl border border-dashed border-white/20 p-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="text-[12px] text-white/60">
            Brain MRI slice (PNG or JPEG, max 8 MB)
            <input
              type="file"
              accept="image/png,image/jpeg"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="mt-1 block w-full text-[12px] text-white/70 file:mr-3 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-white"
            />
          </label>
          <label className="text-[12px] text-white/60">
            Notes (no personal identifiers)
            <input
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={1000}
              className="mt-1 w-full rounded-lg border border-white/15 bg-ink px-3 py-2 text-[13px] text-white"
            />
          </label>
          <button disabled={!file || busy} className="flex items-center justify-center gap-2 rounded-full bg-mint px-5 py-2.5 text-xs font-bold uppercase tracking-wide text-ink disabled:opacity-40">
            <Upload className="h-4 w-4" /> {busy ? 'Analysing…' : 'Analyse'}
          </button>
        </form>
      )}
      {err && <p className="mt-3 text-[12px] text-red-300">{err}</p>}

      <div className="mt-6 space-y-4">
        {cases.length === 0 && <p className="text-[13px] text-white/50">No cases yet.</p>}
        {cases.map((c) => (
          <CaseCard key={c.id} c={c} role={auth.role} onReview={auth.role === 'clinician' ? review : undefined} />
        ))}
      </div>
    </div>
  )
}

export default function Console() {
  const [auth, setAuth] = useState(() => session.get())
  const [health, setHealth] = useState(null)

  useEffect(() => {
    if (SITE.apiEnabled) api.health().then(setHealth).catch(() => setHealth({ status: 'unreachable' }))
  }, [])

  const logout = useCallback(() => {
    session.clear()
    setAuth(null)
  }, [])

  const authed = (a) => {
    session.set(a)
    setAuth(a)
  }

  return (
    <Section
      id="console"
      eyebrow="Live console"
      title="Upload. Inspect. Sign off"
      intro="Patients upload scans; clinicians see the AI’s work — probabilities, heatmap, citations, agent trace — and release the final verdict."
    >
      <GlassPanel>
        {!SITE.apiEnabled ? (
          <div>
            <p className="mb-5 rounded-lg border border-white/15 bg-white/[0.03] px-4 py-3 text-[12.5px] leading-relaxed text-white/70">
              Backend not connected, so this page shows a <b>static sample</b>. Run the API and build with{' '}
              <code className="font-mono text-mint">VITE_API_URL</code> to use the live console (see README).
            </p>
            <CaseCard c={SAMPLE} role="clinician" sample />
          </div>
        ) : health?.status === 'unreachable' ? (
          <p className="text-[13px] text-amber-200">The API ({SITE.apiUrl || 'same origin'}) is not reachable right now.</p>
        ) : auth ? (
          <Workspace auth={auth} onLogout={logout} />
        ) : (
          <>
            {health?.model_mode && health.model_mode !== 'model' && (
              <p className="mb-5 rounded-lg border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-[12.5px] text-amber-200">
                Server mode: <b>{health.model_mode}</b>
                {health.model_mode === 'demo' ? ' — outputs are simulated, not real predictions.' : ' — no model is loaded, uploads will be refused.'}
              </p>
            )}
            <AuthForm onAuthed={authed} />
          </>
        )}
      </GlassPanel>
    </Section>
  )
}
