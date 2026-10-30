"""Safety guardrails: prompt-injection filter, PII scan/redaction, faithfulness check."""
from __future__ import annotations

import re

INJECTION_PATTERNS = [
    r"ignore (all |any |the )?(previous|prior|above|earlier)? ?(instructions|rules|prompts?)",
    r"disregard (all |any |the )?(previous|prior|above)? ?(instructions|rules)",
    r"you are now\b",
    r"\bact as\b",
    r"(reveal|print|show|leak) .{0,30}(system prompt|secret|api key|password)",
    r"</?\s*(system|assistant|instruction)\s*>",
    r"override (the )?(safety|guardrail|policy)",
]
_INJ = [re.compile(p, re.I) for p in INJECTION_PATTERNS]

_EMAIL = re.compile(r"[\w.+-]+@[\w-]+\.[\w.-]+")
_PHONE = re.compile(r"(?<!\d)(?:\+91[\s-]?)?[6-9]\d{9}(?!\d)")
_AADHAAR = re.compile(r"(?<!\d)\d{4}\s?\d{4}\s?\d{4}(?!\d)")

_WORD = re.compile(r"[a-z0-9]+")
_STOP = set(
    "a an the of and or to in on for with is are was were be been by as at from this that these those it its into than then".split()
)


def detect_injection(text: str) -> list[str]:
    return [p.pattern for p in _INJ if p.search(text)]


def sanitize_passage(text: str) -> tuple[str, bool]:
    """Drop sentences that look like instructions. Retrieved text is data, never commands."""
    sentences = re.split(r"(?<=[.!?])\s+", text)
    kept = [s for s in sentences if not detect_injection(s)]
    return " ".join(kept), len(kept) != len(sentences)


def scan_pii(text: str) -> dict[str, int]:
    found = {"email": len(_EMAIL.findall(text)), "phone": len(_PHONE.findall(text)), "id_number": len(_AADHAAR.findall(text))}
    return {k: v for k, v in found.items() if v}


def redact_pii(text: str) -> str:
    text = _EMAIL.sub("[email removed]", text)
    text = _AADHAAR.sub("[id removed]", text)
    return _PHONE.sub("[phone removed]", text)


def faithfulness(sentence: str, passages: list[str], threshold: float = 0.6) -> bool:
    """A sentence is 'supported' if most of its content words appear in a single retrieved passage."""
    words = [w for w in _WORD.findall(sentence.lower()) if w not in _STOP]
    if not words:
        return True
    for p in passages:
        pw = set(_WORD.findall(p.lower()))
        if sum(w in pw for w in words) / len(words) >= threshold:
            return True
    return False
