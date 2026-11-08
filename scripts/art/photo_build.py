#!/usr/bin/env python3
"""Baut aus den fotorealen Rohbildern die Dialog-Halbporträts (Design §6.2).

Aufruf (aus dem Projektordner):
  python3 scripts/art/photo_build.py [ids ...]       ohne ids: alle Figuren mit Rohbildern
  python3 scripts/art/photo_build.py --contact       nur Kontaktbogen neu
  python3 scripts/art/photo_build.py --manifest      nur Fragmente zu design/assets/photos.manifest.json zusammenführen
Optionen: --no-contact (Kontaktbogen und Manifest-Zusammenführung auslassen; für parallele Teilbuilds)

Eingaben:  output/imagegen/raw/photos/<id>-<expr>.png bzw. die in scripts/art/photo_config/<id>.json unter "raws"
           gewählte Fassung; optional "crop": {"<expr>": [x0, y0, x1, y1]} (Pixel im Rohbild).
Ausgaben:  game/public/assets/photos/<id>/<expr>.webp     640×960, WebP Qualität 82, unten sanft abgedunkelt
           design/assets/photos/<id>.json                  Manifest-Fragment {images: {"photo-<id>-<expr>": …}}
           design/assets/photos.manifest.json              alle Fragmente (Teil von game/public/assets/manifest.json)
           design/assets/photos-build/<id>.json            Quelle, Prüfsumme, Zuschnitt je Bild
           output/qa/art/photos.png                        Kontaktbogen Figuren × Ausdrücke

Verarbeitung: optionaler Zuschnitt aus der Config → mittiger Zuschnitt auf 2:3 (bei breiteren Bildern seitlich, bei
höheren Bildern oben bündig, damit der Kopf erhalten bleibt) → LANCZOS auf 640×960 → untere 22 % weich zu
#0a0812 abgedunkelt (bis 55 %, Smoothstep), damit das Bild unter der Dialogbox ruhig ausläuft → WebP q82.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

sys.path.insert(0, str(Path(__file__).resolve().parent))
import photo_prompts as pp  # noqa: E402

ROOT = pp.ROOT
RAW = pp.RAW
OUT = ROOT / "game/public/assets/photos"
FRAG = ROOT / "design/assets/photos"
MANIFEST = ROOT / "design/assets/photos.manifest.json"
BUILD_LOG = ROOT / "design/assets/photos-build"  # je Figur eine Datei (parallele Agenten)
QA = ROOT / "output/qa/art"

W, H = 640, 960
FADE_FROM = 0.78          # ab diesem Anteil der Höhe beginnt die Abdunklung
FADE_MAX = 0.55           # Stärke am unteren Rand
FADE_COLOR = (10, 8, 18)


def rel(p: Path) -> str:
    try:
        return str(p.relative_to(ROOT))
    except ValueError:
        return str(p)


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()[:16]


def crop_23(img: Image.Image) -> tuple[Image.Image, list[int]]:
    w, h = img.size
    if abs(w / h - 2 / 3) < 0.005:
        return img, [0, 0, w, h]
    if w / h > 2 / 3:  # zu breit: mittig seitlich beschneiden
        nw = round(h * 2 / 3)
        x0 = (w - nw) // 2
        box = [x0, 0, x0 + nw, h]
    else:  # zu hoch: oben bündig (Kopf bleibt), unten kürzen
        nh = round(w * 3 / 2)
        box = [0, 0, w, nh]
    return img.crop(box), box


def darken_bottom(img: Image.Image) -> Image.Image:
    arr = np.asarray(img, dtype=np.float32)
    y = np.linspace(0, 1, arr.shape[0], dtype=np.float32)
    t = np.clip((y - FADE_FROM) / (1 - FADE_FROM), 0, 1)
    a = (t * t * (3 - 2 * t) * FADE_MAX)[:, None, None]
    out = arr * (1 - a) + np.array(FADE_COLOR, dtype=np.float32) * a
    return Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8))


def build_one(cid: str, expr: str, src: Path, cfg: dict) -> dict:
    img = Image.open(src).convert("RGB")
    raw_size = list(img.size)
    pre = cfg.get("crop", {}).get(expr)
    if pre:
        img = img.crop(tuple(pre))
    img, box = crop_23(img)
    img = darken_bottom(img.resize((W, H), Image.LANCZOS))
    out = OUT / cid / f"{expr}.webp"
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out, "WEBP", quality=82, method=6)
    return {"src": src.name, "sha": sha(src), "rawSize": raw_size, "crop": pre, "crop23": box,
            "bytes": out.stat().st_size}


def build(cid: str) -> dict:
    cfg = pp.config(cid)
    images, meta = {}, {}
    for expr in pp.defaults(cid)["exprs"]:
        src = pp.chosen_raw(cid, expr)
        if not src.exists():
            continue
        meta[expr] = build_one(cid, expr, src, cfg)
        images[f"photo-{cid}-{expr}"] = f"assets/photos/{cid}/{expr}.webp"
    if not images:
        return {}
    FRAG.mkdir(parents=True, exist_ok=True)
    (FRAG / f"{cid}.json").write_text(json.dumps({"images": images}, indent=2) + "\n")
    BUILD_LOG.mkdir(parents=True, exist_ok=True)
    (BUILD_LOG / f"{cid}.json").write_text(json.dumps(meta, ensure_ascii=False, indent=1) + "\n")
    return meta


def merge_manifest() -> Path:
    order = {cid: i for i, cid in enumerate(pp.PHOTO)}
    images = {}
    for p in sorted(FRAG.glob("*.json"), key=lambda p: (order.get(p.stem, len(order)), p.stem)):
        for key, val in json.loads(p.read_text()).get("images", {}).items():
            if key in images and images[key] != val:
                raise ValueError(f"Manifest-Schlüssel {key} doppelt ({p.name})")
            images[key] = val
    MANIFEST.write_text(json.dumps({"images": images}, indent=2) + "\n")
    return MANIFEST


def font(size: int):
    for f in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/System/Library/Fonts/Helvetica.ttc"):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            pass
    return ImageFont.load_default()


def contact_sheet() -> Path | None:
    ids = [cid for cid in pp.PHOTO if (OUT / cid).is_dir() and any((OUT / cid).glob("*.webp"))]
    if not ids:
        return None
    cols = list(pp.EXPRESSIONS)  # dazu Zusatzausdrücke (z. B. Romanze), sofern eine Figur sie hat
    for cid in ids:
        cols += [e for e in pp.defaults(cid)["exprs"] if e not in cols]
    tw, th, lab, head = 160, 240, 130, 28
    sheet = Image.new("RGB", (lab + tw * len(cols), head + th * len(ids)), (18, 14, 28))
    d = ImageDraw.Draw(sheet)
    f = font(16)
    for i, e in enumerate(cols):
        d.text((lab + i * tw + 8, 6), e, fill=(220, 220, 235), font=f)
    for r, cid in enumerate(ids):
        y = head + r * th
        d.text((8, y + th // 2 - 8), cid, fill=(220, 220, 235), font=f)
        exprs = pp.defaults(cid)["exprs"]
        for i, e in enumerate(cols):
            x = lab + i * tw
            p = OUT / cid / f"{e}.webp"
            if p.exists():
                sheet.paste(Image.open(p).convert("RGB").resize((tw - 4, th - 4), Image.LANCZOS), (x + 2, y + 2))
            else:
                d.rectangle([x + 2, y + 2, x + tw - 3, y + th - 3], fill=(40, 34, 56) if e in exprs else (24, 20, 34))
                if e in exprs:
                    d.text((x + 50, y + th // 2 - 8), "fehlt", fill=(230, 90, 120), font=f)
    QA.mkdir(parents=True, exist_ok=True)
    out = QA / "photos.png"
    sheet.save(out, optimize=True)
    return out


def main(argv: list[str]) -> int:
    flags = {a for a in argv if a.startswith("--")}
    ids = [a for a in argv if not a.startswith("--")]
    if "--contact" in flags:
        print(contact_sheet())
        return 0
    if "--manifest" in flags:
        print(merge_manifest())
        return 0
    if not ids:
        ids = [cid for cid in pp.PHOTO if any(RAW.glob(f"{cid}-*.png"))]
    bad = [i for i in ids if i not in pp.PHOTO]
    if bad:
        print(f"Unbekannte Figuren-ID(s): {bad}")
        return 1
    status = 0
    for cid in ids:
        try:
            meta = build(cid)
        except Exception as e:  # noqa: BLE001 – je Figur weiterbauen
            print(f"FEHLER {cid}: {e}")
            status = 1
            continue
        if not meta:
            print(f"{cid}: keine Rohbilder")
            continue
        missing = [e for e in pp.defaults(cid)["exprs"] if e not in meta]
        print(f"{cid}: {', '.join(f'{e} ({m['src']}, {m['bytes'] // 1024} KB)' for e, m in meta.items())}"
              + (f"\n  fehlt: {', '.join(missing)}" if missing else ""))
    if "--no-contact" not in flags:
        print(f"Kontaktbogen: {contact_sheet()}")
        print(f"Manifest: {merge_manifest()}")
    return status


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
