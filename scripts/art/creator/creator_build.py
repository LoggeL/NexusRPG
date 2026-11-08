#!/usr/bin/env python3
"""Baut aus den Baukasten-Rohbildern die Ebenen der Spielfigur (Design §3.1a, §6.3, docs/creator-pipeline.md).

Aufruf (aus dem Projektordner):
  python3 scripts/art/creator/creator_build.py              alles bauen (Grundkörper, alle Aufträge mit Rohbild)
  python3 scripts/art/creator/creator_build.py j01 j02      nur diese Aufträge neu (Grundkörper wird immer gebaut)
  python3 scripts/art/creator/creator_build.py --preview    nur Vorschau aus vorhandenen Ebenen
Optionen: --seed=7 (Zufallskombinationen der Vorschau)

Verfahren (festgelegt nach Augenschein, Design §6.3):
  1. Grundpuppe `base-mittel.png` (Codex, graue Schaufensterpuppe) → freistellen (char_build.keyed), 4×4-Raster,
     Zeilenskalierung auf 96 px, Fußanker (64,120) wie char_build. Ergebnis: Fenster-Transformation je Zelle.
  2. Jeder Auftrag ist eine Codex-BEARBEITUNG der Grundpuppe (Teile in Kennfarben: Rot = A, Grün = B, Blau = Haar,
     Cyan = Leuchten, Gunmetal/Schwarz = fest). Je Zelle wird das Rohbild auf die Puppe ausgerichtet (Maßstab
     0,92–1,08 und Versatz ±40 px per FFT-Korrelation der Silhouetten/grauen Hautflächen), dann werden die Teile
     über Kennfarben + Zonen (Kopf / Rumpf / Füße) + Abweichung von der Puppe ausgeschnitten.
  3. Regionen → Graustufe (HSL-Helligkeit, je Region normiert: 5 % → 0,15, Median → 0,5, 95 % → 0,85),
     feste Pixel (Tusche, Metall) bleiben farbig, Tusche entsättigt. Maske: Rot A, Grün B, Blau Haar, Gelb Haut,
     Magenta Leuchten, Schwarz fest.
  4. Zeile O = gespiegelte Zeile W (seitengebundene Teile tauschen links/rechts). Haar → back/front.
  5. Körperbauten schmal/kraeftig: horizontale Streckung unterhalb des Halses (0,88 / 1,16) für Grundkörper und
     alle Rumpf-/Beinteile; Kopfteile gelten für alle Körperbauten.
Ausgaben: game/public/assets/creator/... (+ catalog.json), design/assets/creator.json (Katalog),
          output/qa/creator/combos.png, combo-<n>.gif, parts.png
"""
from __future__ import annotations

import json
import random
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont
from scipy import ndimage
from scipy.signal import fftconvolve

HERE = Path(__file__).resolve().parent
sys.path.insert(0, str(HERE.parent))
sys.path.insert(0, str(HERE))
import char_build  # noqa: E402
import creator_prompts as CP  # noqa: E402
from sprites_lib import runs, split_bands  # noqa: E402

ROOT = HERE.parents[2]
RAW = ROOT / "output/imagegen/raw/creator"
OUT = ROOT / "game/public/assets/creator"
CATALOG = ROOT / "design/assets/creator.json"
QA = ROOT / "output/qa/creator"

CELL, FOOT, HEIGHT = 128, (64, 120), 96
DIRS = ["s", "w", "e", "n"]
BODIES = {"mittel": 1.0, "schmal": 0.88, "kraeftig": 1.16}
# Regionscodes
NONE, FIXED, RA, RB, RHAIR, RSKIN, RGLOW = range(7)
MASK_RGB = {FIXED: (0, 0, 0), RA: (255, 0, 0), RB: (0, 255, 0), RHAIR: (0, 0, 255), RSKIN: (255, 255, 0),
            RGLOW: (255, 0, 255)}
REGION_NAME = {RA: "colorA", RB: "colorB", RHAIR: "hair", RSKIN: "skin", RGLOW: "glow"}

# Ebenenreihenfolge (unten → oben), §6.3. In N liegt haar.back über der Jacke (zusammen mit haar.front).
LAYERS = ["haar.back", "koerper", "tattoo", "gesicht", "cyber.platte", "cyber.augen", "hose", "cyber.bein", "schuhe",
          "oberteil", "cyber.kabel", "kette", "jacke", "cyber.arm", "maske", "haar.front", "brille", "kappe",
          "kopfhoerer"]
LAYERS_N = [l for l in LAYERS if l != "haar.back"]
LAYERS_N.insert(LAYERS_N.index("haar.front"), "haar.back")

# Teil-Präfix → (Ebene, Ordner, körperabhängig, Zone, Kennfarben-Art). Erster Treffer gilt.
#   Zone in Anteilen der Puppenhöhe ab Scheitel: (von, bis); Kopf ≈ 0–0,14, Hals ≈ 0,17.
PART_META: list[tuple[str, tuple]] = [
    ("haar-", ("haar", "haar", False, (-0.2, 1.0), "hair")),
    ("oben-", ("oberteil", "oben", True, (0.10, 0.70), "ab")),
    ("jacke-", ("jacke", "jacke", True, (0.10, 1.0), "ab")),
    ("hose-", ("hose", "hose", True, (0.35, 0.94), "ab")),
    ("schuhe-", ("schuhe", "schuhe", True, (0.70, 1.0), "ab")),
    ("cyber-arm-", ("cyber.arm", "cyber", True, (0.20, 0.66), "cyber")),
    ("cyber-bein-", ("cyber.bein", "cyber", True, (0.58, 1.0), "cyber")),
    ("cyber-augen", ("cyber.augen", "cyber", False, (0.0, 0.13), "cyber")),
    ("cyber-kabel", ("cyber.kabel", "cyber", True, (0.10, 0.32), "cyber")),
    ("cyber-platte", ("cyber.platte", "cyber", False, (0.0, 0.17), "cyber")),
    ("gesicht-", ("gesicht", "gesicht", False, (0.0, 0.17), "hair")),
    ("brille-", ("brille", "brille", False, (-0.2, 0.17), "acc")),
    ("kopfhoerer", ("kopfhoerer", "kopfhoerer", False, (-0.2, 0.20), "acc")),
    ("kette", ("kette", "kette", True, (0.12, 0.35), "acc")),
    ("kappe-", ("kappe", "kappe", False, (-0.2, 0.08), "ab")),
    ("maske-tuch", ("maske", "maske", False, (0.07, 0.19), "ab")),
    ("maske-", ("maske", "maske", False, (0.07, 0.19), "acc")),
]


def meta_for(pid: str) -> dict:
    for prefix, (layer, folder, body_dep, zone, kind) in PART_META:
        if pid.startswith(prefix):
            side = "links" if pid.endswith("-links") else "rechts" if pid.endswith("-rechts") else None
            return {"layer": layer, "bodyDependent": body_dep, "zone": zone, "kind": kind, "side": side,
                    "folder": folder}
    raise KeyError(pid)


# ---------------------------------------------------------------------------------------------------------
# Farbanalyse


def hsv(rgb: np.ndarray):
    f = rgb.astype(np.float32) / 255
    mx, mn = f.max(axis=2), f.min(axis=2)
    d = mx - mn
    s = np.where(mx > 0, d / np.maximum(mx, 1e-6), 0)
    r, g, b = f[..., 0], f[..., 1], f[..., 2]
    h = np.zeros_like(mx)
    m = d > 1e-6
    h = np.where(m & (mx == r), ((g - b) / np.maximum(d, 1e-6)) % 6, h)
    h = np.where(m & (mx == g), (b - r) / np.maximum(d, 1e-6) + 2, h)
    h = np.where(m & (mx == b), (r - g) / np.maximum(d, 1e-6) + 4, h)
    return h * 60, s, mx, (mx + mn) / 2


def classes(rgba: np.ndarray) -> dict:
    h, s, v, l = hsv(rgba[..., :3])
    a = rgba[..., 3] > 24
    col = a & (s > 0.32) & (v > 0.10)
    return {
        "a": a, "l": l, "v": v,
        "red": col & ((h < 28) | (h > 335)),
        "green": col & (h > 70) & (h < 165),
        "blue": col & (h >= 205) & (h < 265),
        "cyan": col & (h >= 165) & (h < 205) & (v > 0.45),
        "grey": a & (s < 0.16) & (v >= 0.42),
        "ink": a & (v < 0.32) & (s <= 0.40),
        "gun": a & (s < 0.32) & (v >= 0.12) & (v < 0.50),
    }


# ---------------------------------------------------------------------------------------------------------
# Raster, Ausrichtung


def grid_boxes(alpha: np.ndarray) -> list[tuple[int, int, int, int]]:
    h, w = alpha.shape
    rows = split_bands(runs(alpha.sum(axis=1), 3, 4), 4, h)
    boxes = []
    for y0, y1 in rows:
        cols = split_bands(runs(alpha[y0:y1].sum(axis=0), 1, 6), 4, w)
        boxes += [(x0, y0, x1, y1) for x0, x1 in cols]
    return boxes


def load_keyed(path: Path) -> np.ndarray:
    return np.asarray(char_build.keyed(path)).copy()


def affine_warp(img: np.ndarray, s: float, tx: float, ty: float, size: tuple[int, int], nearest=False) -> np.ndarray:
    """out(x, y) = img(s*x + tx, s*y + ty); RGBA vormultipliziert, bikubisch."""
    pil = Image.fromarray(img, "RGBA")
    if not nearest:
        pil = pil.convert("RGBa")
    out = pil.transform(size, Image.Transform.AFFINE, (s, 0, tx, 0, s, ty),
                        resample=Image.Resampling.NEAREST if nearest else Image.Resampling.BICUBIC)
    if not nearest:
        out = out.convert("RGBA")
    arr = np.asarray(out).copy()
    arr[arr[..., 3] < 8] = 0
    return arr


def align(part: np.ndarray, base_win: np.ndarray, box, margin=40) -> tuple[float, float, float, float]:
    """Sucht s, d so dass part(c + s*(u - c) + d) ≈ base(u) im Fenster box. Liefert (score, s, tx, ty) für
    affine_warp mit Ausgabe-Ursprung = box-Ursprung."""
    x0, y0, x1, y1 = box
    W, H = x1 - x0, y1 - y0
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    bc = classes(base_win)
    Ba = bc["a"].astype(np.float32)
    nB = Ba.sum()
    best = (-1.0, 1.0, 0.0, 0.0)
    for s in np.arange(0.92, 1.0801, 0.01):
        # Ausgabe-Bild über das Fenster ± margin: out(x,y) = part(c + s*((x0-m+x) - c))
        tx = cx + s * (x0 - margin - cx)
        ty = cy + s * (y0 - margin - cy)
        big = affine_warp(part, s, tx, ty, (W + 2 * margin, H + 2 * margin))
        pc = classes(big)
        Pa = pc["a"].astype(np.float32)
        Pg = pc["grey"].astype(np.float32)
        nG = max(Pg.sum(), 1.0)
        c1 = fftconvolve(Pg, Ba[::-1, ::-1], mode="valid")   # |Pg(u+k) ∩ Ba(u)|
        c2 = fftconvolve(Pa, Ba[::-1, ::-1], mode="valid")   # |Pa(u+k) ∩ Ba(u)|
        score = c1 / nG + c2 / nB
        k = np.unravel_index(int(np.argmax(score)), score.shape)
        if score[k] > best[0]:
            ky, kx = k  # Versatz in Ausgabe-Pixeln des großen Bildes
            # out_window(x,y) = big(x + kx, y + ky) = part(s*(x + kx) + tx)
            best = (float(score[k]), float(s), tx + s * kx, ty + s * ky)
    return best


# ---------------------------------------------------------------------------------------------------------
# Grundpuppe


class Base:
    def __init__(self, path: Path):
        self.img = load_keyed(path)
        self.boxes = grid_boxes(self.img[..., 3] > 0)
        heights, bbs = [], []
        for (x0, y0, x1, y1) in self.boxes:
            a = self.img[y0:y1, x0:x1, 3] >= 128
            ys, xs = np.nonzero(a.any(axis=1))[0], np.nonzero(a.any(axis=0))[0]
            bbs.append((x0 + xs[0], y0 + ys[0], x0 + xs[-1] + 1, y0 + ys[-1] + 1))
            heights.append(ys[-1] - ys[0] + 1)
        self.bbox = bbs
        raw = [HEIGHT / max(heights[r * 4:(r + 1) * 4]) for r in range(4)]
        base = float(np.median([raw[0], raw[1], raw[3]]))
        self.scale = [min(max(s, base * 0.92), base * 1.08) for s in raw]
        self.scale[2] = self.scale[1]
        self.offset: dict[int, tuple[int, int]] = {}
        for r in (0, 1, 3):
            smalls = [self.scaled(r * 4 + i, self.img) for i in range(4)]
            crops = []
            for sm in smalls:
                bb = Image.fromarray(sm, "RGBA").getchannel("A").point(lambda v: 255 if v >= 128 else 0).getbbox()
                crops.append((bb, Image.fromarray(sm, "RGBA").crop(bb)))
            off = float(np.median([char_build.foot_x(c) - char_build.torso_x(c) for _, c in crops]))
            for i, (bb, c) in enumerate(crops):
                ax = char_build.torso_x(c) + off
                x = round(FOOT[0] - ax)
                y = FOOT[1] - char_build.bottom_row(c)
                self.offset[r * 4 + i] = (x - bb[0], y - bb[1])

    def window(self, idx: int, img: np.ndarray) -> np.ndarray:
        x0, y0, x1, y1 = self.boxes[idx]
        return img[y0:y1, x0:x1]

    def scaled(self, idx: int, img: np.ndarray, nearest=False) -> np.ndarray:
        s = self.scale[idx // 4]
        w = img if img.shape[0] != self.img.shape[0] else self.window(idx, img)
        size = (max(1, round(w.shape[1] * s)), max(1, round(w.shape[0] * s)))
        if nearest:
            return np.asarray(Image.fromarray(w).resize(size, Image.Resampling.NEAREST))
        out = np.asarray(Image.fromarray(w, "RGBA").convert("RGBa").resize(size, Image.Resampling.LANCZOS)
                         .convert("RGBA")).copy()
        out[out[..., 3] < 8] = 0
        return out

    def zone_rows(self, idx: int, zone: tuple[float, float]) -> tuple[int, int]:
        """Zeilenbereich (Fensterkoordinaten) für Zonenanteile der Puppenhöhe."""
        _, by0, _, by1 = self.bbox[idx]
        y0 = self.boxes[idx][1]
        H = by1 - by0
        return round(by0 + zone[0] * H - y0), round(by0 + zone[1] * H - y0)


def place(base: Base, idx: int, win_rgba: np.ndarray, win_reg: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Fensterebene (Rohauflösung) → 128er-Frame (RGBA + Regionsindex)."""
    s = base.scale[idx // 4]
    sm = base.scaled(idx, win_rgba)
    size = (sm.shape[1], sm.shape[0])
    # Regionen: je Region Abdeckung (alpha-gewichtet) verkleinern, Maximum gewinnt
    alpha = win_rgba[..., 3].astype(np.float32) / 255
    stack = []
    for code in range(1, 7):
        m = ((win_reg == code) * alpha).astype(np.float32)
        stack.append(np.asarray(Image.fromarray(m, "F").resize(size, Image.Resampling.BOX)))
    stack = np.stack(stack)
    reg = (np.argmax(stack, axis=0) + 1).astype(np.uint8)
    reg[sm[..., 3] == 0] = NONE
    ox, oy = base.offset[idx]
    frame = np.zeros((CELL, CELL, 4), np.uint8)
    freg = np.zeros((CELL, CELL), np.uint8)
    h, w = sm.shape[:2]
    fx0, fy0 = max(0, ox), max(0, oy)
    fx1, fy1 = min(CELL, ox + w), min(CELL, oy + h)
    if fx1 > fx0 and fy1 > fy0:
        frame[fy0:fy1, fx0:fx1] = sm[fy0 - oy:fy1 - oy, fx0 - ox:fx1 - ox]
        freg[fy0:fy1, fx0:fx1] = reg[fy0 - oy:fy1 - oy, fx0 - ox:fx1 - ox]
    _ = s
    return frame, freg


# ---------------------------------------------------------------------------------------------------------
# Extraktion


def normalize_gray(l: np.ndarray, sel: np.ndarray) -> np.ndarray:
    """Helligkeit je Region auf 5 % → 0,15, Median → 0,5, 95 % → 0,85 abbilden."""
    out = l.copy()
    if sel.sum() < 20:
        return out
    p5, p50, p95 = np.percentile(l[sel], [5, 50, 95])
    p50 = min(max(p50, p5 + 1e-3), p95 - 1e-3)
    x = l[sel]
    y = np.where(x < p50, 0.15 + (x - p5) / max(p50 - p5, 1e-3) * 0.35, 0.5 + (x - p50) / max(p95 - p50, 1e-3) * 0.35)
    out[sel] = np.clip(y, 0.0, 1.0)
    return out


def finish_layer(rgba: np.ndarray, reg: np.ndarray, gray: np.ndarray, desat_fixed: bool) -> np.ndarray:
    """Regionspixel als Graustufe, feste Pixel farbig (Tusche ggf. entsättigt)."""
    out = rgba.copy()
    g = (gray * 255).clip(0, 255).astype(np.uint8)
    regm = (reg != FIXED) & (reg != NONE)
    out[regm, 0] = out[regm, 1] = out[regm, 2] = g[regm]
    if desat_fixed:
        fx = reg == FIXED
        lum = (0.3 * rgba[..., 0] + 0.59 * rgba[..., 1] + 0.11 * rgba[..., 2]).astype(np.uint8)
        out[fx, 0] = out[fx, 1] = out[fx, 2] = lum[fx]
    out[reg == NONE] = 0
    return out


def region_of(c: dict, kind: str) -> np.ndarray:
    reg = np.full(c["a"].shape, FIXED, np.uint8)
    if kind == "ab":
        reg[c["red"]] = RA
        reg[c["green"]] = RB
        reg[c["cyan"]] = RGLOW
    elif kind == "hair":
        reg[c["blue"]] = RHAIR
    elif kind in ("cyber", "acc"):
        reg[c["cyan"]] = RGLOW
    return reg


def extract(base_win: np.ndarray, part_win: np.ndarray, kind: str, rows: tuple[int, int]) -> np.ndarray:
    """Maske der Teilpixel im Fenster (ausgerichtetes Rohbild gegen Puppe)."""
    c = classes(part_win)
    b = classes(base_win)
    Z = np.zeros_like(c["a"])
    Z[max(0, rows[0]):max(0, rows[1])] = True
    base_a = ndimage.binary_dilation(b["a"], iterations=3)
    base_ink = ndimage.binary_dilation(b["ink"], iterations=3)
    newdark = (c["ink"] | c["gun"]) & ~base_ink
    outside = c["a"] & ~base_a & ~c["grey"]
    if kind == "ab":
        core = (c["red"] | c["green"] | c["cyan"]) & Z
    elif kind == "hair":
        core = c["blue"] & Z
    elif kind == "cyber":
        core = (c["cyan"] | (newdark & b["a"])) & Z
    else:  # acc: dunkle Pixel dort, wo die Puppe hell/grau ist (Brille über den Augen, Bügel, Muscheln)
        core = (((c["ink"] | c["gun"]) & (b["grey"] | ~b["a"])) | c["cyan"]) & Z
    core = ndimage.binary_opening(core, iterations=1) | (core & (c["cyan"] | c["red"] | c["green"] | c["blue"]))
    # Kleinstflecken weg
    lab, n = ndimage.label(core)
    if n:
        sizes = ndimage.sum(core, lab, range(1, n + 1))
        core = np.isin(lab, np.nonzero(sizes >= 12)[0] + 1)
    near = ndimage.binary_dilation(core, iterations=4)
    part = ndimage.binary_fill_holes(ndimage.binary_closing(core, iterations=2))
    part |= near & (c["ink"] | c["gun"] | outside)
    part |= ndimage.binary_dilation(core, iterations=8) & outside
    return part & c["a"] & Z


# ---------------------------------------------------------------------------------------------------------
# Körperbau-Varianten, Spiegelung, Speichern


def body_warp(frame: np.ndarray, reg: np.ndarray, base_frame: np.ndarray, k: float):
    if k == 1.0:
        return frame, reg
    a = base_frame[..., 3] >= 128
    ys = np.nonzero(a.any(axis=1))[0]
    if not len(ys):
        return frame, reg
    top, bot = ys[0], ys[-1]
    neck = top + 0.17 * (bot - top)
    cx = char_build.torso_x(Image.fromarray(base_frame, "RGBA").crop((0, top, CELL, bot + 1))) if True else 64
    yy, xx = np.mgrid[0:CELL, 0:CELL].astype(np.float32)
    ramp = np.clip((yy - neck) / 8.0, 0, 1)
    kk = 1 + (k - 1) * ramp
    src_x = cx + (xx - cx) / kk
    out = np.zeros_like(frame)
    pm = frame.astype(np.float32)
    pm[..., :3] *= pm[..., 3:4] / 255
    for ch in range(4):
        out[..., ch] = ndimage.map_coordinates(pm[..., ch], [yy, src_x], order=1, mode="constant").clip(0, 255)
    al = out[..., 3].astype(np.float32)
    rgb = out[..., :3].astype(np.float32) * 255 / np.maximum(al[..., None], 1)
    out = np.dstack([rgb.clip(0, 255), al]).astype(np.uint8)
    out[al < 8] = 0
    oreg = ndimage.map_coordinates(reg, [yy, np.round(src_x)], order=0, mode="constant").astype(np.uint8)
    oreg[out[..., 3] == 0] = NONE
    return out, oreg


def sheet_from(frames: dict[int, tuple[np.ndarray, np.ndarray]], mirror_from: dict | None = None):
    """frames: idx → (rgba, reg) für Zeilen S, W, N; Zeile O = gespiegelte Zeile W (ggf. aus anderem Teil)."""
    img = np.zeros((CELL * 4, CELL * 4, 4), np.uint8)
    reg = np.zeros((CELL * 4, CELL * 4), np.uint8)
    src_e = mirror_from if mirror_from is not None else frames
    for idx in range(16):
        r, i = divmod(idx, 4)
        if r == 2:
            f = src_e.get(4 + i)
            if f is None:
                continue
            fr, rg = f[0][:, ::-1], f[1][:, ::-1]
        else:
            f = frames.get(idx)
            if f is None:
                continue
            fr, rg = f
        fr, rg = fr.copy(), rg.copy()
        lab, n = ndimage.label(fr[..., 3] > 40, structure=np.ones((3, 3)))
        if n > 1:
            sizes = ndimage.sum(np.ones_like(lab), lab, range(1, n + 1))
            small = np.isin(lab, np.nonzero(sizes < 6)[0] + 1)
            small = ndimage.binary_dilation(small, iterations=1) & ~np.isin(lab, np.nonzero(sizes >= 6)[0] + 1)
            fr[small] = 0
            rg[small] = NONE
        img[r * CELL:(r + 1) * CELL, i * CELL:(i + 1) * CELL] = fr
        reg[r * CELL:(r + 1) * CELL, i * CELL:(i + 1) * CELL] = rg
    return img, reg


def save_clip(img: np.ndarray, path: Path) -> str:
    """Kappen-Clip: Kappensilhouette + alles darüber je Spalte (+1 px) → dort wird Haar gelöscht."""
    a = img[..., 3] > 40
    clip = np.zeros_like(a)
    for r in range(4):
        for c in range(4):
            sub = a[r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL]
            # je Spalte: alles oberhalb des untersten Kappenpixels
            below = np.flipud(np.maximum.accumulate(np.flipud(sub), axis=0))
            clip[r * CELL:(r + 1) * CELL, c * CELL:(c + 1) * CELL] = below
    clip = ndimage.binary_dilation(clip, iterations=1)
    out = np.zeros(img.shape, np.uint8)
    out[clip] = (255, 255, 255, 255)
    Image.fromarray(out, "RGBA").save(path, optimize=True)
    return str(path.relative_to(ROOT / "game/public"))


def save_layer(img: np.ndarray, reg: np.ndarray, path: Path) -> dict:
    path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(img, "RGBA").save(path, optimize=True)
    m = np.zeros(img.shape, np.uint8)
    for code, col in MASK_RGB.items():
        m[reg == code, :3] = col
    m[..., 3] = np.where(img[..., 3] > 0, 255, 0)
    mp = path.with_name(path.name[:-4] + ".mask.png")
    Image.fromarray(m, "RGBA").save(mp, optimize=True)
    regions = sorted(REGION_NAME[c] for c in np.unique(reg[img[..., 3] > 0]) if c in REGION_NAME)
    return {"file": str(path.relative_to(ROOT / "game/public")), "mask": str(mp.relative_to(ROOT / "game/public")),
            "regions": regions}


# ---------------------------------------------------------------------------------------------------------
# Bauen


def build_base(base: Base) -> dict[int, tuple[np.ndarray, np.ndarray]]:
    frames = {}
    for idx in range(16):
        if idx // 4 == 2:
            continue
        win = base.window(idx, base.img)
        c = classes(win)
        reg = np.where(c["a"], RSKIN, NONE).astype(np.uint8)
        ink = c["ink"] & (c["v"] < 0.26)
        reg[ink] = FIXED
        frames[idx] = (win, reg, c["l"])
    sel_all = np.concatenate([(f[1] == RSKIN).ravel() for f in frames.values()])
    l_all = np.concatenate([f[2].ravel() for f in frames.values()])
    gray_all = normalize_gray(l_all, sel_all)
    out, pos = {}, 0
    for idx, (win, reg, l) in frames.items():
        n = l.size
        gray = gray_all[pos:pos + n].reshape(l.shape)
        pos += n
        layer = finish_layer(win, reg, gray, True)
        out[idx] = place(base, idx, layer, reg)
    return out


def fill_hair_occlusion(base: Base, idx: int, bwin, pwin, c, sel, reg, zone):
    """Im selben Auftrag gemaltes Haar verdeckt Kleidung (lange Haare über dem Rücken). Haarpixel innerhalb der
    Puppe, unterhalb des Kopfes und zeilenweise zwischen Kleidungspixeln werden mit der nächstgelegenen
    Kleidungsfarbe gefüllt (leicht geglättet)."""
    if not sel.any():
        return pwin, reg, c["l"]
    b = classes(bwin)
    r0, r1 = base.zone_rows(idx, (max(zone[0], 0.17), zone[1]))
    occl = c["blue"] & b["a"]
    occl[:max(0, r0)] = False
    occl[max(0, r1):] = False
    xs = np.arange(sel.shape[1])[None, :]
    has = sel.any(axis=1)
    left = np.where(has, np.argmax(sel, axis=1), sel.shape[1])[:, None]
    right = np.where(has, sel.shape[1] - 1 - np.argmax(sel[:, ::-1], axis=1), -1)[:, None]
    occl &= (xs > left) & (xs < right)
    if not occl.any():
        return pwin, reg, c["l"]
    _, (iy, ix) = ndimage.distance_transform_edt(~sel, return_indices=True)
    out = pwin.copy()
    out[occl] = pwin[iy[occl], ix[occl]]
    reg = reg.copy()
    reg[occl] = reg[iy[occl], ix[occl]]
    l = c["l"].copy()
    lf = ndimage.uniform_filter(np.where(sel, l, 0), 7) / np.maximum(ndimage.uniform_filter(sel.astype(np.float32), 7), 1e-3)
    l[occl] = lf[occl]
    return out, reg, l


def build_job(base: Base, job: str) -> dict[str, dict[int, tuple[np.ndarray, np.ndarray]]]:
    raw = load_keyed(RAW / f"{job}.png")
    parts = CP.JOBS[job]
    per_part: dict[str, list] = {p: [] for p in parts}
    scores = []
    for idx in range(16):
        if idx // 4 == 2:
            continue
        box = base.boxes[idx]
        bwin = base.window(idx, base.img)
        score, s, tx, ty = align(raw, bwin, box)
        scores.append(round(score, 3))
        pwin = affine_warp(raw, s, tx, ty, (box[2] - box[0], box[3] - box[1]))
        c = classes(pwin)
        for p in parts:
            m = meta_for(p)
            sel = extract(bwin, pwin, m["kind"], base.zone_rows(idx, m["zone"]))
            reg = np.where(sel, region_of(c, m["kind"]), NONE).astype(np.uint8)
            ppwin, pl = pwin, c["l"]
            if m["kind"] == "ab" and any(meta_for(q)["kind"] == "hair" for q in parts):
                ppwin, reg, pl = fill_hair_occlusion(base, idx, bwin, pwin, c, sel, reg, m["zone"])
            per_part[p].append((idx, ppwin, reg, pl))
    print(f"  {job}: Ausrichtung {min(scores):.2f}–{max(scores):.2f}", flush=True)
    result = {}
    for p, items in per_part.items():
        m = meta_for(p)
        gray_by_idx = {}
        for code in (RA, RB, RHAIR, RGLOW):
            sel = np.concatenate([(r == code).ravel() for _, _, r, _ in items])
            if not sel.any():
                continue
            l_all = np.concatenate([l.ravel() for _, _, _, l in items])
            g = normalize_gray(l_all, sel)
            pos = 0
            for idx, _, r, l in items:
                n = l.size
                gi = g[pos:pos + n].reshape(l.shape)
                pos += n
                prev = gray_by_idx.get(idx, l.copy())
                prev[r == code] = gi[r == code]
                gray_by_idx[idx] = prev
        frames = {}
        for idx, pwin, reg, l in items:
            rgba = pwin.copy()
            rgba[..., 3] = np.where(reg != NONE, rgba[..., 3], 0)
            layer = finish_layer(rgba, reg, gray_by_idx.get(idx, l), m["kind"] in ("ab", "hair"))
            frames[idx] = place(base, idx, layer, reg)
        result[p] = frames
    return result


def split_hair(frames: dict, base_frames: dict):
    """S/W: Haar unterhalb der Kinnlinie außerhalb der Puppe → back, Rest front. N: alles front."""
    back, front = {}, {}
    for idx, (img, reg) in frames.items():
        bimg = base_frames[idx][0]
        a = bimg[..., 3] >= 100
        ys = np.nonzero(a.any(axis=1))[0]
        chin = ys[0] + 0.14 * (ys[-1] - ys[0]) if len(ys) else 0
        hair = img[..., 3] > 0
        if idx // 4 == 3:
            bm = np.zeros_like(hair)
        else:
            yy = np.arange(CELL)[:, None]
            bm = hair & (yy > chin) & ~ndimage.binary_dilation(a, iterations=1)
        fm = hair & ~bm
        back[idx] = (np.where(bm[..., None], img, 0).astype(np.uint8), np.where(bm, reg, NONE).astype(np.uint8))
        front[idx] = (np.where(fm[..., None], img, 0).astype(np.uint8), np.where(fm, reg, NONE).astype(np.uint8))
    return back, front


def load_cache() -> dict:
    p = RAW / "_layers.npz"
    if not p.exists():
        return {}
    d = np.load(p, allow_pickle=True)
    return d["layers"].item()


def save_cache(c: dict) -> None:
    np.savez_compressed(RAW / "_layers.npz", layers=np.array(c, dtype=object))


def build(jobs: list[str]) -> None:
    base = Base(RAW / CP.BASE_RAW)
    print("Grundpuppe …", flush=True)
    base_frames = build_base(base)
    cache = load_cache() if jobs != list(j for j in CP.JOBS if CP.JOBS[j] and (RAW / f"{j}.png").exists()) else {}
    for job in jobs:
        for p, fr in build_job(base, job).items():
            cache[p] = fr
    save_cache(cache)
    write_outputs(base_frames, cache)


def write_outputs(base_frames: dict, layers: dict) -> None:
    catalog = {"note": "Erzeugt von scripts/art/creator/creator_build.py – nicht von Hand bearbeiten.",
               "sheet": {"frameW": CELL, "frameH": CELL, "cols": 4, "rows": 4, "rowsDir": DIRS, "foot": list(FOOT),
                         "figureHeight": HEIGHT, "eRow": "gespiegelte Zeile W (seitengebundene Teile getauscht)"},
               "layerOrder": {"s": LAYERS, "w": LAYERS, "e": LAYERS, "n": LAYERS_N},
               "maskColors": {"colorA": "#ff0000", "colorB": "#00ff00", "hair": "#0000ff", "skin": "#ffff00",
                              "glow": "#ff00ff", "fixed": "#000000"},
               "tint": "Graustufe L (0…1) je Region → Verlauf dunkel(0)/mittel(0,5)/hell(1) der gewählten Farbe; feste Pixel unverändert",
               "bodies": {b: {"warpBelowNeck": k} for b, k in BODIES.items()},
               "palette": PALETTE, "hairColors": HAIR, "skin": SKIN,
               "parts": {}}
    base_by_body = {}
    files = {}
    for b, k in BODIES.items():
        fr = {i: body_warp(f[0], f[1], base_frames[i][0], k) for i, f in base_frames.items()}
        base_by_body[b] = fr
        img, reg = sheet_from(fr)
        files[b] = save_layer(img, reg, OUT / f"koerper/{b}.png")
    catalog["parts"]["koerper"] = {"id": "koerper", "category": "koerper", "layer": "koerper", "files": files}
    for pid, frames in sorted(layers.items()):
        m = meta_for(pid)
        entry = {"id": pid, "category": m["folder"], "layer": m["layer"], "bodyDependent": m["bodyDependent"]}
        if m["side"]:
            entry["side"] = m["side"]
        mirror_src = None
        if m["side"]:
            other = pid.replace("-links", "-X").replace("-rechts", "-links").replace("-X", "-rechts")
            mirror_src = layers.get(other)
        if m["layer"] == "haar":
            back, front = split_hair(frames, base_frames)
            entry["layer"] = "haar.back/haar.front"
            entry["files"] = {}
            for nm, fr in (("back", back), ("front", front)):
                img, reg = sheet_from(fr)
                entry["files"][nm] = save_layer(img, reg, OUT / f"haar/{pid}.{nm}.png")
        elif m["bodyDependent"]:
            entry["files"] = {}
            for b, k in BODIES.items():
                fr = {i: body_warp(f[0], f[1], base_frames[i][0], k) for i, f in frames.items()}
                ms = None
                if mirror_src is not None:
                    ms = {i: body_warp(f[0], f[1], base_frames[i][0], k) for i, f in mirror_src.items()}
                img, reg = sheet_from(fr, ms if m["side"] else None)
                if m["side"] and ms is None:
                    img[2 * CELL:3 * CELL] = 0
                    reg[2 * CELL:3 * CELL] = 0
                entry["files"][b] = save_layer(img, reg, OUT / f"{m['folder']}/{b}/{pid}.png")
        else:
            img, reg = sheet_from(frames)
            entry["files"] = {"alle": save_layer(img, reg, OUT / f"{m['folder']}/{pid}.png")}
            if m["layer"] == "kappe":
                entry["clip"] = save_clip(img, OUT / f"kappe/{pid}.clip.png")
        catalog["parts"][pid] = entry
    catalog["parts"]["jacke-keine"] = {"id": "jacke-keine", "category": "jacke", "layer": "jacke", "files": {}}
    catalog["parts"]["gesicht-1"] = {"id": "gesicht-1", "category": "gesicht", "layer": "gesicht", "files": {},
                                     "note": "schlichtes Gesicht ist in den Grundkörper eingemalt"}
    catalog["parts"]["haar-glatze"] = {"id": "haar-glatze", "category": "haar", "layer": "haar", "files": {}}
    CATALOG.parent.mkdir(parents=True, exist_ok=True)
    text = json.dumps(catalog, ensure_ascii=False, indent=1) + "\n"
    CATALOG.write_text(text)
    (OUT / "catalog.json").write_text(text)
    print(f"Katalog: {len(catalog['parts'])} Einträge → {CATALOG.relative_to(ROOT)}", flush=True)


# ---------------------------------------------------------------------------------------------------------
# Paletten (Vorschlag für content/appearance.ts) und Vorschau-Zusammensetzung (gleiche Regel wie compose.ts)

SKIN = {"haut-1": "#f3d6c4", "haut-2": "#e8bfa0", "haut-3": "#d9a27e", "haut-4": "#c68a62", "haut-5": "#a86d48",
        "haut-6": "#8a5636", "haut-7": "#6b3f27", "haut-8": "#4a2a1a"}
HAIR = {"schwarz": "#2a2428", "dunkelbraun": "#4a3020", "kastanie": "#7a3a22", "kupfer": "#b8602c", "rot": "#b02a22",
        "dunkelblond": "#94743f", "blond": "#d8b868", "platin": "#e6dcc0", "grau": "#8f8c88", "weiss": "#ece8e2",
        "neon-pink": "#ff3fb0", "neon-cyan": "#3fe8ff", "neon-violett": "#a64dff", "giftgruen": "#7cff2e"}
PALETTE = {"schwarz": "#2a272f", "anthrazit": "#41444d", "grau": "#80838c", "weiss": "#e6e4df", "sand": "#c9b48a",
           "oliv": "#6b7040", "leder": "#7a4a2a", "wein": "#6e1f33", "rot": "#c02a2a", "orange": "#e0702a",
           "senf": "#c9a12a", "waldgruen": "#2f5a3a", "petrol": "#1f6670", "marine": "#22305e",
           "jeansblau": "#4a6a9a", "chrom": "#a9b4c2", "neon-pink": "#ff2fa8", "neon-cyan": "#22e8ff",
           "neon-violett": "#a040ff", "neon-gruen": "#5cff3a"}


def hexrgb(h: str) -> np.ndarray:
    return np.array([int(h[i:i + 2], 16) for i in (1, 3, 5)], np.float32)


def ramp(hx: str, neon: bool) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    mid = hexrgb(hx)
    dark = mid * 0.4 + hexrgb("#0b0716") * 0.6
    lw = 0.7 if neon else 0.45
    light = mid * (1 - lw) + np.array([255, 255, 255], np.float32) * lw
    return dark, mid, light


def tint(gray: np.ndarray, hx: str, neon=False) -> np.ndarray:
    d, m, l = ramp(hx, neon)
    t = gray[..., None] / 255.0
    lo = d + (m - d) * np.clip(t / 0.5, 0, 1)
    hi = m + (l - m) * np.clip((t - 0.5) / 0.5, 0, 1)
    return np.where(t < 0.5, lo, hi)


def colorize(img: np.ndarray, mask: np.ndarray, look: dict) -> np.ndarray:
    out = img.astype(np.float32).copy()
    g = img[..., 0].astype(np.float32)
    for col, key in (((255, 0, 0), "colorA"), ((0, 255, 0), "colorB"), ((0, 0, 255), "hair"), ((255, 255, 0), "skin"),
                     ((255, 0, 255), "glow")):
        sel = (mask[..., 0] == col[0]) & (mask[..., 1] == col[1]) & (mask[..., 2] == col[2]) & (img[..., 3] > 0)
        if sel.any():
            hx = look[key]
            out[sel, :3] = tint(g, hx, neon=key == "glow" or look.get(key + "Neon", False))[sel]
    return out.clip(0, 255).astype(np.uint8)


def read_layer(rel: str) -> tuple[np.ndarray, np.ndarray]:
    p = ROOT / "game/public" / rel
    return np.asarray(Image.open(p).convert("RGBA")), np.asarray(Image.open(str(p)[:-4] + ".mask.png").convert("RGBA"))


def compose(cat: dict, ap: dict) -> Image.Image:
    look = {"colorA": PALETTE[ap["colorA"]], "colorB": PALETTE[ap["colorB"]], "hair": HAIR[ap["hairColor"]],
            "skin": SKIN[ap["skin"]], "glow": PALETTE[ap["glow"]],
            "colorANeon": ap["colorA"].startswith("neon"), "colorBNeon": ap["colorB"].startswith("neon"),
            "hairNeon": ap["hairColor"].startswith("neon") or ap["hairColor"] == "giftgruen"}
    body = ap["body"]
    by_layer: dict[str, list[str]] = {}
    P = cat["parts"]

    def add(layer, rel):
        by_layer.setdefault(layer, []).append(rel)

    add("koerper", P["koerper"]["files"][body]["file"])
    for pid in [ap["top"], ap["jacket"], ap["pants"], ap["shoes"], *ap["extra"]]:
        e = P.get(pid)
        if not e or not e["files"]:
            continue
        f = e["files"]
        add(e["layer"], (f.get(body) or f.get("alle"))["file"])
    if ap["hair"] in P and P[ap["hair"]]["files"]:
        add("haar.back", P[ap["hair"]]["files"]["back"]["file"])
        add("haar.front", P[ap["hair"]]["files"]["front"]["file"])
    clips = [np.asarray(Image.open(ROOT / "game/public" / P[x]["clip"]))[..., 3] > 0
             for x in ap["extra"] if x in P and P[x].get("clip")]
    sheet = Image.new("RGBA", (CELL * 4, CELL * 4), (0, 0, 0, 0))
    for r, d in enumerate(DIRS):
        order = LAYERS_N if d == "n" else LAYERS
        row = Image.new("RGBA", (CELL * 4, CELL), (0, 0, 0, 0))
        for layer in order:
            for rel in by_layer.get(layer, []):
                img, mask = read_layer(rel)
                band = slice(r * CELL, (r + 1) * CELL)
                col = colorize(img[band], mask[band], look)
                if layer.startswith("haar.") and clips:
                    for cl in clips:
                        col[cl[band]] = 0
                row.alpha_composite(Image.fromarray(col, "RGBA"))
        sheet.alpha_composite(row, (0, r * CELL))
    return sheet


def random_look(cat: dict, rng: random.Random) -> dict:
    P = cat["parts"]
    by = lambda c: [k for k, v in P.items() if v["category"] == c]  # noqa: E731
    pal = list(PALETTE)
    extra = []
    for cy in by("cyber"):
        if rng.random() < 0.15:
            extra.append(cy)
    for cat_ in ("brille", "maske", "kappe", "kopfhoerer", "kette"):
        if by(cat_) and rng.random() < 0.2:
            extra.append(rng.choice(by(cat_)))
    if any(e.startswith("maske") for e in extra):
        extra = [e for e in extra if e != "cyber-platte"]   # Maske ⟂ Gesichtsplatte
    faces = by("gesicht")
    face = rng.choice(faces)
    if P[face]["files"]:
        extra.append(face)
    return {"body": rng.choice(list(BODIES)), "skin": rng.choice(list(SKIN)), "hair": rng.choice(by("haar")),
            "hairColor": rng.choice(list(HAIR)), "top": rng.choice(by("oben") or [""]),
            "jacket": rng.choice(by("jacke")) if rng.random() > 0.25 else "jacke-keine",
            "pants": rng.choice(by("hose") or [""]), "shoes": rng.choice(by("schuhe") or [""]),
            "colorA": rng.choice(pal), "colorB": rng.choice(pal[-4:] if rng.random() < 0.5 else pal),
            "glow": rng.choice(["neon-cyan", "neon-pink", "neon-violett", "neon-gruen", "orange"]), "extra": extra}


def font(size: int):
    for f in ("/System/Library/Fonts/Supplemental/Arial.ttf", "/System/Library/Fonts/Helvetica.ttc"):
        try:
            return ImageFont.truetype(f, size)
        except OSError:
            pass
    return ImageFont.load_default()


def preview(seed: int = 7) -> None:
    cat = json.loads(CATALOG.read_text())
    rng = random.Random(seed)
    QA.mkdir(parents=True, exist_ok=True)
    looks = [random_look(cat, rng) for _ in range(8)]
    S = 2
    tw, th = CELL * 4 * S, CELL * S + 34
    sheet = Image.new("RGB", (tw * 2, th * 4), (24, 16, 40))
    dr = ImageDraw.Draw(sheet)
    for n, ap in enumerate(looks):
        sh = compose(cat, ap)
        x0, y0 = (n % 2) * tw, (n // 2) * th
        for r in range(4):
            fr = sh.crop((CELL, r * CELL, 2 * CELL, (r + 1) * CELL)).resize((CELL * S, CELL * S), Image.Resampling.LANCZOS)
            bg = Image.new("RGBA", fr.size, (40, 28, 64, 255) if (r + n) % 2 else (30, 22, 52, 255))
            bg.alpha_composite(fr)
            sheet.paste(bg.convert("RGB"), (x0 + r * CELL * S, y0 + 34))
        label = f"{n + 1}: {ap['body']} · {ap['hair']} {ap['hairColor']} · {ap['top']} · {ap['jacket']} · {ap['pants']} · {ap['shoes']} · {ap['colorA']}/{ap['colorB']}"
        if ap["extra"]:
            label += " · " + ", ".join(ap["extra"])
        dr.text((x0 + 6, y0 + 8), label, fill=(230, 226, 214), font=font(13))
        # GIF: 4 Richtungen nebeneinander, laufend
        frames = []
        for i in range(4):
            f = Image.new("RGBA", (CELL * 4 * S, CELL * S), (30, 22, 52, 255))
            for r in range(4):
                c = sh.crop((i * CELL, r * CELL, (i + 1) * CELL, (r + 1) * CELL)).resize((CELL * S, CELL * S), Image.Resampling.LANCZOS)
                f.alpha_composite(c, (r * CELL * S, 0))
            frames.append(f.convert("RGB"))
        frames[0].save(QA / f"combo-{n + 1}.gif", save_all=True, append_images=frames[1:], duration=125, loop=0)
        Image.fromarray(np.asarray(sh)).save(QA / f"combo-{n + 1}.png")
    sheet.save(QA / "combos.png")
    (QA / "combos.json").write_text(json.dumps(looks, ensure_ascii=False, indent=1) + "\n")
    parts_sheet(cat)
    print(f"Vorschau: {(QA / 'combos.png').relative_to(ROOT)} + 8 GIFs", flush=True)


def parts_sheet(cat: dict) -> None:
    """Übersicht aller Teile einzeln auf grauer Puppe (Frame S1, W1, N1) in Standardfarben."""
    ids = [k for k, v in cat["parts"].items() if v["files"] and k != "koerper"]
    base_ap = {"body": "mittel", "skin": "haut-3", "hair": "haar-glatze", "hairColor": "dunkelbraun", "top": "",
               "jacket": "", "pants": "", "shoes": "", "colorA": "marine", "colorB": "senf", "glow": "neon-cyan",
               "extra": []}
    tiles = []
    for pid in ids:
        ap = dict(base_ap, extra=[pid]) if not pid.startswith("haar-") else dict(base_ap, hair=pid)
        sh = compose(cat, ap)
        t = Image.new("RGBA", (CELL * 3, CELL + 18), (36, 26, 58, 255))
        for j, r in enumerate((0, 1, 3)):
            t.alpha_composite(sh.crop((CELL, r * CELL, 2 * CELL, (r + 1) * CELL)), (j * CELL, 18))
        ImageDraw.Draw(t).text((4, 2), pid, fill=(230, 226, 214), font=font(12))
        tiles.append(t)
    cols = 4
    rows = (len(tiles) + cols - 1) // cols
    out = Image.new("RGB", (CELL * 3 * cols, (CELL + 18) * rows), (20, 14, 34))
    for i, t in enumerate(tiles):
        out.paste(t.convert("RGB"), ((i % cols) * CELL * 3, (i // cols) * (CELL + 18)))
    out.save(QA / "parts.png")


def main(argv: list[str]) -> int:
    opts = {a.split("=", 1)[0]: (a.split("=", 1)[1] if "=" in a else True) for a in argv if a.startswith("--")}
    args = [a for a in argv if not a.startswith("--")]
    seed = int(opts.get("--seed", 7))
    if not opts.get("--preview"):
        jobs = args or [j for j in CP.JOBS if CP.JOBS[j] and (RAW / f"{j}.png").exists()]
        build(jobs)
    preview(seed)
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
