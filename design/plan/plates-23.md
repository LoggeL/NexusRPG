# Bildtafeln Akt 2, Akt 3, Enden, Nachspiel

Fotoreale Schlüsselszenen (design.md §6.1), Bildschlüssel `cut-<id>`, Datei `game/public/assets/cut/<id>.webp` (1536×1024).
Prompts stehen in `design/assets/cut.json`, gebaut mit `scripts/art/cut_build.py`, im Laufzeit-Manifest über `scripts/build_manifest.mjs`.
Verwendung in Cutscenes: `{ image: 'cut-<id>', pan: 'in'|'out'|'left'|'right'|'none', fade: 'in'|'cross', caption, hold }`.
Fehlt eine Tafel, zeigt das Spiel eine Erzähltafel. Die Spielfigur ist auf keiner Tafel erkennbar (höchstens anonyme Silhouette von hinten), außer Vex in `rom-vexaria-*`.

Status: **fertig** = Bild gebaut und im Manifest.

## Akt 2 „Der Chip“

| Schlüssel | Szene | Bildinhalt | Status |
| --- | --- | --- | --- |
| `cut-main-2-bruch` | `main-2-bruch`, Nexus erwacht | Quantum-Labor, Rotalarm, riesiges Nexus-Gesicht auf der Wand, Nyra am Terminal, Aria daneben sprungbereit | fertig |
| `cut-main-2-kanal` | `main-2-kanal` | Pumpwerk Sieben, rote Notbeleuchtung, Xion und Ripper feilschen über eine Bahre unter Rettungsdecke (Person nicht erkennbar: passt für Aria, Proband oder Jimmy) | fertig |
| `cut-main-2-countdown` | `main-2-countdown` | Dante wirft den Chip aus dem Werkstattfenster, Mülltonne fliegt, Funken-Konfetti, Eins!-Karten auf dem Tisch, Captain Kuschel im Regal | fertig |
| `cut-main-2-krisensitzung` | `main-2-krisensitzung` | Hinterzimmer, Raven stellt Hunter zur Rede, Dante stolpert mit dem Keksblech, Kekse fliegen (Keksalarm) | fertig |

## Akt 3 „Releaseparty“

| Schlüssel | Szene | Bildinhalt | Status |
| --- | --- | --- | --- |
| `cut-main-3-einlass` | `main-3-einlass` | Himmelsgarten-Party, Collin und Delya live, Sybella vor dem Chip-Hologramm | fertig |
| `cut-main-3-labor` | `main-3-labor` | Dante zieht Nyra den Chip, im Hintergrund flirtet Hunter Alesa weg | fertig |
| `cut-main-3-gedankenkontrolle` | `main-3-gedankenkontrolle` | Blades Rede am Pult, Nexus-Hologramm, gechippte Gäste, Raven mit violett glimmenden Augen | fertig |
| `cut-main-3-nexus` | `main-3-nexus` / `enc-kern-nexus` | Serverkern, Nexus-Gesicht halb cyan, halb rot, Silhouette mit Stick auf dem Steg | fertig |
| `cut-main-3-blade` | `main-3-blade` | Landeplatz, goldener Gleiter, Blade mit leerer Champagnerflasche, Raven mit Handschellen | fertig |

## Enden und Nachspiel

| Schlüssel | Szene | Bildinhalt | Status |
| --- | --- | --- | --- |
| `cut-ende-meer` | Ende 1 „Das Meer“ | Crew kommt am Meer an, Aria rennt zum Wasser, Hunter schaut zum Horizont, Dante und Raven Schulter an Schulter | fertig |
| `cut-ende-neue-nexus` | Ende 2 „Die neue Nexus“ | Autofahrt durch die Ödnis, Hunter am Steuer, Dante lacht, freundliches cyanes Nexus-Hologramm über dem Autoradio | fertig |
| `cut-ende-master` | Ende 3 „Master“ | Penthouse, Silhouette im Teddymantel mit Goldknauf-Stock, rote Nexus-Bildschirme, ein kleiner Bildschirm zeigt die Crew am Strand | fertig |
| `cut-ende-doch-noch-ans-meer` | Ende 3b „Doch noch ans Meer“ | Lagerfeuer am Treibholz-Strandclub, Raven steht auf und hält der ankommenden Silhouette eine Flasche hin, Hunter gerührt | fertig |
| `cut-epilog-sendung` | Epilog-Karten (Sammeltafel) | NX-1-Studio, Collin und Delya lachend vor einer Monitorwand: Jimmy auf dem Lieferroller, Kinder-Fundbüro, Yogastunde, pünktliche U-Bahn, Roboter mit Feuerlöscher, Strandclub | fertig |

## Vex × Aria (nur Spielfigur Vex)

| Schlüssel | Szene | Bildinhalt | Status |
| --- | --- | --- | --- |
| `cut-rom-vexaria-rettung` | Akt 2, Aria gechippt (Variante A), Vex holt sie zurück | Pumpwerk, rotes Notlicht; Aria mit violett glimmendem Blick und Chiplicht hinterm Ohr, Vex kniet vor ihr, Hand an Arias Wange; Arias Metallhand krallt sich in Vex' Gurtriemen | fertig |
| `cut-rom-vexaria-meer` | Nachspiel / Ende am Meer | Sonnenuntergang am Strand, Aria barfuß in der Brandung, Vex in Stiefeln an der Wasserlinie, Hand in Hand, Vex dreht sich lächelnd zur Crew um | fertig |

## Herz-Ereignisse Akt 1 (bisher fehlende Tafeln)

`cut-he-dante-6`, `cut-he-hunter-6`, `cut-he-raven-6`, `cut-he-jimmy-6`, `cut-he-nyra-4`, `cut-he-vega-6`, `cut-he-kaeptn-nebelhorn-10`, `cut-he-lio-funkel-6` – alle fertig, die Cutscenes in den Figurenteilen verweisen schon darauf.
