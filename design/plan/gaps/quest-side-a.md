# Lücken: quest-side-a (Akt-1-Nebenquests world.md §6.2 Nr. 1–11)

Ordner `game/src/content/parts/quest-side-a/`, eine Datei je Quest plus `_lib.ts` (Helfer, `VEXARIA_DABEI`).

## Engine-Lücken (mit Näherung im Inhalt)

| Thema | Soll laut world.md | Näherung jetzt |
|---|---|---|
| Kein Tageswechsel-Ereignis | „Ein Fax pro Tag“ (side-eingehendes-fax) | Flag `fax_heute`; onEnter auf `dantes-werkstatt`/`loetgassen` löscht es ab Zeitfenster „tag“ (`once: false`) |
| Zähler für Gegenstände/Werte | „4 von 8 Spuren“, „3/6/9/12 Platten“ | Kombinatorische Bedingung `mindestens()`; generierte Abgabe-Wahlen je Platte × Zählerstand (Flags `platten_k`) |
| Fahndungsstufe | Lieferwagen-Diebstahl (side-keksalarm) erhöht Fahndung | Flag `fahndung_1` |
| „Meinung“ (Collin/Öffentlichkeit) | side-chrome-10, side-live-dabei | Flags `meinung_plus_*` |
| Status „Schmutzig“ | Schlickstrand (side-live-dabei) | Flag `schmutzig`, wird nur vom Inhalt gesetzt/abgefragt |
| Halbierte Herzgewinne | „Hunter ist Diva“ (side-riegel-krise) | Flag `hunter_diva` (gesetzt/aufgehoben), Engine wertet es nicht aus |
| Shop-Verknappung | Nougatbomben ausverkauft während der Krise | Flags `hunter_diva` / `riegel_krise_vorbei`, Shop muss sie abfragen |
| U-Bahn-Bonus | Pünktliche Bahn spart 15 Min (side-uebliche-verspaetung) | Flag `ubahn_puenktlich`, Reisezeit-Logik muss es lesen |
| Offener Gefallen | Knuspi fordert später ein | Flag `knuspi_gefallen_offen`, noch keine Folgequest |
| Spätere Folgen | Sybella +40 in Akt 3 (side-chrome-10), FX-60 im Finale | Flags `chrome10_markenpiraterie`, `fx60_hilft_finale` |
| Platten 11/12 | erst in Akt 2 auffindbar | Abgabe-Wahlen vorhanden, Fundorte fehlen |
| NPC-Platzierung ohne NpcDef | Nebenfiguren stehen an festen Orten | talk-Hotspots an Spots statt `npcs`-Platzierung |
| Effekte transaktional | `startQuest`/`recruit` im selben Effekt-Block wie andere Effekte | eigene Knoten |

## Fehlende fremde IDs (nicht von mir definiert)

- NpcDefs fehlen für Sprecher in meinen Dialogen: `fx-60`, `knuspi`, `gutschein-gerd`, `vinyl-vincent`, `hafen-hannes`, `frau-klingel` (die beiden letzten nutzen auch andere Teile). Die Inhaltsprüfung meldet sie als „unbekannter Verweis npcs“. Die Besitzer sind die npc-*-Ordner.
- Origins: Alle `origin-*` fehlen derzeit global (z. B. `origin-gossenkind`, das `side-jimmys-chip` für die Spuren-Regel nutzt).
- Kartengeometrie: Die Spots `richterbank` (gerichtssaal) und `schreibtisch` (hv-hinterzimmer) sind laut Prüfung nicht begehbar erreichbar. Dort stehen `q-kessel-richter` und `q-zehn-credits-hunter`; mit Radius 56–64 sollten sie trotzdem ansprechbar sein, aber das muss der Kartenbesitzer prüfen.

## Bilder

Keine generiert. Erzähltafeln (`image: 'black'` + caption): `side-zehn-credits-abend`, `side-keksalarm-nacht`, `side-jimmy-tuerme`, `side-live-dabei-sendung`, `side-kessel-feierabend`.
