"""Append-only, hash-chained audit log. Editing or deleting any past line breaks verification."""
from __future__ import annotations

import hashlib
import json
import threading
import time
from pathlib import Path

GENESIS = "0" * 64


def _digest(entry: dict) -> str:
    body = {k: v for k, v in entry.items() if k != "hash"}
    return hashlib.sha256(json.dumps(body, sort_keys=True, separators=(",", ":")).encode()).hexdigest()


class AuditLog:
    def __init__(self, path: str | Path | None = None):
        self.path = Path(path) if path else None
        self.entries: list[dict] = []
        self._lock = threading.Lock()
        if self.path and self.path.exists():
            with self.path.open() as fh:
                self.entries = [json.loads(line) for line in fh if line.strip()]

    def append(self, actor: str, action: str, detail: dict | None = None) -> dict:
        with self._lock:
            prev = self.entries[-1]["hash"] if self.entries else GENESIS
            entry = {"ts": round(time.time(), 3), "actor": actor, "action": action, "detail": detail or {}, "prev": prev}
            entry["hash"] = _digest(entry)
            self.entries.append(entry)
            if self.path:
                self.path.parent.mkdir(parents=True, exist_ok=True)
                with self.path.open("a") as fh:
                    fh.write(json.dumps(entry, sort_keys=True) + "\n")
            return entry

    def verify(self) -> tuple[bool, int | None]:
        """Return (ok, index_of_first_bad_entry)."""
        prev = GENESIS
        for i, e in enumerate(self.entries):
            if e.get("prev") != prev or e.get("hash") != _digest(e):
                return False, i
            prev = e["hash"]
        return True, None
