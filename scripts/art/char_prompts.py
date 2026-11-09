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
        "walk": True,  # Laufblatt für die Karte (watschelnder Plüschhase, char_config/captain-kuschel.json)
        "prop": True,
        "special": "plush",
    },
}

# Generische Laufblätter (Passanten und Kartengegner, design/plan/sprites-generic.md): keine bekannten Figuren,
# keine Porträts, keine privaten Referenzen. Stilreferenz ist ein vorhandenes Rohlaufblatt (nur Stil/Aufbau).
# body: human (Standard), quadruped (Ratte, Robohund), hover (Drohne). Höhe über char_config/<id>.json.
GENERIC_STYLE_REFS = ["dante-walk.png", "wache-walk.png"]
GENERIC: dict[str, dict] = {
    "passant-punk": {"desc": "adult punk passer-by, lanky, tall spiky neon-green mohawk, silver nose ring, ripped black "
                     "leather jacket covered in silver studs and blank colored patches, torn red tartan trousers, "
                     "hanging chains, battered black combat boots"},
    "passant-arbeiterin": {"desc": "adult woman, sturdy dock and factory worker, short brown hair under a scuffed "
                           "yellow hard hat, orange high-visibility vest with grey reflective stripes over a dark grey "
                           "work coverall, brown leather tool belt with wrenches, thick work gloves, steel-toe boots, "
                           "a dented thermos flask in one hand"},
    "passant-kurier": {"desc": "young adult male bike courier on foot, slim, backwards black cap, headset with a small "
                       "microphone, cyan reflective windbreaker, a big boxy black delivery backpack with a glowing "
                       "cyan strip, black shorts over leggings, chunky white sneakers"},
    "passant-oma": {"desc": "elderly woman, small and slightly hunched, white-grey hair in a tidy bun, round glasses, "
                    "a small glowing cyan hearing implant behind one ear, purple raincoat, floral headscarf around the "
                    "neck, sensible brown shoes, a string shopping bag with leeks and a baguette in one hand"},
    "passant-anzug": {"desc": "adult upper-city businessman, slick back combed blond hair, thin glowing AR visor "
                      "glasses, immaculate tailored white-and-silver suit with a violet tie, polished shoes, a slim "
                      "silver briefcase in one hand, arrogant upright posture"},
    "passant-tourist": {"desc": "adult male tourist from the upper city, a bit chubby, sunburnt, wide straw sun hat, "
                        "loud neon-pink and teal flower-pattern short-sleeve shirt, beige shorts, white socks in "
                        "sandals, a fanny pack, a big vintage camera hanging from his neck"},
    "passant-strassenhaendler": {"desc": "middle-aged male street-food vendor, stocky, stubble, red bandana on his "
                                 "head, stained white apron over a black t-shirt, a vendor tray on a shoulder strap in "
                                 "front of his belly with glowing skewers and steaming paper cups, black trousers, "
                                 "worn sneakers"},
    "passant-kanalvolk": {"desc": "adult sewer dweller, scruffy beard, cheerful, a patched rain poncho sewn from blue "
                          "and green tarps, a knitted scarf, a headlamp on a woolly hat, tall rubber waders, a small "
                          "glass jar lantern with glowing blue mushrooms hanging from one hand"},
    "passant-schrotti": {"desc": "wiry adult scrap collector, sharp face, welding goggles pushed up on the forehead, "
                         "oil-stained olive overall with torn-off sleeves, wrist wraps, a big lumpy sack full of "
                         "scrap metal over one shoulder, heavy boots"},
    "abzieher": {"desc": "young adult small-time street mugger, lean, grey hoodie with the hood up, a dark bandana "
                 "over mouth and nose, a cheap red-glowing cyber eye, black track pants with white side stripes, "
                 "white sneakers, brass knuckles on one fist, shifty sneaking posture"},
    "zerleger": {"desc": "adult man, gang member of a back-alley implant chop shop: a stained grey butcher apron "
                 "over black clothes, a black respirator half mask, brass goggles with round yellow lenses, a green "
                 "cross armband, long black rubber gloves; his right forearm ends in a big hydraulic metal grabbing "
                 "claw, heavy black boots, menacing hunched walk"},
    "rostzahn-schlaeger": {"desc": "adult gang thug of the Rust Teeth gang, broad shoulders, rust-orange dyed spiky "
                           "hair, a grin full of rusty metal teeth, sleeveless faded denim vest with a rust-orange "
                           "tooth emblem painted on the back (no text), bare tattooed arms, a glowing orange chain "
                           "whip wrapped around one fist, black cargo pants, scuffed boots"},
    "quantum-wachmann": {"desc": "adult corporate security guard of the Quantum corporation: sleek glossy white "
                         "armored uniform with violet light seams, a closed white helmet with a dark violet visor, a "
                         "small abstract violet geometric emblem on the chest (no text), black gloves, a compact "
                         "white shock rifle with a violet glow held at the ready, white boots"},
    "ordnungshueter": {"desc": "adult city police officer, dark navy blue riot uniform with yellow reflective stripes, "
                       "light body armor vest, a navy helmet with a raised clear visor, a silver badge on the chest "
                       "(no text), a black baton in one hand, black boots, stern square posture"},
    "kanalratte": {"body": "quadruped",
                   "desc": "an oversized sewer rat (size of a small dog, cartoonish but nasty), mangy grey-brown fur, "
                           "a long naked pink tail, big yellow buck teeth, small glowing red eyes, one ear torn with "
                           "a tiny cyber implant, a grumpy offended face"},
    "spaeherdrohne": {"body": "hover",
                      "desc": "a small Quantum scout drone: compact round glossy white body with violet light seams, "
                              "one big camera eye with a glowing red lens, four small ducted rotors on short arms, a "
                              "thin antenna on top, no legs, floating"},
    "robohund": {"body": "quadruped",
                 "desc": "a decommissioned Quantum robot guard dog: lean quadruped about knee high, scratched white "
                         "and grey armor plates with peeling paint and rust spots, exposed black hydraulic legs, a "
                         "metal jaw with steel teeth, a glowing red visor strip as eyes, a short antenna tail"},
}
for _gid, _g in GENERIC.items():
    CHARACTERS.setdefault(_gid, {"rim": "cyan", "mood": "", "portraits": [], "generic": True, **_g})

# Neue Akt-1-Figuren ohne Kostümreferenz (art-a): Stilreferenz ist eine Kostümfigur mit ähnlichem Körperbau
# (work/char_refs.json "unique:<id>", Kopie unter work/refs). Nur der Zeichenstil wird übernommen.
_STYLE_ONLY = (". STYLE NOTE: any reference image that shows a different-looking person is a STYLE reference only: "
               "copy only its drawing style (ink outlines, painterly shading, natural proportions, level of detail), "
               "never its face, hair, clothing or colors; a reference that shows exactly this character gives face "
               "and costume")
CHARACTERS.update({
    "dexter": {  # neu: Schrotthändler und Drohnenbastler, ewig pleite
        "desc": "lanky, slightly hunched man in his late thirties, light skin with freckles, messy dark-blond hair "
                "sticking out in all directions, patchy stubble, a nervous hopeful grin, round brass welding goggles "
                "hanging around his neck; oversized mustard-yellow work jacket covered in mismatched patches and "
                "silver duct-tape repairs, faded orange hoodie underneath, a tool belt with screwdrivers and a small "
                "drone remote control clipped to it, grease-stained brown cargo pants, mismatched sneakers (one red, "
                "one green)" + _STYLE_ONLY,
        "mood": "nervous, apologetic, hopeful grin of someone who owes everybody money",
        "rim": "cyan",
    },
    "babette-bao": {  # neu: Garküche „Bao Babette“, mütterlich-resolut
        "desc": "sturdy, broad-shouldered, plump East Asian woman in her mid fifties, round rosy cheeks, warm but "
                "stern dark eyes, black hair with grey streaks in a tight bun held by two wooden chopsticks; a teal "
                "quilted cook's jacket with sleeves rolled up to the elbows, a long white apron with a few sauce "
                "stains tied over it, a checkered kitchen towel over one shoulder, black trousers, black rubber "
                "kitchen clogs; holds a big wooden cooking ladle" + _STYLE_ONLY,
        "mood": "motherly, no-nonsense, a warm knowing smile",
        "rim": "pink",
    },
    "opa-gustav": {  # neu: alter Schrotthändler mit Kran
        "desc": "stocky old man in his mid seventies, slightly bow-legged, bald head with a white fringe of hair, "
                "bushy white walrus moustache, ruddy round nose, bright friendly eyes with laugh lines; faded blue "
                "mechanic's overalls with rust and oil stains and sleeves rolled up, a worn brown leather vest over "
                "them, a red bandana knotted around the neck, an old analog wristwatch, a small brass oil can in the "
                "chest pocket, heavy brown work boots" + _STYLE_ONLY,
        "mood": "cozy, nostalgic, gentle grandfather smile",
        "rim": "cyan",
    },
    "oma-volt": {  # Kioskbesitzerin Volt-Eck, näht alles
        "desc": "small, slightly round old woman in her mid seventies, short permed silver-white curls with a faint "
                "lavender tint, big round tortoiseshell glasses on a beaded chain, sharp knowing eyes, bright coral "
                "lipstick; a long quilted lilac cardigan with many pockets over a dark-green flower-print dress that "
                "reaches below the knee, a yellow measuring tape around her neck, a red pincushion strapped to her "
                "left wrist, a small glowing cyan lightning-bolt brooch, thick beige stockings, sturdy brown "
                "orthopedic shoes" + _STYLE_ONLY,
        "mood": "sharp-tongued but warm, one eyebrow raised, amused",
        "rim": "cyan",
    },
    "kiki-karbon": {  # neu: Schwebetaxi-Fahrerin um die dreißig, schnell und laut
        "desc": "athletic woman around thirty, warm dark-brown skin, short asymmetric neon-orange bob with shaved "
                "sides, gold aviator sunglasses pushed up on her head, a small radio headset with a microphone arm at "
                "her cheek, big confident grin; a glossy yellow pilot bomber jacket with a black-and-white checker "
                "stripe on the sleeves worn over a black high-neck top that fully covers her stomach, black "
                "fingerless driving gloves, dark-grey cargo pants with a key ring and a tiny rotor charm on the belt "
                "loop, chunky white high-top sneakers" + _STYLE_ONLY,
        "mood": "loud, fast-talking, cheeky gossip grin",
        "rim": "pink",
    },
    "lio-funkel": {  # neu: Straßenmusiker Ende zwanzig mit Synth-Akkordeon
        "desc": "slim young man in his late twenties, medium-brown skin, chin-length straight black hair with a "
                "few teal strands tucked behind his ears, soft dreamy brown eyes, light stubble, a small silver hoop "
                "earring; a long faded burgundy patchwork coat with colorful patches, a chunky mustard-yellow knitted "
                "scarf, a grey henley shirt, dark jeans, worn brown boots; a compact synth accordion strapped to his "
                "chest with glowing cyan keys and small LED lights along the black bellows" + _STYLE_ONLY,
        "mood": "dreamy, gentle, honest little smile",
        "rim": "cyan",
    },
})

# Neue Akt-1-Figuren ohne Kostümreferenz (art-b): Stilreferenz sind Rohbilder einer vorhandenen Figur mit ähnlichem
# Körperbau (Kopie als work/refs/character-unique-<id>[-portrait].png). Nur der Zeichenstil wird übernommen.
CHARACTERS.update({
    "marla-sand": {  # neu: Aussiedlerin und Karawanenhändlerin um die vierzig
        "desc": "sun-weathered woman around forty, tanned skin with laugh lines and crow's feet, calm light-grey eyes, "
                "long ash-brown hair with a few grey strands in one thick side braid, a faded rust-red scarf loosely "
                "wrapped around her neck, brass aviator dust goggles hanging at her collarbone; a long sand-beige "
                "duster coat, worn and patched at the hem, over an olive linen shirt, a woven caravan sash in "
                "turquoise and orange zigzag pattern around the waist, a brown leather belt with a dented metal "
                "water flask and pouches, khaki trousers tucked into tall scuffed brown boots; carries a tall wooden "
                "walking staff with a small brass dowsing tip and a few colorful wind ribbons tied to the top"
                + _STYLE_ONLY,
        "mood": "calm, knowing, weathered half smile",
        "rim": "pink",
    },
    "pim-pinzette": {  # neu: junge Quantum-Laborassistentin, schüchtern (erwachsen, wirkt jung)
        "desc": "petite young adult woman in her early twenties, small and slight, short choppy black bob with "
                "straight bangs, big nervous eyes behind oversized round thick-rimmed glasses, a jeweler's magnifier "
                "loupe flipped up on one side of the glasses, a few freckles; a white lab coat one size too big with "
                "rolled-up sleeves, a lanyard with a blank white ID card (no text), a chest pocket full of tweezers "
                "and pens, a mint-green turtleneck sweater, grey slim trousers, white sneakers; holds a pair of fine "
                "silver tweezers" + _STYLE_ONLY,
        "mood": "nervous, apologetic little smile, shoulders slightly raised",
        "rim": "cyan",
    },
    "kaeptn-nebelhorn": {  # neu: alter Fährkapitän im Hafenbecken
        "desc": "broad, barrel-chested old sea captain in his sixties, ruddy weathered cheeks, a big bushy white "
                "beard and walrus moustache, bushy white eyebrows, small twinkling blue eyes; a navy-blue peaked "
                "captain's cap with a tarnished brass anchor badge (no text), a thick navy pea coat with two rows of "
                "brass buttons over a cream cable-knit fisherman's sweater, a red neckerchief, dark grey trousers, "
                "black rubber boots; a dented brass hand foghorn (trumpet-shaped horn with a red rubber bulb) hangs "
                "from a leather strap at his hip" + _STYLE_ONLY,
        "mood": "hearty, jovial, booming laugh about to burst out",
        "rim": "cyan",
    },
    "buergermeister-gully": {  # neu: selbsternannter Bürgermeister des Kanalvolks
        "desc": "pear-shaped man in his fifties with a round belly, balding head with a wild grey fringe and a sad "
                "comb-over, big grey mutton-chop sideburns, small round spectacles with one cracked lens, ruddy "
                "nose, a small headlamp strapped around his forehead; a ceremonial sash made of red-and-white "
                "striped barrier tape worn diagonally across the chest, a chain of office made of bottle caps with a "
                "big rusty washer as medallion, a stained, once-elegant burgundy tailcoat with mismatched buttons "
                "over a grubby mustard waistcoat, olive-green rubber chest waders with suspenders, rubber boots; "
                "holds a rusty toilet plunger like a royal scepter" + _STYLE_ONLY,
        "mood": "pompous, self-important, chin raised, about to give a speech",
        "rim": "pink",
    },
    "jimmy": {  # neu: Ex-Crewmitglied mit Virus auf dem Neurochip
        "desc": "lanky, thin young man in his mid twenties, messy bleached-blond hair with dark roots sticking up, "
                "stubble, tired dark circles under wide, slightly manic eyes, a small neurochip implant behind his "
                "right ear glowing with a flickering glitchy cyan-and-magenta light; a faded teal bomber jacket "
                "with orange lining and a few oil stains, worn open over a crumpled grey t-shirt with a simple "
                "smiley face graphic (no text), a black strap harness over the shirt, ripped dark jeans, "
                "mismatched sneakers (one red, one white)" + _STYLE_ONLY,
        "mood": "over-friendly customer-service grin that is a bit too wide, eyes slightly unfocused",
        "rim": "cyan",
    },
    "bolzen": {  # neu: ausgemusterter Quantum-Wachhund, Rudelalpha in der Brackbucht
        "desc": "a decommissioned corporate robot guard dog, size and silhouette of a lean shepherd dog: scuffed "
                "white-grey armor plates with a faded teal stripe (no logo, no text), dents and a few rust spots, "
                "exposed black hydraulic joints, one hind leg is a crude rusty makeshift replacement made of a pipe "
                "and a spring, a single wide visor band as eyes glowing warm amber, small triangular metal ears, a "
                "short segmented antenna tail with a tiny glowing tip, a dented red collar with a round metal tag; "
                "friendly and loyal, NOT menacing, no sharp teeth shown. It is an animal-like robot, not a person"
                + _STYLE_ONLY,
        "mood": "loyal, curious, head tilted, tail antenna wagging",
        "rim": "cyan",
    },
})

# Fehlende Figurenbilder r–z (art-fig-c): Stilreferenz ist eine Kostümfigur mit ähnlichem Körperbau
# (work/char_refs.json "unique:<id>"), nur Stil. wachmann-brezel: Kostüm aus dem generischen quantum-wachmann-Laufblatt,
# eigenes Laufblatt entfällt (NpcDef nutzt quantum-wachmann-walk). werbung: Hologramm, nur Porträt.
CHARACTERS.update({
    "rudi": {  # Diner-Wirt an der Staubstraße (Ödnis), Questgeber Akt 2
        "desc": "burly, broad-bellied man in his late fifties, sun-leathered tanned skin, shaved head with a sunburnt "
                "scalp, a thick grey horseshoe moustache, bushy grey eyebrows, friendly squinting eyes with deep "
                "crow's feet, a faded rust-red bandana knotted around his neck; a short-sleeved cream diner shirt with "
                "a turquoise collar and turquoise piping (no name tag, no text), a grease-stained white apron tied "
                "over it with a metal spatula tucked into the apron string, sand-colored work trousers, worn brown "
                "boots dusted with desert sand; holds a dented chrome coffee pot" + _STYLE_ONLY,
        "mood": "gruff but warm diner host, wry welcoming half smile",
        "rim": "pink",
    },
    "wachmann-brezel": {  # Quantum-Wachmann am Stufenplatz mit heiliger Brezelpause
        "desc": "chubby adult Quantum corporate security guard in his thirties, exactly the uniform of the attached "
                "guard sprite: sleek glossy white armored uniform with violet light seams, a small abstract violet "
                "geometric emblem on the chest (no text), black gloves; his white helmet with the dark violet visor "
                "is tucked under one arm, head uncovered: round friendly face, rosy cheeks, short ginger hair, a few "
                "crumbs on his chin; holds a big golden soft pretzel in the other hand" + _STYLE_ONLY,
        "mood": "on his sacred lunch break, mouth half full, mildly annoyed at being disturbed",
        "rim": "cyan",
        "walk": False,
    },
    "zellennachbarin": {  # Gitter-Gerda, Ravens alte Zellennachbarin (Zellentrakt)
        "desc": "tough, wiry woman in her mid fifties, grey buzz cut, weathered face with a crooked once-broken nose, "
                "a loud grin with one gold tooth, faded blue-black prison tattoos (stars, swallows, a spider web, no "
                "letters) covering both forearms and creeping up her neck to the jaw; a faded orange prison jumpsuit "
                "(no text, no numbers) with the top half tied around her waist, a plain grey t-shirt that fully "
                "covers her torso, white canvas prison slip-on shoes" + _STYLE_ONLY,
        "mood": "loud, cackling, delighted grin",
        "rim": "pink",
    },
    "salzige-grete": {  # Fischstand an der Hafenkante, Stimme wie ein Nebelhorn
        "desc": "big, broad-shouldered woman in her late forties, forearms as thick as ship ropes, ruddy wind-burnt "
                "cheeks, curly salt-and-pepper hair under a knitted navy watch cap, a small gold hoop in one ear; a "
                "long mustard-yellow rubber fisherman's apron over a navy-and-white striped long-sleeve shirt with the "
                "sleeves pushed up, thick orange rubber gloves, dark-green rubber boots; holds a big silver fish by "
                "the tail" + _STYLE_ONLY,
        "mood": "booming, cheerful foghorn laugh, mouth wide open",
        "rim": "cyan",
    },
    "sina-spray": {  # Graffiti-Künstlerin an der Wand der Freiheit (Flutmauer)
        "desc": "slim young woman in her early twenties, shoulder-length messy black hair with neon-pink and teal "
                "paint streaks, a black respirator half mask hanging around her neck, paint splatter up to the "
                "elbows on both forearms, a smudge of pink paint on one cheek; an oversized light-blue denim jacket "
                "covered in paint splatters and pin badges (no text) over a black hoodie, baggy olive cargo pants "
                "with paint stains, a tool belt full of spray cans, chunky black high-top sneakers with paint drips; "
                "a spray can in each hand" + _STYLE_ONLY,
        "mood": "fiery, rebellious, proud grin",
        "rim": "pink",
    },
    "stylistin-gina": {  # Salon am Stufenplatz, Silbermähne, lange Nägel, längere Wimpern
        "desc": "glamorous woman in her late fifties, a huge teased-up silver-white bouffant wig, very long false "
                "eyelashes, bold magenta eyeshadow, glossy pink lipstick, a beauty mark, long glittering gold "
                "acrylic nails; a pink-and-gold satin salon kimono jacket with a sequined collar over a black "
                "turtleneck, black slim trousers, gold heeled ankle boots; a comb and scissors in a small leather hip "
                "holster, a can of hairspray in one hand" + _STYLE_ONLY,
        "mood": "dramatic, appraising, one eye squinted, head tilted",
        "rim": "pink",
    },
    "turbo-tilda": {  # Drohnenrenn-Champion der Hafenkante
        "desc": "wiry, compact woman around forty, short spiky platinum hair with one shaved side, a freckled "
                "sun-tanned face, a cheeky gap-toothed grin, vintage brown leather aviator goggles pushed up on her "
                "forehead, a streak of soot on one cheek; a faded orange racing coverall zipped up to the collarbone "
                "with a black t-shirt underneath and sleeves rolled to the elbows, forearms covered in small tattoos "
                "of trophy cups (no text), black fingerless gloves, a chunky drone remote controller with two "
                "joysticks hanging from a strap around her neck, heavy black boots" + _STYLE_ONLY,
        "mood": "cocky racing champion grin",
        "rim": "cyan",
    },
    "vinyl-vincent": {  # Plattenhehler am Schrottmarkt
        "desc": "skinny, lanky man in his forties, long dark sideburns down to the chin, a slicked-back black "
                "pompadour with a grey streak, round dark sunglasses, a thin moustache; a worn brown corduroy jacket "
                "with elbow patches over a faded maroon turtleneck, dark flared trousers, pointed brown boots; holds "
                "a black vinyl record in a plain cardboard sleeve (no text) tenderly against his chest" + _STYLE_ONLY,
        "mood": "laid-back, melancholic music lover, faint knowing smile",
        "rim": "cyan",
    },
    "wett-willi": {  # Hütchenspieler am Schrottmarkt
        "desc": "wiry man in his fifties, slick dark comb-over under a grey flat cap, a thin pencil moustache, shifty "
                "twinkling eyes, a gold tooth in a too-charming smile; a white shirt with rolled-up sleeves and red "
                "suspenders, a loose black tie, grey pinstripe trousers, scuffed two-tone shoes; holds three "
                "stacked steel cups in one hand and a small red ball between two fingers of the other" + _STYLE_ONLY,
        "mood": "slick, too-charming hustler smile",
        "rim": "pink",
    },
    "werbung": {  # Absender der Werbe-SMS am Telefon: aufdringliches Werbe-Hologramm, kein Mensch, kein Laufblatt
        "desc": "an obnoxiously cheerful holographic advertising mascot of 2086: a glossy, plastic-looking smiling "
                "presenter with perfect white teeth, a slicked-back neon-pink pompadour, a shiny teal suit with "
                "a glowing star pin, giving a thumbs up next to his face" + _STYLE_ONLY,
        "mood": "aggressively cheerful sales grin, way too many teeth",
        "rim": "pink",
        "special": "hologram",
        "walk": False,
    },
    "staubbaron-broesel": {  # Akt 2, Ödnis: Wasser-Wucherer (kopfgeld-staubbaron-broesel, side-glasherz)
        "desc": "scrawny, weaselly man in his fifties with a self-made baron look: sunken cheeks, sly small eyes, a "
                "long thin waxed moustache, crooked yellowish teeth, a battered dusty top hat with brass goggles on "
                "the band, a sand-colored dust scarf; an oversized faded military greatcoat covered in desert dust, "
                "decorated with medals made of bottle caps and brass faucet handles, a wide belt with water pouches, "
                "dusty patched trousers, cracked leather boots; a dented jerrycan with a brass tap strapped to his "
                "back, holds a brass water ladle like a scepter" + _STYLE_ONLY,
        "mood": "greedy, smug, scheming grin",
        "rim": "pink",
    },
    "schlafwandler-ede": {  # Akt 2, Kanal-Schlafwandler (pers-delya-quelle), Beta-Chip-Opfer
        "desc": "stocky man in his sixties, bald with grey stubble, droopy eyelids, a small chip implant at his "
                "temple glowing faint violet; a patched yellow rain poncho over a faded striped pyjama shirt, striped "
                "pyjama trousers rolled up and wet at the hem, one green rubber boot and one brown house slipper"
                + _STYLE_ONLY,
        "mood": "sleepwalking, eyes glazed and half closed, blank vacant expression, faint dreamy smile",
        "rim": "cyan",
    },
    "schlafwandlerin-rosi": {  # Akt 2, Kanal-Schlafwandlerin (pers-delya-quelle), Beta-Chip-Opfer
        "desc": "plump woman in her forties, frizzy copper-red hair half in pink plastic curlers, a small chip implant "
                "at her temple glowing faint violet; a quilted pink dressing gown tied over a grey knitted sweater and "
                "grey leggings, fluffy slippers soaked with sewer water, holds a soup ladle" + _STYLE_ONLY,
        "mood": "sleepwalking, eyes glazed and half closed, blank vacant expression, mouth slightly open",
        "rim": "pink",
    },
    "schlafwandler-bert": {  # Akt 2, Kanal-Schlafwandler (pers-delya-quelle), Beta-Chip-Opfer
        "desc": "thin young office worker in his late twenties, messy brown hair, crooked glasses askew on his nose, "
                "a wireless headset still on one ear, a small chip implant at his temple glowing faint violet; a "
                "wrinkled white shirt half untucked, a loose blue tie, grey suit trousers with muddy knees, one black "
                "office shoe and one bare sock" + _STYLE_ONLY,
        "mood": "sleepwalking, eyes glazed and half closed, blank vacant expression, head tilted",
        "rim": "cyan",
    },
})

# Akt-2/3- und Weltfiguren h–q ohne Kostümreferenz (art-fig-b): Stilreferenz ist eine Kostümfigur mit ähnlichem
# Körperbau (Kopie als work/refs/character-unique-<id>[-portrait].png, danach eigenes Porträt). Nur Stil.
# walk False: Figur nutzt ein generisches Laufblatt (NpcDef.sprite), nur Porträt und Fotos.
_MACHINE_ONLY = (". It is a machine, not a person and not an animal; NO human face, NO dog")
CHARACTERS.update({
    "leutnant-nadel": {  # Xions Stellvertreterin, Quantum-Elite (Kopfgeld Stufe 3)
        "desc": "lean, wiry woman in her early thirties, pale skin, sharp angular face with high cheekbones, cold "
                "pale-grey eyes, a thin vertical scar through her left eyebrow, platinum-white hair in a severe short "
                "undercut slicked back; a fitted black high-collar Quantum tactical uniform with glossy white armor "
                "plates on shoulders and forearms and thin toxic-green light seams, a black strap harness, black "
                "cargo trousers, black boots; her right hand is a black cybernetic gauntlet ending in five long thin "
                "needle-like claws with glowing toxic-green tips" + _STYLE_ONLY,
        "mood": "cold, precise, contemptuous thin smile",
        "rim": "cyan",
    },
    "kraehe": {  # Anführerin der Staubfalken, Ehrenkodex, sammelt Geschichten
        "desc": "tall, rangy wasteland raider chieftain in her mid forties, sun-dark weathered skin, intense black "
                "eyes with black war-paint smeared across the eyes like a mask, long black hair in many thin braids "
                "threaded with crow feathers and small metal beads; a ragged mantle of black crow feathers over her "
                "shoulders, layered rust-brown leather armor with scavenged car-hood plates, a sand-colored dust scarf, "
                "brass driving goggles pushed up on her forehead, fingerless leather gloves, patched dark trousers, "
                "tall dusty boots; carries a long spear with a chain wrapped around the shaft" + _STYLE_ONLY,
        "mood": "proud, fierce, measuring the viewer, a faint challenging smile",
        "rim": "pink",
    },
    "opa-funk": {  # sendet Radio Rost aus der Funkturm-Ruine
        "desc": "wiry old man in his late seventies, deeply tanned wrinkled skin, a long scraggly grey beard and "
                "wild grey hair, small round green-tinted sunglasses, big old over-ear headphones around his neck "
                "with a coiled cable; a patched brown poncho with a small telescopic antenna sticking up from a "
                "pocket, a faded red Hawaiian-pattern shirt underneath, a belt with radio tubes and a handheld "
                "microphone on a cord, baggy khaki trousers, worn sandals over thick wool socks" + _STYLE_ONLY,
        "mood": "warm, crackly old radio-host grin, a little mischievous",
        "rim": "pink",
    },
    "paul": {  # Oma Volts Neffe, ab Akt 2 Beta-Chip-Träger
        "desc": "slim young man of twenty-three, light skin, short neat ginger hair parted on the side, freckles, a "
                "polite eager smile, a small silver chip implant behind his right ear; a beige zip jacket with a "
                "blank white sewn-on name tag on the chest (no text), a green knitted sweater vest over a white "
                "collared shirt, dark-blue chinos, clean brown sneakers, a cheap phone in one hand" + _STYLE_ONLY,
        "mood": "polite, eager to please, slightly awkward smile",
        "rim": "cyan",
    },
    "pfeffer": {  # Quantum-Wachmann, Vater von Mila
        "desc": "big, broad-shouldered man in his early forties with a soft belly, light-olive skin, short dark hair "
                "greying at the temples, a thick dark moustache, kind tired brown eyes; a white Quantum security "
                "uniform with violet light seams and white shoulder armor, the helmet carried under one arm, a "
                "small abstract violet geometric emblem on the chest (no text), a black utility belt, white boots; a "
                "tiny pink hair clip of his daughter clipped to his breast pocket" + _STYLE_ONLY,
        "mood": "good-natured, tired dad smile",
        "rim": "cyan",
    },
    "quantum-fahrer": {  # Mann im Quantum-Anzug (Lückenfigur, generisches Laufblatt)
        "desc": "tall, stiff man in his forties, light skin, square jaw, clean-shaven, black hair cut very short, "
                "dark mirrored sunglasses, a thin earpiece cable; a dark-violet chauffeur suit with a high collar and "
                "silver piping, a peaked chauffeur cap with a small abstract silver emblem (no text), white gloves"
                + _STYLE_ONLY,
        "mood": "expressionless, professional, slightly arrogant",
        "rim": "cyan",
        "walk": False,
    },
    "krabbe-karl": {  # Strandreinigungsroboter in Krabbenform (das-meer)
        "desc": "a small beach-cleaning robot shaped like a crab, about knee high: a rounded orange-red enamel shell "
                "body with scuffs and a few barnacles, six thin jointed metal legs, two big friendly pincer claws (one "
                "holding a pearly seashell), two round camera eyes on short stalks glowing friendly cyan, a small "
                "mesh sand-sieve basket on its back with collected shells, a tiny blinking antenna" + _MACHINE_ONLY
                + _STYLE_ONLY,
        "mood": "cheerful, curious, eye stalks tilted",
        "rim": "cyan",
    },
    "herr-glanz": {  # Verkäufer im Quantum-Schauraum
        "desc": "slick salesman in his early thirties, light skin with a fake tan, impossibly white perfect teeth in "
                "a huge grin, platinum-blond hair sculpted into a glossy wave, a thin violet AR monocle over one eye, "
                "a tiny headset microphone; a pearl-white tailored suit with violet satin lapels and thin violet "
                "light seams, a glowing violet abstract pin on the lapel (no text), a lilac shirt, white loafers; "
                "holds a slim glowing tablet" + _STYLE_ONLY,
        "mood": "dazzling, overly friendly sales grin",
        "rim": "pink",
    },
    "portier-albert": {  # Portier am Chrome Tower
        "desc": "tall, very upright elderly doorman in his late sixties, light skin, long dignified face, neatly "
                "trimmed white mutton-chop sideburns, a stern raised chin; a long burgundy livery coat with gold "
                "braiding, gold buttons and epaulettes, a matching burgundy top hat with a gold band, spotless white "
                "gloves, black trousers with a gold stripe, shiny black shoes" + _STYLE_ONLY,
        "mood": "impeccably polite, faintly disapproving",
        "rim": "pink",
    },
    "mila": {  # Pfeffers Tochter (8), nur Freundschaft
        "desc": "small girl about 8 years old, light-olive skin, big brown eyes, dark-brown hair in two bushy "
                "pigtails with pink hair clips, a gap-toothed smile; an oversized yellow raincoat with the sleeves "
                "rolled up, a striped pink-and-white t-shirt, denim overall shorts over black leggings, red rubber "
                "boots, a small backpack with a sewn-on bunny face" + _STYLE_ONLY,
        "mood": "curious, cheerful, gap-toothed grin",
        "rim": "pink",
        "child": True,
    },
    "madame-satin": {  # Boutique „Satin & Chrom“
        "desc": "elegant, flamboyant woman in her late fifties, light skin, a sharp platinum-silver bob haircut, "
                "dramatic cat-eye glasses with chrome frames, dark-red lipstick; a long emerald-green satin coat with "
                "polished chrome shoulder pieces and a high collar, a black silk blouse buttoned up, many chrome "
                "bangles, black wide trousers, black heeled boots; holds a long thin chrome e-cigarette holder"
                + _STYLE_ONLY,
        "mood": "grand, theatrical, sharply amused",
        "rim": "pink",
    },
    "kabelbrand-roadie": {  # „Schrammel“, Roadie mit Kabelbrand-Tattoo (Lückenfigur, generisches Laufblatt)
        "desc": "burly roadie in his thirties, light skin, shaved head, a thick ginger beard, a tattoo of a burning "
                "cable coiling up his neck and forearm, a lip ring; a faded black band t-shirt with a lightning skull "
                "graphic (no text) under a black work vest full of cable ties, a roll of silver gaffer tape on his "
                "belt, black cargo shorts, black boots, a coil of cable over one shoulder" + _STYLE_ONLY,
        "mood": "gruff, sweaty, crooked grin",
        "rim": "pink",
        "walk": False,
    },
    "hafen-hannes": {  # Hafenarbeiter mit Greifarm
        "desc": "huge, barrel-chested dock worker in his fifties, ruddy light skin, a grey stubble beard, a broken "
                "nose, small kind eyes; a scuffed yellow hard hat, an orange high-visibility vest over a navy "
                "thermal shirt, dark work trousers, steel-toe boots; his LEFT arm is a big heavy industrial "
                "hydraulic grab-arm prosthesis with a yellow-black striped claw and exposed pistons, his right arm is "
                "human and tattooed with an anchor" + _STYLE_ONLY,
        "mood": "gentle giant, shy friendly smile",
        "rim": "cyan",
    },
    "henk-angler": {  # Leuchtturmwärter und Angler an der Flutmauer
        "desc": "lean, weathered old man in his late sixties, light skin tanned by wind, a short white beard, "
                "bright pale-blue eyes with deep crow's feet; a dark-blue knitted fisherman's beanie, a yellow "
                "oilskin raincoat worn open over a thick grey roll-neck sweater, dark wading trousers with suspenders, "
                "tall green rubber boots; carries a long fishing rod with a small glowing lure and a tin bait box"
                + _STYLE_ONLY,
        "mood": "calm, laconic, a quiet salty smile",
        "rim": "cyan",
    },
    "herr-blitz": {  # Besitzer „Schwebetaxi Blitz“, Halunke im Hintergrund
        "desc": "wiry man in his fifties, light skin, slicked-back jet-black hair, a thin pencil moustache, shifty "
                "narrow eyes, a gold tooth; a shiny electric-blue suit a size too tight, a yellow shirt, a gold "
                "lightning-bolt tie pin on a black tie, a chunky gold watch and rings, pointy black shoes, a car key "
                "fob spinning on one finger" + _STYLE_ONLY,
        "mood": "smarmy, shifty salesman smile",
        "rim": "pink",
    },
    "knuspi": {  # Nougatbomben-Schmuggler an der Hafenkante
        "desc": "chubby young man in his mid twenties, warm brown skin, round cheerful face, chocolate smudge on the "
                "chin, a red knitted beanie; a long, far too big brown trench coat with dozens of bulging inner "
                "pockets stuffed with glossy candy bars, a mustard hoodie underneath, baggy grey trousers, worn "
                "sneakers" + _STYLE_ONLY,
        "mood": "conspiratorial, sweet-toothed grin",
        "rim": "pink",
    },
    "knut": {  # älterer Abzieher-Bruder
        "desc": "tall, lanky young man around twenty-five, light skin, a blond buzz cut, a long thin face with a "
                "big nose, one gold tooth; a shiny purple tracksuit with white side stripes zipped up, a fake gold "
                "chain, white sneakers, a backwards black cap; looks like the older brother of a shorter guy in the "
                "same tracksuit" + _STYLE_ONLY,
        "mood": "cocky, small-time tough-guy smirk",
        "rim": "cyan",
    },
    "kurt": {  # jüngerer Abzieher-Bruder („Das sag ich meiner Mama!“)
        "desc": "short, pudgy young man around twenty, light skin, blond hair in a bowl cut, a round baby face with "
                "a big nose, pouting lips; a shiny purple tracksuit with white side stripes several sizes too big, "
                "sleeves covering half the hands, a fake gold chain, white sneakers; looks like the younger brother "
                "of a tall lanky guy in the same tracksuit" + _STYLE_ONLY,
        "mood": "whiny, offended pout",
        "rim": "cyan",
    },
    "meister-watt": {  # Tai-Chi-Lehrer, hält seit 30 Jahren dieselbe Pose
        "desc": "small, wiry old man in his late seventies, light-brown skin, completely bald, a very long thin white "
                "beard tied with a copper wire, long white eyebrows, serene half-closed eyes; a faded grey silk "
                "tai-chi suit with frog buttons, a thin layer of dust and a little cobweb on one shoulder, black "
                "cloth shoes, an old copper power cable worn like a belt" + _STYLE_ONLY,
        "mood": "serene, utterly calm, eyes half closed",
        "rim": "cyan",
    },
    "mira-loetzinn": {  # Händlerin für Neu-Cyberware, Schrauberin
        "desc": "athletic woman in her early thirties, medium-brown skin, copper-red hair shaved on one side and "
                "long on the other, a welding visor flipped up on her head, small soldering burns on her cheeks; a "
                "brown leather work apron over a black high-neck top that fully covers her torso, rolled sleeves, a "
                "tool belt with tiny screwdrivers and spools of solder wire, olive work trousers, heavy boots; her "
                "left forearm is a chrome cybernetic arm with an open panel showing neat wiring, the index finger "
                "is a glowing soldering tip" + _STYLE_ONLY,
        "mood": "focused, wry, competent half smile",
        "rim": "cyan",
    },
    "mixi": {  # Mixroboter der HV-Bar
        "desc": "a squat chrome bar-tender robot about chest high: a barrel-shaped polished chrome body with a "
                "few dents, rolling on a single rubber ball wheel, a round screen face showing two simple glowing "
                "cyan pixel eyes and a pixel smile, two slim jointed arms (one holding a cocktail shaker, one a "
                "glass with a glowing pink drink), a painted black bow tie on the chest, a small orange warning "
                "light on top" + _MACHINE_ONLY + _STYLE_ONLY,
        "mood": "chirpy, eager pixel smile",
        "rim": "pink",
    },
    "mutter-bruehe": {  # Suppenküche der Rohrsiedlung
        "desc": "big, tall, heavy-set woman in her sixties, warm dark-brown skin, round kind face, short grey "
                "curls under a knitted red beanie, round glasses fogged at the edges; several layered patched "
                "cardigans in brown and mustard, a long apron sewn from blue tarp, rubber gloves, rubber boots; "
                "holds a huge dented soup ladle, a little steam around her" + _STYLE_ONLY,
        "mood": "warm, motherly, firm but caring smile",
        "rim": "pink",
    },
    "ole-gaehn": {  # Hausmeister im Digitech-Areal, schläft immer
        "desc": "lanky old caretaker in his late sixties, light skin, droopy heavy eyelids half closed, a grey "
                "stubble, messy thin grey hair, a sleepy yawn; a faded grey janitor coverall with a blank name patch "
                "(no text), a cardigan over it, a huge ring of keys on the belt, a thermos flask in one hand, worn "
                "slippers instead of shoes" + _STYLE_ONLY,
        "mood": "sleepy, half-asleep mid-yawn",
        "rim": "cyan",
    },
    "opa-blech": {  # Oma Volts eingemotteter Sicherheitsroboter, später Kioskwächter
        "desc": "a tall, boxy retro security robot from the 2050s, humanoid on two stubby legs: dented cream and "
                "olive-green painted metal body with rust spots and old rivets, a round bucket-like head with two "
                "round yellow lamp eyes and a speaker grille as mouth, thick accordion-hose arms with clamp hands, "
                "a hand-knitted lilac scarf wrapped around its neck, a sewn patch with a lightning bolt on its chest, "
                "a little dust" + _MACHINE_ONLY + _STYLE_ONLY,
        "mood": "loyal, stoic, gentle lamp-eyed look",
        "rim": "cyan",
    },
    "opa-gurrmann": {  # Taubendrohnen-Post in den Lötgassen
        "desc": "short, round old man in his seventies, light skin, rosy cheeks, a white goatee, a tweed flat cap; "
                "a patched brown corduroy jacket with many pockets full of birdseed and tiny batteries, a postman's "
                "leather satchel across the chest, grey trousers, brown boots; two small grey pigeon drones with "
                "glowing cyan eyes and tiny rotor wings perch on his shoulders" + _STYLE_ONLY,
        "mood": "kindly, chatty grandfather smile",
        "rim": "cyan",
    },
    "hecki": {  # Gärtnerroboter im Himmelsgarten, schneidet Rosen in Herzform (act23.json)
        "desc": "a slim, elegant gardener robot about human height, walking on two thin jointed legs: a glossy "
                "white-and-sage-green enamel body like an upper-city luxury appliance, a small rounded head with one "
                "wide soft-green visor eye and a tiny straw sun hat, a green gardener's apron with a pocket full of "
                "seed packets (no text), one hand is a pair of polished silver pruning shears, the other a delicate "
                "gripper holding a red rose trimmed into a heart shape, a little watering can clipped to its hip"
                + _MACHINE_ONLY + _STYLE_ONLY,
        "mood": "gentle, polite, head tilted",
        "rim": "pink",
    },
})

# Weltfiguren und Akt-2/3-Figuren a–g ohne Kostümreferenz (art-fig-a): Stilreferenz ist eine vorhandene Figur mit
# ähnlichem Körperbau (Kopie als work/refs/character-unique-<id>[-portrait].png, danach eigenes Porträt). Nur Stil.
CHARACTERS.update({
    "falke": {  # Quantum-Scharfschütze an der Hafenkante, Vegas ewiger Zweiter
        "desc": "lean, wiry man in his early thirties, pale skin, sharp hawk-like nose, hollow cheeks, close-cropped "
                "ash-blond hair, narrow squinting grey eyes, a small round cyan-glowing cyber scope lens implanted "
                "over his right eye; a sleek white armored Quantum sniper suit with violet light seams and a small "
                "abstract violet geometric emblem on the chest (no text), a dark grey hooded camouflage scarf around "
                "neck and shoulders, black fingerless gloves, white boots; a long slim white sniper rifle with a "
                "violet glow slung diagonally across his back" + _STYLE_ONLY,
        "mood": "deadpan, laconic, faintly melancholic squint of the eternal second-best",
        "rim": "cyan",
    },
    "elsa": {  # Gustavs Frau, Bastlerin im Aussiedlerhof (Ödnis)
        "desc": "wiry old woman in her early seventies, sun-tanned weathered skin with deep laugh lines, sharp clear "
                "blue eyes, long silver-white hair in a loose braid under a faded red headscarf, brass magnifier "
                "goggles pushed up on her forehead, a grease smudge on one cheek; a patched khaki work shirt with "
                "rolled-up sleeves, a heavy brown leather apron full of tool pockets (pliers, screwdrivers, wire), a "
                "dusty turquoise neck scarf, olive trousers, scuffed desert boots; holds a small soldering iron"
                + _STYLE_ONLY,
        "mood": "dry, sharp, a crooked tinkerer's grin",
        "rim": "pink",
    },
    "glasblaeserin": {  # Die Glasbläserin in den Glasdünen
        "desc": "strong woman in her mid forties, olive-brown skin with a few small burn scars on her forearms, dark "
                "curly hair tied up under a rust-orange bandana, calm dark eyes, dark tinted protective goggles "
                "pushed up on her head, a necklace of glass beads glittering in many colors; a heavy scorched brown "
                "leather glassblower's apron over loose sand-colored layered desert clothes, a long cream scarf, "
                "thick heat-proof gloves tucked into her belt, sturdy boots; holds a long metal glassblowing pipe "
                "with a glowing orange molten glass bulb at its end" + _STYLE_ONLY,
        "mood": "calm, quiet, proud craftswoman, faint warm smile",
        "rim": "pink",
    },
    "fraeulein-pixel": {  # Fälscherin im Fotoautomaten am Bahnhof Mitte
        "desc": "slim woman around forty, pale skin, a sleek pink bob with a blunt straight pink fringe, a jeweler's "
                "loupe monocle in front of her left eye, precise red lipstick, a beauty mark; a mint-green vintage "
                "blouse with a big floppy bow at the collar under a cropped black cardigan, black fingerless lace "
                "gloves with ink stains on the fingertips, an old instant camera on a strap around her neck, slim "
                "black trousers, black ankle boots" + _STYLE_ONLY,
        "mood": "professional, cool, a practiced passport-photo smile that does not reach the eyes",
        "rim": "pink",
    },
    "chrome-haushaelterin": {  # Frau Wischmann, Haushälterin der Chrome-Schwestern
        "desc": "prim woman in her mid sixties, upright posture, silver hair in a perfect French twist, sharp curious "
                "eyes, thin knowing smile; a classic black housekeeper's dress to below the knee with a starched "
                "white collar and cuffs, a crisp white apron, a small gold-and-white brooch, black stockings, "
                "polished black low-heeled shoes; holds a small silver comb and a feather duster" + _STYLE_ONLY,
        "mood": "discreet on the surface, gossip glittering in the eyes",
        "rim": "cyan",
    },
    "bijou": {  # Roboterpudel der Chrome-Schwestern
        "desc": "a small luxury robot poodle (the size of a real toy poodle), a body of polished mirror chrome, the "
                "typical poodle grooming shape: fluffy pompom 'curls' made of fine curled chrome feather-springs on "
                "the head, the long ears, the chest, the ankles and a pompom tail tip, slender chrome legs, big glossy "
                "round blue LED eyes, a small black nose, a pink velvet collar with a bow and a pink heart-shaped "
                "tag; cute, pampered and a bit snooty, NOT menacing. It is an animal-like robot, not a person"
                + _STYLE_ONLY,
        "mood": "pampered, snooty, nose in the air, about to run off",
        "rim": "pink",
    },
    "fx-60": {  # alter Digitech-Assistent, spricht nur per Fax
        "desc": "an old retro-futuristic Digitech office assistant machine from 2061: a boxy beige-and-grey fax "
                "machine body with a paper tray on top, a long curling strip of fax paper hanging out of the front "
                "slot, a small round green-glowing camera eye on a short bendy metal stalk, a cracked little green "
                "LCD display strip, a curly-cord telephone handset clipped to its side, scratches, dust and a few "
                "blank stickers, moving on small stubby black rubber tank treads underneath. It is a machine, no "
                "face, not a person and not an animal" + _STYLE_ONLY,
        "mood": "patient, calm green eye glow, printing slowly",
        "rim": "cyan",
    },
    "direktorin-hartlauf": {  # Digitech-Restbelegschaft, Pförtnerhaus
        "desc": "stern woman in her early sixties, upright, short-cropped steel-grey hair, a firm mouth, tired but "
                "unbroken grey eyes, reading glasses on a beaded chain around her neck; a faded teal-grey company "
                "blazer with a small blank round emblem pin (no text), a white blouse buttoned to the collar, a "
                "lanyard with an old blank key card, dark grey trousers, sensible black shoes; holds a clipboard "
                "with forms" + _STYLE_ONLY,
        "mood": "dignified, bitter, patiently waiting for justice",
        "rim": "cyan",
    },
    "bruder-kabellos": {  # Prediger der Funkstille, früher Nexus-Projektgruppe
        "desc": "gaunt man in his late fifties, intense pale-blue eyes, a wild grey beard and long unkempt grey hair, "
                "hollow cheeks; a monk-like hooded robe roughly sewn from blue and grey plastic tarps with a lining "
                "of crinkled tin foil in the hood, a long black charging cable looped around his neck like a rosary "
                "with a dangling plug as pendant, a rope belt, bare feet in worn sandals; holds a battered wooden "
                "fruit crate under one arm" + _STYLE_ONLY,
        "mood": "intense, fervent preacher, slightly paranoid glance",
        "rim": "cyan",
    },
    "dj-lumo": {  # DJ des High Voltage
        "desc": "lanky young man in his mid twenties, dark-brown skin, a high-top fade with neon-blue tips, a thin "
                "moustache, relaxed half-closed eyes, big chunky over-ear headphones worn half on (one ear "
                "uncovered); a jacket patched together from colorful old record sleeves (square patches, abstract "
                "graphics, no text) over a black t-shirt, a glowing cyan LED wristband, baggy dark cargo pants, "
                "chunky white sneakers; holds a black vinyl record" + _STYLE_ONLY,
        "mood": "laid-back, grooving to a beat only he hears, easy grin",
        "rim": "pink",
    },
    "bruno-brecher": {  # Türsteher des High Voltage
        "desc": "huge, broad-chested bouncer in his forties, built like a wardrobe, thick neck, shaved head, heavy "
                "brow, short black beard, light-brown skin, a small earpiece in one ear, simple dot tattoos on the "
                "knuckles (no letters); a deep burgundy velvet blazer straining at the shoulders over a black "
                "turtleneck, a thin gold chain, black trousers, polished black shoes; stands with arms crossed"
                + _STYLE_ONLY,
        "mood": "stern, unimpressed, judging your style",
        "rim": "pink",
    },
    "dr-winkel": {  # Winkeladvokat im Eisenhof
        "desc": "wiry man in his fifties, slicked-back dark hair with grey temples, a thin pencil moustache, big black "
                "horn-rimmed glasses, a polka-dot red bow tie; a slightly shiny, worn brown three-piece suit, a gold "
                "pocket-watch chain, two-tone black-and-white dance shoes; carries a stack of empty office file "
                "folders under one arm" + _STYLE_ONLY,
        "mood": "oily, eager salesman's smile, eyebrows raised",
        "rim": "cyan",
    },
    "frau-takt": {  # Stationsvorsteherin mit 14 Stoppuhren
        "desc": "lean, strict woman in her fifties, sharp angular face, thin lips, dark hair in a severe low bun, "
                "piercing eyes; a dark navy station-master uniform jacket with brass buttons and red piping, a red "
                "station-master cap with a black visor, a whole bundle of fourteen silver stopwatches on chains "
                "hanging around her neck, a silver whistle, navy trousers with a red stripe, polished black shoes; "
                "holds a round red-and-green signal paddle" + _STYLE_ONLY,
        "mood": "strict, impatient, checking the time",
        "rim": "cyan",
    },
    "gerda-gleis": {  # Fundbüro Bahnhof Mitte
        "desc": "small, round old woman around seventy, short white curly hair, kind tired eyes behind reading "
                "glasses perched on her nose, rosy cheeks; a long cosy grey-blue knitted cardigan over a cream "
                "blouse, a railway-red neckerchief, a lanyard full of little blank paper luggage tags, a brown skirt "
                "to below the knee, thick stockings, comfortable shoes; holds a wooden rubber stamp" + _STYLE_ONLY,
        "mood": "endlessly patient, gentle smile",
        "rim": "pink",
    },
    "barista-perle": {  # Café Sahnehaube in den Glasarkaden
        "desc": "woman around thirty, warm light-brown skin, expressive dark eyes, dark hair in a messy top knot with "
                "a silver coffee spoon stuck through it, big round pearl earrings, a tiny pearl necklace; a cream "
                "barista apron over a black shirt with rolled-up sleeves, a small milk-foam stain on the apron, slim "
                "black trousers, white sneakers; holds a steaming coffee cup with latte art" + _STYLE_ONLY,
        "mood": "warm, theatrical, knows your order before you speak",
        "rim": "pink",
    },
    "fluss-frieda": {  # Kanal-Händlerin auf dem Floß
        "desc": "sturdy woman in her late forties, weathered freckled face, red-brown hair in two thick braids, a "
                "headlamp strapped around her head, cheerful squint; olive-green rubber chest waders with suspenders "
                "over a navy-and-white striped sailor shirt, a patched yellow oilskin jacket worn open, a net bag of "
                "salvaged trinkets on her hip; holds a long wooden punting pole" + _STYLE_ONLY,
        "mood": "cheerful, salty, a trader's wink",
        "rim": "cyan",
    },
    "frau-klingel": {  # Glockenverkäuferin am Schrottmarkt, Hörimplantat empfängt Radio Rost
        "desc": "tiny old lady around eighty, slightly hunched, white hair in a bun tied with a black ribbon, bright "
                "lively eyes, a big old brass hearing implant behind her right ear with a small antenna glowing "
                "orange; a black lace widow's shawl over a long dark-green coat with many little brass bells sewn "
                "onto the hem and sleeves, a string of bells across her chest, black boots; holds a polished brass "
                "hand bell" + _STYLE_ONLY,
        "mood": "cheerful, a little deaf, humming along to a radio only she hears",
        "rim": "pink",
    },
    "gutschein-gerd": {  # Betrüger mit „Chrome 10“-Gutscheinen
        "desc": "thin man in his forties, a too-wide toothy grin with one gold tooth, gelled dark-blond hair with a "
                "sharp side parting, clean-shaven, shifty eyes; a shiny lilac suit several sizes too big (drooping "
                "shoulders, rolled-up sleeves), a loud zigzag-pattern tie, a cheap gold watch, pointed brown shoes; "
                "fans out a handful of glossy blank coupons in one hand" + _STYLE_ONLY,
        "mood": "sleazy, over-friendly salesman grin",
        "rim": "pink",
    },
})

# Statisten ohne Kostümreferenz (Kunst-Phase gaps): nur Porträts, laufen auf der Karte mit einem generischen
# Laufblatt. Referenzen ("style_refs", Pfade relativ zum Projektordner): ein vorhandenes gemaltes Statisten-Porträt
# (nur Stil) und, wo das Kostüm zum Laufblatt passen soll, das generische Rohlaufblatt (nur Kostüm).
_COSTUME_FROM_SHEET = (". REFERENCES: the first attached image is a STYLE reference only (drawing style, never its "
                       "face or clothes); the attached walk-cycle sprite sheet shows this character's outfit and "
                       "colors at small size: match the clothing, but paint a new, individual face")
_ODNIS_STYLE = ["output/imagegen/raw/characters/staubbaron-broesel-portrait.png"]
_CITY_STYLE = ["output/imagegen/raw/characters/dexter-portrait.png"]
_SHEET = "output/imagegen/raw/characters/{}-walk.png"
CHARACTERS.update({
    "staubfalke-bolle": {  # Torwache der Wrackburg (npc-oednis/statisten.ts)
        "desc": "huge, broad man in his thirties built like a refrigerator, a big bushy brown beard, sunburnt "
                "friendly face with puppy-like eyes, dusty round welding goggles pushed up on his shaved head; a "
                "sleeveless worn leather vest over bare tattooed arms, a single black crow feather tacked to his "
                "chest, a sand-colored dust scarf around his neck; a heavy bolt slingshot that looks like a toy in "
                "his big hands" + _STYLE_ONLY,
        "mood": "big goofy grin, a bit slow but warm-hearted",
        "rim": "pink", "walk": False, "style_refs": _ODNIS_STYLE,
    },
    "aussiedlerin-juna": {  # Aussiedlerin an den Beeten
        "desc": "young woman in her early twenties, sun-tanned skin, freckles, a crooked cheerful smile, messy "
                "dark-blond hair under a wide frayed straw sun hat, arms brown with dried clay; a faded green work "
                "shirt with rolled-up sleeves, a patched canvas apron with seed pouches, a red bandana around the "
                "neck; holds a dented tin watering can" + _STYLE_ONLY,
        "mood": "cheerful, a little fierce, about to yell at a tomato",
        "rim": "cyan", "walk": False, "style_refs": _ODNIS_STYLE,
    },
    "konvoi-doro": {  # Diesel-Doro, Konvoi-Chefin
        "desc": "stocky woman in her late forties, weathered tanned face with laugh lines, short grey-streaked "
                "black hair under a backwards trucker cap, an unlit fat cigar in the corner of her mouth; an "
                "oil-stained orange work overall rolled down to the waist with the sleeves tied around her hips, a "
                "black tank top, strong arms with grease smudges, dusty driving goggles around her neck, a ring of "
                "keys on her belt" + _STYLE_ONLY,
        "mood": "shrewd trader's grin, one eyebrow raised",
        "rim": "pink", "walk": False, "style_refs": _ODNIS_STYLE,
    },
    "rohrwartin-muffe": {  # Kanalvolk-Sperre im Pumpwerk Sieben
        "desc": "sturdy, short woman in her fifties of the sewer people, ruddy round face, bushy eyebrows, frizzy "
                "grey hair sticking out from under a battered yellow miner's helmet with a headlamp and a bottle cap "
                "stuck on it; olive rubber chest waders with suspenders over a patched blue-green tarp poncho, a "
                "knitted scarf; rests a huge red pipe wrench as long as a leg on her shoulder" + _STYLE_ONLY,
        "mood": "grumpy, stubborn, cursing under her breath",
        "rim": "cyan", "walk": False, "style_refs": _ODNIS_STYLE,
    },
    "technikerin-kalibri": {  # Quantum-Technikerin in der Außenstelle
        "desc": "slim woman around thirty, pale tired face with dark circles, sharp clever eyes, black hair in a "
                "messy short ponytail, a white respirator half mask pushed down under her chin; a once-white lab coat "
                "now stained sewer-grey and green, a small abstract violet geometric emblem on the coat (no text), a "
                "violet ID lanyard; holds an open tin can of instant noodles with a plastic fork" + _STYLE_ONLY,
        "mood": "deadpan, exhausted, no questions please",
        "rim": "cyan", "walk": False, "style_refs": _ODNIS_STYLE,
    },
    "funzel": {  # Chef der Rostzähne an der Hafenkante
        "desc": "gaunt, wiry gang boss in his late thirties of the Rust Teeth gang, hollow cheeks, narrow mocking "
                "eyes, rust-orange dyed spiky hair, a wide arrogant grin with rusty metal teeth and one shiny GOLD "
                "front tooth, a wooden toothpick between his teeth; a sleeveless faded denim vest, bare tattooed arms, "
                "a glowing orange neon chain whip coiled over one shoulder" + _COSTUME_FROM_SHEET,
        "mood": "smug, menacing, ego the size of a container ship",
        "rim": "pink", "walk": False, "style_refs": _CITY_STYLE + [_SHEET.format("rostzahn-schlaeger")],
    },
    "welt23-gechippter-nachbar": {  # Akt 2, gechippter Schrottsammler
        "desc": "wiry adult scrap collector, sharp face, welding goggles pushed up on the forehead, oil-stained olive "
                "overall with torn-off sleeves, a sack of scrap over one shoulder; a tiny glittering violet chrome "
                "chip on the side of his neck, eyes slightly glassy with a faint violet shimmer" + _COSTUME_FROM_SHEET,
        "mood": "eerily polite, frozen too-wide friendly smile",
        "rim": "pink", "walk": False, "style_refs": _CITY_STYLE + [_SHEET.format("passant-schrotti")],
    },
    "welt23-gechippte-pendlerin": {  # Akt 2, gechippte Pendlerin
        "desc": "adult upper-city businesswoman, sleek blond bob, thin glowing AR visor glasses flickering violet, an "
                "immaculate white-and-silver tailored suit with a violet scarf, a slim silver briefcase; a tiny "
                "glittering violet chrome chip behind her ear" + _COSTUME_FROM_SHEET,
        "mood": "perfectly identical customer-service smile, eyes a little empty",
        "rim": "cyan", "walk": False, "style_refs": _CITY_STYLE + [_SHEET.format("passant-anzug")],
    },
    "welt23-kanalvolk": {  # Rohrputzerin vom Kanalvolk
        "desc": "adult woman of the sewer people, cheerful round face, a few strands of green algae in her curly "
                "brown hair, a headlamp on a woolly hat, a patched rain poncho sewn from blue and green tarps, a "
                "knitted scarf, a small glass jar lantern with glowing blue mushrooms" + _COSTUME_FROM_SHEET,
        "mood": "happy, humming, proud",
        "rim": "cyan", "walk": False, "style_refs": _CITY_STYLE + [_SHEET.format("passant-kanalvolk")],
    },
    "welt23-spaziergaenger": {  # Spaziergänger an der Flutmauer
        "desc": "adult man, a bit chubby, sunburnt nose, wide straw sun hat, loud neon-pink and teal flower-pattern "
                "short-sleeve shirt, a fanny pack strap across his chest" + _COSTUME_FROM_SHEET,
        "mood": "suspicious squint, doesn't believe a word the sea says",
        "rim": "cyan", "walk": False, "style_refs": _CITY_STYLE + [_SHEET.format("passant-tourist")],
    },
    "welt23-nachbarin": {  # Nachbarin mit Einkaufsnetz
        "desc": "elderly woman, small, white-grey hair in a tidy bun, round glasses, a small glowing cyan hearing "
                "implant behind one ear, a purple raincoat, a floral headscarf around the neck, a string shopping bag "
                "with leeks over her arm" + _COSTUME_FROM_SHEET,
        "mood": "feisty, delighted, finally rude again",
        "rim": "pink", "walk": False, "style_refs": _CITY_STYLE + [_SHEET.format("passant-oma")],
    },
    "welt23-pendler": {  # Pendler ohne Termin
        "desc": "adult man in his forties, short brown hair, tired but relaxed face, a scuffed yellow hard hat tilted "
                "back, an orange high-visibility vest with grey reflective stripes over a dark grey work coverall; "
                "holds a half-eaten ice cream cone" + _COSTUME_FROM_SHEET,
        "mood": "calm, dreamy, slightly lost, content",
        "rim": "cyan", "walk": False, "style_refs": _CITY_STYLE + [_SHEET.format("passant-arbeiterin")],
    },
    "welt23-promoterin": {  # Chrome-10-Promoterin am Pavillon
        "desc": "young adult woman promoter, glossy violet-dyed bob, flawless makeup, a white promo uniform jacket "
                "with violet light seams and a small abstract violet geometric emblem (no text), a headset "
                "microphone, a tiny glittering violet chip behind her ear; holds up a small chip in shiny gift wrap "
                "between two fingers" + _STYLE_ONLY,
        "mood": "relentlessly bright sales smile, a little too eager",
        "rim": "pink", "walk": False, "style_refs": _CITY_STYLE,
    },
})

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
    if CHARACTERS[cid].get("generic"):  # generische Laufblätter: nur Stilreferenz (vorhandene Rohlaufblätter)
        return [RAW / r for r in GENERIC_STYLE_REFS if (RAW / r).exists()]
    if CHARACTERS[cid].get("style_refs"):  # Statisten ohne Kostümreferenz: vorhandene Bilder nur für Stil/Kostüm
        return [ROOT / r for r in CHARACTERS[cid]["style_refs"]]
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


def generic_walk_prompt(c: dict, extra: str = "") -> str:
    """Laufblatt für generische Passanten/Gegner: Referenzen nur für Stil, Raster und Maßstab."""
    body = c.get("body", "human")
    if body == "quadruped":
        motion = ("4 walking frames of a four-legged trot cycle (legs alternating), paws on a common baseline per row: "
                  "ROW 1 (top) facing SOUTH toward the viewer (front view, head toward the viewer); ROW 2 facing WEST, "
                  "strict side profile walking toward the LEFT edge, head on the left; ROW 3 facing EAST, strict side "
                  "profile walking toward the RIGHT edge, head on the right; ROW 4 (bottom) facing NORTH, back view "
                  "with the tail toward the viewer")
    elif body == "hover":
        motion = ("4 hovering frames (slight bob up and down, rotors in different blur positions), the lowest point of "
                  "every frame on a common baseline per row: ROW 1 (top) facing SOUTH, camera eye toward the viewer; "
                  "ROW 2 facing WEST, side view flying toward the LEFT edge; ROW 3 facing EAST, side view flying "
                  "toward the RIGHT edge; ROW 4 (bottom) facing NORTH, back view, camera eye hidden")
    else:
        motion = ("4 walking frames (left foot forward, passing, right foot forward, passing), feet on a common "
                  "baseline per row: ROW 1 (top) facing SOUTH toward the viewer; ROW 2 facing WEST, strict side profile "
                  "walking toward the LEFT edge; ROW 3 facing EAST, strict side profile walking toward the RIGHT edge; "
                  "ROW 4 (bottom) facing NORTH, back view")
    subject = "creature" if body != "human" else "character"
    p = (f"Game {subject} WALK CYCLE SPRITE SHEET for a cyberpunk RPG set in a grimy neon lower city in 2086: a square "
         f"image containing a strict 4x4 grid of 16 small full-body figures of the SAME {subject}, evenly spaced, each "
         "centered in its own invisible square cell, identical scale, wide empty gaps, nothing touching or cut off. "
         f"Each row is one direction with {motion}. Slight three-quarter top-down RPG camera. The attached sprite "
         "sheets are ONLY a reference for art style, grid layout, camera angle and scale: copy their hand-painted "
         "cartoon look (clean dark ink outlines, soft painterly shading, natural proportions, not chibi), but draw a "
         f"COMPLETELY DIFFERENT {subject}, not the person in the reference. Readable when shrunk to game size. The "
         f"{subject}: {c['desc']}. Identical look in all 16 frames. Flat pure magenta #FF00FF background everywhere, "
         "no ground shadow, no floor, no text, no letters.")
    if extra:
        p += f" CORRECTION: {extra}"
    return p


def walk_prompt(cid: str, extra: str = "") -> str:
    c = defaults(cid)
    if c.get("generic"):
        return generic_walk_prompt(c, extra)
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
