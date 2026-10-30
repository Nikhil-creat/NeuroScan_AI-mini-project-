"""Image validation + CNN inference + Grad-CAM.

Model: torchvision ResNet-18 with a 3-way head. The class order of the trained head MUST match
`agents.CLASSES` (Alzheimer's Disease, Brain Tumor, Normal Anatomy).

Modes:
  model        weights found -> real prediction + Grad-CAM
  demo         no weights, DEMO_MODE=1 -> clearly flagged SIMULATED output (for UI demos only)
  unavailable  no weights, demo off -> predict() raises RuntimeError
"""
from __future__ import annotations

import base64
import hashlib
import io
import json
import math
import os

from .agents import CLASSES

MAX_BYTES = 8 * 1024 * 1024
_SIGNATURES = ((b"\x89PNG\r\n\x1a\n", "png"), (b"\xff\xd8\xff", "jpg"))


def sniff_image(data: bytes) -> str | None:
    """Trust file content, not the filename or Content-Type."""
    for sig, kind in _SIGNATURES:
        if data.startswith(sig):
            return kind
    return None


class Predictor:
    def __init__(self, weights_path: str | None = None, demo_mode: bool = False, temperature: float = 1.5):
        self.weights_path, self.demo_mode, self.temperature = weights_path, demo_mode, temperature
        self.model = None
        self.error: str | None = None
        if weights_path:  # temperature fitted on the validation set by ml/train.py
            calib = os.path.join(os.path.dirname(weights_path), "calibration.json")
            if os.path.exists(calib):
                try:
                    self.temperature = float(json.load(open(calib))["temperature"])
                except (OSError, ValueError, KeyError):
                    pass
        if weights_path and os.path.exists(weights_path):
            try:
                self._load()
            except Exception as exc:  # torch missing, bad weights, ...
                self.error = f"{type(exc).__name__}: {exc}"

    @property
    def mode(self) -> str:
        return "model" if self.model is not None else ("demo" if self.demo_mode else "unavailable")

    def _load(self) -> None:
        import torch
        import torchvision

        m = torchvision.models.resnet18(weights=None)
        m.fc = torch.nn.Linear(m.fc.in_features, len(CLASSES))
        m.load_state_dict(torch.load(self.weights_path, map_location="cpu"))
        m.eval()
        self.model = m

    def predict(self, data: bytes) -> dict:
        if self.model is not None:
            return self._predict_model(data)
        if self.demo_mode:
            return self._predict_demo(data)
        raise RuntimeError("model weights not found")

    # -- simulated ---------------------------------------------------------
    def _predict_demo(self, data: bytes) -> dict:
        h = hashlib.sha256(data).digest()
        logits = [h[i] / 64.0 for i in range(3)]
        exps = [math.exp(x) for x in logits]
        probs = [e / sum(exps) for e in exps]
        top = max(range(3), key=probs.__getitem__)
        return {
            "label": CLASSES[top],
            "confidence": probs[top],
            "probs": dict(zip(CLASSES, probs)),
            "heat_area": 0.2,
            "ood": False,
            "simulated": True,
            "heatmap_png_b64": None,
        }

    # -- real --------------------------------------------------------------
    @staticmethod
    def _looks_like_mri(arr) -> bool:
        """Cheap OOD gate: MRI slices are near-grayscale and not blank. Replace with a learned detector later."""
        chroma = float(abs(arr[..., 0] - arr[..., 1]).mean() + abs(arr[..., 1] - arr[..., 2]).mean())
        return chroma < 0.06 and float(arr.std()) > 0.05

    def _predict_model(self, data: bytes) -> dict:
        import numpy as np
        import torch
        from PIL import Image

        img = Image.open(io.BytesIO(data)).convert("RGB").resize((224, 224))
        arr = np.asarray(img, dtype=np.float32) / 255.0
        ood = not self._looks_like_mri(arr)
        mean, std = np.array([0.485, 0.456, 0.406]), np.array([0.229, 0.224, 0.225])
        x = torch.from_numpy(((arr - mean) / std).transpose(2, 0, 1)).float().unsqueeze(0)

        store: dict = {}
        layer = self.model.layer4

        def fwd_hook(_m, _i, out):
            store["act"] = out
            out.register_hook(lambda g: store.__setitem__("grad", g))  # tensor hook: safe with in-place ReLU

        handle = layer.register_forward_hook(fwd_hook)
        try:
            logits = self.model(x)
            probs = torch.softmax(logits / self.temperature, dim=1)[0]  # temperature-scaled
            top = int(probs.argmax())
            self.model.zero_grad()
            logits[0, top].backward()
        finally:
            handle.remove()

        weights = store["grad"].mean(dim=(2, 3), keepdim=True)
        cam = torch.relu((weights * store["act"]).sum(1))[0].detach().numpy()
        cam = cam - cam.min()
        cam = cam / (cam.max() + 1e-8)
        cam224 = np.asarray(Image.fromarray((cam * 255).astype("uint8")).resize((224, 224), Image.BILINEAR), dtype=np.float32) / 255.0

        heat = np.stack([cam224, np.clip(4 * cam224 * (1 - cam224), 0, 1), 1 - cam224], axis=-1)
        overlay = (0.6 * arr + 0.4 * heat).clip(0, 1)
        buf = io.BytesIO()
        Image.fromarray((overlay * 255).astype("uint8")).save(buf, format="PNG")

        p = probs.detach().numpy().tolist()
        return {
            "label": CLASSES[top],
            "confidence": float(p[top]),
            "probs": dict(zip(CLASSES, p)),
            "heat_area": float((cam224 >= 0.5).mean()),
            "ood": ood,
            "simulated": False,
            "heatmap_png_b64": base64.b64encode(buf.getvalue()).decode(),
        }
