#!/usr/bin/env python3
"""Zeichnet eine Vorschau (Kartengröße 1:1) einer Karte mit Geometrie, Sprites und Requisiten (für map_tool.mjs)."""
from __future__ import annotations

import json
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parents[1]
PUBLIC = ROOT / "game/public"
S = 1  # Vergrößerung (Karten sind 1536×1024 bzw. 1024×768)
ROW = {"s": 0, "w": 1, "e": 2, "n": 3}


def font(size: int):
    for name in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/System/Library/Fonts/Helvetica.ttc"):
        try:
            return ImageFont.truetype(name, size)
        except OSError:
            pass
    return ImageFont.load_default()


def main(report_path: str, out_path: str) -> None:
    report = json.loads(Path(report_path).read_text())
    manifest = json.loads((PUBLIC / "assets/manifest.json").read_text())
    g = report["geometry"]
    bg_file = report.get("bg")
    W, H = report.get("size") or (640, 360)
    base = Image.open(PUBLIC / bg_file).convert("RGBA") if bg_file else Image.new("RGBA", (W, H), (40, 40, 40, 255))
    base = base.resize((W * S, H * S), Image.LANCZOS)

    # Sprites und Requisiten in Spielgröße (2×) einsetzen
    def paste_sprite(key: str, at, frame: int = 0):
        entry = manifest["sprites"].get(key)
        if not entry:
            return False
        sheet = Image.open(PUBLIC / entry["file"]).convert("RGBA")
        fw, fh = entry["frameW"], entry["frameH"]
        cols = entry["cols"]
        cx, cy = (frame % cols) * fw, (frame // cols) * fh
        cell = sheet.crop((cx, cy, cx + fw, cy + fh)).resize((fw * S, fh * S), Image.NEAREST)
        fx, fy = entry["foot"]
        base.alpha_composite(cell, (int((at[0] - fx) * S), int((at[1] - fy) * S)))
        return True

    def paste_image(key: str, at):
        file = manifest["images"].get(key)
        if not file:
            return paste_sprite(key, at)
        im = Image.open(PUBLIC / file).convert("RGBA")
        im = im.resize((im.width * S, im.height * S), Image.NEAREST)
        base.alpha_composite(im, (int(at[0] * S - im.width / 2), int(at[1] * S - im.height)))
        return True

    for h in g["hotspots"]:
        if h.get("prop"):
            paste_image(h["prop"], h["at"])
    figures = []
    for n in g["npcs"]:
        figures.append((n["at"][1], n))
    for _, n in sorted(figures, key=lambda t: t[0]):
        if n.get("pose"):
            if not paste_sprite(f"{n['actor']}-{n['pose']}", n["at"]):
                paste_sprite(f"{n['actor']}-walk", n["at"], ROW.get(n["facing"], 0) * 4)
        else:
            paste_sprite(f"{n['actor']}-walk", n["at"], ROW.get(n["facing"], 0) * 4)
    for name, e in g["entries"].items():
        paste_sprite("kim-walk", e["at"], ROW.get(e["facing"], 0) * 4)

    over = Image.new("RGBA", base.size, (0, 0, 0, 0))
    d = ImageDraw.Draw(over)
    f_small, f_mid = font(13), font(15)
    for x in range(0, W + 1, 32):
        d.line([(x * S, 0), (x * S, H * S)], fill=(255, 255, 255, 40 if x % 128 else 90), width=1)
        if x % 128 == 0:
            d.text((x * S + 2, 2), str(x), fill=(255, 255, 255, 200), font=f_small)
    for y in range(0, H + 1, 32):
        d.line([(0, y * S), (W * S, y * S)], fill=(255, 255, 255, 40 if y % 128 else 90), width=1)
        if y % 128 == 0:
            d.text((2, y * S + 2), str(y), fill=(255, 255, 255, 200), font=f_small)
    for poly in g["walk"]:
        d.polygon([(x * S, y * S) for x, y in poly], fill=(60, 255, 120, 45), outline=(60, 255, 120, 255), width=2)
    for poly in g["block"]:
        d.polygon([(x * S, y * S) for x, y in poly], fill=(255, 40, 40, 70), outline=(255, 60, 60, 255), width=2)
    for fg in g["foreground"]:
        x, y, w, h = fg["rect"]
        d.rectangle([x * S, y * S, (x + w) * S, (y + h) * S], outline=(200, 120, 255, 255), width=2)
        d.line([(x * S, fg["baseY"] * S), ((x + w) * S, fg["baseY"] * S)], fill=(200, 120, 255, 255), width=1)
    for x in g["exits"]:
        rx, ry, rw, rh = x["rect"]
        d.rectangle([rx * S, ry * S, (rx + rw) * S, (ry + rh) * S], fill=(60, 140, 255, 70), outline=(80, 160, 255, 255), width=2)
        d.text((rx * S + 3, ry * S + 2), f"→{x['to']}", fill=(220, 235, 255, 255), font=f_mid, stroke_width=2, stroke_fill=(0, 0, 0, 255))
    for h in g["hotspots"]:
        hx, hy = h["at"]
        r = h["radius"]
        d.ellipse([(hx - r) * S, (hy - r) * S, (hx + r) * S, (hy + r) * S], outline=(255, 220, 60, 200), width=1)
        d.ellipse([hx * S - 4, hy * S - 4, hx * S + 4, hy * S + 4], fill=(255, 220, 60, 255))
        d.text((hx * S + 6, hy * S - 8), h["id"], fill=(255, 240, 150, 255), font=f_small, stroke_width=2, stroke_fill=(0, 0, 0, 255))
    for n in g["npcs"]:
        nx, ny = n["at"]
        d.ellipse([nx * S - 4, ny * S - 4, nx * S + 4, ny * S + 4], fill=(255, 120, 220, 255))
        d.text((nx * S + 6, ny * S + 2), n["id"], fill=(255, 190, 240, 255), font=f_small, stroke_width=2, stroke_fill=(0, 0, 0, 255))
        if n.get("patrol"):
            d.line([(px * S, py * S) for px, py in n["patrol"]], fill=(255, 120, 220, 200), width=2)
    for name, e in g["entries"].items():
        ex, ey = e["at"]
        d.rectangle([ex * S - 4, ey * S - 4, ex * S + 4, ey * S + 4], fill=(0, 255, 255, 255))
        d.text((ex * S + 6, ey * S + 4), f"⌂{name}", fill=(180, 255, 255, 255), font=f_small, stroke_width=2, stroke_fill=(0, 0, 0, 255))
    y0 = H * S - 18 * (len(report["problems"]) + 1)
    for i, p in enumerate(report["problems"]):
        d.text((8, y0 + i * 18), "✗ " + p, fill=(255, 120, 120, 255), font=f_mid, stroke_width=2, stroke_fill=(0, 0, 0, 255))
    base.alpha_composite(over)
    base.convert("RGB").save(out_path)


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
