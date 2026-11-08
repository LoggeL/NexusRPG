#!/usr/bin/env python3
"""Hilfsfunktionen des Art-Pakets 'sprites' (nur Pillow + NumPy).

Technische Nachbearbeitung ohne gemalte Pixel: Magenta freistellen (Farbabstand + Rand-Flood-Fill),
Kleinstflecken entfernen, Zeilen-/Spaltenerkennung, gemeinsame Skalierung, Nearest-Resize,
gemeinsame Palette je Figur, harte Alpha (0/255), Fußanker. Vorbild: SelantisRPG/scripts/
build_lia_novel_walk.py und build_pixel_unification_story.py.
"""
from __future__ import annotations

from collections import deque
from statistics import median

import numpy as np
from PIL import Image

KEY = np.array([251, 3, 251], dtype=np.int32)


def background_color(rgb: np.ndarray) -> np.ndarray:
    """Median der Randpixel (Codex liefert ≈ (251,3,251) statt reinem #FF00FF)."""
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    return np.median(border, axis=0).astype(np.int32)


def magentaness(rgb: np.ndarray) -> np.ndarray:
    """Wie stark ein Pixel nach Magenta (rot+blau hoch, grün niedrig) aussieht, 0..255."""
    r, g, b = (rgb[..., i].astype(np.int32) for i in range(3))
    return np.clip(np.minimum(r, b) - g, 0, 255)


def flood_from_border(mask: np.ndarray) -> np.ndarray:
    """Alle mit dem Bildrand verbundenen True-Pixel (4er-Nachbarschaft)."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    q: deque[tuple[int, int]] = deque()
    for x in range(w):
        for y in (0, h - 1):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if mask[y, x] and not seen[y, x]:
                seen[y, x] = True
                q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True
                q.append((ny, nx))
    return seen


def components(mask: np.ndarray) -> list[tuple[int, list[int], list[int]]]:
    """Zusammenhangskomponenten (8er-Nachbarschaft): (Größe, ys, xs)."""
    h, w = mask.shape
    seen = np.zeros_like(mask)
    out = []
    ys0, xs0 = np.nonzero(mask)
    for y0, x0 in zip(ys0.tolist(), xs0.tolist()):
        if seen[y0, x0]:
            continue
        seen[y0, x0] = True
        q = deque([(y0, x0)])
        ys, xs = [], []
        while q:
            y, x = q.popleft()
            ys.append(y)
            xs.append(x)
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not seen[ny, nx]:
                        seen[ny, nx] = True
                        q.append((ny, nx))
        out.append((len(ys), ys, xs))
    return out


def key_out(image: Image.Image, near: int = 70, loose: int = 150, min_area: int = 40) -> Image.Image:
    """Magenta freistellen → RGBA mit harter Alpha.

    near:  Farbabstand, ab dem ein Pixel sicher Hintergrund ist (auch eingeschlossene Lücken).
    loose: großzügigere Schwelle für mit dem Rand verbundene Pixel (Säume, Kantenglättung).
    """
    rgb = np.asarray(image.convert("RGB")).astype(np.int32)
    bg = background_color(rgb)
    dist = np.sqrt(((rgb - bg) ** 2).sum(axis=2))
    mag = magentaness(rgb)
    certain = dist < near
    loose_bg = flood_from_border((dist < loose) | certain) & ((dist < loose) | certain)
    background = certain | loose_bg
    alpha = ~background
    # Magenta-Säume: deckende Pixel mit deutlichem Magentastich am Rand → weg.
    for _ in range(2):
        edge = alpha & ~(np.roll(alpha, 1, 0) & np.roll(alpha, -1, 0) & np.roll(alpha, 1, 1) & np.roll(alpha, -1, 1))
        fringe = edge & (mag > 90)
        alpha &= ~fringe
    # Kleinstflecken (Rauschen, Restsäume) entfernen.
    for size, ys, xs in components(alpha):
        if size < min_area:
            alpha[ys, xs] = False
    out = np.dstack([rgb.astype(np.uint8), (alpha * 255).astype(np.uint8)])
    out[~alpha, :3] = 0
    return Image.fromarray(out, "RGBA")


def runs(profile: np.ndarray, min_count: int, merge_gap: int) -> list[tuple[int, int]]:
    """Belegte Abschnitte eines Profils; kleine Lücken werden zusammengelegt."""
    bands, start = [], None
    for i, v in enumerate(profile):
        occupied = v >= min_count
        if occupied and start is None:
            start = i
        elif not occupied and start is not None:
            bands.append([start, i])
            start = None
    if start is not None:
        bands.append([start, len(profile)])
    merged: list[list[int]] = []
    for b in bands:
        if merged and b[0] - merged[-1][1] <= merge_gap:
            merged[-1][1] = b[1]
        else:
            merged.append(b)
    return [tuple(b) for b in merged]


def split_bands(bands: list[tuple[int, int]], count: int, length: int) -> list[tuple[int, int]]:
    """Reduziert/teilt Abschnitte auf genau `count` Bereiche (Grenzen jeweils in der Lückenmitte)."""
    bands = [b for b in bands if b[1] - b[0] >= 6]
    while len(bands) > count:
        # kleinste Lücke schließen
        gaps = [bands[i + 1][0] - bands[i][1] for i in range(len(bands) - 1)]
        i = int(np.argmin(gaps))
        bands[i: i + 2] = [(bands[i][0], bands[i + 1][1])]
    if len(bands) != count:
        raise ValueError(f"erwartet {count} Abschnitte, gefunden {len(bands)}: {bands}")
    bounds = [0] + [round((bands[i][1] + bands[i + 1][0]) / 2) for i in range(count - 1)] + [length]
    return [(bounds[i], bounds[i + 1]) for i in range(count)]


def grid_cells(keyed: Image.Image, rows: int = 4, cols: int = 4) -> tuple[list[Image.Image], dict]:
    """Zeilen- und Spaltenerkennung über Belegungsprofile; liefert zugeschnittene Zellen."""
    alpha = np.asarray(keyed.getchannel("A")) > 0
    h, w = alpha.shape
    row_bands = split_bands(runs(alpha.sum(axis=1), 3, 4), rows, h)
    cells, info = [], {"rows": row_bands, "cols": []}
    for y0, y1 in row_bands:
        sub = alpha[y0:y1]
        col_bands = split_bands(runs(sub.sum(axis=0), 1, 6), cols, w)
        info["cols"].append(col_bands)
        for x0, x1 in col_bands:
            cell = keyed.crop((x0, y0, x1, y1))
            box = cell.getchannel("A").getbbox()
            if box is None:
                raise ValueError(f"leere Zelle bei {(x0, y0, x1, y1)}")
            cells.append(cell.crop(box))
    return cells, info


def single_cell(keyed: Image.Image) -> Image.Image:
    """Größte zusammenhängende Gruppe (alle Komponenten ≥ 2 % der größten) zugeschnitten."""
    box = keyed.getchannel("A").getbbox()
    if box is None:
        raise ValueError("leeres Bild")
    return keyed.crop(box)


def shrink(cell: Image.Image, scale: float, method: str = "box", alpha_cut: int = 110) -> Image.Image:
    """Verkleinern. 'box' = Flächenmittel mit vormultiplizierter Alpha (ruhigere Formen als Nearest bei
    Faktor ≈ 0,1–0,17, wo Nearest Konturen zerreißt); 'nearest' wie in Selantis. Alpha danach hart."""
    w, h = max(1, round(cell.width * scale)), max(1, round(cell.height * scale))
    if method == "nearest":
        small = cell.resize((w, h), Image.Resampling.NEAREST)
    else:
        small = cell.convert("RGBa").resize((w, h), Image.Resampling.BOX).convert("RGBA")
    a = small.getchannel("A").point(lambda v: 255 if v >= alpha_cut else 0)
    small.putalpha(a)
    box = small.getchannel("A").getbbox()
    return small.crop(box)


def outline(frame: Image.Image, factor: float = 0.42, tint=(28, 16, 18)) -> Image.Image:
    """Dunkelt die äußersten Silhouettenpixel ab (Ersatz für die beim Verkleinern verwischte dunkle Kontur)."""
    arr = np.asarray(frame).astype(np.float32).copy()
    a = arr[..., 3] > 0
    pad = np.pad(a, 1)
    inner = pad[:-2, 1:-1] & pad[2:, 1:-1] & pad[1:-1, :-2] & pad[1:-1, 2:]
    edge = a & ~inner
    rgb = arr[..., :3]
    rgb[edge] = rgb[edge] * factor + np.array(tint) * (1 - factor)
    arr[..., :3] = rgb
    return Image.fromarray(arr.clip(0, 255).astype(np.uint8), "RGBA")


def foot_center(image: Image.Image, rows: int = 3) -> float:
    alpha = np.asarray(image.getchannel("A")) > 0
    centers = []
    for y in range(max(0, alpha.shape[0] - rows), alpha.shape[0]):
        xs = np.nonzero(alpha[y])[0]
        if len(xs):
            centers.append((xs[0] + xs[-1]) / 2)
    return float(median(centers)) if centers else image.width / 2


def torso_center(image: Image.Image, top: float = 0.25, bottom: float = 0.6) -> float:
    """Horizontale Mitte des Rumpfs (Zeilenmitten gemittelt) – ruhiger als die Füße beim Gehen."""
    alpha = np.asarray(image.getchannel("A")) > 0
    h = alpha.shape[0]
    centers = []
    for y in range(int(h * top), max(int(h * top) + 1, int(h * bottom))):
        xs = np.nonzero(alpha[y])[0]
        if len(xs):
            centers.append((xs[0] + xs[-1]) / 2)
    return float(median(centers)) if centers else image.width / 2


def make_palette(frames: list[Image.Image], colors: int = 32, base: int = 24, min_count: int = 4,
                 min_dist: float = 40.0) -> Image.Image:
    """Gemeinsame Palette: Median-Cut-Basis (`base` Farben) plus seltene, deutlich abweichende Farben
    (Farthest-Point über vergröberte Farbklassen mit ≥ `min_count` Pixeln) bis `colors`. So bleiben kleine
    Merkmale (Verband, Rohrzange, Blüte, Monokel) erhalten, die Median-Cut allein in Hauttöne mischt."""
    px = []
    for f in frames:
        arr = np.asarray(f)
        px.append(arr[arr[..., 3] > 0][:, :3])
    data = np.concatenate(px).astype(np.uint8)
    strip = Image.fromarray(data.reshape(1, -1, 3), "RGB")
    mc = strip.quantize(colors=base, method=Image.Quantize.MEDIANCUT, dither=Image.Dither.NONE)
    pal = np.array(mc.getpalette()[: base * 3], dtype=np.float32).reshape(-1, 3)
    used = np.unique(np.asarray(mc))
    pal = pal[used]
    # Vergröberte Farbklassen (4 Bit je Kanal) mit Mittelwert und Anzahl
    keys = (data[:, 0].astype(np.int32) >> 4) * 256 + (data[:, 1].astype(np.int32) >> 4) * 16 + (data[:, 2] >> 4)
    uniq, inv, counts = np.unique(keys, return_inverse=True, return_counts=True)
    sums = np.zeros((len(uniq), 3))
    np.add.at(sums, inv, data.astype(np.float64))
    means = (sums / counts[:, None]).astype(np.float32)
    cand = means[counts >= min_count]
    while len(pal) < colors and len(cand):
        d = np.sqrt(((cand[:, None, :] - pal[None, :, :]) ** 2).sum(axis=2)).min(axis=1)
        i = int(np.argmax(d))
        if d[i] < min_dist:
            break
        pal = np.vstack([pal, cand[i]])
    flat = [int(round(v)) for v in pal.flatten()]
    flat += flat[-3:] * (256 - len(pal))
    out = Image.new("P", (1, 1))
    out.putpalette(flat)
    return out


def apply_palette(frame: Image.Image, palette: Image.Image) -> Image.Image:
    alpha = frame.getchannel("A")
    out = frame.convert("RGB").quantize(palette=palette, dither=Image.Dither.NONE).convert("RGBA")
    out.putalpha(alpha)
    arr = np.asarray(out).copy()
    arr[arr[..., 3] == 0] = 0
    return Image.fromarray(arr, "RGBA")


def place(small: Image.Image, frame_w: int, frame_h: int, anchor_x: float, foot: tuple[int, int],
          name: str) -> Image.Image:
    """Setzt das verkleinerte Bild so, dass `anchor_x` (Spalte im Bild) auf foot.x und der Boden auf foot.y liegt."""
    x = round(foot[0] - anchor_x)
    y = foot[1] - small.height
    if x < 1 or y < 1 or x + small.width > frame_w - 1 or y + small.height > frame_h - 1:
        raise ValueError(f"{name}: ragt in den Zellrand (x={x}, y={y}, {small.size})")
    frame = Image.new("RGBA", (frame_w, frame_h), (0, 0, 0, 0))
    frame.alpha_composite(small, (x, y))
    return frame
