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

# Neue Akt-1-Figuren ohne Darstellerfoto (art-a): erfundene Gesichter, Identität nur aus dem gemalten Porträt.
PHOTO.update({
    "dexter": {
        "look": "a lanky, slightly hunched man in his late thirties with an invented face (not a real person), light "
                "skin with freckles, messy dark-blond hair sticking out in all directions, patchy stubble, round brass "
                "welding goggles hanging around his neck; oversized mustard-yellow work jacket covered in mismatched "
                "patches and silver duct-tape repairs, faded orange hoodie underneath, a tool belt with screwdrivers "
                "and a small drone remote control",
        "rim": "cyan",
        "sig": "caught red-handed, sheepish pleading grin, both palms raised in front of his chest as if saying "
               "'I will pay, I swear', eyebrows pulled up",
        "exprs": ["neutral", "freude", "besorgt", "ueberrascht", "signatur"],
    },
    "babette-bao": {
        "look": "a sturdy, broad-shouldered, plump East Asian woman in her mid fifties with an invented face (not a "
                "real person), round rosy cheeks, warm but stern dark eyes, black hair with grey streaks in a tight "
                "bun held by two wooden chopsticks; a teal quilted cook's jacket with sleeves rolled up to the elbows, "
                "a long white apron with a few sauce stains, a checkered kitchen towel over one shoulder, a little "
                "kitchen steam drifting through the light",
        "rim": "pink",
        "sig": "resolute motherly look, pointing a big wooden ladle at the viewer like a warning, one eyebrow "
               "raised, lips pressed into a stern but loving line",
        "exprs": ["neutral", "freude", "wut", "trauer", "signatur"],
    },
    "opa-gustav": {
        "look": "a stocky old man in his mid seventies with an invented face (not a real person), bald head with a "
                "white fringe of hair, bushy white walrus moustache, ruddy round nose, bright friendly eyes with laugh "
                "lines, weathered skin; faded blue mechanic's overalls with rust and oil stains, sleeves rolled up, a "
                "worn brown leather vest over them, a red bandana knotted around the neck, an old analog wristwatch",
        "rim": "cyan",
        "sig": "lost in nostalgia, gazing past the camera into the distance with a soft wistful smile, as if "
               "remembering when everything here was green",
        "exprs": ["neutral", "freude", "trauer", "ueberrascht", "signatur"],
    },
    "oma-volt": {
        "look": "a small, slightly round old woman in her mid seventies with an invented face (not a real person), "
                "short permed silver-white curls with a faint lavender tint, big round tortoiseshell glasses on a "
                "beaded chain, sharp knowing eyes, bright coral lipstick; a long quilted lilac cardigan with many "
                "pockets buttoned over a dark-green flower-print dress, a yellow measuring tape around her neck, a red "
                "pincushion strapped to her wrist, a small glowing cyan lightning-bolt brooch",
        "rim": "cyan",
        "sig": "peering over the top of her glasses with a sceptical raised eyebrow and a dry, knowing half smile, "
               "as if saying 'Kindchen, I know exactly what you did'",
        "exprs": ["neutral", "freude", "wut", "besorgt", "signatur"],
    },
    "kiki-karbon": {
        "look": "an athletic woman around thirty with an invented face (not a real person), warm dark-brown skin, "
                "short asymmetric neon-orange bob with shaved sides, gold aviator sunglasses pushed up on her head, a "
                "small radio headset with a microphone arm at her cheek; a glossy yellow pilot bomber jacket with a "
                "black-and-white checker stripe on the sleeves, zipped half up over a black high-neck top that fully "
                "covers her torso, black fingerless driving gloves",
        "rim": "pink",
        "sig": "gossiping: leaning in conspiratorially, one gloved hand raised beside her mouth as if whispering a "
               "juicy rumor, eyes wide and gleeful, wicked grin",
        "exprs": ["neutral", "freude", "ueberrascht", "wut", "signatur"],
    },
    "lio-funkel": {
        "look": "a slim young man in his late twenties with an invented face (not a real person), medium-brown skin, "
                "chin-length straight black hair with a few teal strands tucked behind his ears, soft dreamy brown "
                "eyes, light stubble, a small silver hoop earring; a long faded burgundy patchwork coat with colorful "
                "patches, a chunky mustard-yellow knitted scarf, a grey henley shirt, a compact synth accordion "
                "strapped to his chest with glowing cyan keys and small LED lights along the black bellows",
        "rim": "cyan",
        "sig": "playing the synth accordion, eyes half closed, head tilted, mouth slightly open mid-song, lost in "
               "the music, cyan light from the keys on his face",
        "exprs": ["neutral", "freude", "trauer", "ueberrascht", "signatur", "verlegen", "zaertlich"],
    },
})

# Neue Akt-1-Figuren ohne Darstellerfoto (art-b): erfundene Gesichter, Identität nur aus dem gemalten Porträt.
# bolzen ist ein Roboterhund (special "robot", eigene Ausdruckstexte ROBOT_TEXT).
PHOTO.update({
    "marla-sand": {
        "look": "a sun-weathered woman around forty with an invented face (not a real person), tanned skin with laugh "
                "lines and crow's feet, calm light-grey eyes, long ash-brown hair with a few grey strands in one thick "
                "side braid over her shoulder, a faded rust-red scarf loosely wrapped around her neck, brass aviator "
                "dust goggles hanging at her collarbone; a long sand-beige duster coat, worn and patched, over an "
                "olive linen shirt buttoned up, a woven turquoise-and-orange caravan sash at the waist, a fine layer "
                "of desert dust on coat and hair",
        "rim": "pink",
        "sig": "reading the wind: eyes half closed, face turned slightly up and to the side, a few colorful wind "
               "ribbons from her staff fluttering in the frame, a calm knowing smile",
        "exprs": ["neutral", "freude", "besorgt", "signatur"],
    },
    "pim-pinzette": {
        "look": "a petite young adult woman in her early twenties with an invented face (not a real person), clearly "
                "adult, short choppy black bob with straight bangs, big eyes behind oversized round thick-rimmed "
                "glasses with a small jeweler's magnifier loupe flipped up on one side, a few freckles; a white lab "
                "coat one size too big with rolled-up sleeves over a mint-green turtleneck sweater, a lanyard with a "
                "blank white ID card (no text), a chest pocket full of tweezers and pens",
        "rim": "cyan",
        "sig": "whispering a secret: leaning in toward the camera, one hand raised beside her mouth, eyes darting "
               "nervously to the side, as if saying 'you did not hear this from me'",
        "exprs": ["neutral", "besorgt", "ueberrascht", "signatur"],
    },
    "kaeptn-nebelhorn": {
        "look": "a broad, barrel-chested old sea captain in his sixties with an invented face (not a real person), "
                "ruddy weathered cheeks, a big bushy white beard and walrus moustache, bushy white eyebrows, small "
                "twinkling blue eyes; a navy-blue peaked captain's cap with a tarnished brass anchor badge (no text), "
                "a thick navy pea coat with brass buttons over a cream cable-knit fisherman's sweater, a red "
                "neckerchief, a dented brass hand foghorn hanging from a leather strap",
        "rim": "cyan",
        "sig": "blowing his brass hand foghorn with puffed-out cheeks, eyes squeezed shut with joy, beard "
               "bristling",
        "exprs": ["neutral", "freude", "besorgt", "signatur"],
    },
    "buergermeister-gully": {
        "look": "a pear-shaped man in his fifties with an invented face (not a real person), round belly, balding "
                "head with a wild grey fringe and a sad comb-over, big grey mutton-chop sideburns, small round "
                "spectacles with one cracked lens, ruddy nose, a small headlamp strapped around his forehead; a "
                "ceremonial sash of red-and-white striped barrier tape diagonally across the chest, a chain of office "
                "made of bottle caps with a big rusty washer as medallion, a stained once-elegant burgundy tailcoat "
                "over a grubby mustard waistcoat, olive-green rubber chest waders with suspenders, damp sewer-tunnel "
                "darkness with dripping light in the bokeh",
        "rim": "pink",
        "sig": "pompous speech: chin raised, one finger lifted in the air, mouth open mid-proclamation, holding a "
               "rusty plunger upright like a royal scepter in the other hand",
        "exprs": ["neutral", "freude", "wut", "signatur"],
    },
    "jimmy": {
        "look": "a lanky, thin young man in his mid twenties with an invented face (not a real person), messy "
                "bleached-blond hair with dark roots sticking up, stubble, tired dark circles under wide, slightly "
                "manic eyes, a small neurochip implant behind his right ear glowing with a flickering cyan-and-magenta "
                "light; a faded teal bomber jacket with orange lining and oil stains worn open over a crumpled grey "
                "t-shirt with a simple smiley face graphic (no text), a black strap harness over the shirt",
        "rim": "cyan",
        "sig": "chip glitch: an over-wide frozen customer-service smile, eyes unfocused, the neurochip behind his "
               "ear flaring bright magenta, a faint digital glitch distortion over half of his face",
        "exprs": ["neutral", "freude", "trauer", "signatur"],
    },
    "bolzen": {
        "look": "a real-looking decommissioned corporate robot guard dog (a machine, not a living animal), lean "
                "shepherd-dog silhouette: scuffed white-grey armor plates with a faded teal stripe (no logo, no text), "
                "dents and rust spots, exposed black hydraulic joints, a single wide visor band as eyes glowing warm "
                "amber, small triangular metal ears, a dented red collar with a round metal tag, a short segmented "
                "antenna tail with a tiny glowing tip",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "wut"],
        "special": "robot",
    },
})
# Fehlende Figuren r–z (art-fig-c): erfundene Gesichter, Identität nur aus dem gemalten Porträt.
PHOTO.update({
    "rudi": {
        "look": "a burly, broad-bellied man in his late fifties with an invented face (not a real person), "
                "sun-leathered tanned skin, shaved head with a sunburnt scalp, a thick grey horseshoe moustache, bushy "
                "grey eyebrows, friendly squinting eyes with deep crow's feet, a faded rust-red bandana around his "
                "neck; a short-sleeved cream diner shirt with a turquoise collar (no name tag, no text), a "
                "grease-stained white apron over it with a metal spatula tucked into the apron string, a dented "
                "chrome coffee pot in one hand, warm dusty desert-diner light in the bokeh",
        "rim": "pink",
        "exprs": ["neutral", "freude", "besorgt"],
    },
    "wachmann-brezel": {
        "look": "a chubby man in his thirties with an invented face (not a real person), round friendly face, rosy "
                "cheeks, short ginger hair, a few pretzel crumbs on his chin; a sleek glossy white armored corporate "
                "security uniform with thin violet light seams and a small abstract violet geometric emblem on the "
                "chest (no text), black gloves, his white helmet with a dark violet visor tucked under one arm, a big "
                "golden soft pretzel in the other hand",
        "rim": "cyan",
        "exprs": ["neutral", "wut", "ueberrascht"],
    },
    "zellennachbarin": {
        "look": "a tough, wiry woman in her mid fifties with an invented face (not a real person), grey buzz cut, "
                "weathered face with a crooked once-broken nose, one gold tooth, faded blue-black prison tattoos "
                "(stars, swallows, a spider web, no letters) on both forearms and creeping up her neck to the jaw; a "
                "plain grey t-shirt fully covering the torso, a faded orange prison jumpsuit (no text, no numbers) "
                "with the top half tied around her waist, cold prison-visiting-room light in the bokeh",
        "rim": "pink",
        "exprs": ["neutral", "freude", "trauer"],
    },
    "salzige-grete": {
        "look": "a big, broad-shouldered woman in her late forties with an invented face (not a real person), "
                "forearms as thick as ship ropes, ruddy wind-burnt cheeks, curly salt-and-pepper hair under a knitted "
                "navy watch cap, a small gold hoop in one ear; a long mustard-yellow rubber fisherman's apron over a "
                "navy-and-white striped long-sleeve shirt with sleeves pushed up, thick orange rubber gloves, holding "
                "a big silver fish by the tail, harbor lights in the bokeh",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "wut"],
    },
    "sina-spray": {
        "look": "a slim young woman in her early twenties with an invented face (not a real person), shoulder-length "
                "messy black hair with neon-pink and teal paint streaks, a black respirator half mask hanging around "
                "her neck, a smudge of pink paint on one cheek, paint splatter on her hands; an oversized light-blue "
                "denim jacket covered in paint splatters and blank pin badges over a black hoodie, a spray can in one "
                "hand, a colorful graffiti wall blurred in the background",
        "rim": "pink",
        "exprs": ["neutral", "freude", "wut"],
    },
    "stylistin-gina": {
        "look": "a glamorous woman in her late fifties with an invented face (not a real person), a huge teased-up "
                "silver-white bouffant wig, very long false eyelashes, bold magenta eyeshadow, glossy pink lipstick, "
                "a beauty mark, long glittering gold nails; a pink-and-gold satin salon kimono jacket with a sequined "
                "collar over a black turtleneck, a can of hairspray in one hand, salon mirror lights in the bokeh",
        "rim": "pink",
        "exprs": ["neutral", "freude", "trauer"],
    },
    "turbo-tilda": {
        "look": "a wiry, compact woman around forty with an invented face (not a real person), short spiky platinum "
                "hair with one shaved side, freckled sun-tanned face, a slight gap between her front teeth, vintage "
                "brown leather aviator goggles pushed up on her forehead, a streak of soot on one cheek; a faded "
                "orange racing coverall zipped up to the collarbone over a black t-shirt, sleeves rolled to the "
                "elbows, forearms with small tattoos of trophy cups (no text), a chunky drone remote controller "
                "hanging from a strap around her neck",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "wut"],
    },
    "vinyl-vincent": {
        "look": "a skinny, lanky man in his forties with an invented face (not a real person), long dark sideburns "
                "down to the chin, a slicked-back black pompadour with a grey streak, round dark sunglasses, a thin "
                "moustache; a worn brown corduroy jacket over a faded maroon turtleneck, holding a black vinyl record "
                "in a plain cardboard sleeve (no text) against his chest",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "besorgt"],
    },
    "wett-willi": {
        "look": "a wiry man in his fifties with an invented face (not a real person), slick dark comb-over under a "
                "grey flat cap, a thin pencil moustache, shifty twinkling eyes, one gold tooth; a white shirt with "
                "rolled-up sleeves and red suspenders, a loose black tie, three stacked steel cups in one hand and a "
                "small red ball between two fingers of the other",
        "rim": "pink",
        "exprs": ["neutral", "freude", "besorgt"],
    },
    "staubbaron-broesel": {
        "look": "a scrawny, weaselly man in his fifties with an invented face (not a real person), sunken cheeks, sly "
                "small eyes, a long thin waxed moustache, crooked yellowish teeth, a battered dusty top hat with brass "
                "goggles on the band, a sand-colored dust scarf; an oversized faded military greatcoat covered in "
                "desert dust, decorated with medals made of bottle caps and brass faucet handles, a dented jerrycan "
                "strap over one shoulder, a brass water ladle held like a scepter, hazy desert dusk in the bokeh",
        "rim": "pink",
        "sig": "greedy offer: leaning toward the camera, holding up a small cloudy water bottle between two fingers, "
               "a sly crooked grin, one eyebrow raised as if naming an outrageous price",
        "exprs": ["neutral", "wut", "signatur"],
    },
    # Kanal-Schlafwandler: neutral = Trance (Text über photo_config extra), danach aufgewacht.
    "schlafwandler-ede": {
        "look": "a stocky man in his sixties with an invented face (not a real person), bald with grey stubble, a "
                "small chip implant at his temple glowing faint violet; a patched yellow rain poncho over a faded "
                "striped pyjama shirt, damp sewer-tunnel darkness with dripping light in the bokeh",
        "rim": "cyan",
        "exprs": ["neutral", "besorgt", "ueberrascht"],
    },
    "schlafwandlerin-rosi": {
        "look": "a plump woman in her forties with an invented face (not a real person), frizzy copper-red hair half "
                "in pink plastic curlers, a small chip implant at her temple glowing faint violet; a quilted pink "
                "dressing gown tied closed over a grey knitted sweater, holding a soup ladle, dim pump-station "
                "industrial light in the bokeh",
        "rim": "pink",
        "exprs": ["neutral", "besorgt", "ueberrascht"],
    },
    "schlafwandler-bert": {
        "look": "a thin young office worker in his late twenties with an invented face (not a real person), messy "
                "brown hair, crooked glasses askew, a wireless headset on one ear, a small chip implant at his temple "
                "glowing faint violet; a wrinkled white shirt with a loose blue tie, dark data-tunnel with cyan "
                "cable lights in the bokeh",
        "rim": "cyan",
        "exprs": ["neutral", "besorgt", "ueberrascht"],
    },
})
# Fehlende Figuren h–q (art-fig-b): erfundene Gesichter, Identität nur aus dem gemalten Porträt.
# Maschinen (mixi, opa-blech, krabbe-karl): special "machine" mit eigenen Ausdruckstexten ("texts").
_INV = "with an invented face (not a real person)"
PHOTO.update({
    "leutnant-nadel": {
        "look": f"a lean, wiry woman in her early thirties {_INV}, pale skin, sharp angular face with high "
                "cheekbones, cold pale-grey eyes, a thin vertical scar through her left eyebrow, platinum-white hair "
                "in a severe short undercut slicked back; a fitted black high-collar tactical uniform with glossy "
                "white armor plates on the shoulders and thin toxic-green light seams, a black strap harness, her "
                "right hand a black cybernetic gauntlet with five long thin needle claws with glowing green tips",
        "rim": "cyan",
        "sig": "cold predatory smile, raising the cybernetic needle-claw hand slowly beside her face, green tips "
               "glinting, eyes fixed on the viewer",
        "exprs": ["neutral", "wut", "ueberrascht", "signatur"],
    },
    "kraehe": {
        "look": f"a tall, rangy wasteland raider chieftain in her mid forties {_INV}, sun-dark weathered skin, "
                "intense black eyes with black war paint smeared across the eyes like a mask, long black hair in many "
                "thin braids threaded with crow feathers and small metal beads; a ragged mantle of black crow "
                "feathers over her shoulders, layered rust-brown leather armor with scavenged metal plates, a "
                "sand-colored dust scarf, brass goggles on her forehead, dusty desert dusk in the bokeh",
        "rim": "pink",
        "sig": "listening to a story: leaning slightly forward, chin resting on her fist, one braid with a crow "
               "feather between her fingers, a rare intrigued half smile",
        "exprs": ["neutral", "wut", "freude", "signatur"],
    },
    "opa-funk": {
        "look": f"a wiry old man in his late seventies {_INV}, deeply tanned wrinkled skin, long scraggly grey "
                "beard and wild grey hair, small round green-tinted sunglasses, big old over-ear headphones around "
                "his neck with a coiled cable; a patched brown poncho over a faded red Hawaiian-pattern shirt, a "
                "small telescopic antenna sticking up from a pocket, warm glow of old radio tubes in the bokeh",
        "rim": "pink",
        "sig": "on air: headphones on, leaning toward an old handheld microphone, mouth open mid-sentence, eyes "
               "twinkling, one finger raised",
        "exprs": ["neutral", "freude", "trauer", "signatur"],
    },
    "paul": {
        "look": f"a slim young man of twenty-three {_INV}, light skin, short neat ginger hair parted on the side, "
                "freckles, a small silver chip implant behind his right ear; a beige zip jacket with a blank white "
                "sewn-on name tag on the chest (no text), a green knitted sweater vest over a white collared shirt",
        "rim": "cyan",
        "sig": "chipped: an unnaturally even, polite smile, eyes glassy and slightly unfocused, the chip behind his "
               "ear glowing soft violet, perfectly still posture, hands folded",
        "exprs": ["neutral", "freude", "besorgt", "signatur"],
    },
    "pfeffer": {
        "look": f"a big, broad-shouldered man in his early forties {_INV}, soft belly, light-olive skin, short dark "
                "hair greying at the temples, a thick dark moustache, kind tired brown eyes; a white corporate "
                "security uniform with violet light seams and white shoulder armor, a small abstract violet emblem on "
                "the chest (no text), his white helmet under one arm, a tiny pink child's hair clip on the breast "
                "pocket",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "ueberrascht"],
    },
    "quantum-fahrer": {
        "look": f"a tall, stiff man in his forties {_INV}, light skin, square jaw, clean-shaven, black hair cut "
                "very short, dark mirrored sunglasses, a thin earpiece cable; a dark-violet chauffeur suit with a high "
                "collar and silver piping, a peaked chauffeur cap with a small abstract silver emblem (no text), "
                "white gloves",
        "rim": "cyan",
        "exprs": ["neutral", "wut", "ueberrascht"],
    },
    "krabbe-karl": {
        "look": "a small beach-cleaning robot shaped like a crab: a rounded orange-red enamel shell body with scuffs "
                "and a few barnacles, six thin jointed metal legs, two big friendly pincer claws (one holding a pearly "
                "seashell), two round camera eyes on short stalks glowing friendly cyan, a mesh sand-sieve basket on "
                "its back with shells, a tiny blinking antenna, standing on wet sand at the beach at night",
        "rim": "cyan",
        "special": "machine",
        "exprs": ["neutral", "freude", "ueberrascht"],
        "texts": {
            "neutral": "standing calmly, eye stalks upright and glowing a steady soft cyan, claws lowered",
            "freude": "happy: both claws raised high, offering the seashell toward the viewer, eye stalks bent "
                      "forward and glowing bright warm yellow",
            "ueberrascht": "startled: eye stalks shot up straight and wide apart, claws pulled in front of the "
                           "shell, the antenna blinking fast, a little sand flying",
        },
    },
    "herr-glanz": {
        "look": f"a slick salesman in his early thirties {_INV}, light skin with a fake tan, impossibly white perfect "
                "teeth, platinum-blond hair sculpted into a glossy wave, a thin violet AR monocle over one eye, a tiny "
                "headset microphone; a pearl-white tailored suit with violet satin lapels and thin violet light "
                "seams, a lilac shirt, a glowing violet abstract lapel pin (no text), bright showroom lights in the "
                "bokeh",
        "rim": "pink",
        "exprs": ["neutral", "freude", "besorgt"],
    },
    "portier-albert": {
        "look": f"a tall, very upright elderly doorman in his late sixties {_INV}, light skin, long dignified face, "
                "neatly trimmed white mutton-chop sideburns; a burgundy livery coat with gold braiding, gold buttons "
                "and epaulettes, a burgundy top hat with a gold band, spotless white gloves, a grand lobby with "
                "golden lights in the bokeh",
        "rim": "pink",
        "exprs": ["neutral", "wut", "ueberrascht"],
    },
    "mila": {
        "look": f"a small girl of about 8 {_INV}, light-olive skin, big brown eyes, dark-brown hair in two bushy "
                "pigtails with pink hair clips, a gap-toothed smile; an oversized yellow raincoat with rolled-up "
                "sleeves over a pink-and-white striped t-shirt, denim overalls, a small backpack with a sewn-on bunny "
                "face",
        "rim": "pink",
        "child": True,
        "exprs": ["neutral", "freude", "trauer"],
    },
    "madame-satin": {
        "look": f"an elegant, flamboyant woman in her late fifties {_INV}, light skin, a sharp platinum-silver bob, "
                "dramatic chrome cat-eye glasses, dark-red lipstick; a long emerald-green satin coat with polished "
                "chrome shoulder pieces and a high collar over a black silk blouse buttoned to the neck, many chrome "
                "bangles, a long thin chrome e-cigarette holder in one hand, boutique lights in the bokeh",
        "rim": "pink",
        "exprs": ["neutral", "freude", "trauer"],
    },
    "kabelbrand-roadie": {
        "look": f"a burly roadie in his thirties {_INV}, light skin, shaved head, thick ginger beard, a tattoo of a "
                "burning cable coiling up his neck, a lip ring; a faded black band t-shirt with a lightning skull "
                "graphic (no text) under a black work vest full of cable ties, a coil of black cable over one "
                "shoulder, sweaty, concert stage lights in the bokeh",
        "rim": "pink",
        "exprs": ["neutral", "freude", "ueberrascht"],
    },
    "hafen-hannes": {
        "look": f"a huge, barrel-chested dock worker in his fifties {_INV}, ruddy light skin, grey stubble beard, a "
                "broken nose, small kind eyes; a scuffed yellow hard hat, an orange high-visibility vest over a navy "
                "thermal shirt, his left arm a heavy industrial hydraulic grab-arm prosthesis with a yellow-black "
                "striped claw and exposed pistons, harbor cranes and lights in the bokeh",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "trauer"],
    },
    "henk-angler": {
        "look": f"a lean, weathered old man in his late sixties {_INV}, wind-tanned light skin, a short white beard, "
                "bright pale-blue eyes with deep crow's feet; a dark-blue knitted fisherman's beanie, a yellow "
                "oilskin raincoat open over a thick grey roll-neck sweater, a fishing rod over his shoulder, a "
                "lighthouse beam and sea spray in the bokeh",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "ueberrascht"],
    },
    "herr-blitz": {
        "look": f"a wiry man in his fifties {_INV}, light skin, slicked-back jet-black hair, a thin pencil "
                "moustache, shifty narrow eyes, a gold tooth; a shiny electric-blue suit a size too tight, a yellow "
                "shirt, a black tie with a gold lightning-bolt tie pin, a chunky gold watch",
        "rim": "pink",
        "exprs": ["neutral", "freude", "trauer"],
    },
    "knuspi": {
        "look": f"a chubby young man in his mid twenties {_INV}, warm brown skin, round cheerful face, a chocolate "
                "smudge on the chin, a red knitted beanie; a far too big brown trench coat held open to show dozens "
                "of inner pockets stuffed with glossy candy bars (no text), a mustard hoodie underneath",
        "rim": "pink",
        "exprs": ["neutral", "freude", "besorgt"],
    },
    "knut": {
        "look": f"a tall, lanky young man around twenty-five {_INV}, light skin, blond buzz cut, long thin face with "
                "a big nose, one gold tooth; a shiny purple tracksuit with white side stripes zipped up, a fake gold "
                "chain, a backwards black cap",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "ueberrascht"],
    },
    "kurt": {
        "look": f"a short, pudgy young man around twenty {_INV}, light skin, blond bowl cut, round baby face with a "
                "big nose, pouting lips; a shiny purple tracksuit with white side stripes several sizes too big, "
                "sleeves over half the hands, a fake gold chain",
        "rim": "cyan",
        "exprs": ["neutral", "wut", "ueberrascht"],
    },
    "meister-watt": {
        "look": f"a small, wiry old man in his late seventies {_INV}, light-brown skin, completely bald, a very long "
                "thin white beard tied with a copper wire, long white eyebrows, serene half-closed eyes; a faded grey "
                "silk tai-chi suit with frog buttons, a thin layer of dust and a little cobweb on one shoulder",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "ueberrascht"],
    },
    "mira-loetzinn": {
        "look": f"an athletic woman in her early thirties {_INV}, medium-brown skin, copper-red hair shaved on one "
                "side and long on the other, a welding visor flipped up on her head, small soldering burns on her "
                "cheeks; a brown leather work apron over a black high-neck top fully covering her torso, her left "
                "forearm a chrome cybernetic arm with an open panel showing neat wiring, a glowing soldering tip "
                "index finger, workshop sparks in the bokeh",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "besorgt"],
    },
    "mixi": {
        "look": "a squat chrome bartender robot: a barrel-shaped polished chrome body with a few dents on a single "
                "rubber ball wheel, a round screen face showing two simple glowing cyan pixel eyes and a pixel mouth, "
                "two slim jointed arms (one holding a cocktail shaker, one a glass with a glowing pink drink), a "
                "painted black bow tie on the chest, a small orange warning light on top, a neon bar counter in the "
                "bokeh",
        "rim": "pink",
        "special": "machine",
        "exprs": ["neutral", "freude", "ueberrascht"],
        "texts": {
            "neutral": "idle: the screen face shows two calm round pixel eyes and a straight pixel line mouth, arms "
                       "lowered, shaker held still",
            "freude": "delighted: the screen face shows happy curved pixel eyes and a big pixel grin, shaking the "
                      "cocktail shaker high above its head, the orange top light blinking",
            "ueberrascht": "startled: the screen face shows huge round pixel eyes and a small round pixel 'o' "
                           "mouth, both arms jerked up, a little drink splashing from the glass",
        },
    },
    "mutter-bruehe": {
        "look": f"a big, tall, heavy-set woman in her sixties {_INV}, warm dark-brown skin, round kind face, short "
                "grey curls under a knitted red beanie, round glasses fogged at the edges; several layered patched "
                "cardigans in brown and mustard, a long apron sewn from blue tarp, a huge dented soup ladle, steam "
                "drifting through the light",
        "rim": "pink",
        "exprs": ["neutral", "freude", "trauer"],
    },
    "ole-gaehn": {
        "look": f"a lanky old caretaker in his late sixties {_INV}, light skin, droopy heavy eyelids, grey stubble, "
                "messy thin grey hair; a faded grey janitor coverall with a blank name patch (no text), a cardigan "
                "over it, a huge ring of keys on the belt, a thermos flask in one hand",
        "rim": "cyan",
        "sig": "fast asleep standing up: head tilted to one side, eyes closed, mouth slightly open mid-snore, the "
               "thermos about to slip from his hand",
        "exprs": ["neutral", "ueberrascht", "signatur"],
    },
    "opa-blech": {
        "look": "a tall, boxy retro security robot from the 2050s: dented cream and olive-green painted metal body "
                "with rust spots and old rivets, a round bucket-like head with two round yellow lamp eyes and a "
                "speaker grille as mouth, thick accordion-hose arms with clamp hands, a hand-knitted lilac scarf "
                "around its neck, a sewn lightning-bolt patch on its chest",
        "rim": "cyan",
        "special": "machine",
        "exprs": ["neutral", "freude", "besorgt"],
        "texts": {
            "neutral": "standing guard, both lamp eyes glowing a steady warm yellow, head straight, arms at its sides",
            "freude": "pleased: lamp eyes glowing bright and slightly squinted like a smile, head tilted, one clamp "
                      "hand patting the knitted scarf",
            "besorgt": "worried: lamp eyes flickering dim orange, head tilted down and to the side, clamp hands "
                       "pressed together in front of its chest",
        },
    },
    "opa-gurrmann": {
        "look": f"a short, round old man in his seventies {_INV}, light skin, rosy cheeks, a white goatee, a tweed "
                "flat cap; a patched brown corduroy jacket with many pockets, a postman's leather satchel across the "
                "chest, two small grey pigeon drones with glowing cyan eyes and tiny rotor wings perched on his "
                "shoulders",
        "rim": "cyan",
        "exprs": ["neutral", "freude", "besorgt"],
    },
    "hecki": {
        "look": "a slim, elegant gardener robot: a glossy white-and-sage-green enamel body like an upper-city luxury "
                "appliance, a small rounded head with one wide soft-green visor eye and a tiny straw sun hat, a green "
                "gardener's apron with seed packets (no text), one hand a pair of polished silver pruning shears, the "
                "other a delicate gripper holding a red rose trimmed into a heart shape, a rooftop garden with roses "
                "and lanterns in the bokeh",
        "rim": "pink",
        "special": "machine",
        "exprs": ["neutral", "freude", "besorgt"],
        "texts": {
            "neutral": "standing politely, visor eye glowing a calm soft green, head slightly tilted, holding the "
                       "heart-shaped rose at chest height",
            "freude": "delighted: offering the heart-shaped rose toward the viewer with a little bow, visor eye "
                      "curved into a happy arc and glowing brighter",
            "besorgt": "worried: visor eye dimmed and flickering amber, head bowed, looking at a wilted rose in its "
                       "gripper, shears lowered",
        },
    },
})
# Fehlende Figuren a–g (art-fig-a): erfundene Gesichter, Identität nur aus dem gemalten Porträt.
# bijou: special "robot" (Roboterpudel) mit eigenen Texten, fx-60: special "machine" (Faxgerät auf Ketten).
PHOTO.update({
    "falke": {
        "look": "a lean, wiry man in his early thirties with an invented face (not a real person), pale skin, sharp "
                "hawk-like nose, hollow cheeks, close-cropped ash-blond hair, narrow squinting grey eyes, a small round "
                "cyan-glowing cyber scope lens implanted over his right eye; a sleek white armored sniper suit with "
                "violet light seams and a small abstract violet geometric emblem (no text), a dark grey hooded "
                "camouflage scarf around neck and shoulders, the strap of a slung white rifle across the chest",
        "rim": "cyan",
        "sig": "deadpan, squinting past the camera into the distance through his glowing scope eye, lips moving "
               "slightly as if silently counting seagulls",
        "exprs": ["neutral", "besorgt", "signatur"],
    },
    "elsa": {
        "look": "a wiry old woman in her early seventies with an invented face (not a real person), sun-tanned "
                "weathered skin with deep laugh lines, sharp clear blue eyes, long silver-white hair in a loose braid "
                "under a faded red headscarf, brass magnifier goggles pushed up on her forehead, a grease smudge on "
                "one cheek; a patched khaki work shirt with rolled-up sleeves, a heavy brown leather apron full of "
                "tool pockets, a dusty turquoise neck scarf, a little desert dust in the warm night air",
        "rim": "pink",
        "sig": "tinkerer's triumph: goggles pulled down over one eye, holding up a small repaired gadget with sparks "
               "fading, a crooked satisfied grin",
        "exprs": ["neutral", "freude", "trauer", "signatur"],
    },
    "glasblaeserin": {
        "look": "a strong woman in her mid forties with an invented face (not a real person), olive-brown skin, a few "
                "small burn scars on her forearms, dark curly hair tied up under a rust-orange bandana, calm dark "
                "eyes, dark tinted protective goggles pushed up on her head, a necklace of glass beads glittering in "
                "many colors; a heavy scorched brown leather glassblower's apron over sand-colored layered desert "
                "clothes, a long cream scarf, warm orange furnace glow mixing into the neon light",
        "rim": "pink",
        "sig": "holding a long glassblowing pipe up beside her face, a glowing orange molten glass bulb at its end "
               "lighting her calm, proud face from below",
        "exprs": ["neutral", "freude", "besorgt", "signatur"],
    },
    "fraeulein-pixel": {
        "look": "a slim woman around forty with an invented face (not a real person), pale skin, a sleek pink bob "
                "with a blunt straight pink fringe, a jeweler's loupe monocle in front of her left eye, precise red "
                "lipstick, a beauty mark; a mint-green vintage blouse with a big floppy bow at the collar under a "
                "cropped black cardigan, black fingerless lace gloves with inky fingertips, an old instant camera on a "
                "strap around her neck",
        "rim": "pink",
        "sig": "raising the instant camera to her eye and aiming it at the viewer, the other eye behind the loupe "
               "monocle, a cool practiced 'smile please' smirk",
        "exprs": ["neutral", "freude", "besorgt", "signatur"],
    },
    "chrome-haushaelterin": {
        "look": "a prim woman in her mid sixties with an invented face (not a real person), upright posture, silver "
                "hair in a perfect French twist, sharp curious eyes, thin lips; a classic black housekeeper's dress "
                "with a starched white collar and cuffs, a crisp white apron, a small gold-and-white brooch, an "
                "elegant penthouse at night behind her as soft white-gold bokeh",
        "rim": "cyan",
        "sig": "whispering gossip: leaning in, one hand raised beside her mouth, eyebrows high, eyes glittering "
               "with a juicy secret",
        "exprs": ["neutral", "freude", "signatur"],
    },
    "bijou": {
        "look": "a real-looking small luxury robot poodle (a machine, not a living animal), the size of a toy "
                "poodle: polished mirror-chrome body in the classic poodle grooming shape, pompom 'curls' of fine "
                "curled chrome feather-springs on the head, the long ears, the chest and the tail tip, slender chrome "
                "legs, big glossy round blue LED eyes, a small black nose, a pink velvet collar with a bow and a pink "
                "heart-shaped tag, neon reflections running over the chrome",
        "rim": "pink",
        "special": "robot",
        "exprs": ["neutral", "freude", "wut"],
        "texts": {
            "neutral": "sitting primly upright, nose slightly raised, blue LED eyes glowing calmly, ears hanging "
                       "neatly, pampered and a bit snooty",
            "freude": "happy: front paws lifted in a little hop, ears flying, tail pompom wagging, blue LED eyes "
                      "curved into happy arcs",
            "wut": "offended: yapping with its little chrome jaw open, chrome curls bristling, LED eyes glowing an "
                   "indignant pink-red, small but furious, not attacking the viewer",
        },
    },
    "fx-60": {
        "look": "a real-looking old retro-futuristic office assistant machine from 2061: a boxy beige-and-grey fax "
                "machine body with a paper tray, a long curling strip of fax paper with blurred unreadable printed "
                "lines hanging out of the front slot, a small round green-glowing camera eye on a short bendy metal "
                "stalk, a cracked little green LCD strip, a curly-cord telephone handset clipped to its side, "
                "scratches and dust, standing on small stubby black rubber tank treads in a dim vault with rusty "
                "pipes in the background bokeh",
        "rim": "cyan",
        "special": "machine",
        "exprs": ["neutral", "freude", "wut"],
        "texts": {
            "neutral": "idle: the green camera eye glows calm and steady, a short strip of paper slowly feeding out",
            "freude": "happy: the camera eye stalk leans toward the viewer glowing bright warm green, a long joyful "
                      "ribbon of paper curling out of the slot, the LCD strip blinking",
            "wut": "error mode: the camera eye glows hard red, the LCD strip flashing red, a crumpled paper jam "
                   "bulging from the slot, a small puff of smoke",
        },
    },
    "direktorin-hartlauf": {
        "look": "a stern woman in her early sixties with an invented face (not a real person), short-cropped "
                "steel-grey hair, a firm mouth, tired but unbroken grey eyes, reading glasses on a beaded chain "
                "around her neck; a faded teal-grey company blazer with a small blank round emblem pin (no text), a "
                "white blouse buttoned to the collar, a lanyard with an old blank key card",
        "rim": "cyan",
        "sig": "holding up a framed formal rejection letter (text blurred and unreadable) beside her face with bitter "
               "irony, one eyebrow raised over the reading glasses",
        "exprs": ["neutral", "wut", "trauer", "signatur"],
    },
    "bruder-kabellos": {
        "look": "a gaunt man in his late fifties with an invented face (not a real person), intense pale-blue eyes, "
                "a wild grey beard and long unkempt grey hair, hollow cheeks; a monk-like hooded robe roughly sewn "
                "from blue and grey plastic tarps, crinkled tin foil lining the hood, a long black charging cable "
                "looped around his neck like a rosary with a dangling plug as pendant",
        "rim": "cyan",
        "sig": "preaching radio silence: one finger raised to the sky, mouth open mid-sermon, eyes burning with "
               "conviction, the charging-cable rosary clutched in the other hand",
        "exprs": ["neutral", "wut", "besorgt", "signatur"],
    },
    "dj-lumo": {
        "look": "a lanky young man in his mid twenties with an invented face (not a real person), dark-brown skin, a "
                "high-top fade with neon-blue tips, a thin moustache, relaxed half-closed eyes, big chunky over-ear "
                "headphones worn half on (one ear uncovered); a jacket patched together from colorful old record "
                "sleeves (abstract graphics, no text) over a black t-shirt, a glowing cyan LED wristband",
        "rim": "pink",
        "sig": "lost in the music: eyes closed, one hand pressing the headphone to his ear, head nodding, a black "
               "vinyl record held up in the other hand",
        "exprs": ["neutral", "freude", "ueberrascht", "signatur"],
    },
    "bruno-brecher": {
        "look": "a huge, broad-chested bouncer in his forties with an invented face (not a real person), built like a "
                "wardrobe, thick neck, shaved head, heavy brow, short black beard, light-brown skin, a small earpiece "
                "in one ear, simple dot tattoos on the knuckles (no letters); a deep burgundy velvet blazer straining "
                "at the shoulders over a black turtleneck, a thin gold chain, arms crossed over the chest",
        "rim": "pink",
        "sig": "panic: a rat has appeared, the giant bouncer flinches back with wide terrified eyes, both hands "
               "raised, mouth open in a silent yelp",
        "exprs": ["neutral", "wut", "signatur"],
    },
    "dr-winkel": {
        "look": "a wiry man in his fifties with an invented face (not a real person), slicked-back dark hair with grey "
                "temples, a thin pencil moustache, big black horn-rimmed glasses, a polka-dot red bow tie; a "
                "slightly shiny worn brown three-piece suit, a gold pocket-watch chain, a stack of empty office file "
                "folders under one arm",
        "rim": "cyan",
        "sig": "oily lawyer's pitch: leaning in with a too-eager smile, one finger raised as if quoting a paragraph, "
               "eyebrows wiggling above the horn-rimmed glasses",
        "exprs": ["neutral", "freude", "besorgt", "signatur"],
    },
    "frau-takt": {
        "look": "a lean, strict woman in her fifties with an invented face (not a real person), sharp angular face, "
                "thin lips, dark hair in a severe low bun, piercing eyes; a dark navy station-master uniform jacket "
                "with brass buttons and red piping, a red station-master cap with a black visor, a bundle of many "
                "silver stopwatches on chains around her neck, a silver whistle",
        "rim": "cyan",
        "sig": "holding up one silver stopwatch at eye level and clicking it, glaring over it at the viewer, lips "
               "pressed: 'you are late'",
        "exprs": ["neutral", "wut", "freude", "signatur"],
    },
    "gerda-gleis": {
        "look": "a small, round old woman around seventy with an invented face (not a real person), short white "
                "curly hair, kind tired eyes behind reading glasses perched on her nose, rosy cheeks; a long cosy "
                "grey-blue knitted cardigan over a cream blouse, a railway-red neckerchief, a lanyard full of little "
                "blank paper luggage tags",
        "rim": "pink",
        "sig": "pressing a wooden rubber stamp onto a lost-property tag with gentle ceremony, smiling warmly over her "
               "glasses at the viewer",
        "exprs": ["neutral", "freude", "trauer", "signatur"],
    },
    "barista-perle": {
        "look": "a woman around thirty with an invented face (not a real person), warm light-brown skin, expressive "
                "dark eyes, dark hair in a messy top knot with a silver coffee spoon stuck through it, big round "
                "pearl earrings, a tiny pearl necklace; a cream barista apron over a black shirt with rolled-up "
                "sleeves, a little milk-foam stain, warm café steam in the light",
        "rim": "pink",
        "sig": "presenting a steaming cup with perfect latte art at chest height with a theatrical singer's flourish, "
               "eyes half closed, a knowing smile",
        "exprs": ["neutral", "freude", "besorgt", "signatur"],
    },
    "fluss-frieda": {
        "look": "a sturdy woman in her late forties with an invented face (not a real person), weathered freckled "
                "face, red-brown hair in two thick braids, a headlamp strapped around her head, cheerful squint; "
                "olive-green rubber chest waders with suspenders over a navy-and-white striped sailor shirt, a patched "
                "yellow oilskin jacket worn open, damp sewer tunnel with blue-green glowing mushrooms in the bokeh",
        "rim": "cyan",
        "sig": "smelling the sea: eyes closed, face tilted up, nostrils wide, a dreamy longing smile, one hand on a "
               "long wooden punting pole",
        "exprs": ["neutral", "freude", "signatur"],
    },
    "frau-klingel": {
        "look": "a tiny old lady around eighty with an invented face (not a real person), slightly hunched, white hair "
                "in a bun tied with a black ribbon, bright lively eyes, a big old brass hearing implant behind her "
                "right ear with a small antenna glowing orange; a black lace widow's shawl over a long dark-green coat "
                "with many little brass bells sewn on, a string of bells across her chest",
        "rim": "pink",
        "sig": "humming along to the radio in her ear implant: eyes closed, head swaying, one finger tapping the "
               "glowing brass implant, a little brass hand bell raised in the other hand",
        "exprs": ["neutral", "freude", "trauer", "signatur"],
    },
    "gutschein-gerd": {
        "look": "a thin man in his forties with an invented face (not a real person), a too-wide toothy grin with one "
                "gold tooth, gelled dark-blond hair with a sharp side parting, clean-shaven, shifty eyes; a shiny "
                "lilac suit several sizes too big with drooping shoulders, a loud zigzag-pattern tie, a cheap gold "
                "watch",
        "rim": "pink",
        "sig": "fanning out a handful of glossy blank coupons toward the viewer like a winning poker hand, winking, "
               "the gold tooth flashing",
        "exprs": ["neutral", "freude", "ueberrascht", "signatur"],
    },
})
ROBOT_TEXT = {
    "neutral": "sitting upright, head tilted slightly, visor glowing a calm steady amber, ears up, attentive and "
               "loyal",
    "freude": "happy: leaning forward eagerly, ears perked high, visor glowing bright warm yellow, the antenna tail "
              "wagging so fast it throws a few tiny sparks",
    "wut": "alert guard mode: low stance, ears flat back, visor glowing hard red, a protective growl, not attacking "
           "the viewer",
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
    if expr in c.get("texts", {}):  # eigene Ausdruckstexte je Figur (art-fig-b: Maschinen)
        return c["texts"][expr]
    if c.get("special") == "hologram":
        return HOLO_TEXT[expr]
    if c.get("special") == "plush":
        return PLUSH_TEXT[expr]
    if c.get("special") == "robot":
        return ROBOT_TEXT[expr]
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
    elif special == "robot":
        who = (f"Subject: {subject(cid)}, sitting on wet dark ground. A real photograph of a real, physical robot "
               "dog (metal, scratched paint, rubber hoses, real reflections), not a living animal, not a drawing and "
               "not a person; the head fills the upper third of the frame, the body down to the front paws below "
               "it, camera at the dog's eye level")
    elif special == "machine":  # art-fig-b: Roboter ohne Tiergestalt (mixi, opa-blech, krabbe-karl)
        who = (f"Subject: {subject(cid)}. A real photograph of a real, physical robot (metal, scratched paint, "
               "rubber hoses, real reflections), not a person, not an animal and not a drawing; match the shape, "
               "colors and details of the painted references exactly; the robot's head or eyes sit in the upper "
               "third of the frame, camera at the robot's eye level")
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
