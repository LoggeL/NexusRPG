# Karten-Stil: Prompt-Rahmen für alle Kartenhintergründe

Stilreferenz: `output/imagegen/raw/maps/STYLE.png` (= `neon-gasse`, Variante A, fertig unter `game/public/assets/bg/neon-gasse.webp`).
Alle weiteren Karten übernehmen den Rahmen unten **wörtlich** und ersetzen nur `{{ORT}}` durch die Ortsbeschreibung (Englisch, siehe Muster unten).

## Referenzen (genau diese zwei, in dieser Reihenfolge)

```
scripts/art/codex_image.sh output/imagegen/raw/maps/<mapId>-a.png "$PROMPT" \
  output/imagegen/raw/maps/STYLE.png work/refs/backdrop-nexus.png
```

- `STYLE.png` gibt Kamera, Maßstab, Tuschekontur, Pflaster/Neon-Spiegelung und Farbbalance vor.
- `backdrop-nexus.png` gibt die Nachtstimmung der Unterstadt vor. Oberstadt oder Ödnis: Backdrop trotzdem mitgeben und im Ortstext ausdrücklich Licht und Material nennen (Chrom/Glas, sauberes Weißlicht oder staubiges Orange, Tageslicht).
- Hat die Karte eine Layout-Skizze (`map_build.py blockout`), kommt sie als dritte Referenz dazu. In diesem Fall gehört folgender Satz an den Anfang von `{{ORT}}`: "Follow the layout of the attached grey blockout sketch: light = walkable ground, dark = buildings/blocking, cyan = exits."

## Rahmen (wörtlich übernehmen)

```text
Game map background for a 2D top-down RPG, 1536x1024 landscape (3:2), filling the whole frame edge to edge, no border.

CAMERA: high-angle bird's-eye view looking down at about 50 degrees, orthographic-looking like a classic JRPG / Stardew-style town map: NO vanishing point, NO perspective convergence, all vertical building edges parallel and pointing straight up the image, ground plane seen almost from above. Building fronts are visible as short facades along the top and side edges; we see their roofs foreshortened. Consistent scale: a doorway is about 60 px wide and 100 px tall, a person would be about 90 px tall (but draw NO people).

STYLE: hand-painted cartoon illustration in exactly the painting style of the attached reference map (clean dark ink outlines on every shape, soft painterly cel shading, natural proportions, rich but slightly muted colours, no chibi, no pixel art, no 3D render, no photo). Mood and palette from the attached stage backdrop: Cyberpunk underground city in the year 2086, night-blue shadows, rusty metal, corrugated sheet metal, cables, steam, wet ground with reflections, neon light in hot pink, cyan and violet, warm yellow window light as accent. Readable game art: the walkable ground is large, flat, clearly lit and uncluttered; props sit at the edges; strong value contrast between floor (walkable) and walls/props (blocking).

The attached images are references for painting style, camera angle, scale and colour ONLY. Do not copy their buildings or layout and do not draw any characters.

STRICT: no people, no figures, no animals, no silhouettes of persons, no readable text, no letters, no numbers, no logos, no watermarks, no signature, no frame, no UI.

LOCATION: {{ORT}}
```

## So schreibt man `{{ORT}}` (Muster aus `neon-gasse`)

1. Ein Satz zur Zone und **wo die große Lauffläche liegt** (Form, Bodenmaterial, Spiegelungen).
2. Je Bildbereich (TOP/LEFT/RIGHT/BOTTOM, CENTER) die Gebäudefronten, Türen und Ankerobjekte aus world.md „Bild“ und „Orte“. Den wichtigsten Eingang ausdrücklich als "most eye-catching spot" markieren.
3. Kleinkram (Tonnen, Kisten, Dampfgitter, Kabel) an die Ränder, Kabel "drawn thin so they don't hide the floor".
4. Eine Zeile `EXITS clearly readable at the image edges:` mit jedem Ausgang aus world.md (Himmelsrichtung = Bildrand, Norden = oben) und woran man ihn erkennt.
5. Tageszeit und Wetter (Standard Unterstadt: "night, after rain").
6. Schilder nur als Symbole ("a neon lightning-bolt sign (a symbol, no letters)"), nie mit Text.

Bewährter Ortstext `neon-gasse`:

```text
"Neon-Gasse", a narrow wet alley street in the underground slums, seen from above. A wide band of dark cobblestone pavement runs through the middle of the image from the bottom edge up to the top and branches to the right edge - this is the large walkable area, with puddles that mirror pink and cyan neon. 
TOP CENTER-LEFT, on the upper building row: the entrance of the nightclub "High Voltage" - the most eye-catching spot: a big double door under a glowing neon lightning-bolt sign (a symbol, no letters), velvet rope on two brass posts in front of it, a small red carpet, pink and violet glow spilling onto the wet street.
LEFT EDGE: a small kiosk booth with a yellow striped awning, shelves of snacks and comics behind a counter window, a few crates; next to it a big wall-mounted TV screen glowing cyan (picture only, no text) on the house wall.
RIGHT SIDE: a rusty iron fire escape zigzagging up a brick wall to a roof terrace at the top-right corner, decorated with warm string lights, a few chairs and a water tank.
Small side door with a metal shutter (back room) next to the club, a plain apartment door with an intercom further left.
Across the alley: sagging cable bundles spanning from wall to wall (drawn thin so they don't hide the floor), trash bins, stacked crates, a floor vent grate with rising steam, a tipped-over shopping cart, graffiti shapes without letters, neon tubes as abstract stripes.
EXITS clearly readable at the image edges: TOP edge (north) - a stairwell going down into an underground metro station with a glowing cyan railing and a round metro emblem (no letters); RIGHT edge (east) - the street opens through an archway hung with colourful lanterns and corrugated metal stalls toward a scrap market; BOTTOM edge (south) - the street continues into narrow workshop lanes with sparks and a rolling shutter door.
Time: night, after rain.
```

## Ablauf je Karte

1. Prompt = Rahmen mit eingesetztem `{{ORT}}`, als Datei `output/imagegen/raw/maps/<mapId>.prompt.txt`.
2. Zwei oder drei Varianten (`-a/-b/-c`) parallel erzeugen (höchstens drei Codex-Aufträge gleichzeitig) und jede ansehen.
3. Auswahl nach: (a) Draufsicht ohne Fluchtpunkt, Gebäudekanten senkrecht; (b) große, zusammenhängende, ruhige Lauffläche; (c) Ausgänge an den richtigen Bildrändern erkennbar; (d) keine Figuren und keine Schrift; (e) Stil wie `STYLE.png`.
   Bei `neon-gasse` verlor Variante C, weil ein Werkstattblock den Südausgang versperrte. Nachgezogen wird nur, wenn keine Variante (b) und (c) erfüllt.
4. `cp …-<wahl>.png output/imagegen/raw/maps/<mapId>.png`
   `python3 scripts/art/map_build.py bg <mapId> output/imagegen/raw/maps/<mapId>.png --prompt-file=output/imagegen/raw/maps/<mapId>.prompt.txt`
   `node scripts/build_manifest.mjs`
5. Innenräume: gleicher Rahmen; im Ortstext "interior room seen from above, cut-away walls on the top edge only, floor fills most of the image" ergänzen. Falls kleiner, `--size=` setzen.

## Beobachtungen aus der Stilprobe

- Codex malt mit diesem Rahmen sehr detailreich. Das Pflaster wirkt trotz "no pixel art" leicht kachelartig. Das ist so gewollt, damit alle Karten gleich aussehen. "no pixel art" bleibt im Rahmen stehen, sonst kippt das Bild in echte Pixelgrafik.
- Mit "a doorway is about 60 px wide and 100 px tall" bleibt der Maßstab stabil (Türen ~110×130 px im Ergebnis). Das passt zu ~96 px hohen Figuren.
- Die Lauffläche liegt zuverlässig dort, wo der Ortstext "large walkable area" sagt. Sie sollte mindestens etwa 45 % des Bildes ausmachen.
