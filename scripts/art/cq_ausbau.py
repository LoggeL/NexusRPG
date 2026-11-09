#!/usr/bin/env python3
"""Crew-Quartier: Bildvarianten für die Ausbaustufen 4–6 (world-23/quartier-23.ts, gaps/world-23.md).

  python3 scripts/art/cq_ausbau.py prompts           # Prompts nach output/imagegen/raw/maps/crew-quartier-s<n>.prompt.txt
  python3 scripts/art/cq_ausbau.py build             # Kombinationen zusammensetzen + map_build.py bg

Je Stufe entsteht EIN Bearbeitungsbild des Grundbilds (output/imagegen/raw/maps/crew-quartier-s4|s5|s6.png, erzeugt
über scripts/art/codex_image.sh mit dem Grundbild als Referenz). Weil die drei Stufen unabhängig voneinander gekauft
werden, setzt `build` alle sieben Kombinationen zusammen: Grundbild, darauf je Stufe nur ihr Bildbereich (weiche
Maske) aus dem auf das Grundbild registrierten Bearbeitungsbild. Ergebnis: bg-crew-quartier-s4, -s5, -s6, -s45, -s46,
-s56, -s456 (1024×768 wie das Grundbild).
"""
from __future__ import annotations

import subprocess
import sys
from itertools import combinations
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

ROOT = Path(__file__).resolve().parents[2]
RAWDIR = ROOT / "output/imagegen/raw/maps"
BASE = RAWDIR / "crew-quartier.png"

KEEP = ("Edit of the attached image (a hand-painted top-down game map of a small cosy flat). Keep EVERYTHING exactly "
        "as it is: same canvas size and framing, same camera, every object at exactly the same position and size, "
        "same floor, rug, walls, colours, lighting and painting style (clean dark ink outlines, soft painterly cel "
        "shading). Change ONLY the one area described below and leave every other pixel untouched. STRICT: no "
        "people, no animals, no readable text, no letters, no numbers, no logos, no watermark.\n\nCHANGE: ")

# Bereich je Stufe im Rohbild (1536×1024): x0, y0, x1, y1
STAGES = {
    "s4": {
        "box": (60, 420, 300, 870),
        "prompt": KEEP + (
            "Replace the old worn green couch on the LEFT SIDE (lower left, next to the dog basket) with a different, "
            "bigger guest couch from a flea market in exactly the same spot and footprint: a deep burgundy-brown "
            "leather sofa with brass studs and rounded arms, slightly cracked leather, a fresh plump pillow and a "
            "neatly folded checkered blanket on it, a small crocheted cushion. The dog basket, the plant pot and the "
            "purple floor cushion next to it stay unchanged."),
    },
    "s5": {
        "box": (880, 0, 1010, 380),
        "prompt": KEEP + (
            "In the narrow strip of back wall between the large cork pinboard (top center) and the round porthole "
            "window, add a slim steel ladder standing upright against the wall, leading up to a small open roof "
            "hatch in the ceiling beam at the very top edge; green leaves, a tomato vine and a few flowers hang down "
            "through the hatch from a rooftop garden. At the foot of the ladder on the floor: two small seedling "
            "trays and a little green watering can. Keep the ladder thin so the pinboard and the porthole stay fully "
            "visible."),
    },
    "s6": {
        "box": (950, 20, 1300, 240),
        "prompt": KEEP + (
            "The round porthole window on the back wall (top right of center) now shows a calm blue sea panorama "
            "with a bright horizon and a soft sunset glow instead of the pink alley neon; its glass is new and "
            "clean. On the wall directly to the right of the porthole (between the porthole and the desk lamp), add "
            "a framed poster of turquoise ocean waves under a blue sky (no text), plus a thin string of small shells "
            "hanging from the porthole frame. A soft blue light from the window falls on the record shelf below."),
    },
}


def write_prompts() -> None:
    for sid, st in STAGES.items():
        (RAWDIR / f"crew-quartier-{sid}.prompt.txt").write_text(st["prompt"] + "\n")
        print(RAWDIR / f"crew-quartier-{sid}.prompt.txt")


def register(edit: Image.Image, base: Image.Image) -> Image.Image:
    """Bearbeitungsbild per ECC (affin) auf das Grundbild ausrichten (leichte Verschiebung/Skalierung beim Malen)."""
    import cv2
    b = np.asarray(base.convert("L"), np.float32) / 255
    e = np.asarray(edit.convert("L").resize(base.size, Image.LANCZOS), np.float32) / 255
    warp = np.eye(2, 3, dtype=np.float32)
    try:
        _, warp = cv2.findTransformECC(b, e, warp, cv2.MOTION_AFFINE,
                                       (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6), None, 5)
    except cv2.error as exc:  # keine Konvergenz: unverändert
        print(f"  Registrierung fehlgeschlagen ({exc}), nehme Bild unverändert")
        return edit.convert("RGB").resize(base.size, Image.LANCZOS)
    rgb = np.asarray(edit.convert("RGB").resize(base.size, Image.LANCZOS))
    out = cv2.warpAffine(rgb, warp, base.size, flags=cv2.INTER_LANCZOS4 + cv2.WARP_INVERSE_MAP,
                         borderMode=cv2.BORDER_REFLECT)
    print(f"  Ausrichtung: {np.round(warp, 4).tolist()}")
    return Image.fromarray(out)


def mask_for(box: tuple[int, int, int, int], edit: Image.Image, base: Image.Image, feather: int = 14) -> Image.Image:
    """Weiche Maske: nur dort, wo sich das Bearbeitungsbild innerhalb des Stufenbereichs wirklich ändert."""
    import cv2
    diff = np.abs(np.asarray(edit, np.int16) - np.asarray(base, np.int16)).max(axis=2).astype(np.uint8)
    diff = cv2.GaussianBlur(diff, (0, 0), 3)
    changed = (diff > 38).astype(np.uint8) * 255
    k = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25))
    changed = cv2.morphologyEx(changed, cv2.MORPH_CLOSE, k)
    changed = cv2.morphologyEx(changed, cv2.MORPH_OPEN, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    changed = cv2.dilate(changed, k)
    inside = np.zeros_like(changed)
    x0, y0, x1, y1 = box
    inside[y0:y1, x0:x1] = 255
    inside = cv2.GaussianBlur(inside, (0, 0), feather)
    m = cv2.GaussianBlur(changed, (0, 0), feather / 2).astype(np.float32) * inside.astype(np.float32) / 255
    return Image.fromarray(np.clip(m, 0, 255).astype(np.uint8))


def build() -> None:
    base = Image.open(BASE).convert("RGB")
    layers = {}
    for sid, st in STAGES.items():
        raw = RAWDIR / f"crew-quartier-{sid}.png"
        if not raw.exists():
            print(f"{raw.name} fehlt – Stufe {sid} übersprungen")
            continue
        print(sid)
        edit = register(Image.open(raw), base)
        mask = mask_for(st["box"], edit, base)
        mask.save(RAWDIR / f"crew-quartier-{sid}-mask.png")
        layers[sid] = (edit, mask)
    ids = sorted(layers)
    for n in range(1, len(ids) + 1):
        for combo in combinations(ids, n):
            img = base.copy()
            for sid in combo:
                edit, m = layers[sid]
                img = Image.composite(edit, img, m)
            name = "crew-quartier-s" + "".join(s[1:] for s in combo)
            out = RAWDIR / f"{name}-composite.png"
            img.save(out)
            subprocess.run([sys.executable, str(ROOT / "scripts/art/map_build.py"), "bg", name, str(out),
                            "--size=1024x768", f"--prompt-file={RAWDIR / f'crew-quartier-{combo[-1]}.prompt.txt'}"],
                           check=True, cwd=ROOT)


if __name__ == "__main__":
    cmd = sys.argv[1] if len(sys.argv) > 1 else ""
    if cmd == "prompts":
        write_prompts()
    elif cmd == "build":
        build()
    else:
        print(__doc__)
