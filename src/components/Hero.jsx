import { useEffect, useRef } from 'react'
import Hls from 'hls.js'
import { ArrowRight } from 'lucide-react'

const STREAM = 'https://stream.mux.com/tLkHO1qZoaaQOUeVWo8hEBeGQfySP02EPS02BmnNFyXys.m3u8'

function BackgroundVideo() {
  const ref = useRef(null)

  useEffect(() => {
    const video = ref.current
    if (!video) return
    let hls

    if (Hls.isSupported()) {
      // enableWorker:false keeps playback stable in sandboxed iframes / previews
      hls = new Hls({ enableWorker: false })
      hls.loadSource(STREAM)
      hls.attachMedia(video)
      hls.on(Hls.Events.MANIFEST_PARSED, () => video.play().catch(() => {}))
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = STREAM // Safari native HLS
      video.play().catch(() => {})
    }
    return () => hls && hls.destroy()
  }, [])

  return (
    <video
      ref={ref}
      className="absolute inset-0 h-full w-full object-cover opacity-60"
      autoPlay
      muted
      loop
      playsInline
      aria-hidden="true"
    />
  )
}

function GlowEllipse() {
  return (
    <svg
      className="pointer-events-none absolute left-1/2 top-[8%] w-[1200px] max-w-none -translate-x-1/2"
      viewBox="0 0 1200 500"
      fill="none"
      aria-hidden="true"
    >
      <defs>
        <filter id="glow-blur" x="-30%" y="-60%" width="160%" height="220%">
          <feGaussianBlur stdDeviation="25" />
        </filter>
        <linearGradient id="glow-fill" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#0f766e" stopOpacity="0.25" />
          <stop offset="50%" stopColor="#22d3ee" stopOpacity="0.45" />
          <stop offset="100%" stopColor="#14532d" stopOpacity="0.25" />
        </linearGradient>
      </defs>
      <ellipse cx="600" cy="170" rx="480" ry="110" fill="url(#glow-fill)" filter="url(#glow-blur)" />
    </svg>
  )
}

function LiquidGlassCard() {
  return (
    <div className="liquid-glass flex h-[200px] w-[200px] translate-y-[-50px] flex-col justify-between rounded-2xl p-5 text-left">
      <span className="font-mono text-[14px] text-white/70">[ 2026 ]</span>
      <div>
        <h3 className="font-inter text-[18px] font-semibold leading-snug text-white">
          Explainable <em className="font-serif text-[20px] font-normal italic">Neuro</em> Diagnostics
        </h3>
        <p className="mt-2 text-[11px] leading-relaxed text-white/60">
          CNN predictions you can inspect — Grad-CAM evidence, cited knowledge, human sign-off.
        </p>
      </div>
    </div>
  )
}

export default function Hero() {
  return (
    <section id="top" className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-ink">
      <BackgroundVideo />

      {/* Left-to-right and bottom-up readability gradients */}
      <div className="absolute inset-0 bg-gradient-to-r from-[#070b0a] to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#070b0a] via-[#070b0a]/40 to-transparent" />

      {/* Vertical grid lines at 25 / 50 / 75% */}
      <div className="pointer-events-none absolute inset-0 hidden lg:block" aria-hidden="true">
        {['25%', '50%', '75%'].map((left) => (
          <div key={left} className="absolute top-0 h-full w-px bg-white/10" style={{ left }} />
        ))}
      </div>

      <GlowEllipse />

      <div className="relative z-10 mx-auto flex max-w-5xl flex-col items-center px-6 pt-28 text-center">
        <LiquidGlassCard />

        <p className="font-jakarta text-[11px] font-bold uppercase tracking-[0.2em] text-mint">
          Explainable Clinical Decision Support
        </p>

        <h1 className="mt-4 font-inter text-[40px] font-extrabold uppercase leading-[1.02] tracking-tight text-white sm:text-6xl lg:text-[72px]">
          See what the model sees<span className="text-mint">.</span>
        </h1>

        <p className="mt-6 max-w-[512px] font-inter text-[14px] leading-relaxed text-white/70">
          NeuroScan AI classifies brain MRI into Tumor, Alzheimer’s or Normal Anatomy, shows the evidence with
          Grad-CAM, grounds every insight in cited literature through RAG, and routes each case through
          guard-railed AI agents to a clinician for final sign-off.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <a
            href="#platform"
            className="inline-flex items-center gap-2 rounded-full bg-mint px-7 py-3.5 font-inter text-sm font-bold uppercase tracking-wide text-ink transition-transform hover:scale-[1.03]"
          >
            Get Started <ArrowRight className="h-4 w-4" />
          </a>
          <a
            href="https://github.com/Nikhil-creat/NeuroScan_AI-mini-project-"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center rounded-full border border-white/20 px-7 py-3.5 font-inter text-sm font-bold uppercase tracking-wide text-white transition-colors hover:border-mint hover:text-mint"
          >
            View Repository
          </a>
        </div>
      </div>
    </section>
  )
}
