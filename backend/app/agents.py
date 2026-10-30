"""Guard-railed multi-agent review pipeline.

Design rules (enforced in code, covered by tests):
  * every tool call goes through an allow-list per agent
  * retrieved text is sanitised: it is data, never instructions
  * the report is extractive — each evidence line is a retrieved passage with a citation
  * NOTHING is ever released here: the final status is always pending clinician review
"""
from __future__ import annotations

from dataclasses import dataclass, field

from . import guardrails
from .audit import AuditLog
from .rag import KnowledgeBase

CLASSES = ["Alzheimer's Disease", "Brain Tumor", "Normal Anatomy"]

TOOL_ALLOW = {
    "supervisor": {"queue_for_review"},
    "imaging": {"cnn_predict", "gradcam"},
    "retrieval": {"hybrid_search"},
    "report": {"draft_report"},
    "safety": {"pii_scan", "injection_filter", "faithfulness_check"},
    "critic": {"consistency_check"},
}


@dataclass
class Policy:
    auto_accept_conf: float = 0.90  # below this a clinician still reviews, but not flagged as priority
    abstain_conf: float = 0.60  # below this the system abstains and flags priority review
    min_margin: float = 0.15  # top-1 vs top-2 gap
    max_heat_area: float = 0.45  # fraction of heatmap above 0.5; larger = diffuse


@dataclass
class Run:
    case_id: str
    trace: list = field(default_factory=list)
    flags: list = field(default_factory=list)


class Orchestrator:
    def __init__(self, kb: KnowledgeBase, audit: AuditLog | None = None, policy: Policy | None = None):
        self.kb, self.audit, self.policy = kb, audit, policy or Policy()

    # -- tool gate ---------------------------------------------------------
    def _call(self, run: Run, agent: str, tool: str, fn, *args, **kwargs):
        if tool not in TOOL_ALLOW.get(agent, set()):
            if self.audit:
                self.audit.append(agent, "tool_denied", {"tool": tool, "case": run.case_id})
            raise PermissionError(f"agent '{agent}' may not call '{tool}'")
        return fn(*args, **kwargs)

    def _log(self, run: Run, agent: str, message: str) -> None:
        run.trace.append({"agent": agent, "message": message})
        if self.audit:
            self.audit.append(agent, "agent_step", {"case": run.case_id, "message": message})

    # -- pipeline ----------------------------------------------------------
    def run_case(self, case_id: str, prediction: dict, notes: str = "") -> dict:
        """`prediction` comes from the imaging service: label, confidence, probs, ood(bool), heat_area."""
        run = Run(case_id)
        self._log(run, "supervisor", "plan: validate, retrieve, draft, verify, queue for clinician")

        # safety: input
        pii = self._call(run, "safety", "pii_scan", guardrails.scan_pii, notes)
        if pii:
            run.flags.append("pii_in_notes")
            notes = guardrails.redact_pii(notes)
            self._log(run, "safety", f"PII found in notes and redacted: {sorted(pii)}")
        else:
            self._log(run, "safety", "input clean")

        if prediction.get("ood"):
            self._log(run, "supervisor", "image failed out-of-distribution check; no prediction trusted")
            return self._finish(run, prediction, report=None, status="rejected_input", priority="high")

        label, conf = prediction["label"], float(prediction["confidence"])
        probs = sorted(prediction["probs"].values(), reverse=True)
        self._log(run, "imaging", f"{label} at {conf:.2f}")

        if conf < self.policy.abstain_conf:
            run.flags.append("low_confidence_abstain")
            self._log(run, "supervisor", "confidence below abstain threshold; skipping report")
            return self._finish(run, prediction, report=None, status="abstained", priority="high")

        # retrieval
        hits = self._call(run, "retrieval", "hybrid_search", self.kb.search, f"{label} MRI findings", 4)
        passages, dropped = [], 0
        for h in hits:
            clean, was_flagged = guardrails.sanitize_passage(h["text"])
            if was_flagged:
                dropped += 1
                run.flags.append("injection_text_removed")
            if clean:
                passages.append({**h, "text": clean})
        self._log(run, "retrieval", f"{len(passages)} passage(s) kept, {dropped} sanitised")

        # report (extractive)
        report = self._call(run, "report", "draft_report", self._draft, label, conf, passages)

        # safety: output
        ok = all(
            self._call(run, "safety", "faithfulness_check", guardrails.faithfulness, e["text"], [p["text"] for p in passages])
            for e in report["evidence"]
        )
        if not ok:
            run.flags.append("unfaithful_output")
        self._log(run, "safety", "output faithful to sources" if ok else "output contained unsupported text")

        # critic
        issues = self._call(run, "critic", "consistency_check", self._critic, conf, probs, prediction.get("heat_area"))
        run.flags.extend(issues)
        self._log(run, "critic", "no contradictions" if not issues else f"flags: {issues}")

        priority = "high" if run.flags or conf < self.policy.auto_accept_conf else "normal"
        return self._finish(run, prediction, report=report, status="pending_clinician_review", priority=priority)

    # -- helpers -----------------------------------------------------------
    def _draft(self, label: str, conf: float, passages: list[dict]) -> dict:
        evidence = [{"cite": i + 1, "source": p["id"], "text": p["text"][:400]} for i, p in enumerate(passages)]
        return {
            "finding": f"Model output: {label} (calibrated confidence {conf:.0%}).",
            "evidence": evidence,
            "evidence_note": None if evidence else "No supporting passages found in the approved knowledge base.",
            "disclaimer": "AI-generated decision support for a qualified clinician. Not a diagnosis.",
        }

    def _critic(self, conf: float, sorted_probs: list[float], heat_area: float | None) -> list[str]:
        issues = []
        if len(sorted_probs) > 1 and sorted_probs[0] - sorted_probs[1] < self.policy.min_margin:
            issues.append("narrow_margin_between_top_classes")
        if heat_area is not None and conf >= self.policy.auto_accept_conf and heat_area > self.policy.max_heat_area:
            issues.append("high_confidence_but_diffuse_heatmap")
        return issues

    def _finish(self, run: Run, prediction: dict, report, status: str, priority: str) -> dict:
        self._call(run, "supervisor", "queue_for_review", lambda: None)
        self._log(run, "supervisor", f"{status}; priority={priority}; NOT released")
        return {
            "case_id": run.case_id,
            "status": status,
            "priority": priority,
            "released": False,  # only an authenticated clinician can release, via the API
            "flags": sorted(set(run.flags)),
            "report": report,
            "trace": run.trace,
        }
