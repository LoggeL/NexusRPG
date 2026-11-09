# Zonen-Paket pkg-quantum-turm (quantum-labor, blades-buero, server-kern)

Dateien: `game/src/content/parts/maps-23/quantum-labor.ts`, `blades-buero.ts`, `server-kern.ts`.
Bilder: `bg-quantum-labor` (+ `-bruch`, `-leer`), `bg-blades-buero` (+ `-master`, `-verlassen`), `bg-server-kern` (+ `-ruhig`, `-stadtnetz`).
Rohbilder, Prompts und Grundrisse unter `output/imagegen/raw/maps/<id>*.png|prompt.txt|-geo.json`.

ersetzt Platzhalter: keine.
Händler: keine (world.md §3.5: im Turm keine; Kantinen-Automat liegt im Foyer).

## Was die Karten liefern

- Alle Ausgänge, Einstiege und Spots aus act23.json, genau mit diesen IDs.
  Kernschacht (`quantum-labor` → `server-kern`) offen ab `main-3-nexus` aktiv/erledigt oder Flag `epilog`.
- Blick-Hotspots mit Fassungen je Zustand (vor/nach dem Bruch, Partynacht, Nachspiel, Master-Modus, Stadtnetz).
  Sie blenden sich aus, solange die Quest an dieser Stelle läuft (`main-2-bruch`, `main-3-labor`, `main-3-nexus`,
  `side-zweite-chance`, `side-offene-werkstatt`, `pers-pim-kleine-schrift`), damit die Quest-Hotspots nicht doppelt erscheinen.
- Eigenes:
  - Labor: Ausschuss-Tonne (2 × `quantum-chip-schrott`, ab Akt 2), Serverracks (`akt-hacken` St. 4, 180 Cr),
    Kittelhaken (`laborkittel-neu`, Akt 3/Nachspiel), Wasserspender (täglich +10 LP).
  - Büro:
    - Aussichtspunkt Panoramafenster (`aussicht-blades-buero`, 20 XP).
    - Flipchart (setzt `markSeen: blades-flipchart-gesehen`).
    - Geheimfach:
      - Mit dem Code aus `he-blade-10` (`{ seen: 'he-blade-10' }`) oder nach der Rebellion bzw. im Nachspiel per `akt-hacken` St. 5.
      - Inhalt: 1500 Cr, `taschenspiegel-gold`, 60 XP, Dialog mit dem alten Crew-Foto.
      - Setzt Flag `blades_geheimfach_offen`.
    - Vitrine (`goldknauf-replik`, nach der Rebellion bzw. im Nachspiel).
    - Champagnerbar (Master-Modus täglich +25 LP).
    - Chefsessel als Schlafplatz.
    - `shelter` (Einstieg `aufwachen`), beides nur im Master-Modus.
  - Kern: Fassungen für Kampfzeit, Stille, Ende 2 (Nexus umgezogen), Master-Modus, Stadtnetz; Steg-Blick.
- onEnter: Ersteintritt je Karte, Partynacht (Labor), Nachspiel/versiegelt (Büro, Labor), Master-Erwachen (Büro, Kern).
- Master-Modus = Flag `master_modus` oder `ende_master`, solange nicht `ende_doch_noch_meer`.

## Für die Quest-Agenten (Hotspot-IDs laut Plan sind frei geblieben)

| Karte | Spot | Hotspot-ID laut Plan | gehört zu |
| --- | --- | --- | --- |
| quantum-labor | `zentralrechner` | `zentralrechner` (gc-29) | main-2-bruch |
| quantum-labor | `chip-tresor` | `chip-tresor` (Chip + Daten, akt-hacken) | main-2-bruch |
| quantum-labor | `notschalter` | `notschalter` (Flag `notschalter`) | main-2-bruch |
| quantum-labor | `xion-tuer` / `probanden-liege` / `op-tisch` | Kampf `enc-labor-xion`, Variante A/B | main-2-bruch |
| quantum-labor | `nyras-arbeitsplatz` | `nyras-tastatur` | Nyra / main-3-labor |
| quantum-labor | `labortuer`, `alesas-pult`, `kuschel-ablage` | – | main-3-labor |
| quantum-labor | `pims-werkbank` | `pims-notizen` | pers-pim-kleine-schrift |
| server-kern | `kern` | `kern` (enc-kern-nexus + Fassungen, gc-47) | main-3-nexus |
| server-kern | `upload-konsole` | `upload-konsole` (4 Wege) / gc-141 | main-3-nexus / side-offene-werkstatt |
| server-kern | `fx60-anschluss` | `fx60-anschluss` | main-3-nexus |
| blades-buero | `kuschel-sessel` / `nexus-terminal` | `kuschel-sessel`, `nexus-terminal` | side-zweite-chance (gc-101/102) |

Wer die Upload-Entscheidung baut, muss die Spots oben per `mapAdditions` belegen. Die Karte selbst startet keine Kämpfe.

## Abstimmung / Integration

1. `quest-enden` reist bei Ende 3 nach `blades-buero/aufwachen`.
   Das Erwachen erzählt die Karte selbst (onEnter `blades-buero-master`: Nexus-Begrüßung, Plüschhase im Sessel).
   Legt quest-enden dort noch ein eigenes Erwachen an, bitte eines von beiden entfernen.
2. Stadtnetz-Hintergrund: gilt bei `side-offene-werkstatt` erledigt oder Flag `serverkern_stadtnetz`.
   Vorschlag: Die Quest setzt das Flag, wenn gc-141 gelingt.
   Ohne Flag erscheint die grüne Fassung nach Questende immer.
3. `main-3-einlass` (Lüftungsweg) landet im Labor. Die Karte zeigt dann keinen eigenen Partynacht-Satz, solange `main-3-einlass` aktiv ist.

## Engine-Lücken

- **Lichter mit Bedingung** (schon bekannt): Alarmlicht im Labor und Violett im Master-Büro kommen nur über die
  Hintergrundvarianten. `LightDef.when` würde das Rotlicht pulsieren lassen.
- **Bedingte Kartenmusik** (schon bekannt): Labor spielt immer `quantum-labor`, Kern immer `ki-nexus`.
  Beim Bruch wäre `schleichen` passend, im Master-Büro `ki-nexus`.
  Vorschlag: `music` als `{ when, track }[]`.
- **Passanten mit Bedingung:** `AmbientDef` kennt nur Tageszeiten. Labor- und Büropersonal laufen deshalb nur morgens und tags (`count: 0`),
  damit sie weder beim nächtlichen Bruch noch in der Partynacht stören.
  Vorschlag: `AmbientDef.when`.
