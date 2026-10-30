// Add real screenshots here: put files in public/screens/ and list them.
//   { src: 'screens/console.png', caption: 'Console: upload and AI analysis' }
export const SCREENS = []

export const DOWNLOADS = [
  { title: 'Technical summary (PDF)', note: 'Architecture, safety design, evaluation plan and limitations on a few pages.', href: 'docs/NeuroScan_Technical_Summary.pdf', cta: 'Open PDF' },
  { title: 'Viva preparation', note: 'Likely questions with honest answers, including what the project does not do.', href: '/blob/main/VIVA.md', cta: 'Read on GitHub', external: true },
  { title: 'Source repository', note: 'Backend, ML pipeline, Docker files, CI workflow and tests.', href: '', cta: 'Open repo', external: true },
]

export const REPORT_FIXES = [
  'Chapter 8 module description is copied from a vehicle/parking project: replace it.',
  'List of Figures row 3 says "About Java"; the chapter is Python.',
  'Python chapter is generic tutorial text with wrong versions.',
  'Data dictionary lists Django default tables: add the real ones.',
  'Reference [16] author should be F. Chollet; add RAG and Grad-CAM++ papers.',
  'Hardware table has an empty RAM value; diagrams and screenshots sections are empty.',
  'Chapter 6 title differs between index and body.',
  'Replace "no defects encountered" with a real results table.',
]
