"""Small dependency-free RAG retriever (BM25). Swap in embeddings + a vector DB when you scale up."""
from __future__ import annotations

import json
import math
import re
from collections import Counter
from pathlib import Path

_TOKEN = re.compile(r"[a-z0-9]+")
_STOP = set("a an the of and or to in on for with is are was were be by as at from this that it its".split())


def tokenize(text: str) -> list[str]:
    return [t for t in _TOKEN.findall(text.lower()) if t not in _STOP]


def chunk_text(text: str, size: int = 120, overlap: int = 30) -> list[str]:
    words = text.split()
    if not words:
        return []
    step = max(1, size - overlap)
    return [" ".join(words[i : i + size]) for i in range(0, len(words), step) if words[i : i + size]]


def extract_pdf_text(data: bytes) -> str:
    import io

    from pypdf import PdfReader  # lazy: only needed for PDF ingestion

    reader = PdfReader(io.BytesIO(data))
    return "\n".join((page.extract_text() or "") for page in reader.pages)


class KnowledgeBase:
    K1, B = 1.5, 0.75

    def __init__(self, path: str | Path | None = None):
        self.path = Path(path) if path else None
        self.chunks: list[dict] = []
        if self.path and self.path.exists():
            self.chunks = json.loads(self.path.read_text())

    def _save(self) -> None:
        if self.path:
            self.path.parent.mkdir(parents=True, exist_ok=True)
            self.path.write_text(json.dumps(self.chunks))

    def add_document(self, title: str, text: str, source: str = "") -> int:
        pieces = chunk_text(text)
        start = len(self.chunks)
        for n, piece in enumerate(pieces):
            self.chunks.append({"id": f"{title}#{n + 1}", "title": title, "source": source, "text": piece})
        self._save()
        return len(self.chunks) - start

    def search(self, query: str, k: int = 4) -> list[dict]:
        q = tokenize(query)
        if not q or not self.chunks:
            return []
        docs = [tokenize(c["text"]) for c in self.chunks]
        n = len(docs)
        avgdl = sum(len(d) for d in docs) / n or 1.0
        df = Counter(t for d in docs for t in set(d))
        scored = []
        for c, d in zip(self.chunks, docs):
            tf = Counter(d)
            score = 0.0
            for t in q:
                if t not in tf:
                    continue
                idf = math.log(1 + (n - df[t] + 0.5) / (df[t] + 0.5))
                score += idf * tf[t] * (self.K1 + 1) / (tf[t] + self.K1 * (1 - self.B + self.B * len(d) / avgdl))
            if score > 0:
                scored.append({**c, "score": round(score, 4)})
        return sorted(scored, key=lambda x: x["score"], reverse=True)[:k]
