# Deploy from your phone with Termux (copy-paste commands)

Install Termux from **F-Droid** (the Play Store version is outdated).

## A. Get the zip into Termux

1. Download `neuroscan-ai-platform.zip` to your phone (it lands in *Downloads*).
2. In Termux:

```bash
termux-setup-storage            # tap Allow in the popup
pkg update -y && pkg install -y git gh unzip
```

## B. One command

```bash
cd ~
unzip -q ~/storage/downloads/neuroscan-ai-platform.zip -d ~/ns-tmp
bash ~/ns-tmp/neuroscan-ai-platform/termux-deploy.sh
```

The script will:
1. ask you to log in to GitHub: choose **HTTPS** → **Login with a web browser**, open the link, type the 8-character code;
2. clone `Nikhil-creat/NeuroScan_AI-mini-project-`, move your report to `docs/`, copy the project in;
3. commit, push, switch Pages to **GitHub Actions**, set topics and description;
4. print your live URL: `https://nikhil-creat.github.io/NeuroScan_AI-mini-project-/`

Wait 2–3 minutes, then open the URL. Check progress with `gh run watch` or the repo's **Actions** tab.

## C. Manual commands (if you prefer typing them yourself)

```bash
gh auth login -h github.com -p https -w
gh auth setup-git
git config --global user.name  "Nikhil Chary Sriramoju"
git config --global user.email "sriramojunikhil66@gmail.com"

cd ~ && gh repo clone Nikhil-creat/NeuroScan_AI-mini-project-
cd NeuroScan_AI-mini-project-
mkdir -p docs && git mv "NeuroScan AI.docx" docs/
unzip -q ~/storage/downloads/neuroscan-ai-platform.zip -d ~/ns-tmp
cp -a ~/ns-tmp/neuroscan-ai-platform/. .
git add -A && git commit -m "NeuroScan AI v2" && git push origin main
gh api -X PUT repos/Nikhil-creat/NeuroScan_AI-mini-project-/pages -f build_type=workflow
```

## D. Updating the site later (edit → push)

```bash
cd ~/neuroscan-deploy/NeuroScan_AI-mini-project-     # or wherever you cloned
nano src/config.js                                   # your details, counts, team
git add -A && git commit -m "Update details" && git push
```

Every push to `main` re-runs the tests and redeploys automatically.

## Troubleshooting

| Problem | Fix |
|---|---|
| `Zip not found` | Check the path, or pass it: `bash termux-deploy.sh /storage/emulated/0/Download/neuroscan-ai-platform.zip` |
| `Permission denied (push)` | You must be logged in as the repo owner: `gh auth status`, then `gh auth login` again |
| Pages shows 404 | Settings → Pages → Source must be **GitHub Actions**; re-run the workflow from the Actions tab |
| Workflow fails at tests/build | Open the failed step in the Actions tab and read the red lines; send them to me |
| Hidden `.github` folder missing | Always use `cp -a src/. .` (note the trailing `/.`) |

## Training the model on mobile?

Don't: use a free Google Colab GPU. Upload `backend/`, run `python -m ml.train --data ./data` and `python -m ml.evaluate --data ./data --out ../src/metrics.json`, download `models/neuroscan_resnet18.pt`, `models/calibration.json` and `src/metrics.json`, then commit `src/metrics.json` from Termux. The site's Evaluation section fills itself in.
