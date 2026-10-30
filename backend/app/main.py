"""NeuroScan AI REST API.

Run:  uvicorn app.main:app --reload   (docs at /api/docs)
"""
from __future__ import annotations

import json
import os
import secrets
import uuid
from pathlib import Path

import jwt
from fastapi import Depends, FastAPI, File, Form, HTTPException, Request, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from pydantic import BaseModel, Field

from . import guardrails, security
from .agents import CLASSES, Orchestrator
from .audit import AuditLog
from .db import Database
from .inference import MAX_BYTES, Predictor, sniff_image
from .rag import KnowledgeBase, extract_pdf_text

DATA = Path(os.environ.get("DATA_DIR", "./data"))
SECRET = os.environ.get("NEUROSCAN_SECRET") or secrets.token_urlsafe(48)  # random per process if unset (dev only)
ORIGINS = [o.strip() for o in os.environ.get("CORS_ORIGINS", "http://localhost:5173").split(",") if o.strip()]

db = Database(DATA / "neuroscan.db")
audit = AuditLog(DATA / "audit.jsonl")
kb = KnowledgeBase(DATA / "knowledge.json")
predictor = Predictor(
    os.environ.get("WEIGHTS_PATH", "./models/neuroscan_resnet18.pt"),
    demo_mode=os.environ.get("DEMO_MODE", "0") == "1",
)
orchestrator = Orchestrator(kb, audit)
login_limiter = security.RateLimiter(10, 60)
upload_limiter = security.RateLimiter(20, 60)

if os.environ.get("ADMIN_USERNAME") and os.environ.get("ADMIN_PASSWORD"):
    if db.create_user(os.environ["ADMIN_USERNAME"], security.hash_password(os.environ["ADMIN_PASSWORD"]), "admin"):
        audit.append("system", "admin_bootstrapped", {"username": os.environ["ADMIN_USERNAME"]})

app = FastAPI(title="NeuroScan AI API", version="2.0.0", docs_url="/api/docs", openapi_url="/api/openapi.json")
app.add_middleware(
    CORSMiddleware,
    allow_origins=ORIGINS,
    allow_methods=["GET", "POST"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.middleware("http")
async def security_headers(request: Request, call_next):
    resp = await call_next(request)
    resp.headers["X-Content-Type-Options"] = "nosniff"
    resp.headers["X-Frame-Options"] = "DENY"
    resp.headers["Referrer-Policy"] = "no-referrer"
    resp.headers["Cache-Control"] = "no-store"
    return resp


# ---------------------------------------------------------------- auth deps
bearer = HTTPBearer(auto_error=False)


def current_user(creds: HTTPAuthorizationCredentials | None = Depends(bearer)) -> dict:
    if not creds:
        raise HTTPException(401, "Not authenticated")
    try:
        return security.decode_token(creds.credentials, SECRET)
    except jwt.InvalidTokenError:
        raise HTTPException(401, "Invalid or expired token")


def require(*roles: str):
    def dep(user: dict = Depends(current_user)) -> dict:
        if user["role"] not in roles:
            audit.append(user["sub"], "forbidden", {"needed": roles})
            raise HTTPException(403, "Insufficient role")
        return user

    return dep


# ---------------------------------------------------------------- schemas
class Credentials(BaseModel):
    username: str = Field(min_length=3, max_length=40, pattern=r"^[A-Za-z0-9_.-]+$")
    password: str = Field(min_length=1, max_length=128)


class NewUser(Credentials):
    role: str = "clinician"


class Review(BaseModel):
    verdict: str = Field(pattern="^(confirm|override|reject)$")
    final_label: str | None = None
    notes: str = Field(default="", max_length=2000)


# ---------------------------------------------------------------- views
def case_view(row, user: dict) -> dict:
    """Patients see only status (and the clinician's verdict once released); clinicians see the AI work."""
    result, review = json.loads(row["result"]), json.loads(row["review"]) if row["review"] else None
    base = {"id": row["id"], "created": row["created"], "status": row["status"]}
    if user["role"] == "patient":
        return {**base, "review": {"verdict": review["verdict"], "final_label": review["final_label"], "notes": review["notes"]} if review else None}
    return {
        **base,
        "owner": row["owner"],
        "priority": row["priority"],
        "prediction": json.loads(row["prediction"]),
        "flags": result["flags"],
        "report": result["report"],
        "trace": result["trace"],
        "heatmap_png_b64": row["heatmap_b64"],
        "review": review,
    }


def _get_case_or_404(case_id: str, user: dict):
    row = db.get_case(case_id)
    if not row or (user["role"] == "patient" and row["owner"] != user["sub"]):
        raise HTTPException(404, "Case not found")  # same answer for 'missing' and 'not yours'
    return row


# ---------------------------------------------------------------- routes
@app.get("/api/health")
def health():
    return {"status": "ok", "model_mode": predictor.mode, "model_error": predictor.error, "classes": CLASSES}


@app.post("/api/auth/register", status_code=201)
def register(body: Credentials):
    problems = security.password_problems(body.password)
    if problems:
        raise HTTPException(422, "Password needs: " + ", ".join(problems))
    if not db.create_user(body.username, security.hash_password(body.password), "patient"):
        raise HTTPException(409, "Username taken")
    audit.append(body.username, "registered", {"role": "patient"})
    return {"username": body.username, "role": "patient"}


@app.post("/api/auth/login")
def login(body: Credentials, request: Request):
    ip = request.client.host if request.client else "?"
    if not login_limiter.allow(ip):
        raise HTTPException(429, "Too many attempts, slow down")
    row = db.get_user(body.username)
    if not row or not security.verify_password(body.password, row["pw_hash"]):
        audit.append(body.username, "login_failed", {"ip": ip})
        raise HTTPException(401, "Invalid credentials")
    audit.append(body.username, "login", {})
    return {"access_token": security.create_token(row["username"], row["role"], SECRET), "role": row["role"]}


@app.post("/api/admin/users", status_code=201)
def admin_create_user(body: NewUser, admin: dict = Depends(require("admin"))):
    if body.role not in security.ROLES:
        raise HTTPException(422, "Unknown role")
    problems = security.password_problems(body.password)
    if problems:
        raise HTTPException(422, "Password needs: " + ", ".join(problems))
    if not db.create_user(body.username, security.hash_password(body.password), body.role):
        raise HTTPException(409, "Username taken")
    audit.append(admin["sub"], "user_created", {"username": body.username, "role": body.role})
    return {"username": body.username, "role": body.role}


@app.post("/api/cases", status_code=201)
async def create_case(
    file: UploadFile = File(...),
    notes: str = Form("", max_length=1000),
    user: dict = Depends(require("patient", "clinician")),
):
    if not upload_limiter.allow(user["sub"]):
        raise HTTPException(429, "Upload limit reached, try again shortly")
    data = await file.read(MAX_BYTES + 1)
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "File too large (max 8 MB)")
    kind = sniff_image(data)
    if not kind:
        raise HTTPException(415, "Only PNG or JPEG images are accepted")
    try:
        pred = predictor.predict(data)
    except RuntimeError:
        raise HTTPException(503, "Model not available on this server")

    case_id = uuid.uuid4().hex[:12]
    heatmap = pred.pop("heatmap_png_b64", None)
    result = orchestrator.run_case(case_id, pred, notes)

    uploads = DATA / "uploads"
    uploads.mkdir(parents=True, exist_ok=True)
    (uploads / f"{case_id}.{kind}").write_bytes(data)  # original filename is never stored (PHI minimisation)

    db.add_case(case_id, user["sub"], result["status"], result["priority"], pred, result, heatmap)
    audit.append(user["sub"], "case_created", {"case": case_id, "status": result["status"]})
    return case_view(db.get_case(case_id), user)


@app.get("/api/cases")
def list_cases(user: dict = Depends(current_user)):
    rows = db.list_cases(owner=user["sub"] if user["role"] == "patient" else None)
    return [case_view(r, user) for r in rows]


@app.get("/api/cases/{case_id}")
def get_case(case_id: str, user: dict = Depends(current_user)):
    row = _get_case_or_404(case_id, user)
    audit.append(user["sub"], "case_viewed", {"case": case_id})
    return case_view(row, user)


@app.post("/api/cases/{case_id}/review")
def review_case(case_id: str, body: Review, user: dict = Depends(require("clinician"))):
    row = _get_case_or_404(case_id, user)
    if body.final_label is not None and body.final_label not in CLASSES:
        raise HTTPException(422, f"final_label must be one of {CLASSES}")
    review = {"reviewer": user["sub"], **body.model_dump()}
    db.set_review(case_id, "released", review)  # the ONLY place a case becomes released
    audit.append(user["sub"], "case_reviewed", {"case": case_id, "verdict": body.verdict})
    return case_view(db.get_case(case_id), user)


@app.post("/api/knowledge", status_code=201)
async def add_knowledge(
    title: str = Form(..., max_length=120),
    file: UploadFile = File(...),
    admin: dict = Depends(require("admin")),
):
    data = await file.read(20 * 1024 * 1024)
    try:
        text = extract_pdf_text(data) if data.startswith(b"%PDF") else data.decode("utf-8")
    except Exception:
        raise HTTPException(415, "Upload a text-based PDF or UTF-8 text file")
    clean, flagged = guardrails.sanitize_passage(text)
    n = kb.add_document(title, clean, source=title)
    audit.append(admin["sub"], "knowledge_added", {"title": title, "chunks": n, "injection_text_removed": flagged})
    return {"title": title, "chunks": n, "injection_text_removed": flagged}


@app.get("/api/knowledge/search")
def search_knowledge(q: str, user: dict = Depends(require("clinician", "admin"))):
    return kb.search(q)


@app.get("/api/audit/verify")
def verify_audit(admin: dict = Depends(require("admin"))):
    ok, bad_index = audit.verify()
    return {"intact": ok, "first_bad_entry": bad_index, "entries": len(audit.entries)}
