"""Map dataset folder names to the project's three classes (order must match app.agents.CLASSES)."""
from __future__ import annotations

CLASSES = ["Alzheimer's Disease", "Brain Tumor", "Normal Anatomy"]

# Substring rules, checked in order. Covers common public brain-MRI dataset layouts.
_RULES = [
    ("nondemented", 2),  # Alzheimer's datasets: NonDemented -> normal (checked before 'demented')
    ("notumor", 2),
    ("no_tumor", 2),
    ("normal", 2),
    ("demented", 0),  # Very mild / Mild / Moderate Demented -> Alzheimer's
    ("alz", 0),
    ("glioma", 1),
    ("meningioma", 1),
    ("pituitary", 1),
    ("tumor", 1),
    ("tumour", 1),
]


def folder_to_class(name: str, override: dict[str, int] | None = None) -> int:
    key = name.strip().lower().replace(" ", "").replace("-", "")
    if override and name in override:
        return override[name]
    for needle, idx in _RULES:
        if needle in key:
            return idx
    raise ValueError(f"Cannot map folder '{name}' to a class; pass --map '{{\"{name}\": 0|1|2}}'")
