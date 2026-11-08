#!/usr/bin/env python3
"""Prompts und Generierung der Figurenbilder (Laufblätter, Porträts, Requisiten).

Aufruf (aus dem Projektordner):
  python3 scripts/art/char_prompts.py list [ids ...]                     Prompts ausgeben
  python3 scripts/art/char_prompts.py walk <ids|all> [--suffix=-v2] [--extra='Korrektur'] [--force]
  python3 scripts/art/char_prompts.py portrait <ids|all> [--variants=,angry] [--suffix=..] [--extra=..] [--force]
  python3 scripts/art/char_prompts.py prop <ids|all> [--suffix=..] [--extra=..] [--force]
  Zusatz: --dry-run (nur anzeigen, nichts erzeugen)

Rohbilder: output/imagegen/raw/characters/<id>-walk[suffix].png, <id>-portrait[-variante][suffix].png,
<id>-prop[suffix].png. Vorhandene Dateien werden übersprungen (außer --force). Höchstens drei Codex-Aufträge
gleichzeitig. Alle Prompts zusätzlich nach design/assets/characters.json.

Referenzen: Die Zuordnung Figuren-ID → Referenzdateien steht privat in work/char_refs.json (work/ ist nicht in
Git). In Prompts, design/ und game/ nur Figuren-IDs verwenden.
"""
from __future__ import annotations

import json
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "output/imagegen/raw/characters"
DESIGN = ROOT / "design/assets/characters.json"
REFMAP = ROOT / "work/char_refs.json"
CODEX = ROOT / "scripts/art/codex_image.sh"
MAX_PARALLEL = 3

# ---------------------------------------------------------------------------------------------------------
# Figuren. desc = Aussehen laut Referenzbildern (Kostümfigur + Brustbild), englisch.
# mood = Grundausdruck des Porträts, rim = Neonfarbe des Randlichts.
# walk = Laufblatt erzeugen, portraits = Porträtvarianten ('' = Grundporträt), prop = Requisit erzeugen.

CHARACTERS: dict[str, dict] = {
    "blade": {
        "desc": "adult man, short dark-brown hair swept up with a grey-silver streak, short dark beard and stubble, "
                "warm confident grin; long fluffy cream-colored shearling teddy coat reaching the knees, black-and-gold "
                "baroque brocade waistcoat, white shirt with open collar, black strap harness across the chest, black "
                "trousers, black boots; carries a polished golden walking cane with a round golden knob",
        "mood": "confident, charming grin, a little vain",
        "rim": "pink",
    },
    "raven": {
        "desc": "young woman, long voluminous curly auburn-brown hair, black lipstick with a thin black line running "
                "from the lower lip down the chin, small teal drop earrings; black lace-trimmed crop top with brown "
                "leather strap harness and buckles, oversized black jacket with big puffy sleeves, short black leather "
                "skirt, brown fishnet tights, black lace-up combat boots",
        "mood": "playful, mischievous smirk",
        "rim": "cyan",
    },
    "hunter": {
        "desc": "adult man with a sturdy, stocky build, short brown undercut hair, full brown beard, black sunglasses; "
                "light pink button-up shirt, long black coat worn open, black strap harness across the chest, dark "
                "blue jeans, black shoes",
        "mood": "self-assured crew boss grin, relaxed and cocky",
        "rim": "pink",
    },
    "dante": {
        "desc": "young man, shaggy curly brown shoulder-length hair, white patterned bandana headband with brass "
                "steampunk goggles pushed up on the forehead, thin white circuit-line tattoo on one cheek, stubble; "
                "black leather biker jacket, white t-shirt, silver dog-tag necklace, black strap harness, black leather "
                "trousers with a silver wallet chain, black boots",
        "mood": "friendly, roguish, slightly goofy smile",
        "rim": "cyan",
    },
    "vex": {  # neu (Vex Schrapnell, Kurierfahrerin)
        "desc": "young adult woman in her early twenties with soft features, tomboyish, tough and a bit masculine in attitude: long dark-brown wavy hair with a center part, a bit messy, dark brown eyes under straight dark brows, a small silver nose ring, a deadpan cocky smirk, chin slightly up; long white almond-shaped nails sticking out of black fingerless leather gloves, chunky silver rings, a thin gold chain with a small cross pendant, a braided rainbow bracelet and black string bracelets; all-black edgy street outfit: a black fitted sleeveless tank top with a scoop neckline that fully covers her stomach, a black leather strap harness with silver O-rings and buckles over chest and shoulders, a wide black studded belt plus a second thin buckled belt, black cargo pants with hanging straps, a small black courier hip bag with one reflective strip, scuffed black combat boots; no sleeves, no sweater, no vest; her RIGHT arm is a full cybernetic prosthesis from the shoulder down: matte graphite-black armor plates with scuffed edges and a few scratches, exposed gunmetal hydraulic pistons at the elbow, thin cyan light seams along the forearm, five articulated black metal fingers, the harness strap runs over the metal shoulder joint, her colorful woven wristbands sit on the metal wrist; a cheap, practical street-clinic model, clearly different from a silver coil-spring arm; her LEFT arm is human with a black fingerless leather glove; NO plush toy, no stuffed animal. Wide confident stance. The LAST reference is a real photo: use it for her face and hair, keep the painted style of the other references; ignore the costume of the painted reference",
        "mood": "cocky deadpan smirk, tough, one eyebrow raised",
        "rim": "cyan",
    },
    "nyra": {
        "desc": "young woman, long voluminous curly brown hair, black rectangular glasses, freckles; olive-green "
                "bomber jacket, white ribbed crop top, black strap harness, black baggy cargo pants, white sneakers",
        "mood": "bright, nerdy, enthusiastic smile",
        "rim": "cyan",
    },
    "aria": {
        "desc": "young woman with a soft round face and thick dark eyebrows, very dark brown hair tightly braided from "
                "the hairline into two braids ending in long loose curls; black long-sleeve top with sheer mesh "
                "shoulders and sleeves, a big red star on the chest (no text), red-black striped and checkered panels; "
                "her LEFT arm is a cybernetic prosthesis with exposed silver coil springs on the upper arm and a "
                "silver riveted forearm shell, black gloves on both hands, black belt with round silver buckle, black "
                "cargo pants, black boots, no harness; carries a silver aluminium baseball bat with black grip. The "
                "LAST reference is a real costume photo: use it only for costume and hair details, keep the painted "
                "style of the other references",
        "mood": "tough, confident, sly half smile",
        "rim": "pink",
    },
    "vega": {
        "desc": "young woman, athletic build, brown hair in a high ponytail; olive-green tank top, black tactical "
                "chest harness, black fingerless gloves, olive-green baggy cargo pants with a black utility belt and "
                "thigh holster strap, black combat boots; a compact black futuristic rifle slung across her back",
        "mood": "focused, determined, a small proud smile",
        "rim": "cyan",
    },
    "alesa": {
        "desc": "young woman, very long straight dark-brown hair with pink streaks, round pink-red tinted glasses; "
                "white lab coat with green circuit-board patches on both sleeves, black shirt, black strap harness, "
                "black slim trousers, white sneakers",
        "mood": "excited, quirky scientist grin",
        "rim": "pink",
    },
    "xion": {
        "desc": "young man, short messy dark-brown hair, right eye replaced by a glowing green cybernetic eye with "
                "thin black circuit lines on the right side of the face; black turtleneck, dark brown strap harness, "
                "black cargo trousers, black boots; his right arm is a black robotic prosthesis with long claw fingers "
                "and glowing green lines",
        "mood": "calm, cool, slightly amused",
        "rim": "cyan",
    },
    "seraphina": {
        "desc": "young woman, wavy light-brown hair in a loose low ponytail, blue eyeshadow; royal-blue tailored suit "
                "(long blazer and wide trousers), black turtleneck, black strap harness over the blazer, black shoes",
        "mood": "elegant, composed, a little condescending",
        "rim": "cyan",
    },
    "sybella": {
        "desc": "young woman, wavy golden-brown hair in a high ponytail, red lipstick; bright red tailored suit "
                "(blazer and trousers), white turtleneck, thin gold necklace, black strap harness over the blazer, "
                "black shoes",
        "mood": "haughty, theatrical bright smile",
        "rim": "pink",
    },
    "serenity": {
        "desc": "young woman, curly dark-brown hair pinned up in a loose bun, silver triangle earrings, thin silver "
                "necklace; green tailored suit (blazer and trousers), black turtleneck, black strap harness over the "
                "blazer, black boots",
        "mood": "serene, polite, slightly dreamy smile",
        "rim": "cyan",
    },
    "collin": {
        "desc": "young man, short tousled light-brown hair, dark sunglasses; dark-red velvet blazer with black satin "
                "lapels, white shirt, black strap harness, black trousers, black shoes; holds a black handheld "
                "microphone in his right hand",
        "mood": "showman TV-host grin, larger than life",
        "rim": "pink",
    },
    "delya": {
        "desc": "young woman, long wavy dark-brown hair, gold hoop earrings; olive-green trench coat worn open, "
                "silver sequin top, black strap harness, tan wide-leg trousers, black shoes; holds a black handheld "
                "microphone in her right hand",
        "mood": "professional reporter smile, curious",
        "rim": "pink",
    },
    "ripper": {
        "desc": "young man, short spiky dark-brown undercut hair, brass steampunk goggles with round yellow lenses "
                "worn over the eyes; long grey trench coat, olive-green shirt, black strap harness, brown belt, khaki "
                "trousers, black gloves, brown boots",
        "mood": "sly, scheming smirk",
        "rim": "cyan",
    },
    "daria": {
        "desc": "girl about 11 years old, long straight light-brown hair with a thin silver headband, freckles; black "
                "leather jacket, white t-shirt, black strap harness, grey jeans, white sneakers",
        "mood": "cheeky, street-smart grin",
        "rim": "pink",
        "child": True,
    },
    "freya": {
        "desc": "girl about 11 years old, long straight light-brown hair, clear pink-tinted glasses, small gold hoop "
                "earrings; light-grey zip hoodie, white t-shirt, black strap harness, light-blue baggy jeans, white "
                "sneakers",
        "mood": "sweet, a bit shy smile",
        "rim": "cyan",
        "child": True,
    },
    "jakko": {
        "desc": "boy about 11 years old, tousled brown hair, freckles; blue denim jacket with sleeves rolled up and "
                "small patches (a star, a smiley, a starburst), black t-shirt, black strap harness, black jeans, "
                "black-and-white canvas sneakers",
        "mood": "mischievous, cheerful grin",
        "rim": "cyan",
        "child": True,
    },
    "richter": {
        "desc": "adult man, black beret, short curly brown hair, curled moustache and small goatee; all-black "
                "tactical outfit: black jacket with a black tactical vest full of pouches, black gloves, black cargo "
                "trousers, black boots",
        "mood": "smug, self-satisfied smile",
        "rim": "pink",
    },
    "wache": {
        "desc": "young woman, auburn hair in a messy bun with bangs, gold hoop earrings, freckles; black hoodie under "
                "a black tactical vest with pouches, black cargo trousers, black boots",
        "mood": "alert guard, stern but good-natured",
        "rim": "cyan",
    },
    "barkeeper": {
        "desc": "adult man with a broad, heavy build, black hood up with white inner lining, black samurai-style "
                "half face mask covering mouth and nose; black hoodie with a white glitch-pattern front panel, black "
                "strap harness, black trousers, black sneakers; a katana with a glowing cyan blade edge in a black "
                "sheath on his back",
        "mood": "calm, unreadable, eyes slightly amused above the mask",
        "rim": "cyan",
    },
    "kameramann": {
        "desc": "adult man, face completely hidden: black beret, black balaclava and a chrome robot-like face plate "
                "with a dark visor; black short-sleeve tactical shirt, black tactical vest with pouches, black gloves, "
                "black cargo trousers, black boots",
        "mood": "faceless, head slightly tilted, curious",
        "rim": "pink",
    },
    "ki-nexus": {
        "desc": "an artificial intelligence appearing as a holographic face on a screen: teal-turquoise skin, pointed "
                "elf-like ears, glowing white-cyan eyes without pupils, swept-back dark teal hair, dark suit with a "
                "high stand-up collar and glowing cyan seam lines",
        "mood": "calm, superior, slightly unsettling smile",
        "rim": "cyan",
        "walk": False,
        "portraits": ["", "angry"],
        "special": "hologram",
    },
    "captain-kuschel": {
        "desc": "a cuddly plush toy bunny: cream-white fluffy fur, very long floppy ears with pink insides, big shiny "
                "dark eyes with pink glitter, small pink nose, visible plush seams, black butler waistcoat with cream "
                "buttons and a black bow tie",
        "mood": "sweet, gentle stitched smile",
        "rim": "pink",
        "walk": False,
        "prop": True,
        "special": "plush",
    },
}

# Ausdrucksvarianten für Porträts (--variants=happy,angry …). ki-nexus-angry hat einen eigenen Text.
VARIANT_MOODS = {
    "happy": "laughing happily, eyes bright",
    "angry": "angry, frowning, jaw set",
    "sad": "sad, eyes lowered, small frown",
    "surprised": "surprised, eyebrows raised, mouth open",
    "worried": "worried, eyebrows drawn together",
    "flirty": "warm, shy smile, slightly blushing",
}

STYLE = ("hand-painted cartoon illustration exactly like the attached character art (clean dark ink outlines, soft "
         "painterly shading, natural proportions, not chibi)")


def defaults(cid: str) -> dict:
    c = dict(CHARACTERS[cid])
    c.setdefault("child", False)
    c.setdefault("walk", True)
    c.setdefault("portraits", [""])
    c.setdefault("prop", False)
    return c


def refs_for(cid: str, kind: str) -> list[Path]:
    """Referenzbilder aus work/refs (privat). Laufblatt/Requisit: Kostümfigur zuerst, Porträt: Brustbild zuerst."""
    stem = json.loads(REFMAP.read_text())[cid]
    if stem.startswith("unique:"):
        base = f"character-unique-{stem.split(':', 1)[1]}"
        runner, portrait = f"{base}.png", f"{base}-portrait.png"
    else:
        runner, portrait = f"character-{stem}--nexus.png", f"character-{stem}--nexus-portrait.png"
    paths = [ROOT / "work/refs" / runner, ROOT / "work/refs" / portrait]
    if kind == "portrait":
        paths.reverse()
    # Optional: echtes Kostümfoto (privat) als letzte Referenz, nur für Kostümdetails (char_config "photo_ref").
    conf = ROOT / "scripts/art/char_config" / f"{cid}.json"
    photo = json.loads(conf.read_text()).get("photo_ref") if conf.exists() else None
    if photo:
        paths.append(ROOT / "work/refs" / photo)
    missing = [p for p in paths if not p.exists()]
    if missing:
        raise FileNotFoundError(f"{cid}: Referenz fehlt: {missing}")
    return paths


def walk_prompt(cid: str, extra: str = "") -> str:
    c = defaults(cid)
    desc = c["desc"]
    if c["child"]:
        desc += ". This character is a CHILD: clearly child-sized with child proportions (shorter legs, bigger head " \
                "relative to the body, youthful face), but drawn in the same natural, non-chibi style"
    p = ("Game character WALK CYCLE SPRITE SHEET: a square image containing a strict 4x4 grid of 16 small full-body "
         "figures of the SAME character, evenly spaced, each centered in its own invisible square cell, identical "
         "scale, wide empty gaps, nothing touching or cut off. Each row is one walking direction with 4 walking frames "
         "(left foot forward, passing, right foot forward, passing), feet on a common baseline per row: ROW 1 (top) "
         "facing SOUTH toward the viewer; ROW 2 facing WEST, strict side profile walking toward the LEFT edge; ROW 3 "
         "facing EAST, strict side profile walking toward the RIGHT edge; ROW 4 (bottom) facing NORTH, back view. "
         "Slight three-quarter top-down RPG camera. Style: hand-painted cartoon illustration exactly like the attached "
         "character art (clean dark ink outlines, soft painterly shading, natural proportions, not chibi), readable "
         "when shrunk to about 80 pixels tall. The character must match the attached reference exactly: "
         f"{desc}. Identical clothing in all 16 frames. Flat pure magenta #FF00FF background everywhere, no ground "
         "shadow, no floor, no text.")
    if extra:
        p += f" CORRECTION: {extra}"
    return p


def portrait_prompt(cid: str, variant: str = "", extra: str = "") -> str:
    c = defaults(cid)
    special = c.get("special")
    if special == "hologram":
        if variant == "angry":
            look = ("The hologram has turned hostile: everything glows RED instead of cyan (red-tinted skin glow, burning "
                    "red eyes, red seam lines), strong red scanlines and harsh glitch tears, menacing narrowed glare, "
                    "threatening and cold")
        else:
            look = f"Cyan holographic glow, expression: {c['mood']}"
        p = ("Character PORTRAIT for an RPG dialogue box: bust shot (head and shoulders only, cropped at mid-chest, slightly turned three-quarter) "
             f"of {c['desc']}. It is clearly a hologram on a screen: thin horizontal scanlines over the whole face, "
             "subtle glitch-displaced edges, faint screen glow. "
             f"{look}. Style: {STYLE}, matching the attached character exactly. Background: dark screen #0c0a18 to "
             "#1a1030 with a faint grid. Square image, head fully inside the frame with a little space above, no text, "
             "no frame, no watermark.")
    else:
        mood = VARIANT_MOODS.get(variant, variant) if variant else c["mood"]
        who = c["desc"]
        if c["child"]:
            who += " (a child, youthful face)"
        p = ("Character PORTRAIT for an RPG dialogue box: bust shot (head and shoulders only, cropped at mid-chest, slightly turned three-quarter), "
             f"{STYLE}, with exactly the look of the attached character: {who}. Expression: {mood}. Background: dark "
             f"neutral #120c1e to #1a1030, a soft {c['rim']} neon rim light along the hair and shoulder edge. Square "
             "image, head fully inside the frame with a little space above, no text, no frame, no watermark.")
    if extra:
        p += f" CORRECTION: {extra}"
    return p


def prop_prompt(cid: str, extra: str = "") -> str:
    c = defaults(cid)
    p = ("Game PROP for a top-down RPG: one single object, full body, centered, small in the middle of a square "
         f"image with wide empty margins, nothing cut off: {c['desc']}, sitting upright, front three-quarter view, "
         "slight top-down RPG camera. "
         f"Style: {STYLE}, matching the attached reference exactly, readable when shrunk to about 48 pixels tall. "
         "Flat pure magenta #FF00FF background everywhere, no ground shadow, no floor, no text.")
    if extra:
        p += f" CORRECTION: {extra}"
    return p


def jobs_for(mode: str, ids: list[str], suffix: str, extra: str, variants: list[str] | None) -> list[dict]:
    jobs = []
    for cid in ids:
        c = defaults(cid)
        if mode == "walk":
            if not c["walk"]:
                print(f"{cid}: kein Laufblatt vorgesehen – übersprungen")
                continue
            jobs.append({"id": cid, "target": RAW / f"{cid}-walk{suffix}.png", "prompt": walk_prompt(cid, extra),
                         "refs": refs_for(cid, "walk")})
        elif mode == "portrait":
            for v in (variants if variants is not None else c["portraits"]):
                name = f"{cid}-portrait{'-' + v if v else ''}{suffix}.png"
                jobs.append({"id": cid, "target": RAW / name, "prompt": portrait_prompt(cid, v, extra),
                             "refs": refs_for(cid, "portrait")})
        elif mode == "prop":
            if not c["prop"]:
                print(f"{cid}: kein Requisit vorgesehen – übersprungen")
                continue
            jobs.append({"id": cid, "target": RAW / f"{cid}-prop{suffix}.png", "prompt": prop_prompt(cid, extra),
                         "refs": refs_for(cid, "prop")})
    return jobs


def run_job(job: dict) -> tuple[str, bool, float]:
    start = time.time()
    cmd = [str(CODEX), str(job["target"]), job["prompt"], *map(str, job["refs"])]
    res = subprocess.run(cmd, cwd=ROOT, capture_output=True, text=True)
    ok = res.returncode == 0 and job["target"].exists()
    if not ok:
        print(f"FEHLER {job['target'].name}: {res.stderr.strip() or res.stdout.strip()}", flush=True)
    return job["target"].name, ok, time.time() - start


def write_design() -> None:
    """Alle Prompts (Standardfassung ohne Korrektur) nach design/assets/characters.json – ohne private Pfade."""
    data = {"_info": "Prompts der Figurenbilder (scripts/art/char_prompts.py). Referenzen: Kostümfigur und Brustbild "
                     "der jeweiligen Rolle aus der TheaterApp (privat unter work/refs, nicht im Repo). Korrekturfassungen "
                     "(--extra) stehen in den Build-Daten der Figur.",
            "characters": {}}
    for cid in CHARACTERS:
        c = defaults(cid)
        entry = {"desc": c["desc"], "child": c["child"], "walk": c["walk"], "portraits": c["portraits"],
                 "prop": c["prop"], "prompts": {}}
        if c["walk"]:
            entry["prompts"]["walk"] = walk_prompt(cid)
        for v in c["portraits"]:
            entry["prompts"][f"portrait{'-' + v if v else ''}"] = portrait_prompt(cid, v)
        if c["prop"]:
            entry["prompts"]["prop"] = prop_prompt(cid)
        data["characters"][cid] = entry
    DESIGN.parent.mkdir(parents=True, exist_ok=True)
    DESIGN.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def main(argv: list[str]) -> int:
    opts = {a.split("=", 1)[0]: (a.split("=", 1)[1] if "=" in a else True) for a in argv if a.startswith("--")}
    args = [a for a in argv if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 1
    mode, ids = args[0], args[1:]
    if ids in ([], ["all"]) and mode in ("list", "walk", "portrait", "prop"):
        ids = [i for i in CHARACTERS if mode not in ("walk", "prop") or defaults(i)[mode]]
    unknown = [i for i in ids if i not in CHARACTERS]
    if unknown:
        print(f"Unbekannte Figuren-ID(s): {unknown}. Bekannt: {', '.join(CHARACTERS)}")
        return 1
    write_design()
    suffix, extra = str(opts.get("--suffix", "") or ""), str(opts.get("--extra", "") or "")
    variants = None
    if "--variants" in opts:
        variants = [v.strip() for v in str(opts["--variants"] if opts["--variants"] is not True else "").split(",")]
    if mode == "list":
        for cid in ids:
            c = defaults(cid)
            print(f"=== {cid} ===")
            if c["walk"]:
                print(f"[walk]\n{walk_prompt(cid, extra)}\n")
            for v in c["portraits"]:
                print(f"[portrait{'-' + v if v else ''}]\n{portrait_prompt(cid, v, extra)}\n")
            if c["prop"]:
                print(f"[prop]\n{prop_prompt(cid, extra)}\n")
        return 0
    if mode not in ("walk", "portrait", "prop"):
        print(f"Unbekannter Modus {mode!r}")
        return 1
    jobs = jobs_for(mode, ids, suffix, extra, variants)
    todo = [j for j in jobs if opts.get("--force") or not j["target"].exists()]
    for j in jobs:
        if j not in todo:
            print(f"vorhanden, übersprungen: {j['target'].relative_to(ROOT)} (--force zum Überschreiben)")
    if opts.get("--dry-run"):
        for j in todo:
            print(f"würde erzeugen: {j['target'].relative_to(ROOT)}\n  {j['prompt']}")
        return 0
    if not todo:
        return 0
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
