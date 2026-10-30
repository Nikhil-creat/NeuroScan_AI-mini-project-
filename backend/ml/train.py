"""Train the 3-class ResNet-18 used by the API.

Expected data layout (class folder names are mapped by ml/labels.py):

    data/
      train/<class folders>/*.jpg|png
      test/<class folders>/*.jpg|png        (kept untouched until ml/evaluate.py)

A validation set is carved from train. WARNING: if several slices come from one patient, a random
split leaks patients across train/val and inflates scores. Prefer a patient-level split when you
have patient IDs, and say which you used in your report.

Usage:
    python -m ml.train --data ./data --epochs 15 --out models/neuroscan_resnet18.pt
"""
from __future__ import annotations

import argparse
import json
import random
from pathlib import Path

from .labels import CLASSES, folder_to_class
from .metrics import summarise


def collect(root: Path, override: dict | None):
    items = []
    for folder in sorted(p for p in root.iterdir() if p.is_dir()):
        cls = folder_to_class(folder.name, override)
        for f in folder.rglob("*"):
            if f.suffix.lower() in {".jpg", ".jpeg", ".png"}:
                items.append((f, cls))
    if not items:
        raise SystemExit(f"No images found under {root}")
    return items


def main() -> None:
    ap = argparse.ArgumentParser()
    ap.add_argument("--data", required=True)
    ap.add_argument("--out", default="models/neuroscan_resnet18.pt")
    ap.add_argument("--epochs", type=int, default=15)
    ap.add_argument("--batch", type=int, default=32)
    ap.add_argument("--lr", type=float, default=3e-4)
    ap.add_argument("--val-frac", type=float, default=0.15)
    ap.add_argument("--no-pretrained", action="store_true")
    ap.add_argument("--map", type=str, default=None, help='JSON {"folder name": class_index}')
    ap.add_argument("--seed", type=int, default=42)
    args = ap.parse_args()

    import numpy as np
    import torch
    import torchvision
    from PIL import Image
    from torch import nn
    from torch.utils.data import DataLoader, Dataset
    from torchvision import transforms as T

    random.seed(args.seed)
    np.random.seed(args.seed)
    torch.manual_seed(args.seed)
    override = json.loads(args.map) if args.map else None

    items = collect(Path(args.data) / "train", override)
    random.shuffle(items)
    n_val = int(len(items) * args.val_frac)
    val_items, train_items = items[:n_val], items[n_val:]
    counts = [sum(1 for _, c in train_items if c == k) for k in range(3)]
    print("train class counts:", dict(zip(CLASSES, counts)), "| val:", len(val_items))
    if min(counts) == 0:
        raise SystemExit("A class has no training images; check folder names / --map")

    norm = T.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
    train_tf = T.Compose([
        T.Resize((224, 224)), T.RandomHorizontalFlip(), T.RandomRotation(10),
        T.ColorJitter(brightness=0.15, contrast=0.15), T.ToTensor(), norm,
    ])
    eval_tf = T.Compose([T.Resize((224, 224)), T.ToTensor(), norm])

    class DS(Dataset):
        def __init__(self, rows, tf):
            self.rows, self.tf = rows, tf

        def __len__(self):
            return len(self.rows)

        def __getitem__(self, i):
            path, y = self.rows[i]
            return self.tf(Image.open(path).convert("RGB")), y

    dev = "cuda" if torch.cuda.is_available() else "cpu"
    tl = DataLoader(DS(train_items, train_tf), batch_size=args.batch, shuffle=True, num_workers=2)
    vl = DataLoader(DS(val_items, eval_tf), batch_size=args.batch, num_workers=2)

    weights = torchvision.models.ResNet18_Weights.IMAGENET1K_V1 if not args.no_pretrained else None
    model = torchvision.models.resnet18(weights=weights)
    model.fc = nn.Linear(model.fc.in_features, 3)
    model.to(dev)

    class_w = torch.tensor([sum(counts) / (3 * c) for c in counts], dtype=torch.float32, device=dev)
    loss_fn = nn.CrossEntropyLoss(weight=class_w)
    opt = torch.optim.AdamW(model.parameters(), lr=args.lr, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=args.epochs)

    def run_val():
        model.eval()
        logits_all, ys = [], []
        with torch.no_grad():
            for x, y in vl:
                logits_all.append(model(x.to(dev)).cpu())
                ys.extend(y.tolist())
        logits = torch.cat(logits_all)
        return logits, ys

    best_f1, out = -1.0, Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)
    for epoch in range(args.epochs):
        model.train()
        total = 0.0
        for x, y in tl:
            x, y = x.to(dev), y.to(dev)
            opt.zero_grad()
            loss = loss_fn(model(x), y)
            loss.backward()
            opt.step()
            total += loss.item() * len(y)
        sched.step()
        logits, ys = run_val()
        probs = torch.softmax(logits, 1).tolist()
        s = summarise(ys, probs, CLASSES)
        print(f"epoch {epoch + 1:02d} loss {total / len(train_items):.4f} val acc {s['accuracy']:.3f} macroF1 {s['macroF1']:.3f}")
        if s["macroF1"] > best_f1:
            best_f1 = s["macroF1"]
            torch.save(model.state_dict(), out)

    # --- temperature scaling on the validation set (post-hoc calibration) ---
    model.load_state_dict(torch.load(out, map_location=dev))
    logits, ys = run_val()
    y = torch.tensor(ys)
    temp = torch.nn.Parameter(torch.ones(1) * 1.5)
    opt_t = torch.optim.LBFGS([temp], lr=0.1, max_iter=60)

    def closure():
        opt_t.zero_grad()
        l = nn.functional.cross_entropy(logits / temp.clamp(min=0.05), y)
        l.backward()
        return l

    opt_t.step(closure)
    T_val = float(temp.clamp(min=0.05).item())
    (out.parent / "calibration.json").write_text(json.dumps({"temperature": T_val, "fit_on": "validation"}))
    print(f"saved {out} (best val macroF1 {best_f1:.3f}) and calibration.json (T={T_val:.3f})")


if __name__ == "__main__":
    main()
