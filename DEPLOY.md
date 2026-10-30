# Deploying to GitHub Pages (step by step)

Your repo: `github.com/Nikhil-creat/NeuroScan_AI-mini-project-`
Your site: `https://nikhil-creat.github.io/NeuroScan_AI-mini-project-/`

GitHub Pages hosts **static files only**. So Pages serves the React site; the FastAPI backend runs elsewhere (your laptop with Docker, or a host such as Render/Railway/Fly). Without a backend the Console section shows a clearly labelled sample.

## 1. Put the project in your repo

1. Unzip `neuroscan-ai-platform.zip`.
2. Copy **everything inside** the folder (including the hidden `.github` folder) into your local clone of the repo, so `package.json` sits at the repo root.
   Keep your report: move it to `docs/NeuroScan AI.docx` (optional but tidy).
3. Commit and push:

```bash
git clone https://github.com/Nikhil-creat/NeuroScan_AI-mini-project-.git
cd NeuroScan_AI-mini-project-
# copy the unzipped files here, then:
git add .
git commit -m "NeuroScan AI v2: React site, FastAPI backend, Docker, Pages workflow"
git push origin main
```

(Phone-only? Use the GitHub web UI: *Add file → Upload files*, drag the folder contents. Hidden folders like `.github` are easiest to add from a computer or Codespaces.)

## 2. Switch Pages to GitHub Actions

Repo → **Settings → Pages → Build and deployment → Source: GitHub Actions**.
(Your repo currently shows an older `github-pages` deployment; this replaces it.)

## 3. Watch the deploy

Repo → **Actions** tab → "Deploy site to GitHub Pages". Three jobs run: backend tests → build → deploy (about 2 minutes). Then open the site URL above.

If the build fails, open the failed step; the most common causes are a typo in `src/config.js` or a missing file from the copy.

## 4. (Recommended) commit the lockfile

After your first local `npm install`, commit `package-lock.json` so builds are reproducible.

## 5. Personalise

Edit `src/config.js`: team members, guide, links, certificate counts, issuers. Push to `main` and the site redeploys automatically.
After training your model, add real numbers to `metrics` in the same file; the Evaluation section fills itself in.

## Running the full stack locally

```bash
# Backend (needs Python 3.12 + the packages in backend/requirements.txt)
cd backend
cp .env.example .env            # set NEUROSCAN_SECRET and the admin password
pip install -r requirements.txt
uvicorn app.main:app --reload   # http://localhost:8000/api/docs

# Frontend (second terminal, repo root)
VITE_API_URL=http://localhost:8000 npm run dev
```

Or everything in containers: `docker compose up --build` then open http://localhost:8080.

## Connecting the live site to a hosted backend

1. Deploy the `backend/` Docker image to a host and set the env vars from `.env.example`
   (`NEUROSCAN_SECRET`, `ADMIN_PASSWORD`, and `CORS_ORIGINS=https://nikhil-creat.github.io`).
2. Repo → Settings → Secrets and variables → Actions → **Variables** → add `API_URL` = your backend URL (HTTPS).
3. In `.github/workflows/pages.yml` uncomment the two `env:` lines under the build step and push.

Use HTTPS for the backend: browsers block an HTTPS page from calling an HTTP API.

## Training the model (the part no template can do for you)

The API loads `backend/models/neuroscan_resnet18.pt`, a torchvision ResNet-18 state_dict with a 3-way head, trained with class order:
`["Alzheimer's Disease", "Brain Tumor", "Normal Anatomy"]` (see `app/agents.py`). Until the file exists:
- `DEMO_MODE=0` → uploads are refused (503), the honest default;
- `DEMO_MODE=1` → returns outputs flagged **simulated**, for UI demos only.

Never present simulated outputs as results in your viva or report.
