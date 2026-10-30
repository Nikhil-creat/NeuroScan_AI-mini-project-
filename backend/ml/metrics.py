"""Evaluation metrics in plain Python (no numpy/torch), so they are easy to test and audit."""
from __future__ import annotations


def confusion_matrix(y_true: list[int], y_pred: list[int], n: int) -> list[list[int]]:
    m = [[0] * n for _ in range(n)]
    for t, p in zip(y_true, y_pred):
        m[t][p] += 1
    return m


def per_class(matrix: list[list[int]], labels: list[str]) -> list[dict]:
    out = []
    for i, label in enumerate(labels):
        tp = matrix[i][i]
        fp = sum(matrix[r][i] for r in range(len(labels))) - tp
        fn = sum(matrix[i]) - tp
        prec = tp / (tp + fp) if tp + fp else 0.0
        rec = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * prec * rec / (prec + rec) if prec + rec else 0.0
        out.append({"label": label, "precision": prec, "recall": rec, "f1": f1, "support": sum(matrix[i])})
    return out


def accuracy(matrix: list[list[int]]) -> float:
    total = sum(map(sum, matrix))
    return sum(matrix[i][i] for i in range(len(matrix))) / total if total else 0.0


def macro_f1(rows: list[dict]) -> float:
    return sum(r["f1"] for r in rows) / len(rows) if rows else 0.0


def expected_calibration_error(probs: list[list[float]], y_true: list[int], bins: int = 10) -> float:
    """ECE: weighted gap between confidence and accuracy across equal-width confidence bins."""
    n = len(y_true)
    if n == 0:
        return 0.0
    buckets: list[list[tuple[float, bool]]] = [[] for _ in range(bins)]
    for p, t in zip(probs, y_true):
        conf = max(p)
        pred = p.index(conf)
        buckets[min(int(conf * bins), bins - 1)].append((conf, pred == t))
    ece = 0.0
    for b in buckets:
        if b:
            avg_conf = sum(c for c, _ in b) / len(b)
            acc = sum(ok for _, ok in b) / len(b)
            ece += len(b) / n * abs(avg_conf - acc)
    return ece


def summarise(y_true: list[int], probs: list[list[float]], labels: list[str]) -> dict:
    y_pred = [p.index(max(p)) for p in probs]
    cm = confusion_matrix(y_true, y_pred, len(labels))
    rows = per_class(cm, labels)
    return {
        "n": len(y_true),
        "accuracy": accuracy(cm),
        "macroF1": macro_f1(rows),
        "ece": expected_calibration_error(probs, y_true),
        "perClass": [{k: v for k, v in r.items() if k != "support"} for r in rows],
        "confusion": {"labels": labels, "matrix": cm},
    }
