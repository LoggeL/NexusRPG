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
