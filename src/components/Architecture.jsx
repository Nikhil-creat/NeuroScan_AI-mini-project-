import { Section, Reveal } from './ui.jsx'

// Inline SVG: scales with the container, uses currentColor-friendly strokes for the dark theme.
function Box({ x, y, w = 150, h = 46, label, sub, accent }) {
  return (
    <g>
      <rect x={x} y={y} width={w} height={h} rx="10" fill={accent ? 'rgba(94,210,156,0.10)' : 'rgba(255,255,255,0.03)'} stroke={accent ? '#5ed29c' : 'rgba(255,255,255,0.22)'} />
      <text x={x + w / 2} y={y + (sub ? 20 : 28)} textAnchor="middle" fill="#fff" fontSize="12.5" fontWeight="600" fontFamily="Inter, sans-serif">{label}</text>
      {sub && (
        <text x={x + w / 2} y={y + 36} textAnchor="middle" fill="rgba(255,255,255,0.55)" fontSize="10" fontFamily="ui-monospace, monospace">{sub}</text>
      )}
    </g>
  )
}

function Arrow({ d }) {
  return <path d={d} fill="none" stroke="rgba(255,255,255,0.35)" strokeWidth="1.3" markerEnd="url(#arr)" />
}

export default function Architecture() {
  return (
    <Section
      id="architecture"
      eyebrow="System architecture"
      title="How a scan travels through the system"
      intro="Every request crosses authentication, validation and audit logging. The agent layer can read and draft, but only a clinician can release."
    >
      <Reveal>
        <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02] p-4">
          <svg viewBox="0 0 900 430" className="mx-auto min-w-[760px] max-w-full" role="img" aria-label="NeuroScan AI architecture diagram">
            <defs>
              <marker id="arr" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
                <path d="M0 0 L10 5 L0 10 z" fill="rgba(255,255,255,0.5)" />
              </marker>
            </defs>

            <Box x={20} y={30} label="Patient / Clinician" sub="browser" />
            <Box x={20} y={120} label="React + Tailwind" sub="GitHub Pages / nginx" accent />
            <Box x={215} y={120} label="nginx" sub="TLS · CSP · /api proxy" />
            <Box x={410} y={120} label="FastAPI" sub="JWT · RBAC · rate limit" accent />
            <Box x={640} y={30} label="Upload validator" sub="magic bytes · 8 MB cap" />
            <Box x={640} y={120} label="CNN + Grad-CAM" sub="ResNet-18 · calibrated" accent />
            <Box x={410} y={230} label="Agent orchestrator" sub="allow-listed tools" accent />
            <Box x={640} y={230} label="RAG retriever" sub="BM25 · sanitised" />
            <Box x={410} y={340} label="Hash-chained audit log" sub="append-only" />
            <Box x={215} y={340} label="SQLite → PostgreSQL" sub="users · cases" />
            <Box x={640} y={340} label="Clinician sign-off" sub="the only release gate" accent />

            <Arrow d="M95 76 V120" />
            <Arrow d="M170 143 H215" />
            <Arrow d="M365 143 H410" />
            <Arrow d="M560 135 L640 56" />
            <Arrow d="M560 143 H640" />
            <Arrow d="M485 166 V230" />
            <Arrow d="M560 253 H640" />
            <Arrow d="M485 276 V340" />
            <Arrow d="M410 363 H365" />
            <Arrow d="M715 276 V340" />
            <Arrow d="M715 166 C715 200 600 200 560 240" />
          </svg>
        </div>
      </Reveal>
    </Section>
  )
}
