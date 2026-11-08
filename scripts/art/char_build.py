#!/usr/bin/env python3
"""Baut aus den Figuren-Rohbildern die Laufzeit-Assets (Design §6).

Aufruf (aus dem Projektordner):
  python3 scripts/art/char_build.py [ids ...]        ohne ids: alle Figuren mit Rohbildern
  python3 scripts/art/char_build.py --contact        nur Kontaktbogen neu
  python3 scripts/art/char_build.py --manifest       nur Fragmente zu design/assets/characters.manifest.json zusammenführen
Optionen: --no-contact (Kontaktbogen und Manifest-Zusammenführung auslassen; für parallele Teilbuilds)

Eingaben:  output/imagegen/raw/characters/<id>-walk.png, <id>-portrait[-variante].png, <id>-prop.png
           optional scripts/art/char_config/<id>.json (eine Datei je Figur, damit parallele Agenten sich nicht
           in die Quere kommen):
             { "walkRaw": "<id>-walk-v2.png",                       anderes Rohbild fürs Laufblatt
               "rowFrom": {"e": ["<id>-walk.png", 2]},               einzelne Zeile (s/w/e/n) aus anderem Rohbild
               "mirror": {"w": 2},                                   Zeile w = Rohzeile 2 gespiegelt (nur Notlösung)
               "order": {"n": [0, 1, 2, 3]},                         Frame-Reihenfolge je Zeile
               "height": 96,                                         Figurenhöhe in px (Kinder 76)
               "portraitRaws": {"": "<id>-portrait-v2.png", "angry": "<id>-portrait-angry-v3.png"},
               "propRaw": "<id>-prop-v2.png", "propHeight": 44,
               "clearPink": true,                                   blasse Magentareste in Lücken entfernen (nur Figuren ohne Pink)
               "note": "warum welche Fassung" }
Ausgaben:  game/public/assets/sprites/<id>-walk.png    512×512, 4×4 Zellen à 128, Zeilen S/W/O/N, Fuß (64,120)
           game/public/assets/portraits/<id>[-variante].webp   512×512, Qualität 85
           game/public/assets/props/<id>.png            freigestellt, Fußanker unten Mitte
           design/assets/characters/<id>.json           Manifest-Fragment {images, sprites}
           design/assets/characters-build.json          Verarbeitungsdaten und QA je Figur
           output/qa/art/characters.png                 Kontaktbogen (dunkel + hell), output/qa/art/characters/<id>.png/.gif

Verarbeitung Laufblatt: Magenta freistellen (sprites_lib.key_out: Farbabstand + Rand-Flood-Fill, Säume weg,
Kleinstflecken weg) → Magenta-Restsaum entmischen (unmix_edges: Randpixel und eingeschlossene Mischpixel bekommen
weiche Alpha und die Farbe ohne Magentaanteil; pinke Haarspitzen werden zurückgenommen) → 4×4-Raster über Belegungsprofile (sprites_lib.grid_cells) → Skalierung je Zeile auf Zielhöhe (höchster
Frame der Zeile = Zielhöhe, auf ±8 % um den Figurenmedian begrenzt, damit Schrittposen nicht pumpen) → LANCZOS mit
vormultiplizierter Alpha (weiche Kanten, keine Palettenreduktion, kein Pixel-Look) → Fußlinie y=120, Rumpf je Zeile
ruhig, Füße im Zeilenmittel auf x=64.
"""
from __future__ import annotations

import hashlib
import json
import sys
from pathlib import Path
from statistics import median

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage

sys.path.insert(0, str(Path(__file__).resolve().parent))
import char_prompts  # noqa: E402
from sprites_lib import background_color, grid_cells, key_out  # noqa: E402

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "output/imagegen/raw/characters"
CONF = ROOT / "scripts/art/char_config"
ASSETS = ROOT / "game/public/assets"
FRAG = ROOT / "design/assets/characters"
BUILD_LOG = ROOT / "design/assets/characters-build.json"
QA = ROOT / "output/qa/art"

DIRS = ["s", "w", "e", "n"]
CELL = 128
FOOT = (64, 120)
ADULT_H, CHILD_H = 96, 76
ROW_CLAMP = 0.08
DARK = (26, 16, 48, 255)
LIGHT = (232, 226, 214, 255)


def rel(p: Path) -> str:
    try:
        return str(p.relative_to(ROOT))
    except ValueError:
        return str(p)


def sha(p: Path) -> str:
    return hashlib.sha256(p.read_bytes()).hexdigest()[:16]


def config(cid: str) -> dict:
    p = CONF / f"{cid}.json"
    return json.loads(p.read_text()) if p.exists() else {}


# ---------------------------------------------------------------------------------------------------------
# Freistellen und Entfärben


def spill_mask(arr: np.ndarray) -> np.ndarray:
    """Pixel mit deutlichem Magentastich (Rot und Blau ähnlich hoch, Grün deutlich niedriger)."""
    r, g, b = (arr[..., i].astype(np.int32) for i in range(3))
    return (np.minimum(r, b) - g > 45) & (np.abs(r - b) < 70) & (np.maximum(r, b) > 70)


def unmix_edges(img: Image.Image, bg: np.ndarray, band: int = 3) -> Image.Image:
    """Entfärbt den Magentasaum. Betroffen sind Randpixel (bis `band` px vom Transparenten) und eingeschlossene
    Mischpixel (Magenta in Lockenlücken). Je Pixel wird die saubere Umgebungsfarbe F aus deckenden Innenpixeln
    geschätzt und der Magentaanteil t aus C = (1−t)·F + t·B bestimmt (B = Magenta des Rohbilds; Maximum aus
    Magenta-Überschuss und gerichteter Projektion). Ergebnis: Alpha·(1−t), Farbe entmischt (bei hohem t ≈ F)."""
    arr = np.asarray(img).astype(np.float32).copy()
    opaque = arr[..., 3] > 0
    # Eingeschlossene Mischpixel (Magenta in Lücken von Locken, Netzstrumpf usw.) gehören ebenfalls dazu.
    r, g, b_ = arr[..., 0], arr[..., 1], arr[..., 2]
    trapped = opaque & (np.minimum(r, b_) - g > 45) & (np.abs(r - b_) < 90) & (np.maximum(r, b_) > 60)
    trapped = ndimage.binary_dilation(trapped, iterations=1) & opaque
    interior = ndimage.binary_erosion(opaque, iterations=band, border_value=0) & ~trapped
    edge = opaque & ~interior
    if not edge.any():
        return img
    known = interior.astype(np.float32)
    est = arr[..., :3] * known[..., None]
    for _ in range(band + 2):  # Innenfarben schrittweise in den Randstreifen ausbreiten
        cnt = ndimage.uniform_filter(known, size=5, mode="constant")
        grow = (cnt > 1e-3) & (known == 0) & edge
        if not grow.any():
            break
        for i in range(3):
            s = ndimage.uniform_filter(est[..., i], size=5, mode="constant")
            est[..., i] = np.where(grow, s / np.maximum(cnt, 1e-6), est[..., i])
        known = np.maximum(known, grow.astype(np.float32))
    # Magentaanteil t aus dem Magenta-Überschuss (min(R,B) − G) gegenüber der Umgebungsfarbe: Ein Mischpixel
    # C = (1−t)·F + t·B hat ungefähr m(C) = (1−t)·m(F) + t·m(B). Dunkle Tusche + Magenta (violetter Saum) und
    # braunes Haar + Magenta (rötlicher Saum) werden so gleichermaßen erkannt; Innenfarben bleiben unberührt.
    def mag(x: np.ndarray) -> np.ndarray:
        return np.minimum(x[..., 0], x[..., 2]) - x[..., 1]

    c = arr[..., :3]
    bgf = bg.astype(np.float32)
    has_f = known > 0
    m_bg = float(min(bgf[0], bgf[2]) - bgf[1])
    m_f = np.where(has_f, np.maximum(mag(est), 0.0), 0.0) + 8.0
    t_mag = np.clip((mag(c) - m_f) / np.maximum(m_bg - m_f, 1.0), 0.0, 0.95)
    # Zweite Schätzung: Projektion von C − F auf B − F (fängt rötliche Säume an braunem Haar und blasse Magenta-
    # Schleier in Haarlücken, die der Überschuss allein unterschätzt). Nur wenn F deutlich anders als Magenta ist.
    d = bgf[None, None, :] - est
    dd = (d ** 2).sum(axis=2)
    diff = c - est
    dot = (diff * d).sum(axis=2)
    # Nur echte Mischungen: C − F muss nahezu in Richtung B − F zeigen (cos > 0,85). Dunkle Konturpixel neben heller
    # Haut zeigen in eine andere Richtung und würden sonst grünstichig „entmischt“.
    cos = dot / np.maximum(np.sqrt((diff ** 2).sum(axis=2) * dd), 1.0)
    t_proj = np.where(has_f & (dd > 120.0 ** 2) & (cos > 0.85), dot / np.maximum(dd, 1.0), 0.0)
    t = np.clip(np.maximum(t_mag, t_proj), 0.0, 0.95)
    t = np.where(edge & (t >= 0.06), t, 0.0)
    keep = 1.0 - t
    unmixed = np.clip((c - t[..., None] * bgf[None, None, :]) / keep[..., None], 0, 255)
    # Bei hohem Magentaanteil ist die Entmischung unzuverlässig → Richtung Umgebungsfarbe F.
    w = np.where(has_f, np.clip((t - 0.3) / 0.3, 0.0, 1.0), 0.0)[..., None]
    c[:] = np.where((t > 0)[..., None], unmixed * (1 - w) + est * w, c)
    arr[..., 3] = arr[..., 3] * keep
    # Pinke Haarspitzen (der Generator malt Locken am Rand oft magentastichig an): Bei warmer Umgebungsfarbe (B < G)
    # wird ein Blau-Überschuss im Randstreifen auf die Farbrichtung der Umgebung zurückgenommen.
    bg_f = est[..., 2] - est[..., 1]
    excess = (c[..., 2] - c[..., 1]) - (bg_f + 25.0)
    pinkish = edge & has_f & (bg_f < 0) & (excess > 0) & (c[..., 0] > c[..., 2])
    c[..., 2] = np.where(pinkish, c[..., 2] - excess, c[..., 2])
    arr[arr[..., 3] < 4] = 0
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), "RGBA")


def keyed(path: Path) -> Image.Image:
    raw = Image.open(path).convert("RGB")
    bg = background_color(np.asarray(raw).astype(np.int32))
    return unmix_edges(key_out(raw), bg)


def resize_soft(img: Image.Image, scale: float) -> Image.Image:
    """LANCZOS mit vormultiplizierter Alpha (keine dunklen/magentafarbenen Säume), weiche Kanten bleiben."""
    w, h = max(1, round(img.width * scale)), max(1, round(img.height * scale))
    small = img.convert("RGBa").resize((w, h), Image.Resampling.LANCZOS).convert("RGBA")
    arr = np.asarray(small).copy()
    arr[arr[..., 3] < 8] = 0  # Überschwinger von LANCZOS weg
    return Image.fromarray(arr, "RGBA")


# ---------------------------------------------------------------------------------------------------------
# Laufblatt


def solid(img: Image.Image, cut: int = 128) -> np.ndarray:
    return np.asarray(img.getchannel("A")) >= cut


def bottom_row(img: Image.Image) -> int:
    ys = np.nonzero(solid(img).any(axis=1))[0]
    return int(ys[-1]) if len(ys) else img.height - 1


def torso_x(img: Image.Image, top: float = 0.22, bottom: float = 0.55) -> float:
    a = solid(img)
    h = a.shape[0]
    cs = []
    for y in range(int(h * top), max(int(h * top) + 1, int(h * bottom))):
        xs = np.nonzero(a[y])[0]
        if len(xs):
            cs.append((xs[0] + xs[-1]) / 2)
    return float(median(cs)) if cs else img.width / 2


def foot_x(img: Image.Image, rows: int = 4) -> float:
    a = solid(img)
    b = bottom_row(img)
    cs = []
    for y in range(max(0, b - rows + 1), b + 1):
        xs = np.nonzero(a[y])[0]
        if len(xs):
            cs.append((xs[0] + xs[-1]) / 2)
    return float(median(cs)) if cs else img.width / 2


def load_rows(path: Path) -> tuple[list[list[Image.Image]], dict]:
    cells, info = grid_cells(keyed(path))
    return [cells[r * 4:(r + 1) * 4] for r in range(4)], info


def build_walk(cid: str, cfg: dict, child: bool) -> tuple[Image.Image, dict]:
    target = cfg.get("height", CHILD_H if child else ADULT_H)
    main_raw = RAW / cfg.get("walkRaw", f"{cid}-walk.png")
    sources = {main_raw.name: load_rows(main_raw)}
    mirror, order, row_from = cfg.get("mirror", {}), cfg.get("order", {}), cfg.get("rowFrom", {})
    rows, row_source = [], {}
    for r, d in enumerate(DIRS):
        file, raw_row = row_from.get(d, (main_raw.name, mirror.get(d, r)))
        if file not in sources:
            sources[file] = load_rows(RAW / file)
        src = list(sources[file][0][raw_row])
        if d in mirror:
            src = [c.transpose(Image.Transpose.FLIP_LEFT_RIGHT) for c in src]
        if d in order:
            src = [src[i] for i in order[d]]
        rows.append(src)
        row_source[d] = f"{file} Zeile {raw_row + 1}" + (" gespiegelt" if d in mirror else "")
    # Skalierung je Zeile: höchster Frame = Zielhöhe, begrenzt um den Median aller Zeilen.
    raw_scales = [target / max(c.height for c in row) for row in rows]
    base = median(raw_scales)
    scales = [min(max(s, base * (1 - ROW_CLAMP)), base * (1 + ROW_CLAMP)) for s in raw_scales]
    sheet = Image.new("RGBA", (CELL * 4, CELL * 4), (0, 0, 0, 0))
    frames_qa, problems = [], []
    for r, (row, scale) in enumerate(zip(rows, scales)):
        smalls = [resize_soft(c, scale) for c in row]
        offset = median(foot_x(s) - torso_x(s) for s in smalls)
        for i, s in enumerate(smalls):
            idx = r * 4 + i
            # Zu breite Schrittposen (selten) passend verkleinern statt abschneiden.
            if s.width > CELL - 4:
                s = resize_soft(row[i], scale * (CELL - 4) / s.width)
                problems.append(f"Frame {idx} zu breit, auf {CELL - 4} px verkleinert")
            ax = torso_x(s) + offset
            x = round(FOOT[0] - ax)
            y = FOOT[1] - bottom_row(s)
            x = min(max(x, 1), CELL - 1 - s.width)
            if y < 1:
                problems.append(f"Frame {idx} oben abgeschnitten (y={y})")
            frame = Image.new("RGBA", (CELL, CELL), (0, 0, 0, 0))
            frame.alpha_composite(s, (x, y)) if y >= 0 else frame.alpha_composite(s.crop((0, -y, s.width, s.height)), (x, 0))
            if cfg.get("clearPink"):
                frame = clear_pink(frame)
            sheet.alpha_composite(frame, ((idx % 4) * CELL, (idx // 4) * CELL))
            frames_qa.append(frame_qa(frame, idx))
    qa = walk_qa(frames_qa)
    qa["problems"] = problems + qa["problems"]
    meta = {
        "raws": {f: {"path": rel(RAW / f), "size": list(Image.open(RAW / f).size), "sha256": sha(RAW / f),
                     "rowBands": sources[f][1]["rows"]} for f in sources},
        "targetHeight": target, "rowScales": [round(s, 4) for s in scales],
        "rowScalesUnclamped": [round(s, 4) for s in raw_scales], "rowSource": row_source,
        "resample": "lanczos-premultiplied, soft alpha", "qa": qa,
    }
    if cfg.get("note"):
        meta["note"] = cfg["note"]
    return sheet, meta


def clear_pink(frame: Image.Image) -> Image.Image:
    """Nur für Figuren ohne echte Pink-/Lilatöne (char_config "clearPink": true): blasse Magentareste in
    eingeschlossenen Lücken (z. B. zwischen Arm und Rumpf), die unmix_edges als deckend stehen lässt, werden
    transparent."""
    arr = np.asarray(frame).copy()
    r, g, b = (arr[..., i].astype(np.int32) for i in range(3))
    m = (np.minimum(r, b) - g > 20) & (b > 120) & (np.abs(r - b) < 80) & (arr[..., 3] > 0)
    arr[m] = 0
    return Image.fromarray(arr, "RGBA")


def frame_qa(frame: Image.Image, idx: int) -> dict:
    arr = np.asarray(frame)
    a = arr[..., 3]
    box = frame.getchannel("A").getbbox() or (0, 0, 0, 0)
    vis = a > 0
    spill = int((spill_mask(arr) & (a > 40)).sum())
    return {"index": idx, "dir": DIRS[idx // 4], "bbox": list(box), "height": box[3] - box[1],
            "footY": bottom_row(frame), "touchesEdge": bool(vis[0].any() or vis[-1].any() or vis[:, 0].any() or vis[:, -1].any()),
            "magentaPixels": spill}


def walk_qa(frames: list[dict]) -> dict:
    problems = []
    for f in frames:
        if f["touchesEdge"]:
            problems.append(f"Frame {f['index']} berührt den Zellrand (abgeschnitten?)")
        if abs(f["footY"] - FOOT[1]) > 1:
            problems.append(f"Frame {f['index']} Fußlinie {f['footY']} statt {FOOT[1]}")
        if f["magentaPixels"] > 6:
            problems.append(f"Frame {f['index']}: {f['magentaPixels']} magentastichige Pixel")
    heights = [f["height"] for f in frames]
    return {"heights": heights, "footY": sorted({f["footY"] for f in frames}),
            "magentaPixels": sum(f["magentaPixels"] for f in frames), "problems": problems}


def walk_entry(cid: str) -> dict:
    anims = {}
    for r, d in enumerate(DIRS):
        anims[f"walk-{d}"] = {"frames": [r * 4 + i for i in range(4)], "fps": 8}
    for r, d in enumerate(DIRS):
        anims[f"idle-{d}"] = {"frames": [r * 4 + 1], "fps": 1}
    return {"file": f"assets/sprites/{cid}-walk.png", "frameW": CELL, "frameH": CELL, "cols": 4, "rows": 4,
            "foot": list(FOOT), "anims": anims}


# ---------------------------------------------------------------------------------------------------------
# Porträts und Requisiten


def portrait_variants(cid: str, cfg: dict) -> dict[str, Path]:
    known = set(char_prompts.defaults(cid)["portraits"]) | set(char_prompts.VARIANT_MOODS) | {""}
    found = {}
    for v in sorted(known):
        p = RAW / f"{cid}-portrait{'-' + v if v else ''}.png"
        if p.exists():
            found[v] = p
    for v, name in cfg.get("portraitRaws", {}).items():
        found[v] = RAW / name
    return found


def build_portrait(src: Path, out: Path) -> dict:
    im = Image.open(src).convert("RGB")
    s = min(im.size)
    left, top = (im.width - s) // 2, (im.height - s) // 2
    im = im.crop((left, top, left + s, top + s)).resize((512, 512), Image.Resampling.LANCZOS)
    out.parent.mkdir(parents=True, exist_ok=True)
    im.save(out, "WEBP", quality=85, method=6)
    return {"raw": rel(src), "rawSize": list(Image.open(src).size), "sha256": sha(src), "out": rel(out),
            "bytes": out.stat().st_size}


def build_prop(cid: str, cfg: dict) -> tuple[Image.Image, dict] | None:
    src = RAW / cfg.get("propRaw", f"{cid}-prop.png")
    if not src.exists():
        return None
    img = keyed(src)
    img = img.crop(img.getchannel("A").getbbox())
    h = cfg.get("propHeight", 44)
    small = resize_soft(img, h / img.height)
    canvas = Image.new("RGBA", (small.width + 4, small.height + 3), (0, 0, 0, 0))
    canvas.alpha_composite(small, (2, 2))
    box = canvas.getchannel("A").getbbox()
    spill = int((spill_mask(np.asarray(canvas)) & (np.asarray(canvas)[..., 3] > 40)).sum())
    return canvas, {"raw": rel(src), "sha256": sha(src), "height": h, "size": list(canvas.size), "bbox": list(box),
                    "foot": [canvas.width // 2, canvas.height - 1], "magentaPixels": spill}


# ---------------------------------------------------------------------------------------------------------
# Vorschau


def on(img: Image.Image, color) -> Image.Image:
    bg = Image.new("RGBA", img.size, color)
    bg.alpha_composite(img)
    return bg


def font(size: int):
    for f in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/System/Library/Fonts/Helvetica.ttc"):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            pass
    return ImageFont.load_default()


def preview_tile(cid: str) -> Image.Image | None:
    walk = ASSETS / f"sprites/{cid}-walk.png"
    ports = sorted((ASSETS / "portraits").glob(f"{cid}*.webp"), key=lambda p: (p.stem != cid, p.stem)) \
        if (ASSETS / "portraits").exists() else []
    ports = [p for p in ports if p.stem == cid or p.stem[len(cid):].startswith("-")
             and p.stem[len(cid) + 1:] in set(char_prompts.VARIANT_MOODS) | set(char_prompts.defaults(cid)["portraits"])]
    prop = ASSETS / f"props/{cid}.png"
    if not (walk.exists() or ports or prop.exists()):
        return None
    tile = Image.new("RGBA", (1024 + 256, 512 + 28), (40, 40, 44, 255))
    d = ImageDraw.Draw(tile)
    d.text((6, 4), cid, fill=(255, 255, 255, 255), font=font(18))
    if walk.exists():
        w = Image.open(walk).convert("RGBA")
        g = Image.new("RGBA", w.size, (0, 0, 0, 0))
        gd = ImageDraw.Draw(g)
        for k in range(4):  # Fußlinie je Zeile und Zellgrenzen
            gd.line([(0, k * CELL + FOOT[1] + 1), (512, k * CELL + FOOT[1] + 1)], fill=(0, 255, 160, 90))
            gd.line([(k * CELL, 0), (k * CELL, 512)], fill=(255, 255, 255, 40))
            gd.line([(0, k * CELL), (512, k * CELL)], fill=(255, 255, 255, 40))
        for x0, col in ((0, DARK), (512, LIGHT)):
            panel = on(w, col)
            panel.alpha_composite(g)
            tile.alpha_composite(panel, (x0, 28))
    y = 28
    for p in ports[:2]:
        tile.alpha_composite(Image.open(p).convert("RGBA").resize((256, 256), Image.Resampling.LANCZOS), (1024, y))
        y += 256
    if prop.exists() and y < 28 + 512:
        pr = Image.open(prop).convert("RGBA")
        big = pr.resize((pr.width * 2, pr.height * 2), Image.Resampling.LANCZOS)
        cell = on(Image.new("RGBA", (128, 128), (0, 0, 0, 0)), DARK)
        cell.alpha_composite(pr, (64 - pr.width // 2, 120 - pr.height))
        tile.alpha_composite(cell, (1024, y))
        cell2 = on(Image.new("RGBA", (128, 128), (0, 0, 0, 0)), LIGHT)
        cell2.alpha_composite(big if big.height < 124 else pr, (64 - min(big.width, 128) // 2, 0))
        tile.alpha_composite(cell2, (1152, y))
    return tile


def write_gif(cid: str) -> None:
    walk = ASSETS / f"sprites/{cid}-walk.png"
    if not walk.exists():
        return
    w = Image.open(walk).convert("RGBA")
    frames = []
    for i in range(4):
        f = Image.new("RGBA", (CELL * 4, CELL), DARK)
        for r in range(4):
            f.alpha_composite(w.crop(((i) * CELL, r * CELL, (i + 1) * CELL, (r + 1) * CELL)), (r * CELL, 0))
        frames.append(f.convert("RGB"))
    (QA / "characters").mkdir(parents=True, exist_ok=True)
    frames[0].save(QA / f"characters/{cid}-walk.gif", save_all=True, append_images=frames[1:], duration=125, loop=0)


def contact_sheet() -> Path | None:
    tiles = [(cid, t) for cid in char_prompts.CHARACTERS if (t := preview_tile(cid)) is not None]
    if not tiles:
        return None
    (QA / "characters").mkdir(parents=True, exist_ok=True)
    for cid, t in tiles:
        t.convert("RGB").save(QA / f"characters/{cid}.png")
    cols = 2 if len(tiles) > 3 else 1
    tw, th = tiles[0][1].size
    rows = (len(tiles) + cols - 1) // cols
    sheet = Image.new("RGB", (tw * cols, th * rows), (40, 40, 44))
    for i, (_, t) in enumerate(tiles):
        sheet.paste(t.convert("RGB"), ((i % cols) * tw, (i // cols) * th))
    out = QA / "characters.png"
    sheet.save(out)
    return out


# ---------------------------------------------------------------------------------------------------------


def build(cid: str) -> dict:
    cfg = config(cid)
    c = char_prompts.defaults(cid)
    images, sprites, meta = {}, {}, {}
    walk_raw = RAW / cfg.get("walkRaw", f"{cid}-walk.png")
    if c["walk"] and walk_raw.exists():
        sheet, meta["walk"] = build_walk(cid, cfg, c["child"])
        out = ASSETS / f"sprites/{cid}-walk.png"
        out.parent.mkdir(parents=True, exist_ok=True)
        sheet.save(out, optimize=True)
        meta["walk"]["out"] = rel(out)
        sprites[f"{cid}-walk"] = walk_entry(cid)
        write_gif(cid)
    meta["portraits"] = {}
    for v, src in portrait_variants(cid, cfg).items():
        name = f"{cid}-{v}" if v else cid
        meta["portraits"][v or "base"] = build_portrait(src, ASSETS / f"portraits/{name}.webp")
        images[f"portrait-{name}"] = f"assets/portraits/{name}.webp"
    if c["prop"]:
        res = build_prop(cid, cfg)
        if res:
            img, meta["prop"] = res
            out = ASSETS / f"props/{cid}.png"
            out.parent.mkdir(parents=True, exist_ok=True)
            img.save(out, optimize=True)
            images[f"prop-{cid}"] = f"assets/props/{cid}.png"
    if not images and not sprites:
        return {}
    FRAG.mkdir(parents=True, exist_ok=True)
    (FRAG / f"{cid}.json").write_text(json.dumps({"images": images, "sprites": sprites}, indent=2) + "\n")
    log = json.loads(BUILD_LOG.read_text()) if BUILD_LOG.exists() else {}
    log[cid] = meta
    BUILD_LOG.write_text(json.dumps(dict(sorted(log.items())), ensure_ascii=False, indent=1) + "\n")
    return meta


def merge_manifest() -> Path:
    """Führt alle Fragmente design/assets/characters/<id>.json (Reihenfolge wie char_prompts.CHARACTERS) zu
    design/assets/characters.manifest.json zusammen ({images, sprites}, Teil von game/public/assets/manifest.json)."""
    order = {cid: i for i, cid in enumerate(char_prompts.CHARACTERS)}
    frags = sorted(FRAG.glob("*.json"), key=lambda p: (order.get(p.stem, len(order)), p.stem))
    images, sprites = {}, {}
    for p in frags:
        f = json.loads(p.read_text())
        for kind, target in (("images", images), ("sprites", sprites)):
            for key, val in f.get(kind, {}).items():
                if key in target and target[key] != val:
                    raise ValueError(f"Manifest-Schlüssel {key} doppelt ({p.name})")
                target[key] = val
    out = ROOT / "design/assets/characters.manifest.json"
    out.write_text(json.dumps({"images": images, "sprites": sprites}, indent=2) + "\n")
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
        ids = [cid for cid in char_prompts.CHARACTERS if any(RAW.glob(f"{cid}-*.png"))]
    bad = [i for i in ids if i not in char_prompts.CHARACTERS]
    if bad:
        print(f"Unbekannte Figuren-ID(s): {bad}")
        return 1
    status = 0
    for cid in ids:
        try:
            meta = build(cid)
        except Exception as e:  # noqa: BLE001 – je Figur weiterbauen, Fehler melden
            print(f"FEHLER {cid}: {e}")
            status = 1
            continue
        if not meta:
            print(f"{cid}: keine Rohbilder")
            continue
        parts = []
        if "walk" in meta:
            q = meta["walk"]["qa"]
            parts.append(f"Laufblatt Höhen {min(q['heights'])}–{max(q['heights'])} px, Fußlinie {q['footY']}, "
                         f"Magenta {q['magentaPixels']}")
            for p in q["problems"]:
                parts.append(f"  ! {p}")
                status = 1
        if meta.get("portraits"):
            parts.append(f"Porträts: {', '.join(meta['portraits'])}")
        if "prop" in meta:
            parts.append(f"Requisit {meta['prop']['size']}, Magenta {meta['prop']['magentaPixels']}")
        print(f"{cid}: " + "\n  ".join(parts))
    if "--no-contact" not in flags:
        print(f"Kontaktbogen: {contact_sheet()}")
        print(f"Manifest: {merge_manifest()}")
    return status


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
