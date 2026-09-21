"""Recompute Cancer Fusion AI metrics from the logits committed in that repo.

The project README reports validation macro-F1 (the set used to pick the
checkpoint). This script reports the held-out test set too. It needs only
numpy: torch .pt files are zip archives, and the tensors are read directly.

    pip install numpy
    python scripts/derive/cancer_fusion_metrics.py

The commit is pinned to match src/data/claims.ts.
"""

from __future__ import annotations

import io
import json
import pickle
import urllib.request
import zipfile

import numpy as np

SHA = "a5699d2e2167f357d8035fad2b51b9bf4b391ee5"
BASE = f"https://raw.githubusercontent.com/Avnish1505/cancer-fusion-ai/{SHA}/reports/calibration/cache"
CLASSES = ["akiec", "bcc", "bkl", "df", "mel", "nv", "vasc"]  # src/dataset.py DX_LABELS
DTYPES = {
    "FloatStorage": np.float32,
    "DoubleStorage": np.float64,
    "HalfStorage": np.float16,
    "LongStorage": np.int64,
    "IntStorage": np.int32,
}


def load_pt(blob: bytes) -> np.ndarray:
    archive = zipfile.ZipFile(io.BytesIO(blob))
    root = archive.namelist()[0].split("/")[0]

    class Unpickler(pickle.Unpickler):
        def find_class(self, module, name):
            if name == "_rebuild_tensor_v2":
                def rebuild(storage, offset, size, stride, *_):
                    count = int(np.prod(size)) if size else 1
                    return storage[offset : offset + count].reshape(size)
                return rebuild
            if name.endswith("Storage"):
                return name
            if module == "collections" and name == "OrderedDict":
                import collections
                return collections.OrderedDict
            return super().find_class(module, name)

        def persistent_load(self, pid):
            _, storage_type, key, _location, _numel = pid
            data = archive.read(f"{root}/data/{key}")
            return np.frombuffer(data, dtype=DTYPES[storage_type])

    return Unpickler(archive.open(f"{root}/data.pkl")).load()


def fetch(name: str) -> np.ndarray:
    with urllib.request.urlopen(f"{BASE}/{name}") as response:
        return load_pt(response.read())


def metrics(split: str) -> dict:
    logits, labels = fetch(f"{split}_logits.pt"), fetch(f"{split}_labels.pt")
    predicted = logits.argmax(axis=1)
    per_class = {}
    raw_f1 = []
    for index, name in enumerate(CLASSES):
        tp = int(((predicted == index) & (labels == index)).sum())
        fp = int(((predicted == index) & (labels != index)).sum())
        fn = int(((predicted != index) & (labels == index)).sum())
        precision = tp / (tp + fp) if tp + fp else 0.0
        recall = tp / (tp + fn) if tp + fn else 0.0
        f1 = 2 * precision * recall / (precision + recall) if precision + recall else 0.0
        raw_f1.append(f1)
        per_class[name] = {
            "n": int((labels == index).sum()),
            "precision": round(precision, 3),
            "recall": round(recall, 3),
            "f1": round(f1, 3),
        }
    mel = CLASSES.index("mel")
    false_mel = {
        CLASSES[t]: int(((predicted == mel) & (labels == t)).sum()) for t in range(len(CLASSES)) if t != mel
    }
    return {
        "n": int(labels.shape[0]),
        "macro_f1": round(float(np.mean(raw_f1)), 4),
        "accuracy": round(float((predicted == labels).mean()), 4),
        "per_class": per_class,
        "melanoma_false_positives": {"total": sum(false_mel.values()), "by_true_class": false_mel},
    }


if __name__ == "__main__":
    print(json.dumps({"commit": SHA, "val": metrics("val"), "test": metrics("test")}, indent=2))
