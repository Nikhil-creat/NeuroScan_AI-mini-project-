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

// Other project work shown under Credentials. EDIT: keep only what you can demo, add repo links when public.
// `link` empty => no link is shown.
export const PROJECTS = [
  { name: 'NeuroScan AI', tag: 'This project', note: 'Explainable brain-MRI decision support: CNN, Grad-CAM, RAG, guard-railed agents.', stack: ['PyTorch', 'FastAPI', 'React', 'Docker'], link: 'https://github.com/Nikhil-creat/NeuroScan_AI-mini-project-' },
  { name: 'AgentShield-X', tag: 'AI security', note: 'Zero-trust governance engine for AI agents: guardrails, sandbox, Merkle audit ledger.', stack: ['Python', 'Security'], link: '' },
  { name: 'TrustGuard AI', tag: 'ML + MLOps', note: 'KYC document verification, fraud detection and risk-case prioritisation in one platform.', stack: ['ML', 'MLOps'], link: '' },
  { name: 'Omni-Cloud Sentinel', tag: 'Multi-agent', note: 'Cloud-ops agents for FinOps, DevSecOps and incident response.', stack: ['Agents', 'DevSecOps'], link: '' },
  { name: 'ChurnScope', tag: 'Data science', note: 'End-to-end customer churn prediction with a scikit-learn pipeline.', stack: ['scikit-learn', 'Pandas'], link: '' },
  { name: 'PDF RAG Chatbot', tag: 'RAG', note: 'Upload PDFs and chat with them: embeddings, retrieval, prompt design.', stack: ['RAG', 'LLM'], link: '' },
]
