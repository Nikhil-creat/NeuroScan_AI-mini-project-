# NeuroScan AI: viva preparation

Answer honestly. Examiners respect "that is a limitation" far more than a bluff.

## Project basics
**Q. What does the project do?** Classifies brain MRI slices into three classes (Alzheimer's disease, brain tumor, normal) with a CNN, shows a Grad-CAM heat map of where the model looked, retrieves cited guideline passages (RAG), and routes everything to a human clinician for sign-off.

**Q. Is it a diagnostic tool?** No. It is a research prototype and decision-support demo. Nothing is released to a patient without clinician review (`released: false` is enforced in the orchestrator and covered by tests).

**Q. Why ResNet-18?** Small, well understood, trains on modest hardware with transfer learning, and Grad-CAM hooks into its last conv block cleanly.

## Machine learning
**Q. What are your accuracy numbers?** Say exactly what `src/metrics.json` shows after you train. Until it is filled the site says "pending". Never quote numbers you did not measure.

**Q. Why temperature scaling?** CNNs are overconfident. A single temperature fitted on validation data makes confidence closer to accuracy; we report ECE.

**Q. Why class-weighted loss?** Classes are imbalanced; weighting stops the model ignoring the small class.

**Q. Does Grad-CAM prove the model is right?** No. It shows where gradient signal was strong, not causality. We flag confident-but-diffuse maps for priority review.

**Q. How do you handle non-MRI uploads?** An out-of-distribution heuristic gate plus low-confidence and narrow-margin abstention. It is a heuristic, not a guarantee.

## RAG and agents
**Q. What is RAG here?** BM25 lexical retrieval over ingested PDFs/text; the report is extractive, each line is a retrieved passage with a citation. No passage means "none found", not an invented answer.

**Q. What is agentic about it?** An orchestrator runs specialised agents (triage, imaging, evidence, report) each with a tool allow-list. No agent has a release tool.

**Q. Prompt injection?** Retrieved text is treated as data; instruction-like sentences are stripped; PII patterns are filtered.

## Security
**Q. Auth?** PBKDF2 password hashing, HS256 JWT, role-based access (patient, clinician, admin), rate limiting.
**Q. Uploads?** Magic-byte sniffing (PNG/JPEG only), 8 MB cap.
**Q. Audit?** Append-only, hash-chained log; editing any row breaks verification (`/api/audit/verify`).
**Q. Docker?** Multi-stage build, non-root nginx, CSP headers, `cap_drop: ALL`, read-only filesystem.

## Limitations (say these before they ask)
Small public datasets, 2D slices only, three classes, no clinical validation, no security audit, BM25 is lexical (no embeddings yet), SQLite and in-memory rate limits suit a single worker. GitHub Pages hosts only the static site; the Console shows a labelled sample unless a backend is deployed.

## Future work
Embedding-based retrieval, 3D volumes (DICOM/NIfTI), more classes, external validation, Postgres + Redis, SSO.
