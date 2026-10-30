# Security policy

NeuroScan AI is an academic prototype. It has not had a formal security audit and must not be used with real patient data.

## Reporting a vulnerability

Please email sriramojunikhil66@gmail.com with steps to reproduce. Do not open a public issue for a vulnerability.

## Hardening checklist before any real-world pilot

- Set a long random `NEUROSCAN_SECRET`; never commit `.env`.
- Run behind HTTPS; use PostgreSQL and a shared rate-limit store (Redis).
- Encrypt volumes and back up the audit log off-host.
- Run image scanning (Trivy) and dependency audits in CI.
- Obtain ethics approval and regulatory guidance before using any real patient data.
