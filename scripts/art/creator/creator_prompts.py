#!/usr/bin/env python3
"""Prompts und Codex-Aufträge für den Charakter-Baukasten (Design §3.1a, §6.3, docs/creator-pipeline.md).

Aufruf (aus dem Projektordner):
  python3 scripts/art/creator/creator_prompts.py list [jobs ...]          Prompts anzeigen
  python3 scripts/art/creator/creator_prompts.py gen <jobs|all> [--force] [--extra='Korrektur'] [--suffix=-v2]
  python3 scripts/art/creator/creator_prompts.py todo                     Aufträge ohne Rohbild

Ein Auftrag (JOB) malt EIN Laufblatt der Grundpuppe (Referenz 1 = fertiges Puppen-Rohbild), die zusätzlich ein
oder mehrere Teile trägt. Teile werden in Kennfarben gemalt, damit der Build sie ohne Handarbeit trennt:
  Kleidung Hauptfarbe A = sattes Rot, Zweitfarbe B = sattes Grün, Haare/Bart = sattes Blau,
  Cyberware = dunkles Gunmetal mit hellcyanen Leuchtlinien, Accessoires = schwarz/dunkel (fest).
Mehrere Teile pro Auftrag nur, wenn sie räumlich (Kopf / Rumpf / Füße) oder farblich trennbar sind.
Rohbilder: output/imagegen/raw/creator/<job>.png. Prompts zusätzlich nach design/assets/creator-prompts.json.
Höchstens drei Codex-Aufträge gleichzeitig.
"""
from __future__ import annotations

import json
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
RAW = ROOT / "output/imagegen/raw/creator"
DESIGN = ROOT / "design/assets/creator-prompts.json"
CODEX = ROOT / "scripts/art/codex_image.sh"
STYLE_REF = ROOT / "output/imagegen/raw/characters/barkeeper-walk.png"
MAX_PARALLEL = 3

STYLE = ("hand-painted cartoon illustration exactly like the style of the attached character art (clean dark ink "
         "outlines, soft painterly shading, natural adult proportions, not chibi)")

GRID = ("a square image containing a strict 4x4 grid of 16 small full-body figures of the SAME character, evenly "
        "spaced, each centered in its own invisible square cell, identical scale, wide empty gaps, nothing touching or "
        "cut off. Each row is one walking direction with 4 walking frames (left foot forward, passing, right foot "
        "forward, passing), feet on a common baseline per row: ROW 1 (top) facing SOUTH toward the viewer; ROW 2 facing "
        "WEST, strict side profile walking toward the LEFT edge; ROW 3 facing EAST, strict side profile walking toward "
        "the RIGHT edge; ROW 4 (bottom) facing NORTH, back view. Slight three-quarter top-down RPG camera.")

BASE = ("Game character WALK CYCLE SPRITE SHEET: " + GRID + " Style: " + STYLE + ", readable when shrunk to about 90 "
        "pixels tall. The character is a neutral BASE MANNEQUIN for a character creator: an adult (early twenties), "
        "androgynous person of average build, smooth completely BALD head (no hair at all, no eyebrows hair tufts), "
        "simple calm face with dark eyes, thin dark eyebrows, small nose and mouth, small ears. The WHOLE body is plain "
        "uniform smooth NEUTRAL LIGHT GREY like a featureless store mannequin (grey skin everywhere, about #b4b4b4, with "
        "soft painterly grey shading), no clothes, no underwear details, no nipples, no navel, no anatomy details, no "
        "shoes (simple smooth grey feet), no accessories. Arms hang slightly away from the torso with a natural small "
        "arm swing, hands open and relaxed, legs clearly separated in the stride. The attached image is ONLY a style "
        "reference (line work, shading, size of the figures, grid spacing) - do NOT copy its person or clothing. Flat "
        "pure magenta #FF00FF background everywhere, no ground shadow, no floor, no text.")

EDIT = ("Edit of the first attached image (a walk-cycle sprite sheet of a grey base mannequin on magenta): keep "
        "EVERYTHING else pixel-identical - the same 4x4 grid, the same 16 figures at exactly the same positions and "
        "sizes, the same poses, arm and leg positions, the same grey mannequin head and face, the same magenta "
        "background. ONLY add the following to the figure in EVERY one of the 16 frames, consistently in all four "
        "directions (front, left profile, right profile, back): {what}. "
        "COLOR CODE (strict, this is a recolorable template): {colors} Everything that is not added stays the plain "
        "grey mannequin. Same hand-painted cartoon style with dark ink outlines and soft shading as the first image. "
        "No ground shadow, no text.")

C_AB = ("main fabric of clothing = saturated pure RED (#d81e1e) with painted shading; secondary color parts (trims, "
        "cuffs, stripes, soles, linings, laces) = saturated pure GREEN (#1ec81e) with shading; metal parts (zippers, "
        "buckles, rivets) = dark grey/silver; never use magenta or pink.")
C_HAIR = "hair = saturated pure BLUE (#1e50ff) with painted strands and shading (no other hair color)."
C_CYBER = ("cybernetic parts = dark gunmetal (#3a3f4a) armor plates with thin bright CYAN (#30f0ff) glowing lines "
           "and dots; never use magenta.")
C_ACC = "accessories = black/very dark charcoal with small silver highlights; never use magenta."

# Teile: id → (slot, englische Beschreibung, Farbschlüssel)
PARTS: dict[str, tuple[str, str, str]] = {
    # Frisuren (Haar-Blau)
    "haar-buzz": ("haar", "a very short buzz-cut hair, close to the scalp", C_HAIR),
    "haar-undercut": ("haar", "an undercut hairstyle: shaved short sides, longer hair on top combed back", C_HAIR),
    "haar-irokese": ("haar", "a tall spiky punk mohawk, shaved sides", C_HAIR),
    "haar-bob": ("haar", "a chin-length straight bob haircut with blunt bangs", C_HAIR),
    "haar-lang-glatt": ("haar", "long straight hair falling to the middle of the back and over the shoulders", C_HAIR),
    "haar-afro": ("haar", "a big round afro", C_HAIR),
    "haar-pferdeschwanz": ("haar", "hair tied back into a high ponytail that hangs down the back", C_HAIR),
    "haar-dreads": ("haar", "shoulder-length dreadlocks", C_HAIR),
    "haar-locken-kurz": ("haar", "short curly hair", C_HAIR),
    # Oberteile
    "oben-tshirt": ("oben", "a plain short-sleeved crew-neck T-shirt (red), sleeve hems and collar in green", C_AB),
    "oben-tanktop": ("oben", "a sleeveless tank top (red) with a thin green neckline trim, bare grey shoulders and arms", C_AB),
    "oben-hoodie": ("oben", "a long-sleeved hoodie (red) with hood lying on the back, green drawstrings, green cuffs and waistband", C_AB),
    "oben-streifenpulli": ("oben", "a long-sleeved knit sweater (red) with two horizontal green stripes across chest and sleeves", C_AB),
    "oben-rollkragen": ("oben", "a tight long-sleeved turtleneck sweater (red) with green cuffs", C_AB),
    # Jacken
    "jacke-bomber": ("jacke", "an open bomber jacket (red) with green ribbed cuffs, collar and waistband, over the bare torso", C_AB),
    "jacke-langmantel": ("jacke", "an open long trench coat (red) reaching the knees, green lining and belt", C_AB),
    "jacke-leder": ("jacke", "an open biker leather jacket (red) with silver zippers and green lapel trim", C_AB),
    # Hosen
    "hose-cargo": ("hose", "loose cargo trousers (red) with green side pockets and a green belt", C_AB),
    "hose-jeans": ("hose", "slim straight jeans (red) with green stitching and a green belt", C_AB),
    "hose-rock": ("hose", "a short pleated skirt (red) over opaque tights (green)", C_AB),
    "hose-leder": ("hose", "tight leather trousers (red) with green knee seams", C_AB),
    # Schuhe
    "schuhe-sneaker": ("schuhe", "low sneakers (red) with thick green soles and green laces", C_AB),
    "schuhe-kampfstiefel": ("schuhe", "lace-up combat boots up to mid-shin (red) with green soles", C_AB),
    "schuhe-hightops": ("schuhe", "high-top sneakers (red) covering the ankles, green soles and green laces", C_AB),
    # Cyberware
    "cyber-arm-links": ("cyber", "a cybernetic prosthetic LEFT forearm and LEFT hand (the character's own left arm only; "
                        "in the front view it is the arm on the viewer's right side, in the left-facing profile it is "
                        "the near arm, in the right-facing profile the far arm, in the back view the arm on the viewer's left)", C_CYBER),
    "cyber-arm-rechts": ("cyber", "a cybernetic prosthetic RIGHT forearm and RIGHT hand (the character's own right arm only; "
                         "in the front view it is the arm on the viewer's left side, in the left-facing profile it is "
                         "the far arm, in the right-facing profile the near arm, in the back view the arm on the viewer's right)", C_CYBER),
    # Accessoires
    "brille-sonnenbrille": ("acc", "dark wraparound sunglasses on the face", C_ACC),
    "kopfhoerer": ("acc", "big over-ear headphones on the head, band over the top of the head", C_ACC),
    "kette": ("acc", "a thick silver chain necklace", C_ACC),
    # Runde 2
    "haar-sidecut": ("haar", "an asymmetric sidecut: one side shaved, long hair swept over to the other side down to the jaw", C_HAIR),
    "haar-pixie": ("haar", "a short tousled pixie cut with short side-swept bangs", C_HAIR),
    "haar-wuschel": ("haar", "messy tousled medium-short hair sticking out in all directions", C_HAIR),
    "haar-schulterlang": ("haar", "straight shoulder-length hair with a middle parting", C_HAIR),
    "haar-lang-locken": ("haar", "long voluminous curly hair falling past the shoulders", C_HAIR),
    "haar-zwei-zoepfe": ("haar", "two long braided pigtails hanging down in front of the shoulders", C_HAIR),
    "haar-dutt": ("haar", "hair pulled back tightly into a round bun on top of the back of the head", C_HAIR),
    "oben-hemd": ("oben", "a long-sleeved button-up shirt (red) with rolled-up sleeves, green buttons and green collar", C_AB),
    "oben-netzshirt": ("oben", "a long-sleeved tight fishnet mesh shirt (red mesh, grey skin visible through the holes) with a green crop top underneath", C_AB),
    "oben-gurtshirt": ("oben", "a short-sleeved T-shirt (red) with a green leather harness of straps across chest and shoulders", C_AB),
    "jacke-jeans": ("jacke", "an open denim jacket (red) with green round patches sewn on, sleeves to the wrists", C_AB),
    "jacke-kapuze": ("jacke", "an open long-sleeved techwear hooded jacket (red) with hood down on the back, thin bright CYAN (#30f0ff) glowing seam lines, green cuffs", C_AB),
    "jacke-weste": ("jacke", "an open sleeveless tactical utility vest (red) with green pockets, arms stay bare grey", C_AB),
    "jacke-sakko": ("jacke", "an open tailored blazer (red) with green lapels and green pocket square", C_AB),
    "hose-flicken": ("hose", "worn trousers (red) with several green square patches sewn on the legs", C_AB),
    "hose-anzug": ("hose", "straight tailored suit trousers (red) with a green belt", C_AB),
    "hose-overall": ("hose", "work overall trousers (red) with the overall's sleeves (green) tied around the hips", C_AB),
    "schuhe-plateau": ("schuhe", "chunky platform boots (red) with very thick green platform soles", C_AB),
    "schuhe-halbschuhe": ("schuhe", "classic low leather dress shoes (red) with thin green soles", C_AB),
    "kette": ("acc", "a thick silver chain necklace hanging on the chest", C_ACC),
    "brille-rund": ("acc", "small round black-rimmed glasses", C_ACC),
    "brille-visier": ("acc", "a sleek one-piece cyber visor over the eyes: dark frame with a glowing bright CYAN (#30f0ff) lens band", C_ACC),
    "kappe-basecap": ("kappe", "a baseball cap (red crown, green brim) worn forward", C_AB),
    "kappe-muetze": ("kappe", "a knitted beanie hat (red) with a green folded cuff, covering the top of the head down to the eyebrows", C_AB),
    "maske-tuch": ("maske", "a bandana face mask (red) covering nose, mouth and chin, with a printed white toothy grin", C_AB),
    "maske-atemmaske": ("acc", "a black respirator mask with two round filters covering mouth and nose", C_ACC),
    "cyber-bein-links": ("cyber", "a cybernetic prosthetic LEFT shin and LEFT foot (the character's own left leg only, below the knee; in the front view on the viewer's right, in the left-facing profile the near leg, in the back view on the viewer's left)", C_CYBER),
    "cyber-bein-rechts": ("cyber", "a cybernetic prosthetic RIGHT shin and RIGHT foot (the character's own right leg only, below the knee; in the front view on the viewer's left, in the left-facing profile the far leg, in the back view on the viewer's right)", C_CYBER),
    "cyber-augen": ("cyber", "glowing cybernetic eyes: both irises glow bright CYAN (#30f0ff)", C_CYBER),
    "cyber-kabel": ("cyber", "a thick cybernetic cable plugged into the back of the neck, running from the nape down between the shoulder blades, with a glowing plug", C_CYBER),
    "cyber-platte": ("cyber", "a cybernetic chrome face plate on one cheek and jaw (the character's left cheek) with a small glowing line", C_CYBER),
    "gesicht-5": ("gesicht", "a short full beard and mustache, plus matching eyebrows", C_HAIR),
    "gesicht-4": ("gesicht", "three-day stubble on jaw and upper lip, plus matching eyebrows", C_HAIR),
}

# Aufträge: job → Teile (räumlich getrennt: Kopf / Rumpf / Füße bzw. Kopf / Arm)
JOBS: dict[str, list[str]] = {
    "base-mittel-a": [], "base-mittel-b": [], "base-mittel-c": [],
    "j01": ["haar-undercut", "oben-tshirt", "schuhe-sneaker"],
    "j02": ["haar-lang-glatt", "oben-hoodie", "schuhe-kampfstiefel"],
    "j03": ["haar-irokese", "oben-tanktop", "schuhe-hightops"],
    "j04": ["haar-bob", "oben-streifenpulli"],
    "j05": ["haar-afro", "oben-rollkragen"],
    "j06": ["haar-pferdeschwanz", "hose-cargo"],
    "j07": ["haar-buzz", "hose-jeans"],
    "j08": ["haar-dreads", "hose-rock"],
    "j09": ["haar-locken-kurz", "hose-leder"],
    "j10": ["jacke-bomber"],
    "j11": ["jacke-langmantel"],
    "j12": ["jacke-leder"],
    "j13": ["cyber-arm-links", "brille-sonnenbrille"],
    "j14": ["cyber-arm-rechts", "kopfhoerer"],
    "j15": ["haar-sidecut", "oben-hemd", "schuhe-plateau"],
    "j16": ["haar-pixie", "oben-netzshirt", "schuhe-halbschuhe"],
    "j17": ["haar-wuschel", "oben-gurtshirt"],
    "j18": ["haar-schulterlang", "hose-flicken"],
    "j19": ["haar-lang-locken", "hose-anzug"],
    "j20": ["haar-zwei-zoepfe", "hose-overall"],
    "j21": ["haar-dutt", "kette"],
    "j22": ["jacke-jeans"],
    "j23": ["jacke-kapuze"],
    "j24": ["jacke-weste"],
    "j25": ["jacke-sakko"],
    "j26": ["brille-rund", "cyber-bein-links"],
    "j27": ["brille-visier", "cyber-bein-rechts"],
    "j28": ["kappe-basecap", "maske-atemmaske"],
    "j29": ["kappe-muetze"],
    "j33": ["maske-tuch"],
    "j30": ["gesicht-5", "cyber-kabel"],
    "j31": ["gesicht-4", "cyber-platte"],
    "j32": ["cyber-augen"],
}

BASE_RAW = "base-mittel.png"   # gewählte Grundpuppe (Kopie des besten base-mittel-*)


def prompt_for(job: str, extra: str = "") -> str:
    parts = JOBS[job]
    if not parts:
        p = BASE
    else:
        what = "; ".join(PARTS[p][1] for p in parts)
        colors = " ".join(dict.fromkeys(PARTS[p][2] for p in parts))
        p = EDIT.format(what=what, colors=colors)
    if extra:
        p += f" CORRECTION: {extra}"
    return p


def refs_for(job: str) -> list[Path]:
    if not JOBS[job]:
        return [STYLE_REF]
    return [RAW / BASE_RAW]


def write_design() -> None:
    DESIGN.parent.mkdir(parents=True, exist_ok=True)
    data = {"note": "Erzeugt von scripts/art/creator/creator_prompts.py", "parts": {k: {"slot": v[0], "desc": v[1]} for k, v in PARTS.items()},
            "jobs": {j: {"parts": ps, "prompt": prompt_for(j), "refs": [str(r.relative_to(ROOT)) for r in refs_for(j)]} for j, ps in JOBS.items()}}
    DESIGN.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def run_job(job: dict) -> tuple[str, bool, float]:
    t = time.time()
    r = subprocess.run([str(CODEX), str(job["target"]), job["prompt"], *map(str, job["refs"])],
                       cwd=ROOT, capture_output=True, text=True)
    return job["target"].name, r.returncode == 0, time.time() - t


def main(argv: list[str]) -> int:
    opts = {a.split("=", 1)[0]: (a.split("=", 1)[1] if "=" in a else True) for a in argv if a.startswith("--")}
    args = [a for a in argv if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 1
    mode, ids = args[0], args[1:]
    write_design()
    if ids in ([], ["all"]):
        ids = list(JOBS)
    extra, suffix = str(opts.get("--extra", "") or ""), str(opts.get("--suffix", "") or "")
    if mode == "list":
        for j in ids:
            print(f"=== {j} ({', '.join(JOBS[j]) or 'Grundpuppe'}) ===\n{prompt_for(j, extra)}\n")
        return 0
    if mode == "todo":
        print(" ".join(j for j in JOBS if not (RAW / f"{j}.png").exists()))
        return 0
    if mode != "gen":
        print(f"Unbekannter Modus {mode!r}")
        return 1
    jobs = [{"target": RAW / f"{j}{suffix}.png", "prompt": prompt_for(j, extra), "refs": refs_for(j)} for j in ids]
    todo = [j for j in jobs if opts.get("--force") or not j["target"].exists()]
    if any(JOBS[j] for j in ids) and not (RAW / BASE_RAW).exists():
        print(f"Grundpuppe fehlt: {RAW / BASE_RAW}")
        return 1
    RAW.mkdir(parents=True, exist_ok=True)
    print(f"Erzeuge {len(todo)} Bild(er), höchstens {MAX_PARALLEL} gleichzeitig …", flush=True)
    failed = 0
    with ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
        for name, ok, dur in pool.map(run_job, todo):
            print(f"{'ok    ' if ok else 'FEHLER'} {name} ({dur:.0f} s)", flush=True)
            failed += not ok
    return 1 if failed else 0


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
