import { useEffect, useRef, useState } from 'react'
import { Pause, Play, RotateCcw, Layers, Flame } from 'lucide-react'
import { createBrain3D, MODES } from '../lib/brain3d.js'
import { usePrefersReducedMotion } from '../lib/hooks.js'
import { Section, GlassPanel, Reveal } from './ui.jsx'
import PipelineFlow from './PipelineFlow.jsx'

export default function Brain3D() {
  const canvasRef = useRef(null)
  const ctl = useRef(null)
  const reduced = usePrefersReducedMotion()
  const [mode, setMode] = useState('Brain Tumor')
  const [playing, setPlaying] = useState(!reduced)
  const [slice, setSlice] = useState(true)
  const [heat, setHeat] = useState(true)

  useEffect(() => {
    const c = createBrain3D(canvasRef.current, { reducedMotion: reduced })
    ctl.current = c
    return () => c.destroy()
  }, [reduced])

  useEffect(() => { ctl.current?.setMode(mode) }, [mode])
  useEffect(() => { ctl.current?.setPaused(!playing) }, [playing])
  useEffect(() => { ctl.current?.setSlice(slice) }, [slice])
  useEffect(() => { ctl.current?.setHeat(heat) }, [heat])

  const btn = (on) =>
    `inline-flex items-center gap-2 rounded-full border px-3.5 py-2 font-inter text-[12px] font-semibold transition-colors ${
      on ? 'border-mint bg-mint/15 text-mint' : 'border-white/15 text-white/75 hover:border-white/40'
    }`

  return (
    <Section
      id="visual-lab"
      eyebrow="Visual lab"
      title="3D explainability view"
      intro="An interactive brain-shaped model showing how a Grad-CAM attention map would be presented on anatomy. Drag to rotate (or use the arrow keys when focused)."
    >
      <div className="grid gap-5 lg:grid-cols-[1.3fr_1fr]">
        <Reveal>
          <GlassPanel className="p-3 sm:p-4">
            <canvas
              ref={canvasRef}
              tabIndex={0}
              role="img"
              aria-label={`Rotating 3D brain schematic. Mode: ${mode}. ${MODES[mode].note}. Illustration only, not a patient scan.`}
              className="h-[360px] w-full cursor-grab rounded-xl bg-black/40 outline-none focus-visible:ring-2 focus-visible:ring-mint active:cursor-grabbing sm:h-[460px]"
            />
            <div className="mt-3 flex flex-wrap gap-2">
              <button className={btn(playing)} onClick={() => setPlaying((p) => !p)} aria-pressed={playing}>
                {playing ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
                {playing ? 'Pause' : 'Play'}
              </button>
              <button className={btn(slice)} onClick={() => setSlice((s) => !s)} aria-pressed={slice}>
                <Layers className="h-3.5 w-3.5" /> Scan plane
              </button>
              <button className={btn(heat)} onClick={() => setHeat((s) => !s)} aria-pressed={heat}>
                <Flame className="h-3.5 w-3.5" /> Heat map
              </button>
              <button className={btn(false)} onClick={() => ctl.current?.resetView()}>
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </button>
            </div>
          </GlassPanel>
        </Reveal>

        <Reveal>
          <GlassPanel className="h-full">
            <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Class pattern</h3>
            <div className="mt-4 flex flex-col gap-2" role="radiogroup" aria-label="Class pattern">
              {Object.keys(MODES).map((m) => (
                <button
                  key={m}
                  role="radio"
                  aria-checked={mode === m}
                  onClick={() => setMode(m)}
                  className={`rounded-xl border px-4 py-3 text-left transition-colors ${
                    mode === m ? 'border-mint bg-mint/10' : 'border-white/10 hover:border-white/30'
                  }`}
                >
                  <p className="font-inter text-[14px] font-semibold">{m}</p>
                  <p className="text-[12px] text-white/60">{MODES[m].note}</p>
                </button>
              ))}
            </div>
            <p className="mt-5 rounded-xl border border-amber-300/30 bg-amber-300/5 p-3 text-[12px] leading-relaxed text-amber-100/90">
              <strong>Illustration only.</strong> The brain is a procedurally generated point cloud and the heat spots are
              hand-placed examples. This is not a patient scan, not a model output, and not a diagnosis.
            </p>
          </GlassPanel>
        </Reveal>
      </div>

      <div className="mt-8">
        <PipelineFlow />
      </div>
    </Section>
  )
}
