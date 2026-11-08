#!/usr/bin/env python3
"""Kartenhintergründe und Arenen aufbereiten (design.md §5, §6).

Aufruf:
  python3 scripts/art/map_build.py bg <mapId> <roh.png> [--size=1536x1024] [--prompt-file=datei.txt]
  python3 scripts/art/map_build.py arena <arenaId> <roh.png> [--prompt-file=datei.txt]
  python3 scripts/art/map_build.py blockout <mapId> <aus.png> <geometrie.json>
      geometrie.json: {"size":[w,h], "walk":[[[x,y],…],…], "block":[…], "exits":[[x,y,w,h,"label"],…],
                       "labels":[[x,y,"Text"],…]}  → graue Skizze (Wege hell, Sperren dunkel, Ausgänge cyan)

Ergebnis bg:    game/public/assets/bg/<mapId>.webp  + Fragment design/assets/maps/<mapId>.json (images.bg-<mapId>)
Ergebnis arena: game/public/assets/arena/<id>.webp  + Fragment design/assets/maps/arena-<id>.json (images.arena-<id>)
Danach: node scripts/build_manifest.mjs (führt alle Fragmente zusammen; parallel unbedenklich, deterministisch).
Rohbilder gehören nach output/imagegen/raw/maps/ (nie in Git).
"""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[2]
PUBLIC = ROOT / "game/public/assets"
FRAG = ROOT / "design/assets/maps"


def opt(name: str, default: str | None = None) -> str | None:
    for a in sys.argv:
        if a.startswith(f"--{name}="):
            return a.split("=", 1)[1]
    return default


def fit(img: Image.Image, w: int, h: int) -> Image.Image:
    """Auf Zielformat zuschneiden (mittig, Seitenverhältnis wahren), dann skalieren."""
    img = img.convert("RGB")
    sw, sh = img.size
    target = w / h
    if sw / sh > target:
        nw = round(sh * target)
        img = img.crop(((sw - nw) // 2, 0, (sw - nw) // 2 + nw, sh))
    elif sw / sh < target:
        nh = round(sw / target)
        img = img.crop((0, (sh - nh) // 2, sw, (sh - nh) // 2 + nh))
    return img.resize((w, h), Image.LANCZOS)


def write(kind: str, ident: str, raw: Path) -> None:
    size = opt("size", "1536x1024")
    w, h = (int(v) for v in size.split("x"))
    folder, key = ("bg", f"bg-{ident}") if kind == "bg" else ("arena", f"arena-{ident}")
    out = PUBLIC / folder / f"{ident}.webp"
    out.parent.mkdir(parents=True, exist_ok=True)
    fit(Image.open(raw), w, h).save(out, "WEBP", quality=84, method=6)
    frag = {"images": {key: f"assets/{folder}/{ident}.webp"}, "size": [w, h], "raw": str(raw.relative_to(ROOT)) if raw.is_relative_to(ROOT) else raw.name}
    pf = opt("prompt-file")
    if pf:
        frag["prompt"] = Path(pf).read_text().strip()
    FRAG.mkdir(parents=True, exist_ok=True)
    name = ident if kind == "bg" else f"arena-{ident}"
    (FRAG / f"{name}.json").write_text(json.dumps(frag, ensure_ascii=False, indent=1) + "\n")
    print(f"{out.relative_to(ROOT)} ({out.stat().st_size // 1024} KiB), Fragment design/assets/maps/{name}.json")


def blockout(ident: str, out: Path, geo_file: Path) -> None:
    g = json.loads(geo_file.read_text())
    w, h = g.get("size", [1536, 1024])
    img = Image.new("RGB", (w, h), (40, 40, 48))
    d = ImageDraw.Draw(img)
    for poly in g.get("walk", []):
        d.polygon([tuple(p) for p in poly], fill=(150, 150, 158))
    for poly in g.get("block", []):
        d.polygon([tuple(p) for p in poly], fill=(70, 70, 82), outline=(20, 20, 26))
    try:
        f = ImageFont.truetype("/System/Library/Fonts/Supplemental/Arial.ttf", 22)
    except OSError:
        f = ImageFont.load_default()
    for x, y, ew, eh, *label in g.get("exits", []):
        d.rectangle([x, y, x + ew, y + eh], outline=(0, 230, 255), width=4)
    for x, y, text in g.get("labels", []):
        d.text((x, y), text, fill=(255, 255, 255), font=f, anchor="mm")
    out.parent.mkdir(parents=True, exist_ok=True)
    img.save(out)
    print(out)


def main() -> None:
    args = [a for a in sys.argv[1:] if not a.startswith("--")]
    if len(args) < 3:
        sys.exit(__doc__)
    kind, ident = args[0], args[1]
    if kind in ("bg", "arena"):
        write(kind, ident, Path(args[2]).resolve())
    elif kind == "blockout" and len(args) >= 4:
        blockout(ident, Path(args[2]), Path(args[3]))
    else:
        sys.exit(__doc__)


if __name__ == "__main__":
    main()
