import { SITE } from '../config.js'
import { Section, GlassPanel, Reveal } from './ui.jsx'

const METHOD = [
  'Patient-level train / validation / test split, so slices of one patient never leak across sets.',
  'Report per-class precision, recall and F1, not just overall accuracy.',
  'Confusion matrix and calibration error (ECE) on the held-out test set.',
  'Check Grad-CAM on correct and incorrect cases, not only the flattering ones.',
  'Test on a differently sourced MRI set to estimate how performance transfers.',
]

const pct = (x) => `${(x * 100).toFixed(1)}%`

export default function Evaluation() {
  const m = SITE.metrics
  return (
    <Section
      id="evaluation"
      eyebrow="Evaluation"
      title="Numbers only count if they’re honest"
      intro={
        m
          ? 'Results on the held-out test set.'
          : 'No metrics are shown until the model has been trained and tested. Fill them in from src/config.js once you have real results.'
      }
    >
      <div className="grid gap-5 lg:grid-cols-2">
        <Reveal>
          <GlassPanel className="h-full">
            <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Results</h3>
            {m ? (
              <>
                <div className="mt-5 grid grid-cols-3 gap-4">
                  {[
                    ['Accuracy', pct(m.accuracy)],
                    ['Macro-F1', pct(m.macroF1)],
                    ['ECE', m.ece.toFixed(3)],
                  ].map(([k, v]) => (
                    <div key={k}>
                      <p className="font-inter text-3xl font-extrabold">{v}</p>
                      <p className="font-mono text-[11px] uppercase text-white/45">{k}</p>
                    </div>
                  ))}
                </div>
                <table className="mt-6 w-full text-left text-[12.5px]">
                  <thead className="font-mono text-[11px] uppercase text-white/45">
                    <tr>
                      <th className="py-2">Class</th>
                      <th>Precision</th>
                      <th>Recall</th>
                      <th>F1</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/10">
                    {m.perClass.map((c) => (
                      <tr key={c.label}>
                        <td className="py-2">{c.label}</td>
                        <td>{pct(c.precision)}</td>
                        <td>{pct(c.recall)}</td>
                        <td>{pct(c.f1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {m.confusion && (
                  <div className="mt-6">
                    <p className="font-mono text-[11px] uppercase text-white/45">Confusion matrix (rows = true, cols = predicted)</p>
                    <table className="mt-2 w-full text-center text-[12px]">
                      <thead className="text-white/45">
                        <tr>
                          <th />
                          {m.confusion.labels.map((l) => (
                            <th key={l} className="px-1 py-1 font-normal">{l.split(' ')[0]}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {m.confusion.matrix.map((row, i) => (
                          <tr key={i}>
                            <th className="pr-2 text-right font-normal text-white/45">{m.confusion.labels[i].split(' ')[0]}</th>
                            {row.map((v, j) => (
                              <td key={j} className={`py-1.5 ${i === j ? 'bg-mint/15 text-mint' : 'text-white/70'}`}>{v}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    <p className="mt-2 text-[11px] text-white/40">n = {m.n} test images</p>
                  </div>
                )}
              </>
            ) : (
              <p className="mt-5 rounded-xl border border-dashed border-white/20 p-6 text-[13px] text-white/60">
                Pending: accuracy, macro-F1, per-class metrics, confusion matrix and calibration will appear here after
                evaluation on a held-out test set.
              </p>
            )}
          </GlassPanel>
        </Reveal>
        <Reveal>
          <GlassPanel className="h-full">
            <h3 className="font-inter text-sm font-semibold uppercase tracking-wide">Evaluation protocol</h3>
            <ul className="mt-5 space-y-3 text-[13px] leading-relaxed text-white/75">
              {METHOD.map((x) => (
                <li key={x} className="flex gap-3">
                  <span className="text-mint">—</span>
                  {x}
                </li>
              ))}
            </ul>
          </GlassPanel>
        </Reveal>
      </div>
    </Section>
  )
}
