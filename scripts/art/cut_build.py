#!/usr/bin/env python3
"""Baut fotoreale Bildtafeln (design.md §6.1) aus output/imagegen/raw/cut/<id>.png.

Aufruf: python3 scripts/art/cut_build.py <ids|all>
- Ziel: game/public/assets/cut/<id>.webp, 1536×1024, höchstens 1,2 MB.
- Manifest: design/assets/cut.manifest.json (Datei, Größe, Bytes, Blurhash 4×3).
- Kontaktbogen: output/qa/art/cut.jpg
Nur Tafeln, die in design/assets/cut.json eingetragen sind, werden gebaut.
"""
from __future__ import annotations

import json
import math
import sys
from pathlib import Path

import numpy as np
from PIL import Image

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "output/imagegen/raw/cut"
OUT = ROOT / "game/public/assets/cut"
PROMPTS = ROOT / "design/assets/cut.json"
MANIFEST = ROOT / "design/assets/cut.manifest.json"
SHEET = ROOT / "output/qa/art/cut.jpg"
SIZE = (1536, 1024)
MAX_BYTES = 1_200_000

B83 = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#$%*+,-.:;=?@[]^_{|}~"


def b83(value: int, length: int) -> str:
    return "".join(B83[(value // 83 ** (length - i - 1)) % 83] for i in range(length))


def srgb_to_linear(c: np.ndarray) -> np.ndarray:
    v = c / 255.0
    return np.where(v <= 0.04045, v / 12.92, ((v + 0.055) / 1.055) ** 2.4)


def linear_to_srgb(v: float) -> int:
    v = max(0.0, min(1.0, v))
    if v <= 0.0031308:
        return int(v * 12.92 * 255 + 0.5)
    return int((1.055 * v ** (1 / 2.4) - 0.055) * 255 + 0.5)


def sign_pow(v: float, e: float) -> float:
    return math.copysign(abs(v) ** e, v)


def blurhash(img: Image.Image, cx: int = 4, cy: int = 3) -> str:
    """BlurHash-Encoder nach der Referenzimplementierung (woltapp/blurhash)."""
    small = img.convert("RGB").resize((32, round(32 * img.height / img.width)), Image.BILINEAR)
    px = srgb_to_linear(np.asarray(small, dtype=np.float64))
    h, w, _ = px.shape
    xs, ys = np.arange(w), np.arange(h)
    factors = []
    for j in range(cy):
        for i in range(cx):
            norm = 1.0 if i == 0 and j == 0 else 2.0
            basis = np.outer(np.cos(math.pi * j * ys / h), np.cos(math.pi * i * xs / w))
            factors.append((px * basis[:, :, None]).sum(axis=(0, 1)) * norm / (w * h))
    dc, ac = factors[0], factors[1:]
    out = b83((cx - 1) + (cy - 1) * 9, 1)
    actual_max = max(float(np.abs(f).max()) for f in ac)
    quant_max = int(max(0, min(82, math.floor(actual_max * 166 - 0.5))))
    max_value = (quant_max + 1) / 166
    out += b83(quant_max, 1)
    out += b83((linear_to_srgb(dc[0]) << 16) + (linear_to_srgb(dc[1]) << 8) + linear_to_srgb(dc[2]), 4)
    for f in ac:
        q = [int(max(0, min(18, math.floor(sign_pow(c / max_value, 0.5) * 9 + 9.5)))) for c in f]
        out += b83(q[0] * 19 * 19 + q[1] * 19 + q[2], 2)
    return out


def save_webp(img: Image.Image, target: Path) -> int:
    for quality in (86, 82, 78, 74, 70, 65, 60):
        img.save(target, "WEBP", quality=quality, method=6)
        size = target.stat().st_size
        if size <= MAX_BYTES:
            return size
    raise SystemExit(f"{target.name}: auch mit Qualität 60 über {MAX_BYTES} Bytes")


def main() -> None:
    if len(sys.argv) < 2:
        raise SystemExit(__doc__)
    plates = json.loads(PROMPTS.read_text())
    want = list(plates) if sys.argv[1] == "all" else sys.argv[1].split(",")
    unknown = [i for i in want if i not in plates]
    if unknown:
        raise SystemExit(f"Nicht in {PROMPTS.name} eingetragen: {', '.join(unknown)}")
    manifest = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {}
    OUT.mkdir(parents=True, exist_ok=True)
    for pid in want:
        src = RAW / f"{pid}.png"
        if not src.exists():
            print(f"fehlt  {src.relative_to(ROOT)}")
            continue
        img = Image.open(src).convert("RGB")
        if img.size != SIZE:
            img = img.resize(SIZE, Image.LANCZOS)
        size = save_webp(img, OUT / f"{pid}.webp")
        manifest[pid] = {"file": f"assets/cut/{pid}.webp", "width": SIZE[0], "height": SIZE[1],
                         "bytes": size, "blurhash": blurhash(img)}
        print(f"ok     {pid}.webp ({size // 1024} KB, {manifest[pid]['blurhash']})")
    MANIFEST.write_text(json.dumps(dict(sorted(manifest.items())), indent=2, ensure_ascii=False) + "\n")
    built = [OUT / f"{k}.webp" for k in sorted(manifest) if (OUT / f"{k}.webp").exists()]
    if built:
        tw, th = 512, 341
        cols = 3
        sheet = Image.new("RGB", (tw * cols, th * math.ceil(len(built) / cols)), "black")
        for n, f in enumerate(built):
            sheet.paste(Image.open(f).convert("RGB").resize((tw, th)), ((n % cols) * tw, (n // cols) * th))
        SHEET.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(SHEET, quality=85)
        print(f"Kontaktbogen: {SHEET}")
    print(f"Manifest: {MANIFEST}")


if __name__ == "__main__":
    main()
