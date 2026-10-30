import metricsJson from './metrics.json'

// ONE place to edit your details. Everything on the site reads from here.
export const SITE = {
  name: 'NeuroScan AI',
  projectTitle:
    'An Explainable Deep Learning and RAG-Based Clinical Decision Support System for Multi-Class Brain MRI Diagnosis',
  programme: 'B.Tech Computer Science & Engineering',
  level: 'Mini Project · 3rd Year',
  academicYear: '2025–2026',
  college: 'Vaagdevi College of Engineering',
  location: 'Warangal, Telangana',
  guide: { name: 'Dr. P. Shailaja', role: 'Associate Professor, Dept. of CSE' },

  // Add teammates here — they appear in the Project section automatically.
  team: [{ name: 'Nikhil Chary Sriramoju', role: 'Lead developer · ML, backend, frontend' }],

  links: {
    github: 'https://github.com/Nikhil-creat',
    repo: 'https://github.com/Nikhil-creat/NeuroScan_AI-mini-project-',
    live: 'https://nikhil-creat.github.io/NeuroScan_AI-mini-project-/',
    linkedin: 'https://in.linkedin.com/in/nikhil-chary-sriramoju-95041b38a',
    email: 'sriramojunikhil66@gmail.com',
  },

  // Build-time VITE_API_URL connects the Console to the FastAPI backend:
  //   unset          -> static sample mode (GitHub Pages)
  //   'same-origin'  -> API is proxied under /api (Docker compose)
  //   'https://...'  -> API hosted elsewhere
  apiEnabled: (import.meta.env.VITE_API_URL || '') !== '',
  apiUrl: (import.meta.env.VITE_API_URL || '') === 'same-origin' ? '' : (import.meta.env.VITE_API_URL || '').replace(/\/$/, ''),

  // Assistant endpoint: VITE_ASSISTANT_URL (e.g. a Cloudflare Worker) or the FastAPI backend's /api/assistant.
  // Empty => the chat runs offline from built-in project notes (or with the visitor's own Groq key).
  assistantUrl:
    (import.meta.env.VITE_ASSISTANT_URL || '').trim() ||
    ((import.meta.env.VITE_API_URL || '') !== '' ? ((import.meta.env.VITE_API_URL === 'same-origin' ? '' : import.meta.env.VITE_API_URL.replace(/\/$/, '')) + '/api/assistant') : ''),

  // Real results only: `python -m ml.evaluate --out ../src/metrics.json` overwrites src/metrics.json.
  // While that file contains `null`, the Evaluation section shows "pending" instead of numbers.
  metrics: metricsJson,
}

// Edit these to match the certificates you actually hold.
export const CREDENTIALS = {
  certificates: '100+',
  internships: '5+',
  currentInternship: 'Machine Learning Engineer · Yuva Intern (NSDC) · Aug–Sep 2026',
  categories: [
    { title: 'Cloud & Cybersecurity', note: 'Security-first thinking, applied in this project’s design' },
    { title: 'Data, AI & Emerging Tech', note: 'IBM SkillsBuild · AI Fundamentals, plus ML/DL coursework' },
    { title: 'Automation & Robotics', note: 'UiPath and workflow automation' },
    { title: 'Software & Systems Engineering', note: 'Full-stack and systems practice' },
    { title: 'Consulting & Business Simulations', note: 'Forage job simulations' },
  ],
  issuers: [
    'Skill India · NASSCOM',
    'IBM SkillsBuild',
    'UiPath',
    'Reliance Foundation',
    'Deloitte (Forage)',
    'TATA (Forage)',
    'BCG Platinion (Forage)',
    'Skyscanner (Forage)',
    'AIG (Forage)',
    'British Airways (Forage)',
    'Yuva Intern · NSDC',
  ],
  skills: ['Python', 'Django', 'React', 'SQL', 'Power BI', 'Pandas', 'Deep Learning', 'RAG', 'Docker'],
}
