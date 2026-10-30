# AI assistant (Groq + Gemini) setup

The chat button (bottom-right of the site) answers questions about the project.
**Golden rule: API keys never go in the website code, GitHub, or chat.** GitHub Pages is public; anything in `src/` can be read by anyone.

## How the chat answers (3 modes, automatic)

| Mode | When | Keys |
|---|---|---|
| **AI: Groq + Gemini** | `ASSISTANT_URL` is set (Cloudflare Worker) or the FastAPI backend is connected | Stored as server secrets, never in the browser |
| **AI: your Groq key** | A visitor pastes their own free key via the key icon | Stays in that tab only (sessionStorage) |
| **Offline** | Nothing configured | None. Answers from built-in project notes |

Order on the server: Groq first, Gemini if Groq fails, offline notes if both fail.

## Option A: Cloudflare Worker (free, works with GitHub Pages, phone friendly)

1. Get free keys: Groq at console.groq.com (API Keys), Gemini at aistudio.google.com (Get API key).
2. dash.cloudflare.com, create a free account, **Workers & Pages > Create > Hello World > Deploy**, then **Edit code**.
3. Replace the code with the contents of `worker/assistant-worker.js`, **Deploy**.
4. Worker **Settings > Variables and Secrets**: add secrets `GROQ_API_KEY` and `GEMINI_API_KEY` (type *Secret*), and a plain variable `ALLOWED_ORIGIN` = `https://nikhil-creat.github.io` (no trailing slash, no path).
5. Copy the worker URL (`https://xxxx.workers.dev`).
6. GitHub repo **Settings > Secrets and variables > Actions > Variables > New repository variable**: name `ASSISTANT_URL`, value = the worker URL.
7. Actions tab > **Deploy site to GitHub Pages > Run workflow**. Done.

Worker protections: only your origin is accepted, message length cap, injection filter, PII redaction, keys server-side.
Add a Cloudflare rate-limiting rule (Security > WAF > Rate limiting) to stop abuse of your free quota.

## Option B: FastAPI backend

Put `GROQ_API_KEY` and `GEMINI_API_KEY` in `backend/.env` (never commit it), then `docker compose up --build`. Route: `POST /api/assistant`, 12 questions per minute per client.

## If a key ever leaks
Revoke it immediately in the Groq / Google console and create a new one. Deleting it from Git history is not enough.

## Notes
- Model names change over time. Override with `GROQ_MODEL` / `GEMINI_MODEL` (worker variables or backend env) if a model is retired.
- Editing the project notes: change `src/assistant_kb.json`, copy it to `backend/app/assistant_kb.json` (a test checks they match) and re-paste the `KB` array into the worker.
- The assistant refuses medical diagnosis, ignores instructions hidden in user text, and says "I do not know" when the notes do not cover something. It can still be wrong.
