// Dependency-free 3D brain schematic drawn on a 2D canvas (no three.js, so nothing extra to install).
//
// IMPORTANT: this is a procedurally generated brain-SHAPED point cloud for illustration.
// It is not a patient scan and not model output. The heat region only shows how a Grad-CAM-style
// attention map would be presented on a 3D anatomy.

export const MODES = {
  'Brain Tumor': { spots: [{ c: [0.42, 0.22, 0.52], r: 0.3 }], note: 'Focal region (example: frontal mass)' },
  "Alzheimer's Disease": {
    spots: [
      { c: [-0.3, -0.3, 0.12], r: 0.24 },
      { c: [0.3, -0.3, 0.12], r: 0.24 },
    ],
    note: 'Medial temporal / hippocampal region, both sides',
  },
  'Normal Anatomy': { spots: [], note: 'No focal activation' },
}

export function mulberry32(seed) {
  let a = seed | 0
  return function () {
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function sphereDir(rng) {
  const u = rng() * 2 - 1
  const phi = rng() * Math.PI * 2
  const s = Math.sqrt(1 - u * u)
  return [s * Math.cos(phi), u, s * Math.sin(phi)] // dx, dy(up), dz(front/back)
}

/** Deterministic point cloud: two cortical hemispheres, temporal lobes, cerebellum, brainstem. */
export function buildBrain(seed = 7, perHemi = 1100) {
  const rng = mulberry32(seed)
  const xs = [], ys = [], zs = [], tint = []
  const push = (x, y, z, t) => { xs.push(x); ys.push(y); zs.push(z); tint.push(t) }

  for (const h of [-1, 1]) {
    for (let i = 0; i < perHemi; i++) {
      const [dx, dy, dz] = sphereDir(rng)
      const g = 0.05 * Math.sin(9 * dx + 3 * dy + h) * Math.sin(8 * dz) + 0.035 * Math.sin(14 * dy + 5 * dz + 2 * h) + 0.02 * Math.sin(22 * dx + 11 * dz)
      let x = h * 0.3 + 0.5 * dx * (1 + g)
      let y = 0.6 * dy * (1 + g)
      const z = 0.9 * dz * (1 + g)
      if (y < -0.3) y = -0.3 + (y + 0.3) * 0.35 // flatten the underside
      if (x * h < 0.04) x = h * 0.04 // medial fissure
      push(x, y, z, 0)
    }
    for (let i = 0; i < 250; i++) { // temporal lobe
      const [dx, dy, dz] = sphereDir(rng)
      push(h * 0.5 + 0.18 * dx, -0.3 + 0.17 * dy, 0.2 + 0.42 * dz, 0)
    }
  }
  for (let i = 0; i < 450; i++) { // cerebellum
    const [dx, dy, dz] = sphereDir(rng)
    const r = 1 + 0.06 * Math.sin(32 * dy)
    push(0.42 * dx * r, -0.52 + 0.22 * dy * r, -0.62 + 0.28 * dz * r, 1)
  }
  for (let i = 0; i < 150; i++) { // brainstem
    const t = rng(), a = rng() * Math.PI * 2
    push(0.1 * Math.cos(a), -0.45 - 0.5 * t, -0.25 - 0.12 * t + 0.1 * Math.sin(a), 1)
  }
  return { n: xs.length, x: Float32Array.from(xs), y: Float32Array.from(ys), z: Float32Array.from(zs), tint: Uint8Array.from(tint) }
}

const lerp = (a, b, t) => a + (b - a) * t
function heatColor(v) { // 0..1 -> mint, yellow, red
  const stops = [[94, 210, 156], [250, 204, 21], [239, 68, 68]]
  const s = v < 0.5 ? 0 : 1
  const t = v < 0.5 ? v / 0.5 : (v - 0.5) / 0.5
  const a = stops[s], b = stops[s + 1]
  return [lerp(a[0], b[0], t) | 0, lerp(a[1], b[1], t) | 0, lerp(a[2], b[2], t) | 0]
}

export function createBrain3D(canvas, options = {}) {
  const ctx = canvas.getContext('2d')
  const brain = buildBrain(options.seed ?? 7)
  const N = brain.n
  const sx = new Float32Array(N), sy = new Float32Array(N), bin = new Uint8Array(N), size = new Float32Array(N), inten = new Float32Array(N)

  const state = {
    yaw: 0.6, pitch: -0.15, mode: options.mode || 'Brain Tumor',
    paused: !!options.reducedMotion, slice: true, heat: true, dragging: false,
    visible: true, w: 0, h: 0, dpr: 1, t0: performance.now(), tPause: 0, frozenT: 0,
  }
  let raf = 0, destroyed = false, lastStats = { base: 0, heat: 0, slice: 0 }

  const resize = () => {
    const r = canvas.getBoundingClientRect()
    state.dpr = Math.min(window.devicePixelRatio || 1, 2)
    state.w = Math.max(1, Math.round(r.width))
    state.h = Math.max(1, Math.round(r.height))
    canvas.width = state.w * state.dpr
    canvas.height = state.h * state.dpr
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0)
    invalidate()
  }

  function now() { return (performance.now() - state.t0) / 1000 }

  function draw(t) {
    const { w, h } = state
    ctx.clearRect(0, 0, w, h)
    const scale = Math.min(w, h) * 0.42
    const cx = w / 2, cy = h / 2
    const cyaw = Math.cos(state.yaw), syaw = Math.sin(state.yaw)
    const cp = Math.cos(state.pitch), sp = Math.sin(state.pitch)
    const F = 3.0
    const spots = MODES[state.mode].spots
    const pulse = 0.78 + 0.22 * Math.sin(t * 3)
    const plane = Math.sin(t * 0.9) * 0.62

    for (let i = 0; i < N; i++) {
      const x = brain.x[i], y = brain.y[i], z = brain.z[i]
      const x1 = x * cyaw + z * syaw
      const z1 = -x * syaw + z * cyaw
      const y2 = y * cp - z1 * sp
      const z2 = y * sp + z1 * cp
      const k = F / (F - z2)
      sx[i] = cx + x1 * k * scale
      sy[i] = cy - y2 * k * scale
      const d = Math.min(1, Math.max(0, (z2 + 1) / 2))
      bin[i] = Math.min(7, (d * 8) | 0)
      size[i] = 1.2 + 1.5 * d
      let v = 0
      if (state.heat) {
        for (let s = 0; s < spots.length; s++) {
          const c = spots[s].c, r = spots[s].r
          const dx = x - c[0], dy = y - c[1], dz = z - c[2]
          const q = (dx * dx + dy * dy + dz * dz) / (r * r)
          const e = Math.exp(-1.6 * q)
          if (e > v) v = e
        }
      }
      inten[i] = v * pulse
    }

    let base = 0, heatN = 0, sliceN = 0
    for (let tn = 0; tn < 2; tn++) {
      const rgb = tn === 0 ? '190,235,225' : '150,195,255'
      for (let b = 0; b < 8; b++) {
        ctx.fillStyle = `rgba(${rgb},${(0.16 + 0.62 * (b / 7)).toFixed(3)})`
        for (let i = 0; i < N; i++) {
          if (bin[i] !== b || brain.tint[i] !== tn || inten[i] > 0.12) continue
          if (state.slice && Math.abs(brain.y[i] - plane) < 0.03) continue
          ctx.fillRect(sx[i], sy[i], size[i], size[i])
          base++
        }
      }
    }
    if (state.slice) {
      ctx.fillStyle = 'rgba(120,240,255,0.95)'
      for (let i = 0; i < N; i++) {
        if (inten[i] > 0.12 || Math.abs(brain.y[i] - plane) >= 0.03) continue
        ctx.fillRect(sx[i], sy[i], size[i] + 1, size[i] + 1)
        sliceN++
      }
      ctx.strokeStyle = 'rgba(120,240,255,0.35)'
      ctx.lineWidth = 1
      ctx.beginPath()
      for (let a = 0; a <= 48; a++) {
        const ang = (a / 48) * Math.PI * 2
        const x = 0.85 * Math.cos(ang), z = 1.05 * Math.sin(ang), y = plane
        const x1 = x * cyaw + z * syaw, z1 = -x * syaw + z * cyaw
        const y2 = y * cp - z1 * sp, z2 = y * sp + z1 * cp
        const k = F / (F - z2)
        const px = cx + x1 * k * scale, py = cy - y2 * k * scale
        if (a === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py)
      }
      ctx.stroke()
    }
    for (let i = 0; i < N; i++) {
      const v = inten[i]
      if (v <= 0.12) continue
      const [r, g, b] = heatColor(Math.min(1, v))
      ctx.fillStyle = `rgba(${r},${g},${b},${(0.45 + 0.5 * Math.min(1, v)).toFixed(2)})`
      ctx.fillRect(sx[i], sy[i], size[i] + 1.2, size[i] + 1.2)
      heatN++
    }
    lastStats = { base, heat: heatN, slice: sliceN }
  }

  function frame() {
    raf = 0
    if (destroyed) return
    const t = state.paused ? state.frozenT : now()
    if (!state.paused && !state.dragging) state.yaw += 0.006
    draw(t)
    if (!state.paused && state.visible) raf = requestAnimationFrame(frame)
  }
  function invalidate() {
    if (!raf && !destroyed) raf = requestAnimationFrame(frame)
  }

  // interaction
  let lx = 0, ly = 0
  const down = (e) => { state.dragging = true; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture?.(e.pointerId) }
  const move = (e) => {
    if (!state.dragging) return
    state.yaw += (e.clientX - lx) * 0.01
    state.pitch = Math.max(-0.7, Math.min(0.7, state.pitch + (e.clientY - ly) * 0.008))
    lx = e.clientX; ly = e.clientY
    invalidate()
  }
  const up = () => { state.dragging = false; invalidate() }
  const key = (e) => {
    if (e.key === 'ArrowLeft') { state.yaw -= 0.15; invalidate(); e.preventDefault() }
    if (e.key === 'ArrowRight') { state.yaw += 0.15; invalidate(); e.preventDefault() }
  }
  canvas.style.touchAction = 'pan-y' // horizontal drag rotates, vertical swipe still scrolls the page
  canvas.addEventListener('pointerdown', down)
  canvas.addEventListener('pointermove', move)
  canvas.addEventListener('pointerup', up)
  canvas.addEventListener('pointercancel', up)
  canvas.addEventListener('keydown', key)

  const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(resize) : null
  ro?.observe(canvas)
  const io = typeof IntersectionObserver !== 'undefined'
    ? new IntersectionObserver(([e]) => { state.visible = e.isIntersecting; if (state.visible) invalidate() })
    : null
  io?.observe(canvas)
  resize()

  return {
    setMode(m) { if (MODES[m]) { state.mode = m; invalidate() } },
    setPaused(p) {
      if (p && !state.paused) state.frozenT = now()
      if (!p && state.paused) state.t0 = performance.now() - state.frozenT * 1000
      state.paused = p
      invalidate()
    },
    setSlice(v) { state.slice = !!v; invalidate() },
    setHeat(v) { state.heat = !!v; invalidate() },
    resetView() { state.yaw = 0.6; state.pitch = -0.15; invalidate() },
    renderOnce(t = now()) { draw(t) },
    stats: () => ({ points: N, ...lastStats }),
    destroy() {
      destroyed = true
      cancelAnimationFrame(raf)
      ro?.disconnect(); io?.disconnect()
      canvas.removeEventListener('pointerdown', down)
      canvas.removeEventListener('pointermove', move)
      canvas.removeEventListener('pointerup', up)
      canvas.removeEventListener('pointercancel', up)
      canvas.removeEventListener('keydown', key)
    },
  }
}
