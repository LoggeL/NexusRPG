# Lücken und Übergaben: Paket `pkg-flutmauer` (Karte `flutmauer`, Bezirk `kueste`)

Datei: `game/src/content/parts/maps/flutmauer.ts` (Karte, Bezirk `kueste`, Dialoge `flutmauer-*`).
Bild: `game/public/assets/bg/flutmauer.webp` (Rohbild `output/imagegen/raw/maps/flutmauer-b.png`).

## Flags, die die Karte setzt (für die Quest-Agenten)

| Flag | Hotspot | Bedeutung / gedacht für |
| --- | --- | --- |
| `kameradrohne_geborgen` | `drohnenwrack` (gc-66), `drohnenwrack-tauchen` (gc-65), `drohnenwrack-magnet` (magnetangel) | `side-live-dabei`: Drohne geborgen. Hotspots erscheinen nur bei aktiver Quest. Kampfweg: Sieg `enc-bucht-hunde` – der Quest-Agent sollte `won: enc-bucht-hunde` ebenfalls als „geborgen“ werten. |
| `schmutzig` | `drohnenwrack-tauchen` | Status „Schmutzig“ (Ausstrahlung −1 für einen Tag) – Engine hat keine Zustände außerhalb des Kampfs. Vorschlag: `checkBuff` mit negativem Wert und Ablauf am selben Tag, oder Statusmodul. Bis dahin nur Flag. |
| `hundespuren_gefunden` | `hundespuren` | `side-hunde-der-brackbucht` Schritt „Spuren im Schlick“. Schaltet `alpha-hund` frei. |
| `bolzen_umprogrammiert` | `alpha-hund` (gc-81) | Alpha wird Bolzen. Quest-Agent: Quest abschließen / Haustier freischalten bei diesem Flag. Ersatzteil-Weg (5 `schrott-ersatzteil`, Dexters Halde) gehört in Henks Dialog. |
| `wand_gesprueht` | `graffiti-wand` (akt-graffiti, Schlüssel `graffiti-wand`, nachts) | Freies Sprühen; für `side-wand-der-freiheit` kann der Quest-Agent zusätzlich `wonMinigame: 'graffiti-wand'` prüfen oder per mapAdditions eigene Bild-Hotspots ergänzen (Spot `wand-der-freiheit`). |
| `mauer_kamera_gehackt` | `mauer-kamera` (akt-hacken Stufe 3, Schlüssel `mauer-kamera`) | `side-wand-der-freiheit`: Kamera am Mauerweg. Nur bei aktiver Quest. Alternative „Kessel ablenken“ = Dialog des Quest-Agenten. |
| `treibgutnetz_gezogen` | `treibgutnetz` (gc-149, nur bei Ebbe = Morgen/Abend) | schaltet Loot `schallplatte-07` frei. |

Gesehen-Marken: `flutmauer-betreten`, `aussicht-leuchtturm-oben` + `aussicht-flutmauer` (Aussichtspunkt), `fernblick-meer` (Münzfernrohr), `flutmauer-hundespuren`.

## Begegnung

- `rudel-brackbucht` (`enc-bucht-hunde`, Laufblatt `robohund-walk`) am Spot `hunderudel`, nur bei aktiver `side-hunde-der-brackbucht` und solange nicht gelöst. Vermeiden: eingebetteter Check `flutmauer-rudel-umgehen` `[Reflexe 5]` (world.md nennt keinen; Checks-Agent darf eine gc-ID nachreichen).
- Zufallsbegegnungen der Zone liegen bereits in `parts/combat/random.ts`.

## Romanze Vex × Aria (Priorität)

- `mauer-ziel` (1290, 335) am Geländer neben dem Laufsteg zu den Hallendächern: Ziel des Dächerrennens. Die Romanze-Agenten setzen ihre Cutscenes/Dialoge `rom-aria-kuss`, `rom-vexaria-kuss`, `he-aria-10` dort an (Spot-Name `mauer-ziel`). Die Rennankunft kommt optisch über den Laufsteg rechts oben (Dächer der Hafenkante).
- Hotspot `mauer-ziel` → Dialog `flutmauer-mauerziel`: nach `aria_kuss` Erinnerungszeilen (Vex-Fassung eigene), mit Aria in der Party ein anzüglicher Nachschlag am Geländer (Vex: „Schnallen“-Revanche als Brücke zu `rom-vexaria-licht`), für Vex mit `vexaria_luecke_gesprungen` der Kronkorken für Kas. ♥ +10 je Szene über `relation` (wiederholbar – falls zu großzügig: `once` an den Wahlen setzen).
- onEnter `flutmauer-aria-abend`: einmalig, Aria in der Party am Abend, sät das Rennen an.

## Engine-Lücken

1. **Aussichtspunkte** (world.md §3.9: 20 XP, deckt Zonenkarte auf, zeigt Sammelobjekt-Silhouetten): keine Engine-Funktion. Notbehelf: Dialog mit `xp: 20` und `markSeen: 'aussicht-flutmauer'`. Vorschlag: `MapDef.viewpoint?: { hotspot, reveal: true }` oder Effekt `{ viewpoint: mapId }`.
2. **Ebbe/Flut**: keine Gezeiten; Ebbe = Morgen und Abend (`time`).
3. **Angelfang zufällig**: Effekte sind fest; Angeln gibt tags `muschel-frisch` (Verlust: `rostige-dose`), nachts `treibholz` + `muschel-frisch`. Vorschlag: Effekt `{ loot: [{item, weight}] }` oder Fangtabelle im Minispiel `akt-angeln`. Fischgegenstand fehlt in world.md §9.
4. **Gegenstand `leuchtalge`** (side-neon-limo) ist noch nicht definiert – Gegenstands-Agent bitte anlegen (Quest-Gegenstand, „leuchtet grün, riecht nach Batterie“).
5. **Notschlafplatz**: `shelter: { entry: 'aufwachen', when: { hearts: 'henk-angler', min: 3 } }` + Hotspot `leuchtturm-bett` (kind `sleep`, gleiche Bedingung). `leuchtturm-oben` ist der Nachtplatz von Henk auf der Bastion am Fuß der Turmleiter (der Turm selbst ist nicht begehbar).
6. **Wetter-Barks** (§10.7 `klar`: Leute schauen aufs Meer) – Bedingung `weather` fehlt in `ConditionMap`.
7. **Taxi**: Einstieg `taxi` auf der Promenade (600, 290).
