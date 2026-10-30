// EDIT THIS FILE with your real certificates. One object per certificate.
//   verifyUrl: paste the public verification / credential link. A "Verified" badge is shown
//              ONLY when verifyUrl is non-empty, so nothing is claimed that you cannot back up.
//   file:      optional path to a PDF/image you commit under public/certs/ (e.g. 'certs/ibm-ai.pdf').
// The counters (100+, 5+) live in config.js; this list is the browsable wall.
export const CERT_CATEGORIES = ['All', 'Job simulation', 'AI & Data', 'Cloud & Security', 'Automation', 'Internship']

export const CERTS = [
  { title: 'Job simulation', issuer: 'Deloitte (Forage)', category: 'Job simulation', year: '', verifyUrl: '' },
  { title: 'Job simulation', issuer: 'TATA (Forage)', category: 'Job simulation', year: '', verifyUrl: '' },
  { title: 'Job simulation', issuer: 'BCG Platinion (Forage)', category: 'Job simulation', year: '', verifyUrl: '' },
  { title: 'Job simulation', issuer: 'Skyscanner (Forage)', category: 'Job simulation', year: '', verifyUrl: '' },
  { title: 'Job simulation', issuer: 'AIG (Forage)', category: 'Job simulation', year: '', verifyUrl: '' },
  { title: 'Job simulation', issuer: 'British Airways (Forage)', category: 'Job simulation', year: '', verifyUrl: '' },
  { title: 'AI Fundamentals', issuer: 'IBM SkillsBuild', category: 'AI & Data', year: '', verifyUrl: '' },
  { title: 'Automation learning path', issuer: 'UiPath', category: 'Automation', year: '', verifyUrl: '' },
  { title: 'Skilling programme', issuer: 'Skill India · NASSCOM', category: 'AI & Data', year: '', verifyUrl: '' },
  { title: 'Machine Learning Engineer internship', issuer: 'Yuva Intern · NSDC', category: 'Internship', year: '2026', verifyUrl: '' },
]

export const TIMELINE = [
  { when: 'Aug–Sep 2026', what: 'Machine Learning Engineer intern', where: 'Yuva Intern (NSDC)' },
  { when: '2025–2026', what: 'NeuroScan AI mini project', where: 'Vaagdevi College of Engineering' },
]
