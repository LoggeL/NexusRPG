#!/usr/bin/env python3
"""Baut die Figuren-Review-Seite nach output/review/characters/index.html.

Aufruf: python3 scripts/review/build_characters.py
Liest die fertigen Spiel-Assets (game/public/assets: portraits, sprites, photos, cut, props) und die Namen aus
docs/world.md. Keine Rohbilder, nichts aus work/. Server: scripts/review/serve.py.
"""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
ASSETS = ROOT / "game/public/assets"
OUT = ROOT / "output/review/characters/index.html"

# Asset-ID → world.md-ID, wo sie abweichen
ALIAS = {"alesa": "alesa-zero", "xion": "xion-venom", "seraphina": "seraphina-chrome", "sybella": "sybella-chrome",
         "serenity": "serenity-chrome", "collin": "collin-charleston", "delya": "delya-delloraine"}
GROUPS = [
    ("Crew", ["hunter", "raven", "dante", "vega", "aria", "nyra", "captain-kuschel"]),
    ("Quantum und Oberstadt", ["blade", "alesa", "xion", "ki-nexus", "seraphina", "sybella", "serenity"]),
    ("Medien und Stadt", ["collin", "delya", "kameramann", "ripper", "barkeeper", "richter", "wache"]),
    ("Straßenkinder", ["daria", "freya", "jakko"]),
    ("Neu", ["vex"]),
]
EXTRA_NAMES = {"vex": "Vex Schrapnell"}
PLAYABLE = {"vex"}
EXPR_ORDER = ["neutral", "freude", "wut", "trauer", "ueberrascht", "besorgt", "signatur", "verlegen", "zaertlich"]
EXPR_LABEL = {"neutral": "neutral", "freude": "Freude", "wut": "Wut", "trauer": "Trauer", "ueberrascht": "überrascht",
              "besorgt": "besorgt", "signatur": "Signatur", "verlegen": "verlegen", "zaertlich": "zärtlich"}
ROMANCE = {"aria", "hunter", "dante", "collin", "lio-funkel"}


def names() -> dict[str, str]:
    out = {}
    for m in re.finditer(r"^#### `([^`]+)` · (.+)$", (ROOT / "docs/world.md").read_text(), re.M):
        out[m.group(1)] = re.sub(r"\s*\((neu|Straßenkind|Farbe [^)]*)\)", "", m.group(2)).strip()
    return out


# Tafel-Reihen je Figur: (Präfix nach „rom-“, Überschrift). Standard: eigene Romanze.
PLATE_SETS = {
    "vex": [("vexaria", "Romanze mit Aria (Vex × Aria)")],
    "aria": [("aria", "Romanze-Bildtafeln"), ("vexaria", "Romanze mit Vex (Vex × Aria)")],
}


def rel(p: Path) -> str:
    return "/" + p.relative_to(ROOT / "game/public").as_posix()


def plate_order(cid: str) -> list[str]:
    """Romanze-Tafeln in der Reihenfolge, in der sie im Strang (world.md) zuerst genannt werden."""
    text = (ROOT / "docs/world.md").read_text()
    seen: list[str] = []
    for m in re.finditer(rf"^\s*\d+\. \*\*`(rom-{re.escape(cid)}-[a-z0-9-]+)`", text, re.M):  # nummerierte Stationen
        if m.group(1) not in seen:
            seen.append(m.group(1))
    for m in re.finditer(rf"rom-{re.escape(cid)}-[a-z0-9-]+", text):
        if m.group(0) not in seen:
            seen.append(m.group(0))
    return seen


def character(cid: str, nm: dict[str, str]) -> dict:
    wid = ALIAS.get(cid, cid)
    c: dict = {"id": cid, "name": nm.get(wid) or EXTRA_NAMES.get(cid, cid.title()), "romance": cid in ROMANCE,
               "playable": cid in PLAYABLE}
    portraits = sorted((ASSETS / "portraits").glob(f"{cid}*.webp"))
    c["portraits"] = [{"src": rel(p), "label": p.stem.replace(cid, "").strip("-") or "Porträt"} for p in portraits
                      if p.stem == cid or p.stem.startswith(cid + "-")]
    walk = ASSETS / "sprites" / f"{cid}-walk.png"
    c["walk"] = rel(walk) if walk.exists() else None
    prop = ASSETS / "props" / f"{cid}.png"
    c["prop"] = rel(prop) if prop.exists() else None
    pdir = ASSETS / "photos" / cid
    photos = {p.stem: p for p in pdir.glob("*.webp")} if pdir.exists() else {}
    c["photos"] = [{"src": rel(photos[e]), "label": EXPR_LABEL.get(e, e), "key": e}
                   for e in EXPR_ORDER if e in photos]
    c["photos"] += [{"src": rel(p), "label": k, "key": k} for k, p in sorted(photos.items()) if k not in EXPR_ORDER]
    c["plateSets"] = []
    for prefix, title in PLATE_SETS.get(cid, [(cid, "Romanze-Bildtafeln")]):
        cut = sorted((ASSETS / "cut").glob(f"rom-{prefix}-*.webp"))
        order = plate_order(prefix)
        cut.sort(key=lambda p: order.index(p.stem) if p.stem in order else 99)
        plates = [{"src": rel(p), "label": p.stem.replace(f"rom-{prefix}-", ""), "key": p.stem} for p in cut]
        if plates:
            c["plateSets"].append({"title": title, "plates": plates})
    c["plates"] = [p for s in c["plateSets"] for p in s["plates"]]
    return c


def main() -> None:
    nm = names()
    data = [{"group": g, "chars": [character(cid, nm) for cid in ids]} for g, ids in GROUPS]
    html = TEMPLATE.replace("__DATA__", json.dumps(data, ensure_ascii=False))
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(html)
    n = sum(len(c["photos"]) + len(c["portraits"]) + len(c["plates"]) + bool(c["walk"]) for g in data for c in g["chars"])
    print(f"{OUT} ({n} Bilder)")


TEMPLATE = r"""<!doctype html>
<html lang="de">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Nexus Figuren-Review</title>
<style>
:root{--bg:#0b0912;--panel:#15111f;--line:#2a2238;--text:#ece6f5;--muted:#9b90ad;--pink:#ff3d9a;--cyan:#38e1ff;--ok:#3ddc84;--redo:#ff5a5a}
*{box-sizing:border-box}
body{margin:0;background:var(--bg);color:var(--text);font:15px/1.45 system-ui,-apple-system,Segoe UI,sans-serif}
header{position:sticky;top:0;z-index:5;background:rgba(11,9,18,.92);backdrop-filter:blur(8px);border-bottom:1px solid var(--line);padding:10px 16px;display:flex;gap:12px;align-items:center;flex-wrap:wrap}
h1{font-size:18px;margin:0;letter-spacing:.04em}
h1 span{color:var(--pink)}
nav{display:flex;gap:6px;flex-wrap:nowrap;overflow-x:auto;flex:1 1 100%;order:3;scrollbar-width:thin;padding-bottom:2px}
nav a{flex:0 0 auto;white-space:nowrap}
nav a{color:var(--muted);text-decoration:none;font-size:13px;padding:3px 8px;border:1px solid var(--line);border-radius:999px}
nav a:hover{color:var(--text);border-color:var(--pink)}
#status{font-size:13px;color:var(--muted)}
main{max-width:1400px;margin:0 auto;padding:16px}
h2{font-size:14px;text-transform:uppercase;letter-spacing:.12em;color:var(--cyan);margin:28px 0 10px}
.char{background:var(--panel);border:1px solid var(--line);border-radius:14px;padding:14px;margin-bottom:16px}
.char h3{margin:0 0 10px;font-size:20px;display:flex;align-items:center;gap:10px}
.tag{font-size:11px;font-weight:600;color:var(--pink);border:1px solid var(--pink);border-radius:999px;padding:1px 8px}
.row{display:flex;gap:10px;overflow-x:auto;padding-bottom:6px;scroll-snap-type:x proximity}
.row+.row{margin-top:10px}
.lbl{font-size:12px;color:var(--muted);margin:10px 0 4px}
figure{margin:0;flex:0 0 auto;scroll-snap-align:start;position:relative}
figure img{display:block;border-radius:8px;background:#000;cursor:zoom-in}
.photo img{height:240px;width:160px;object-fit:cover}
.portrait img{height:160px;width:160px;object-fit:cover}
.plate img{height:200px;width:300px;object-fit:cover}
figcaption{font-size:12px;color:var(--muted);display:flex;justify-content:space-between;align-items:center;gap:4px;margin-top:4px}
.vote{display:flex;gap:3px}
.vote button{font:inherit;font-size:11px;background:transparent;color:var(--muted);border:1px solid var(--line);border-radius:6px;padding:1px 6px;cursor:pointer}
.vote button.on.ok{background:var(--ok);color:#000;border-color:var(--ok)}
.vote button.on.redo{background:var(--redo);color:#000;border-color:var(--redo)}
figure.redo img{outline:2px solid var(--redo)}
figure.ok img{outline:2px solid var(--ok)}
.walk{display:flex;gap:10px;flex-wrap:wrap}
.walk div{width:128px;height:128px;background-repeat:no-repeat;background-size:512px 512px;image-rendering:auto;border-radius:8px;background-color:#1d1729;animation:walk .6s steps(4) infinite}
@keyframes walk{from{background-position-x:0}to{background-position-x:-512px}}
textarea{width:100%;min-height:44px;margin-top:10px;background:#0f0c17;color:var(--text);border:1px solid var(--line);border-radius:8px;padding:8px;font:inherit;font-size:13px;resize:vertical}
#lb{position:fixed;inset:0;background:rgba(0,0,0,.92);display:none;align-items:center;justify-content:center;z-index:10;cursor:zoom-out}
#lb img{max-width:96vw;max-height:92vh;border-radius:8px}
#lb.on{display:flex}
@media (max-width:600px){.photo img{height:180px;width:120px}.plate img{height:150px;width:225px}}
</style>
</head>
<body>
<header><h1>NEXUS <span>Figuren-Review</span></h1><nav id="nav"></nav><div id="status"></div></header>
<main id="main"></main>
<div id="lb"><img alt=""></div>
<script>
const DATA = __DATA__;
let fb = {votes:{}, notes:{}};
const $ = (t, a = {}, ...k) => { const e = document.createElement(t); for (const [x, y] of Object.entries(a)) x === 'class' ? e.className = y : e.setAttribute(x, y); e.append(...k); return e; };
const status = (t) => { document.getElementById('status').textContent = t; };
async function load() { try { const r = await fetch('/api/feedback'); if (r.ok) fb = await r.json(); } catch {} }
let timer;
function save() { clearTimeout(timer); status('speichert …'); timer = setTimeout(async () => {
  try { const r = await fetch('/api/feedback', {method:'POST', headers:{'content-type':'application/json'}, body: JSON.stringify(fb)}); status(r.ok ? 'gespeichert' : 'Fehler beim Speichern'); } catch { status('offline – nicht gespeichert'); } }, 400); }
function fig(cls, id, src, label) {
  const img = $('img', {src, alt: label, loading: 'lazy'});
  img.onclick = () => { const lb = document.getElementById('lb'); lb.querySelector('img').src = src; lb.classList.add('on'); };
  const f = $('figure', {class: cls}, img);
  const ok = $('button', {class: 'ok', title: 'passt'}, '✓'), redo = $('button', {class: 'redo', title: 'neu machen'}, '↻');
  const paint = () => { const v = fb.votes[id]; ok.classList.toggle('on', v === 'ok'); redo.classList.toggle('on', v === 'redo'); f.classList.toggle('ok', v === 'ok'); f.classList.toggle('redo', v === 'redo'); };
  const set = (v) => { fb.votes[id] = fb.votes[id] === v ? undefined : v; if (!fb.votes[id]) delete fb.votes[id]; paint(); save(); };
  ok.onclick = () => set('ok'); redo.onclick = () => set('redo'); paint();
  f.append($('figcaption', {}, $('span', {}, label), $('span', {class: 'vote'}, ok, redo)));
  return f;
}
function render() {
  const main = document.getElementById('main'), nav = document.getElementById('nav');
  for (const g of DATA) {
    main.append($('h2', {}, g.group));
    for (const c of g.chars) {
      nav.append($('a', {href: '#' + c.id}, c.name));
      const box = $('section', {class: 'char', id: c.id});
      const h = $('h3', {}, c.name); if (c.romance) h.append($('span', {class: 'tag'}, 'Romanze')); if (c.playable) h.append($('span', {class: 'tag'}, 'Spielfigur'));
      box.append(h);
      if (c.photos.length) { box.append($('div', {class: 'lbl'}, 'Dialogfotos')); const r = $('div', {class: 'row'}); c.photos.forEach(p => r.append(fig('photo', `photo:${c.id}:${p.key}`, p.src, p.label))); box.append(r); }
      (c.plateSets || []).forEach(s => { box.append($('div', {class: 'lbl'}, s.title)); const r = $('div', {class: 'row'}); s.plates.forEach(p => r.append(fig('plate', `cut:${p.key}`, p.src, p.label))); box.append(r); });
      const r2 = $('div', {class: 'row'});
      c.portraits.forEach(p => r2.append(fig('portrait', `portrait:${c.id}:${p.label}`, p.src, p.label === 'Porträt' ? 'gemaltes Porträt' : 'Porträt ' + p.label)));
      if (c.prop) r2.append(fig('portrait', `prop:${c.id}`, c.prop, 'Requisite'));
      if (r2.children.length) { box.append($('div', {class: 'lbl'}, 'Gemalt')); box.append(r2); }
      if (c.walk) {
        box.append($('div', {class: 'lbl'}, 'Laufgrafik (Süd · West · Ost · Nord)'));
        const w = $('div', {class: 'walk'});
        for (let row = 0; row < 4; row++) { const d = $('div'); d.style.backgroundImage = `url(${c.walk})`; d.style.backgroundPositionY = `${-row * 128}px`; w.append(d); }
        const wrap = $('div', {class: 'row'}, w, fig('portrait', `walk:${c.id}`, c.walk, 'Blatt'));
        box.append(wrap);
      }
      const ta = $('textarea', {placeholder: `Anmerkungen zu ${c.name} …`}); ta.value = fb.notes[c.id] || '';
      ta.oninput = () => { fb.notes[c.id] = ta.value; if (!ta.value) delete fb.notes[c.id]; save(); };
      box.append(ta); main.append(box);
    }
  }
}
document.getElementById('lb').onclick = (e) => e.currentTarget.classList.remove('on');
document.addEventListener('keydown', (e) => { if (e.key === 'Escape') document.getElementById('lb').classList.remove('on'); });
load().then(() => { render(); status(Object.keys(fb.votes).length ? `${Object.keys(fb.votes).length} Bewertungen` : '✓ passt · ↻ neu machen'); });
</script>
</body>
</html>
"""

if __name__ == "__main__":
    main()
