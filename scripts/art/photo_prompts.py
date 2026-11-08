#!/usr/bin/env python3
"""Prompts und Generierung der fotorealen Dialog-Halbporträts mit Gesichtsausdrücken (Design §6.2).

Aufruf (aus dem Projektordner):
  python3 scripts/art/photo_prompts.py <ids|all> [--expr=neutral,wut] [--suffix=-v2] [--extra='Korrektur'] [--force]
  python3 scripts/art/photo_prompts.py list [ids ...] [--expr=..]       Prompts ausgeben
  Zusatz: --dry-run (nur anzeigen, nichts erzeugen)

Ablauf je Figur: Fehlt das neutral-Rohbild (oder steht neutral in --expr), entsteht es ZUERST aus gemaltem Porträt,
Kostümbild und Stilreferenz. Danach alle übrigen Ausdrücke mit dem fertigen neutral-Foto als ERSTER Referenz
(Identität, Kleidung, Licht und Bildausschnitt bleiben gleich). Höchstens drei Codex-Aufträge gleichzeitig.

Rohbilder: output/imagegen/raw/photos/<id>-<expr>[suffix].png. Vorhandene Dateien werden übersprungen (außer --force).
Neutral-Referenz für die übrigen Ausdrücke: neutral-Rohbild dieses Laufs, sonst "raws.neutral" aus
scripts/art/photo_config/<id>.json, sonst <id>-neutral.png.

scripts/art/photo_config/<id>.json (optional, eine Datei je Figur):
  { "raws":  {"wut": "<id>-wut-v2.png"},             gewählte Rohbilder (für photo_build.py und neutral-Referenz)
    "extra": {"*": "…", "trauer": "…"},              dauerhafte Prompt-Zusätze ("*" = alle Ausdrücke)
    "crop":  {"wut": [x0, y0, x1, y1]},              optionaler Bildausschnitt im Rohbild (Pixel) für photo_build.py
    "note":  "warum welche Fassung" }

Alle Standard-Prompts zusätzlich nach design/assets/photos.json. Referenzzuordnung privat in work/char_refs.json.
"""
from __future__ import annotations

import json
import subprocess
import sys
import time
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]
RAW = ROOT / "output/imagegen/raw/photos"
DESIGN = ROOT / "design/assets/photos.json"
CONF = ROOT / "scripts/art/photo_config"
REFMAP = ROOT / "work/char_refs.json"
STYLE_REF = ROOT / "work/refs/style-keyscene-photoreal.webp"
PAINTED = ROOT / "game/public/assets/portraits"
CODEX = ROOT / "scripts/art/codex_image.sh"
MAX_PARALLEL = 3

EXPRESSIONS = ["neutral", "freude", "wut", "trauer", "ueberrascht", "besorgt", "signatur"]
MINOR_EXPR = ["neutral", "wut", "ueberrascht"]
# Romanze-Ausdrücke nur für Figuren in content/romance.ts (vom Nutzer freigegeben), jugendfrei.
ROMANCE_EXPR = ["verlegen", "zaertlich"]

# Bildregeln (Pflichtbausteine, Design §6.1/§6.2).
PHOTO_STYLE = ("photorealistic portrait photograph, cinematic, 85mm lens, shallow depth of field, subtle film grain, "
               "low-key lighting with violet/blue/pink neon rim light, dark background with soft neon bokeh, vertical "
               "2:3 half-body portrait from head to hips, camera at eye level, framing focused on the face, modest "
               "clothing fully covering the torso, no emphasis on legs, chest or body, age-appropriate, no text, "
               "no watermark")
FRAMING = ("Composition: tall vertical 2:3 image (1024x1536). The subject stands upright, centered, facing the camera "
           "in a slight three-quarter turn; the top of the head sits close below the upper edge with a little "
           "headroom, the face is in the upper third and is the sharpest point of the image, the frame ends at the "
           "hips (no thighs or legs visible). Camera exactly at eye level, never from below. Plain dark city-night "
           "background: out-of-focus neon bokeh only, no readable signs, no letters, no logos, no other people.")
SAME = ("same person, same clothes, same lighting, background and framing as the first reference image; only the "
        "facial expression and slight head/hand pose change")

# ---------------------------------------------------------------------------------------------------------
# Figuren: look = Aussehen als echter Mensch (Kopf bis Hüfte, Kleidung den Rumpf bedeckend), englisch.
# rim = Hauptfarbe von Randlicht/Bokeh, sig = Signatur-Ausdruck, exprs = Ausdrucksliste (Standard: alle sieben).
# special: "hologram" (KI Nexus) / "plush" (Captain Kuschel) mit eigenen Prompts.

PHOTO: dict[str, dict] = {
    "blade": {
        "look": "a charismatic man in his early thirties, short dark-brown hair swept up with a grey-silver streak, "
                "short dark beard and stubble; long fluffy cream-colored shearling teddy coat, black-and-gold baroque "
                "brocade waistcoat buttoned up, white shirt with an open collar, black leather strap harness over the "
                "waistcoat",
        "rim": "pink",
        "sig": "smug, self-satisfied grin, one eyebrow raised, holding a small glowing data chip between two fingers "
               "of a raised hand near his face",
    },
    "raven": {
        "look": "a young woman in her early twenties, long voluminous curly auburn-brown hair, black lipstick with a "
                "thin black line painted from the middle of the lower lip straight down the chin, small teal drop "
                "earrings; a black long-sleeved top with lace trim at the neckline that fully covers her stomach, "
                "brown leather strap harness with buckles over the top, oversized black jacket with big puffy sleeves, "
                "black high-waisted leather skirt waistband at the hips",
        "rim": "cyan",
        "sig": "cold, determined stare straight into the camera, chin slightly lowered, eyes narrowed, lips pressed "
               "together, no smile",
    },
    "hunter": {
        "look": "a sturdy, stocky man in his thirties, short brown undercut hair, full brown beard, black sunglasses; "
                "light pink button-up shirt, long black coat worn open, black strap harness across the chest",
        "rim": "pink",
        "sig": "annoyed, rolling his eyes upward (eyes visible above the sunglasses pushed down his nose), mouth "
               "pulled to one side, exasperated",
    },
    "dante": {
        "look": "a young man in his early twenties, shaggy curly brown shoulder-length hair, white patterned bandana "
                "headband with brass steampunk goggles pushed up on the forehead, thin white circuit-line tattoo on "
                "one cheek, stubble; black leather biker jacket, white t-shirt, silver dog-tag necklace, black strap "
                "harness",
        "rim": "cyan",
        "sig": "embarrassed, sheepish lopsided grin, scratching the back of his head with one hand, eyes glancing "
               "aside",
    },
    "vex": {  # neu (Vex Schrapnell)
        "look": "a young adult woman in her early twenties with a clearly adult face and soft features, tomboyish, tough and a bit masculine in attitude: long dark-brown wavy hair with a center part, a bit messy, dark brown eyes under straight dark brows, a small silver nose ring, a deadpan cocky smirk, chin slightly up; long white almond-shaped nails sticking out of black fingerless leather gloves, chunky silver rings, a thin gold chain with a small cross pendant, a braided rainbow bracelet and black string bracelets; all-black edgy street outfit: a black fitted sleeveless tank top with a scoop neckline that fully covers her stomach, a black leather strap harness with silver O-rings and buckles over chest and shoulders, a wide black studded belt plus a second thin buckled belt, black cargo pants with hanging straps, a small black courier hip bag with one reflective strip, scuffed black combat boots; no sleeves, no sweater, no vest; her RIGHT arm is a full cybernetic prosthesis from the shoulder down: matte graphite-black armor plates with scuffed edges and a few scratches, exposed gunmetal hydraulic pistons at the elbow, thin cyan light seams along the forearm, five articulated black metal fingers, the harness strap runs over the metal shoulder joint, her colorful woven wristbands sit on the metal wrist; a cheap, practical street-clinic model, clearly different from a silver coil-spring arm; her LEFT arm is human with a black fingerless leather glove; NO plush toy, no stuffed animal",
        "rim": "cyan",
        "sig": "cocky tough pose: arms crossed, chin up, one eyebrow raised, unimpressed smirk",
    },
    "nyra": {
        "look": "a young woman in her early twenties, long voluminous curly brown hair, black rectangular glasses, "
                "freckles; olive-green bomber jacket, white ribbed long top that fully covers her stomach, black strap "
                "harness",
        "rim": "cyan",
        "sig": "starstruck fan-girl beaming, huge delighted smile, eyes shining, both hands clasped together under "
               "her chin",
    },
    "aria": {
        "look": "a young woman in her early twenties with a soft, round youthful face, full cheeks, small straight nose, "
                "thick dark eyebrows, dark-brown eyes, a few light freckles; very dark brown hair tightly braided from "
                "the hairline into two Dutch braids that end in long loose voluminous curls over her shoulders; "
                "black long-sleeve top with a sheer black mesh yoke and sleeves (opaque underneath), a large red "
                "star graphic on the chest WITHOUT any text, red-and-black striped and checkered panels on the "
                "sleeves; her LEFT arm is a costume-style cybernetic prosthesis: exposed silver coil springs around "
                "the upper arm and a brushed-silver forearm shell with round rivets, the hand in a black glove; black "
                "leather glove on the right hand, black belt with a round silver buckle, black cargo pants; no "
                "harness",
        "rim": "pink",
        "sig": "ready to fight, fierce confident half smile, holding a silver aluminium baseball bat with a black "
               "grip diagonally across her body, the barrel resting in the gloved hand of her cybernetic left arm",
        "exprs": ["neutral", "freude", "wut", "trauer", "ueberrascht", "besorgt", "signatur", "verlegen", "zaertlich"],
    },
    "vega": {
        "look": "an athletic young woman in her early twenties, brown hair in a high ponytail; olive-green tank top "
                "with a high neckline, black tactical chest harness over it, black fingerless gloves, the strap of a "
                "compact black futuristic rifle slung across her back",
        "rim": "cyan",
        "sig": "fully concentrated as if aiming, one eye slightly narrowed, steady intense gaze past the camera, "
               "breath held",
    },
    "alesa": {
        "look": "a young woman in her twenties, very long straight dark-brown hair with pink streaks, round pink-red "
                "tinted glasses; white lab coat with green circuit-board patches on both sleeves, black shirt, black "
                "strap harness",
        "rim": "pink",
        "sig": "nervous, awkward smile with tense lips, fiddling with her glasses, eyes darting sideways",
    },
    "xion": {
        "look": "a young man in his twenties, short messy dark-brown hair, right eye replaced by a glowing green "
                "cybernetic eye with thin black circuit lines on the right side of the face; black turtleneck, dark "
                "brown strap harness; his right arm is a black robotic prosthesis with long claw fingers and glowing "
                "green lines",
        "rim": "cyan",
        "sig": "menacing, threatening glare, head lowered, cybernetic eye glowing brighter, robotic claw hand raised "
               "slightly",
    },
    "seraphina": {
        "look": "an elegant young woman in her twenties, wavy light-brown hair in a loose low ponytail, blue "
                "eyeshadow; royal-blue tailored long blazer, black turtleneck, black strap harness over the blazer",
        "rim": "cyan",
        "sig": "condescending, looking down her nose with chin raised, cool thin smile, one eyebrow lifted",
    },
    "sybella": {
        "look": "a young woman in her twenties, wavy golden-brown hair in a high ponytail, red lipstick; bright red "
                "tailored blazer, white turtleneck, thin gold necklace, black strap harness over the blazer",
        "rim": "pink",
        "sig": "mocking, sarcastic smirk, head tilted, one hand raised in a theatrical dismissive gesture",
    },
    "serenity": {
        "look": "a young woman in her twenties, curly dark-brown hair pinned up in a loose bun, silver triangle "
                "earrings, thin silver necklace; green tailored blazer, black turtleneck, black strap harness over "
                "the blazer",
        "rim": "cyan",
        "sig": "dreamy, swooning, soft smile, eyes half-lidded and gazing upward, hands folded near her cheek",
    },
    "collin": {
        "look": "a young man in his late twenties, short tousled light-brown hair, dark sunglasses; dark-red velvet "
                "blazer with black satin lapels, white shirt, black strap harness; holds a black handheld microphone",
        "rim": "pink",
        "sig": "big professional TV-host smile with perfect teeth, microphone raised, other hand open in a "
               "welcoming gesture",
    },
    "delya": {
        "look": "a young woman in her twenties, long wavy dark-brown hair, gold hoop earrings; olive-green trench coat "
                "worn open, silver sequin top with a modest neckline, black strap harness; holds a black handheld "
                "microphone",
        "rim": "pink",
        "sig": "sensation-hungry reporter, eager wide eyes, leaning slightly toward the camera with the microphone "
               "pushed forward, excited grin",
    },
    "ripper": {
        "look": "a young man in his twenties, short spiky dark-brown undercut hair, brass steampunk goggles with "
                "round yellow lenses worn over the eyes; long grey trench coat, olive-green shirt, black strap "
                "harness, black gloves",
        "rim": "cyan",
        "sig": "greedy, scheming grin showing teeth, rubbing his gloved hands together",
    },
    "daria": {
        "look": "a girl about 11 years old, clearly a child, long straight light-brown hair with a thin silver "
                "headband, freckles; black leather jacket, white t-shirt, black strap harness",
        "rim": "pink",
        "child": True,
        "sig": "triumphant while playing a card game, grinning, holding up a fan of plain colorful playing cards "
               "(red, yellow, green, blue, no readable text) toward the camera",
    },
    "freya": {
        "look": "a girl about 11 years old, clearly a child, long straight light-brown hair, clear pink-tinted "
                "glasses, small gold hoop earrings; light-grey zip hoodie zipped up, white t-shirt, black strap "
                "harness",
        "rim": "cyan",
        "child": True,
        "sig": "shy giggle, hiding the smile behind the sleeve of her hoodie, eyes happy",
    },
    "jakko": {
        "look": "a boy about 11 years old, clearly a child, tousled brown hair, freckles; blue denim jacket with "
                "sleeves rolled up and small patches (a star, a smiley, a starburst), black t-shirt, black strap "
                "harness",
        "rim": "cyan",
        "child": True,
        "sig": "cheeky, proud grin, holding up a small homemade gadget of wires and a tiny blinking light",
    },
    "richter": {
        "look": "a man in his forties, black beret, short curly brown hair, curled moustache and small goatee; black "
                "jacket with a black tactical vest full of pouches, black gloves",
        "rim": "pink",
        "exprs": MINOR_EXPR,
    },
    "wache": {
        "look": "a young woman in her twenties, auburn hair in a messy bun with bangs, gold hoop earrings, freckles; "
                "black hoodie under a black tactical vest with pouches",
        "rim": "cyan",
        "exprs": MINOR_EXPR,
    },
    "barkeeper": {
        "look": "a broad, heavy-set man, black hood up with white inner lining, black samurai-style half face mask "
                "covering mouth and nose, only the eyes visible; black hoodie with a white glitch-pattern front "
                "panel, black strap harness, the hilt of a katana visible over his shoulder",
        "rim": "cyan",
        "exprs": MINOR_EXPR,
        "masked": True,
    },
    "kameramann": {
        "look": "a man whose face is completely hidden: black beret, black balaclava and a chrome robot-like face "
                "plate with a dark visor; black short-sleeve tactical shirt, black tactical vest with pouches, black "
                "gloves",
        "rim": "pink",
        "exprs": MINOR_EXPR,
        "faceless": True,
    },
    "ki-nexus": {
        "look": "an artificial intelligence appearing as a photorealistically rendered holographic face on a large "
                "dark screen: teal-turquoise skin, pointed elf-like ears, glowing white-cyan eyes without pupils, "
                "swept-back dark teal hair, dark suit with a high stand-up collar and glowing cyan seam lines; thin "
                "horizontal scanlines over the whole image, faint screen glow",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "wut", "signatur"],
        "special": "hologram",
    },
    "captain-kuschel": {
        "look": "a real photographed cuddly plush toy bunny: cream-white fluffy fur, very long floppy ears with pink "
                "insides, big shiny dark button eyes with pink glitter, small pink stitched nose, visible plush seams, "
                "a little black butler waistcoat with cream buttons and a black bow tie",
        "rim": "pink",
        "exprs": ["neutral", "freude", "trauer"],
        "special": "plush",
    },
}

EXPR_TEXT = {
    "neutral": "calm, neutral expression, relaxed face, mouth closed, looking at the viewer",
    "freude": "genuinely happy, warm open smile, eyes crinkled with joy",
    "wut": "angry, brows furrowed hard, glaring, jaw clenched, nostrils slightly flared",
    "trauer": "sad, eyes glistening, inner brows raised, corners of the mouth turned down, gaze lowered",
    "ueberrascht": "surprised, eyebrows raised high, eyes wide open, mouth open",
    "besorgt": "worried, brows drawn together, lips pressed, tense uncertain look",
    "verlegen": "shy and flustered, a small embarrassed smile, light blush on the cheeks, glancing away for a moment, "
                "one hand rubbing the back of the neck",
    "zaertlich": "soft affectionate look straight at the viewer, gentle warm smile, relaxed eyes, head tilted slightly, "
                 "warm tender mood, fully clothed, wholesome",
}
# Kinder: harmlose Alltagsausdrücke (keine dramatische Wut/Trauer).
CHILD_TEXT = {
    "wut": "grumpy and cross like a sulking kid, pouting, arms crossed",
    "trauer": "disappointed and a little sad, pouting lower lip, looking down",
    "besorgt": "unsure and worried, biting the lower lip, eyebrows drawn together",
}
MASKED_TEXT = {  # nur die Augen sichtbar
    "neutral": "calm, unreadable eyes above the mask, steady gaze",
    "wut": "angry eyes narrowed above the mask, brows furrowed, shoulders squared",
    "ueberrascht": "eyes wide open above the mask, eyebrows raised, head pulled back slightly",
}
FACELESS_TEXT = {  # nur Körpersprache
    "neutral": "standing still, head straight, calm posture",
    "wut": "angry body language: head thrust forward, shoulders raised, one gloved fist clenched",
    "ueberrascht": "surprised body language: head jerked back and tilted, both gloved hands raised slightly",
}
HOLO_TEXT = {
    "neutral": "calm, superior, slightly unsettling faint smile, cyan glow",
    "freude": "cold-friendly smile, polite but artificial, cyan glow slightly brighter",
    "wut": "hostile: everything glows RED instead of cyan (red-tinted skin glow, burning red eyes, red seam lines), "
           "strong red scanlines and harsh glitch tears, menacing narrowed glare",
    "signatur": "the face is breaking apart in a digital glitch: horizontal slices displaced sideways, RGB channel "
                "split, pixel blocks dissolving at the edges, expression frozen mid-word",
}
PLUSH_TEXT = {
    "neutral": "sitting upright, ears hanging relaxed, soft even light, it looks calm and attentive",
    "freude": "ears perked up high, slight forward tilt, warm bright light on the face, it seems to beam with joy",
    "trauer": "ears drooping low over the face, slumped a little, cool dim blue light from above, it looks sad and "
              "lonely",
}


def defaults(cid: str) -> dict:
    c = dict(PHOTO[cid])
    c.setdefault("child", False)
    c.setdefault("exprs", EXPRESSIONS)
    return c


def config(cid: str) -> dict:
    p = CONF / f"{cid}.json"
    return json.loads(p.read_text()) if p.exists() else {}


def expr_text(cid: str, expr: str) -> str:
    c = defaults(cid)
    if c.get("special") == "hologram":
        return HOLO_TEXT[expr]
    if c.get("special") == "plush":
        return PLUSH_TEXT[expr]
    if c.get("faceless"):
        return FACELESS_TEXT[expr]
    if c.get("masked"):
        return MASKED_TEXT[expr]
    if expr == "signatur":
        return c["sig"]
    if c["child"] and expr in CHILD_TEXT:
        return CHILD_TEXT[expr]
    return EXPR_TEXT[expr]


def painted_refs(cid: str) -> list[Path]:
    """Kostümbild (Halbfigur aus der TheaterApp, privat) + gemaltes Spielporträt."""
    stem = json.loads(REFMAP.read_text())[cid]
    if stem.startswith("unique:"):
        costume = ROOT / "work/refs" / f"character-unique-{stem.split(':', 1)[1]}-portrait.png"
    else:
        costume = ROOT / "work/refs" / f"character-{stem}--nexus-portrait.png"
    photo = config(cid).get("photo_ref")  # echtes Kostümfoto (privat, work/refs) als stärkste Referenz
    lead = [ROOT / "work/refs" / photo] if photo else []
    paths = [p for p in (*lead, costume, PAINTED / f"{cid}.webp") if p.exists()]
    if not paths:
        raise FileNotFoundError(f"{cid}: keine Referenz gefunden ({costume.name}, {cid}.webp)")
    return paths


def subject(cid: str) -> str:
    c = defaults(cid)
    s = c["look"]
    if c["child"]:
        s += (". This is a CHILD of about 11 (range 10-13): clearly child-sized with a youthful child's face and "
              "proportions, casual everyday kid look")
    return s


def base_prompt(cid: str, expr: str) -> str:
    c = defaults(cid)
    special = c.get("special")
    if special == "hologram":
        who = (f"Subject: {subject(cid)}. It must look like a real high-end visual-effects render of a hologram, "
               "not a drawing. Background: dark screen with faint grid and soft neon bokeh around it")
    elif special == "plush":
        who = (f"Subject: {subject(cid)}, sitting on a dark surface. A real photograph of a real stuffed toy (real "
               "fabric texture, stitching), not a living animal and not a drawing; the head and ears fill the upper "
               "half of the frame")
    else:
        who = (f"Subject: a real human being (not a drawing), {subject(cid)}. Match the hair, face, clothing and "
               "colors of the painted character references exactly, translated into a real person with natural "
               "skin texture")
    return (f"{PHOTO_STYLE}. {FRAMING} The neon rim light is mainly {c['rim']}, bokeh in violet/blue/pink. {who}. "
            f"Expression: {expr_text(cid, expr)}.")


def neutral_prompt(cid: str, extra: str = "") -> str:
    lead = ("The FIRST reference is a real costume photo of this exact character: match her face shape, facial "
            "features, hairstyle, costume and prosthetic as closely as possible, but never reproduce printed text, "
            "logos or lettering from it. " if config(cid).get("photo_ref") else "")
    p = (base_prompt(cid, "neutral") + " " + lead + "References: the painted character images show the character's look "
         "(hair, face, clothing, colors) – use them for identity and costume only, NOT their drawing style. The "
         "last reference image is a photo used ONLY for color grading, lighting and camera look – ignore its people, "
         "poses, clothing and composition.")
    return p + (f" CORRECTION: {extra}" if extra else "")


def expr_prompt(cid: str, expr: str, extra: str = "") -> str:
    p = (f"Edit of the first reference image: {SAME}. New expression: {expr_text(cid, expr)}. "
         f"Make the expression clearly readable. Keep: {PHOTO_STYLE}. Same vertical 2:3 framing from head to hips, "
         "same face and identity, same hairstyle, same costume details, same background and bokeh. The second "
         "reference (painted) is only a reminder of the costume.")
    return p + (f" CORRECTION: {extra}" if extra else "")


def raw_path(cid: str, expr: str, suffix: str = "") -> Path:
    return RAW / f"{cid}-{expr}{suffix}.png"


def chosen_raw(cid: str, expr: str) -> Path:
    name = config(cid).get("raws", {}).get(expr)
    return RAW / name if name else raw_path(cid, expr)


def job(cid: str, expr: str, suffix: str, extra: str, neutral: Path | None = None) -> dict:
    cfg_extra = config(cid).get("extra", {})
    ex = " ".join(x for x in (cfg_extra.get("*", ""), cfg_extra.get(expr, ""), extra) if x)
    if expr == "neutral":
        refs = [*painted_refs(cid), STYLE_REF]
        prompt = neutral_prompt(cid, ex)
    else:
        refs = [neutral or chosen_raw(cid, "neutral"), painted_refs(cid)[0]]
        prompt = expr_prompt(cid, expr, ex)
    return {"id": cid, "expr": expr, "target": raw_path(cid, expr, suffix), "prompt": prompt, "refs": refs}


def run_job(j: dict) -> tuple[str, bool, float]:
    start = time.time()
    missing = [r for r in j["refs"] if not Path(r).exists()]
    if missing:
        print(f"FEHLER {j['target'].name}: Referenz fehlt {missing}", flush=True)
        return j["target"].name, False, 0.0
    res = subprocess.run([str(CODEX), str(j["target"]), j["prompt"], *map(str, j["refs"])],
                         cwd=ROOT, capture_output=True, text=True)
    ok = res.returncode == 0 and j["target"].exists()
    if not ok:
        print(f"FEHLER {j['target'].name}: {res.stderr.strip() or res.stdout.strip()}", flush=True)
    return j["target"].name, ok, time.time() - start


def run_all(jobs: list[dict]) -> int:
    failed = 0
    if not jobs:
        return 0
    with ThreadPoolExecutor(max_workers=MAX_PARALLEL) as pool:
        for name, ok, dur in pool.map(run_job, jobs):
            print(f"{'ok    ' if ok else 'FEHLER'} {name} ({dur:.0f} s)", flush=True)
            failed += not ok
    return failed


def write_design() -> None:
    data = {"_info": "Prompts der fotorealen Dialog-Halbporträts (scripts/art/photo_prompts.py, Design §6.2). "
                     "neutral: Referenzen Kostümbild der Rolle (privat, work/refs), gemaltes Porträt "
                     "portraits/<id>.webp und Stilreferenz (nur Licht/Farbe/Kamera). Übrige Ausdrücke: fertiges "
                     "neutral-Foto als erste Referenz. Korrekturen stehen in scripts/art/photo_config/<id>.json.",
            "style": PHOTO_STYLE, "framing": FRAMING, "same": SAME, "characters": {}}
    for cid in PHOTO:
        c = defaults(cid)
        data["characters"][cid] = {
            "look": c["look"], "child": c["child"], "expressions": c["exprs"],
            "prompts": {e: (neutral_prompt(cid) if e == "neutral" else expr_prompt(cid, e)) for e in c["exprs"]}}
    DESIGN.parent.mkdir(parents=True, exist_ok=True)
    DESIGN.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n")


def main(argv: list[str]) -> int:
    opts = {a.split("=", 1)[0]: (a.split("=", 1)[1] if "=" in a else True) for a in argv if a.startswith("--")}
    args = [a for a in argv if not a.startswith("--")]
    if not args:
        print(__doc__)
        return 1
    listing = args[0] == "list"
    ids = args[1:] if listing else args
    if ids in ([], ["all"]):
        ids = list(PHOTO)
    unknown = [i for i in ids if i not in PHOTO]
    if unknown:
        print(f"Unbekannte Figuren-ID(s): {unknown}. Bekannt: {', '.join(PHOTO)}")
        return 1
    write_design()
    suffix, extra = str(opts.get("--suffix", "") or ""), str(opts.get("--extra", "") or "")
    want = None
    if isinstance(opts.get("--expr"), str):
        want = [e.strip() for e in opts["--expr"].split(",") if e.strip()]
        bad = [e for e in want if e not in EXPRESSIONS + ROMANCE_EXPR]
        if bad:
            print(f"Unbekannte Ausdrücke {bad}. Erlaubt: {', '.join(EXPRESSIONS)}")
            return 1
    force, dry = bool(opts.get("--force")), bool(opts.get("--dry-run"))

    phase1, phase2, skipped = [], [], []
    for cid in ids:
        c = defaults(cid)
        exprs = [e for e in (want or c["exprs"]) if e in c["exprs"]]
        if want and len(exprs) < len(want):
            print(f"{cid}: nicht vorgesehen und übersprungen: {[e for e in want if e not in exprs]}")
        if listing:
            print(f"=== {cid} ===")
            for e in exprs:
                print(f"[{e}]\n{job(cid, e, suffix, extra)['prompt']}\n")
            continue
        neutral_ref = chosen_raw(cid, "neutral")
        if "neutral" in exprs:
            j = job(cid, "neutral", suffix, extra)
            if force or not j["target"].exists():
                phase1.append(j)
                neutral_ref = j["target"]
            else:
                skipped.append(j["target"])
                neutral_ref = j["target"] if suffix else neutral_ref
        elif not neutral_ref.exists():
            j = job(cid, "neutral", "", "")
            print(f"{cid}: neutral fehlt – wird zuerst erzeugt ({rel(j['target'])})")
            phase1.append(j)
            neutral_ref = j["target"]
        for e in exprs:
            if e == "neutral":
                continue
            j = job(cid, e, suffix, extra, neutral_ref)
            if force or not j["target"].exists():
                phase2.append(j)
            else:
                skipped.append(j["target"])
    if listing:
        return 0
    for t in skipped:
        print(f"vorhanden, übersprungen: {rel(t)} (--force zum Überschreiben)")
    if dry:
        for j in phase1 + phase2:
            print(f"würde erzeugen: {rel(j['target'])}\n  Refs: {[rel(Path(r)) for r in j['refs']]}\n  {j['prompt']}")
        return 0
    RAW.mkdir(parents=True, exist_ok=True)
    failed = 0
    if phase1:
        print(f"Phase 1: {len(phase1)} neutral-Bild(er), höchstens {MAX_PARALLEL} gleichzeitig …", flush=True)
        failed += run_all(phase1)
    if phase2:
        print(f"Phase 2: {len(phase2)} Ausdruck/Ausdrücke, höchstens {MAX_PARALLEL} gleichzeitig …", flush=True)
        failed += run_all(phase2)
    return 1 if failed else 0


def rel(p: Path) -> str:
    try:
        return str(Path(p).resolve().relative_to(ROOT))
    except ValueError:
        return str(p)


if __name__ == "__main__":
    sys.exit(main(sys.argv[1:]))
