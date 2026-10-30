"""Evaluate the trained model on the untouched test split and write metrics for the website.

Usage:
    python -m ml.evaluate --data ./data --weights models/neuroscan_resnet18.pt --out ../src/metrics.json
Then rebuild/push the site: the Evaluation section fills itself in.
"""
from __future__ import annotations

import argparse
import json
from pathlib import Path

from .labels import CLASSES
from .metrics import summarise
from .train import collect


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--weights", default="models/neuroscan_resnet18.pt")
    ap.add_argument("--out", default="metrics.json")
    ap.add_argument("--map", type=str, default=None)
    args = ap.parse_args()

    import torch
    import torchvision
    from PIL import Image
    from torchvision import transforms as T

    items = collect(Path(args.data) / "test", json.loads(args.map) if args.map else None)
    calib = Path(args.weights).parent / "calibration.json"
    temperature = json.loads(calib.read_text())["temperature"] if calib.exists() else 1.0

    model = torchvision.models.resnet18(weights=None)
    model.fc = torch.nn.Linear(model.fc.in_features, 3)
    model.load_state_dict(torch.load(args.weights, map_location="cpu"))
    model.eval()
    tf = T.Compose([T.Resize((224, 224)), T.ToTensor(), T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])])

    probs, ys = [], []
    with torch.no_grad():
        for path, y in items:
            x = tf(Image.open(path).convert("RGB")).unsqueeze(0)
            probs.append(torch.softmax(model(x) / temperature, 1)[0].tolist())
            ys.append(y)

    result = summarise(ys, probs, CLASSES)
    Path(args.out).write_text(json.dumps(result, indent=2))
    print(json.dumps({k: result[k] for k in ("n", "accuracy", "macroF1", "ece")}, indent=2))
    print("wrote", args.out)


if __name__ == "__main__":
    main()
