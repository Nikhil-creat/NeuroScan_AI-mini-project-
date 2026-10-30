# NeuroScan AI

Explainable, agentic clinical decision support for brain MRI: **CNN + Grad-CAM + RAG**, guard-railed AI agents, a security baseline and Docker packaging.
B.Tech CSE mini project · Vaagdevi College of Engineering · guide: Dr. P. Shailaja.

> **Research prototype. Not a medical device. Not for clinical use.**

## What is here

| Part | Status |
|---|---|
| `src/` React + Tailwind site (hero, project, pipeline, agents, RAG, live console, evaluation, credentials, security, FAQ, contact) | Built |
| `backend/` FastAPI: JWT auth + RBAC, upload validation, CNN + Grad-CAM, agent orchestrator, BM25 RAG, hash-chained audit log | Built; core logic unit-tested (34 tests) |
| Trained model weights | **You must train them** (see DEPLOY.md) |
| Docker (`Dockerfile`, `backend/Dockerfile`, `docker-compose.yml`) | Written, not yet run on a Docker host |
| GitHub Pages workflow | Written (`.github/workflows/pages.yml`) |

Also included: 3D explainability view, animated pipeline, credentials wall (`src/credentials.js`), reports section (`src/reports.js`, `public/docs/`, `VIVA.md`), `backend/ml/` (training with class weighting + temperature scaling, held-out evaluation that writes `src/metrics.json`), a model card, architecture diagram, skills-to-code matrix, `termux-deploy.sh` (phone deploy), `SECURITY.md`, `LICENSE` (MIT).

Guides: **AI_ASSISTANT.md** (free Groq + Gemini chatbot, keys kept server-side), **TERMUX.md** (deploy from your phone), **DEPLOY.md** (GitHub Pages walkthrough, hosted backend, training).

## Train and publish real metrics

```bash
cd backend
python -m ml.train --data ./data --epochs 15          # data/train/<class folders>, data/test/<class folders>
python -m ml.evaluate --data ./data --out ../src/metrics.json
git add -A && git commit -m "Add trained metrics" && git push    # Evaluation section fills itself in
```

## Quick start

```bash
npm install && npm run dev                  # site only (Console shows a labelled sample)

cd backend && cp .env.example .env
pip install -r requirements.txt
uvicorn app.main:app --reload               # API docs: /api/docs
VITE_API_URL=http://localhost:8000 npm run dev   # site + live console

docker compose up --build                   # full stack on http://localhost:8080
python -m pytest -q                         # in backend/: unit tests (no GPU or weights needed)
```

## Backend API

| Method | Path | Who |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | anyone (register creates a *patient*) |
| POST | `/api/admin/users` | admin: create clinicians |
| POST | `/api/cases` | patient, clinician: upload PNG/JPEG (content-sniffed, 8 MB cap) |
| GET | `/api/cases`, `/api/cases/{id}` | patients see only status and the clinician verdict; clinicians see the AI work |
| POST | `/api/cases/{id}/review` | clinician: the **only** way a case becomes released |
| POST | `/api/knowledge` | admin: ingest PDF/text for RAG (injection text stripped) |
| GET | `/api/knowledge/search` | clinician, admin |
| GET | `/api/audit/verify` | admin: checks the hash chain is intact |

## Safety design (enforced in code, covered by tests)

- Agents have per-agent tool allow-lists and no release tool; the orchestrator always returns `released: false`.
- Retrieved text is data: sentences that look like instructions are removed.
- The report is extractive: each evidence line is a retrieved passage with a citation; no passage means "none found", not an invented answer.
- Low confidence, non-MRI images, narrow class margins, or confident-but-diffuse heatmaps route the case to priority human review.
- Audit log is append-only and hash-chained; any edit breaks verification.

## Known limitations

Small public datasets, 2D slices, three classes only, Grad-CAM is not causal proof, the OOD gate is a heuristic, BM25 is lexical (no embeddings yet), SQLite and in-memory rate limits suit one worker only, and there has been no clinical validation or security audit.

## Corrections to make in the project report (`NeuroScan AI.docx`)

1. **Chapter 8 Module Description** describes vehicle plate / parking sensors, copied from another project. Replace with: Authentication, MRI Upload, CNN Classification, Grad-CAM, RAG Insights, Expert Review, Report Generation.
2. **List of Figures** row 3 says "About Java"; the software chapter is Python.
3. **Python chapter** is generic tutorial text (a "Purpose" paragraph about retinal segmentation, "Python 7.3", Python 3.7.4 installation) while Chapter 4 says Python 3.10.
4. **Data dictionary** lists Django default tables plus `Image_conversion`; add your real tables.
5. **Reference [16]**: author is F. Chollet. Consider adding RAG (Lewis et al., 2020) and Grad-CAM++ references.
6. **Hardware table** has an empty RAM value; the Collaboration Diagram and Screenshots sections are empty.
7. **Chapter 6** is titled "System Architecture" in the index and "System Design" in the body.
8. Add a results table (accuracy, per-class precision/recall, confusion matrix) instead of "no defects encountered".
