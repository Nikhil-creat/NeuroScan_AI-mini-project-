#!/data/data/com.termux/files/usr/bin/bash
# NeuroScan AI: one-command deploy from Termux (works on normal Linux/macOS too).
#
#   bash termux-deploy.sh [path-to-zip]
#
# What it does: installs tools, logs in to GitHub (browser code), clones your repo,
# copies the project in, commits, pushes, switches Pages to "GitHub Actions", sets repo topics.
# It never deletes your files and never force-pushes.

set -euo pipefail

OWNER="${OWNER:-Nikhil-creat}"
REPO="${REPO:-NeuroScan_AI-mini-project-}"
ZIP="${1:-$HOME/storage/downloads/neuroscan-ai-platform.zip}"
WORK="$HOME/neuroscan-deploy"

say() { printf '\n\033[1;32m==> %s\033[0m\n' "$*"; }
die() { printf '\n\033[1;31mERROR: %s\033[0m\n' "$*" >&2; exit 1; }

# 1. tools -------------------------------------------------------------------
say "Checking tools (git, gh, unzip)"
if command -v pkg >/dev/null 2>&1; then
  pkg install -y git gh unzip >/dev/null
else
  for t in git gh unzip; do command -v "$t" >/dev/null || die "Install '$t' first."; done
fi

# 2. find the zip --------------------------------------------------------------
if [ ! -f "$ZIP" ]; then
  if command -v termux-setup-storage >/dev/null 2>&1 && [ ! -d "$HOME/storage" ]; then
    say "Allow storage access in the popup, then re-run this script"
    termux-setup-storage
    exit 0
  fi
  die "Zip not found at: $ZIP
  Download neuroscan-ai-platform.zip first, or pass its path:  bash termux-deploy.sh /path/to/file.zip"
fi

# 3. GitHub login ----------------------------------------------------------------
if ! gh auth status >/dev/null 2>&1; then
  say "Log in to GitHub: choose HTTPS, then 'Login with a web browser'; open the link, enter the one-time code"
  gh auth login -h github.com -p https -w
fi
gh auth setup-git >/dev/null 2>&1 || true

LOGIN="$(gh api user --jq .login)"
UID_NUM="$(gh api user --jq .id)"
[ "$LOGIN" = "$OWNER" ] || say "Note: logged in as '$LOGIN' but target repo owner is '$OWNER'. You need push access to it."

git config --global user.name  >/dev/null 2>&1 || git config --global user.name  "$LOGIN"
git config --global user.email >/dev/null 2>&1 || git config --global user.email "${UID_NUM}+${LOGIN}@users.noreply.github.com"

# 4. clone ---------------------------------------------------------------------
say "Cloning $OWNER/$REPO"
mkdir -p "$WORK"
cd "$WORK"
if [ -d "$REPO/.git" ]; then
  git -C "$REPO" pull --ff-only
else
  gh repo clone "$OWNER/$REPO"
fi
cd "$REPO"

# 5. copy project in ---------------------------------------------------------------
say "Unpacking project"
TMP="$(mktemp -d)"
unzip -q "$ZIP" -d "$TMP"
SRC="$TMP/neuroscan-ai-platform"
[ -d "$SRC" ] || SRC="$(find "$TMP" -maxdepth 2 -name package.json -printf '%h\n' | head -1)"
[ -n "$SRC" ] && [ -f "$SRC/package.json" ] || die "package.json not found inside the zip"

# keep the original report, tidily
if [ -f "NeuroScan AI.docx" ]; then
  mkdir -p docs
  git mv "NeuroScan AI.docx" "docs/NeuroScan AI.docx" 2>/dev/null || mv "NeuroScan AI.docx" "docs/NeuroScan AI.docx"
fi

# cp -a keeps hidden files (.github, .gitignore); trailing /. copies directory contents
cp -a "$SRC"/. .
rm -rf "$TMP"
[ -f .github/workflows/pages.yml ] || die "Workflow file missing after copy"

# 6. commit & push -----------------------------------------------------------------
say "Committing"
git add -A
if git diff --cached --quiet; then
  say "Nothing new to commit (already up to date)"
else
  git commit -q -m "NeuroScan AI v2: React site, FastAPI backend, ML pipeline, Docker, Pages workflow"
fi
BRANCH="$(git symbolic-ref --short HEAD)"
say "Pushing to $BRANCH"
git push origin "$BRANCH"

# 7. Pages: switch source to GitHub Actions ------------------------------------------
say "Enabling GitHub Pages (source: GitHub Actions)"
if gh api -X PUT "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1 ||
   gh api -X POST "repos/$OWNER/$REPO/pages" -f build_type=workflow >/dev/null 2>&1; then
  echo "Pages source set."
else
  echo "Could not set it automatically. Do it by hand: repo > Settings > Pages > Source: GitHub Actions"
fi

# 8. polish repo metadata (best effort) ------------------------------------------------
gh repo edit "$OWNER/$REPO" \
  --description "NeuroScan AI: explainable brain-MRI decision support with CNN, Grad-CAM, RAG and guard-railed agents (B.Tech CSE mini project)" \
  --homepage "https://$OWNER.github.io/$REPO/" \
  --add-topic cnn --add-topic rag --add-topic reactjs --add-topic fastapi --add-topic docker \
  --add-topic grad-cam --add-topic explainable-ai --add-topic agentic-ai --add-topic miniproject >/dev/null 2>&1 || true

say "Done. Watch the build:  gh run watch   (or the repo's Actions tab)"
echo "Your site (live in ~2-3 minutes): https://$(printf '%s' "$OWNER" | tr '[:upper:]' '[:lower:]').github.io/$REPO/"
