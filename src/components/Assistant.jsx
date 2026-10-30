import { useEffect, useRef, useState } from 'react'
import { Bot, X, Send, KeyRound, Loader2 } from 'lucide-react'
import { ask, byok, mode } from '../assistantApi.js'

const SUGGEST = ['What is NeuroScan AI?', 'How does RAG work here?', 'How is it secured?', 'What are the limitations?']
const LABEL = { proxy: 'AI: Groq + Gemini', byok: 'AI: your Groq key', offline: 'Offline: project notes' }

export default function Assistant() {
  const [open, setOpen] = useState(false)
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: 'Hi! Ask me anything about NeuroScan AI: the CNN, Grad-CAM, RAG, agents, security, Docker or deployment. I am not a doctor and cannot give medical advice.' }])
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const [m, setM] = useState(mode())
  const [keyOpen, setKeyOpen] = useState(false)
  const [key, setKey] = useState('')
  const end = useRef(null)

  useEffect(() => { end.current?.scrollIntoView?.({ block: 'end' }) }, [msgs, open])
  useEffect(() => {
    if (!open) return
    const f = (e) => e.key === 'Escape' && setOpen(false)
    window.addEventListener('keydown', f)
    return () => window.removeEventListener('keydown', f)
  }, [open])

  async function send(q) {
    const msg = (q ?? text).trim()
    if (!msg || busy) return
    setText('')
    const history = msgs.filter((x, i) => i > 0)
    setMsgs((p) => [...p, { role: 'user', content: msg }])
    setBusy(true)
    const r = await ask(msg, history)
    setMsgs((p) => [...p, { role: 'assistant', content: r.answer, meta: r.sources?.length ? `Sources: ${r.sources.join(', ')}` : r.provider }])
    setBusy(false)
  }

  function saveKey() {
    byok.set(key.trim())
    setKey('')
    setKeyOpen(false)
    setM(mode())
  }

  return (
    <>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close assistant' : 'Open AI assistant'}
        aria-expanded={open}
        className="fixed bottom-5 right-5 z-[55] flex h-14 w-14 items-center justify-center rounded-full bg-mint text-ink shadow-[0_0_30px_rgba(94,210,156,0.45)] transition-transform hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <Bot className="h-6 w-6" />}
      </button>

      {open && (
        <div role="dialog" aria-label="NeuroScan AI assistant" className="liquid-glass fixed bottom-24 right-3 z-[55] flex h-[min(560px,75vh)] w-[min(380px,calc(100vw-1.5rem))] flex-col overflow-hidden rounded-2xl border border-white/10 bg-ink/90 backdrop-blur-xl">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="font-inter text-[13px] font-bold">NeuroScan Assistant</p>
              <p className="font-mono text-[10px] text-mint">{LABEL[m]}</p>
            </div>
            {m !== 'proxy' && (
              <button onClick={() => setKeyOpen((k) => !k)} className="rounded-full border border-white/15 p-2 text-white/70 hover:border-mint hover:text-mint" aria-label="Use your own Groq key">
                <KeyRound className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {keyOpen && (
            <div className="border-b border-white/10 bg-white/[0.03] p-3 text-[11px] text-white/65">
              Optional: paste your own free Groq key (console.groq.com). It stays in this tab only (sessionStorage) and goes straight to Groq, never to this site.
              <div className="mt-2 flex gap-2">
                <input type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} placeholder="gsk_..." className="min-w-0 flex-1 rounded-lg border border-white/15 bg-black/40 px-3 py-2 font-mono text-[12px] outline-none focus:border-mint" />
                <button onClick={saveKey} className="rounded-lg bg-mint px-3 text-[12px] font-bold text-ink">Save</button>
              </div>
              {byok.get() && <button onClick={() => { byok.set(''); setM(mode()) }} className="mt-2 underline">Remove key</button>}
            </div>
          )}

          <div className="flex-1 space-y-3 overflow-y-auto p-4" aria-live="polite">
            {msgs.map((x, i) => (
              <div key={i} className={x.role === 'user' ? 'flex justify-end' : 'flex'}>
                <div className={`max-w-[88%] whitespace-pre-wrap rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed ${x.role === 'user' ? 'bg-mint text-ink' : 'bg-white/[0.06] text-white/90'}`}>
                  {x.content}
                  {x.meta && <p className="mt-1.5 font-mono text-[10px] text-white/45">{x.meta}</p>}
                </div>
              </div>
            ))}
            {busy && <Loader2 className="h-4 w-4 animate-spin text-mint" />}
            {msgs.length === 1 && (
              <div className="flex flex-wrap gap-2">
                {SUGGEST.map((s) => (
                  <button key={s} onClick={() => send(s)} className="rounded-full border border-white/15 px-3 py-1.5 text-[11px] text-white/75 hover:border-mint hover:text-mint">{s}</button>
                ))}
              </div>
            )}
            <div ref={end} />
          </div>

          <form onSubmit={(e) => { e.preventDefault(); send() }} className="flex gap-2 border-t border-white/10 p-3">
            <input value={text} onChange={(e) => setText(e.target.value)} maxLength={1000} placeholder="Ask about the project..." aria-label="Your question" className="min-w-0 flex-1 rounded-full border border-white/15 bg-black/40 px-4 py-2.5 text-[13px] outline-none focus:border-mint" />
            <button type="submit" disabled={busy || !text.trim()} aria-label="Send" className="flex h-10 w-10 items-center justify-center rounded-full bg-mint text-ink disabled:opacity-40"><Send className="h-4 w-4" /></button>
          </form>
          <p className="px-4 pb-2 text-center text-[10px] text-white/40">AI can be wrong. Not medical advice.</p>
        </div>
      )}
    </>
  )
}
