#!/usr/bin/env python3
"""Itemsymbole: Symbolbögen planen, mit Codex malen, zum Atlas schneiden.

  python3 scripts/art/icons/icons_build.py plan       # Gegenstände einlesen, neue Symbole an Bögen anhängen
  python3 scripts/art/icons/icons_build.py generate   # fehlende Rohbögen malen (max. 3 gleichzeitig)
  python3 scripts/art/icons/icons_build.py build      # Atlas + Manifest-Fragment + Vorschau
  python3 scripts/art/icons/icons_build.py all        # alles nacheinander

Bögen: design/assets/icons/sheets.json (eingefroren, neue Symbole nur angehängt), Rohbilder
output/imagegen/raw/icons/sheet-NN.png (4×4 Symbole auf Weiß), Atlas game/public/assets/ui/items.png
(64×64-Zellen, 16 Spalten), Fragment design/assets/icons/items.manifest.json. Gegenstände ohne eigenes
Symbol (neu, ohne Beschreibung, Bogen fehlt) bekommen das Kategorie-Symbol generic-<kategorie>.
"""
from __future__ import annotations

import json
import subprocess
import sys
from collections import deque
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw

sys.path.insert(0, str(Path(__file__).resolve().parent))
from icon_prompts import DESC, GENERIC, STYLE  # noqa: E402

ROOT = Path(__file__).resolve().parents[3]
DUMP = ROOT / "output/icons/items.dump.json"
PLAN = ROOT / "design/assets/icons/sheets.json"
FRAGMENT = ROOT / "design/assets/icons/items.manifest.json"
RAW = ROOT / "output/imagegen/raw/icons"
ATLAS = ROOT / "game/public/assets/ui/items.png"
PREVIEW = ROOT / "output/icons"
CELL, COLS, PER_SHEET, GRID = 64, 16, 16, 4
ORDER = ["waffe", "verbrauch", "geschenk", "cyberware", "kleidung", "quest", "sammeln"]


def dump_items() -> list[dict]:
    subprocess.run(["node", str(ROOT / "scripts/art/icons/dump_items.mjs")], check=True, cwd=ROOT)
    return json.loads(DUMP.read_text())


def load_plan() -> dict:
    return json.loads(PLAN.read_text()) if PLAN.exists() else {"note": "Eingefroren; neue Symbole nur anhängen.", "sheets": []}


def plan(items: list[dict]) -> dict:
    data = load_plan()
    planned = {icon for sheet in data["sheets"] for icon in sheet["icons"]}
    wanted: list[str] = []
    for cat in ORDER + sorted({i["category"] for i in items} - set(ORDER)):
        for item in items:
            icon = item["icon"]
            if item["category"] == cat and icon in DESC and icon not in planned and icon not in wanted:
                wanted.append(icon)
    wanted += [g for g in GENERIC if g not in planned]
    missing = sorted({i["icon"] for i in items if i["icon"] not in DESC})
    # angebrochenen letzten Bogen nicht verändern (könnte schon gemalt sein) – immer neue Bögen
    for start in range(0, len(wanted), PER_SHEET):
        n = len(data["sheets"]) + 1
        data["sheets"].append({"id": f"sheet-{n:02d}", "icons": wanted[start:start + PER_SHEET]})
    PLAN.parent.mkdir(parents=True, exist_ok=True)
    PLAN.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    print(f"Plan: {len(data['sheets'])} Bögen, {len(wanted)} neue Symbole; ohne Beschreibung (→ Kategorie-Symbol): {missing}")
    return data


def prompt_for(sheet: dict) -> str:
    lines = []
    for idx, icon in enumerate(sheet["icons"]):
        r, c = divmod(idx, GRID)
        lines.append(f"Row {r + 1}, column {c + 1}: {DESC.get(icon) or GENERIC[icon]}.")
    rest = PER_SHEET - len(sheet["icons"])
    if rest:
        lines.append(f"The remaining {rest} cells at the end stay completely empty white.")
    return STYLE + "\n\nCells, left to right, top to bottom:\n" + "\n".join(lines)


def generate(data: dict, only: set[str] | None = None) -> None:
    RAW.mkdir(parents=True, exist_ok=True)
    todo = [s for s in data["sheets"] if not (RAW / f"{s['id']}.png").exists() and (not only or s["id"] in only)]

    def run(sheet: dict) -> str:
        target = RAW / f"{sheet['id']}.png"
        (RAW / f"{sheet['id']}.prompt.txt").write_text(prompt_for(sheet))
        res = subprocess.run([str(ROOT / "scripts/art/codex_image.sh"), str(target), prompt_for(sheet)], capture_output=True, text=True)
        return f"{sheet['id']}: {'ok' if res.returncode == 0 else 'FEHLER ' + res.stderr.strip()}"

    with ThreadPoolExecutor(3) as pool:
        for line in pool.map(run, todo):
            print(line, flush=True)


def background_mask(rgb: np.ndarray, near: int = 48) -> np.ndarray:
    """Mit dem Rand verbundene, fast weiße (bzw. randfarbene) Pixel."""
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    bg = np.median(border, axis=0)
    close = np.sqrt(((rgb - bg) ** 2).sum(axis=2)) < near
    h, w = close.shape
    seen = np.zeros_like(close)
    q: deque = deque()
    for x in range(w):
        for y in (0, h - 1):
            if close[y, x]:
                seen[y, x] = True; q.append((y, x))
    for y in range(h):
        for x in (0, w - 1):
            if close[y, x] and not seen[y, x]:
                seen[y, x] = True; q.append((y, x))
    while q:
        y, x = q.popleft()
        for ny, nx in ((y - 1, x), (y + 1, x), (y, x - 1), (y, x + 1)):
            if 0 <= ny < h and 0 <= nx < w and close[ny, nx] and not seen[ny, nx]:
                seen[ny, nx] = True; q.append((ny, nx))
    return seen


def label_components(mask: np.ndarray) -> tuple[np.ndarray, int]:
    h, w = mask.shape
    labels = np.zeros((h, w), dtype=np.int32)
    n = 0
    ys0, xs0 = np.nonzero(mask)
    for y0, x0 in zip(ys0.tolist(), xs0.tolist()):
        if labels[y0, x0]:
            continue
        n += 1
        labels[y0, x0] = n
        q = deque([(y0, x0)])
        while q:
            y, x = q.popleft()
            for dy in (-1, 0, 1):
                for dx in (-1, 0, 1):
                    ny, nx = y + dy, x + dx
                    if 0 <= ny < h and 0 <= nx < w and mask[ny, nx] and not labels[ny, nx]:
                        labels[ny, nx] = n; q.append((ny, nx))
    return labels, n


def cut_sheet(path: Path, count: int) -> list[Image.Image | None]:
    img = Image.open(path).convert("RGB")
    if max(img.size) > 1100:
        img = img.resize((1024, round(1024 * img.height / img.width)), Image.LANCZOS)
    rgb = np.asarray(img).astype(np.int32)
    h, w = rgb.shape[:2]
    fg = ~background_mask(rgb)
    # eingeschlossene, reinweiße Löcher (Bogensehne, Griffe) ebenfalls frei – gemaltes Weiß hat Schattierung
    border = np.concatenate([rgb[0], rgb[-1], rgb[:, 0], rgb[:, -1]])
    pure = (np.sqrt(((rgb - np.median(border, axis=0)) ** 2).sum(axis=2)) < 9) & fg
    if pure.any():
        holes, k = label_components(pure)
        hsizes = np.bincount(holes.ravel(), minlength=k + 1)
        fg &= ~np.isin(holes, [lab for lab in range(1, k + 1) if hsizes[lab] >= 250])
    # 1 px Saum abtragen (helle Kantenglättung zum Weiß)
    fg &= np.roll(fg, 1, 0) & np.roll(fg, -1, 0) & np.roll(fg, 1, 1) & np.roll(fg, -1, 1)
    small = np.asarray(Image.fromarray(fg.astype(np.uint8) * 255).resize((w // 2, h // 2), Image.NEAREST)) > 0
    labels_s, n = label_components(small)
    labels = np.asarray(Image.fromarray(labels_s).resize((w, h), Image.NEAREST)) * fg
    cw, ch = w / GRID, h / GRID
    owner: dict[int, int] = {}
    sizes = np.bincount(labels.ravel(), minlength=n + 1)
    for lab in range(1, n + 1):
        if sizes[lab] < 60:
            continue
        ys, xs = np.nonzero(labels == lab)
        cell = min(int(ys.mean() // ch), GRID - 1) * GRID + min(int(xs.mean() // cw), GRID - 1)
        owner[lab] = cell
    out: list[Image.Image | None] = []
    rgba = np.dstack([rgb.astype(np.uint8), np.zeros((h, w), np.uint8)])
    for cell in range(count):
        labs = [lab for lab, c in owner.items() if c == cell]
        if not labs:
            out.append(None); continue
        m = np.isin(labels, labs)
        biggest = max(sizes[lab] for lab in labs)
        m = np.isin(labels, [lab for lab in labs if sizes[lab] >= biggest * 0.02])
        part = rgba.copy()
        part[..., 3] = m * 255
        part[~m, :3] = 0
        im = Image.fromarray(part, "RGBA")
        out.append(im.crop(im.getbbox()))
    return out


def fit(icon: Image.Image, size: int = CELL, pad: int = 3) -> Image.Image:
    box = size - 2 * pad
    scale = box / max(icon.size)
    nw, nh = max(1, round(icon.width * scale)), max(1, round(icon.height * scale))
    # vormultipliziert skalieren, damit keine dunklen/hellen Säume entstehen
    arr = np.asarray(icon).astype(np.float32) / 255
    arr[..., :3] *= arr[..., 3:4]
    pm = Image.fromarray((arr * 255).astype(np.uint8), "RGBA").resize((nw, nh), Image.LANCZOS)
    a = np.asarray(pm).astype(np.float32) / 255
    alpha = a[..., 3:4]
    a[..., :3] = np.where(alpha > 0, a[..., :3] / np.maximum(alpha, 1e-6), 0)
    small = Image.fromarray((np.clip(a, 0, 1) * 255).astype(np.uint8), "RGBA")
    cell = Image.new("RGBA", (size, size))
    cell.paste(small, ((size - nw) // 2, (size - nh) // 2))
    return cell


def build(items: list[dict], data: dict) -> None:
    cells: list[tuple[str, Image.Image]] = []
    for sheet in data["sheets"]:
        sheet["prompt"] = prompt_for(sheet)
    PLAN.write_text(json.dumps(data, indent=1, ensure_ascii=False) + "\n")
    for sheet in data["sheets"]:
        raw = RAW / f"{sheet['id']}.png"
        if not raw.exists():
            print(f"{sheet['id']}: Rohbild fehlt – übersprungen")
            continue
        icons = cut_sheet(raw, len(sheet["icons"]))
        for icon, im in zip(sheet["icons"], icons):
            if im is None:
                print(f"{sheet['id']}: Zelle für {icon} leer")
                continue
            cells.append((icon, fit(im)))
    index = {icon: i for i, (icon, _) in enumerate(cells)}
    rows = max(1, -(-len(cells) // COLS))
    atlas = Image.new("RGBA", (COLS * CELL, rows * CELL))
    for i, (_, im) in enumerate(cells):
        atlas.paste(im, ((i % COLS) * CELL, (i // COLS) * CELL))
    ATLAS.parent.mkdir(parents=True, exist_ok=True)
    # 256 Farben (Octree, mit Alpha): optisch gleich, ~430 KB statt ~2,3 MB
    atlas.quantize(256, method=Image.FASTOCTREE, dither=Image.FLOYDSTEINBERG).save(ATLAS, optimize=True)
    mapping = dict(index)
    fallback = []
    for item in items:
        if item["icon"] in mapping:
            continue
        generic = f"generic-{item['category']}"
        target = index.get(generic, index.get("generic-geschenk"))
        if target is not None:
            mapping[item["icon"]] = target
            fallback.append(item["icon"])
    # leeres `images`, sonst überspringt build_manifest.mjs das Fragment
    FRAGMENT.write_text(json.dumps({"images": {}, "items": {"atlas": "assets/ui/items.png", "cell": CELL,
                                              "icons": dict(sorted(mapping.items()))}}, indent=1, ensure_ascii=False) + "\n")
    print(f"Atlas {atlas.width}×{atlas.height}: {len(cells)} Symbole, {len(mapping)} Schlüssel; Kategorie-Ersatz: {sorted(set(fallback))}")
    preview(cells)


def preview(cells: list[tuple[str, Image.Image]]) -> None:
    PREVIEW.mkdir(parents=True, exist_ok=True)
    per = 64
    for page in range(0, len(cells), per):
        chunk = cells[page:page + per]
        sheet = Image.new("RGB", (8 * 140, -(-len(chunk) // 8) * 150), (34, 30, 44))
        d = ImageDraw.Draw(sheet)
        for i, (icon, im) in enumerate(chunk):
            x, y = (i % 8) * 140, (i // 8) * 150
            sheet.paste(im.resize((128, 128), Image.NEAREST), (x + 6, y + 2), im.resize((128, 128), Image.NEAREST))
            d.text((x + 4, y + 134), icon[:22], fill=(220, 220, 230))
        sheet.save(PREVIEW / f"preview-{page // per + 1}.png")


def main() -> None:
    cmd = sys.argv[1] if len(sys.argv) > 1 else "all"
    only = set(sys.argv[2:]) or None
    items = dump_items() if cmd in ("plan", "build", "all") else json.loads(DUMP.read_text())
    data = plan(items) if cmd in ("plan", "all") else load_plan()
    if cmd in ("generate", "all"):
        generate(data, only)
    if cmd in ("build", "all"):
        build(items, data)


if __name__ == "__main__":
    main()
