# ID-Plan Akt 2, Akt 3, Enden und Nachspiel

`act23.json` ist der Gegenpart zu `act1.json`: Er legt die Karten, Orte und IDs fest, die die Inhaltspakete für Akt 2, Akt 3, die Enden und das Nachspiel bauen. Die Datei wird erzeugt und geprüft mit

```
python3 design/plan/act23_gen.py          # schreibt act23.json und prüft sie
python3 design/plan/act23_gen.py --check  # prüft nur die vorhandene act23.json
```

Ändere die Daten in `act23_gen.py`, nicht in der JSON-Datei. Lauf das Skript danach erneut.

## So liest man den Plan

| Schlüssel | Inhalt |
| --- | --- |
| `districts` | Alle fünf Bezirke gibt es schon. Nichts davon neu anlegen. Nur `das-meer` setzt eine eigene Musik (`meer`). |
| `stations` | Neu ist nur `station-chrome-allee` (`chrome-boulevard`/`station`, cityPos `[0.69, 0.1]`). |
| `maps` | 16 neue Karten. Jede hat `package`, Einstiege, Ausgänge (`edge` n/s/w/o/tuer, `when`, `lockedText`), Spots und Hotspots. Ein Ausgang nach X landet auf X am Einstieg `von-<Quellkarte>`. |
| `shops`, `boards` | Die Händler und Auftragstafeln der neuen Zonen mit Karte und Spot. |
| `npcSchedules` + `scheduleMode` | Tagesabläufe im Format `<Slots>[ <Tage>][ \| <Bedingung>]`, erster Treffer gewinnt. Modus je Figur: **neu** (vollständige Liste), **ersetzt** (ersetzt den Eintrag aus act1.json vollständig), **vorangestellt** (diese Einträge stehen vor den Akt-1-Einträgen). |
| `events` | Ort jedes Herz-, Rivalitäts- und Romanze-Ereignisses. Der `status` sagt, was zu tun ist: `vorhanden (Datei)` heißt nur den Ort prüfen, `umhängen` heißt auf diese Karte verlegen, `neu` heißt anlegen, `act1` steht schon in act1.json. |
| `questLocations` | Schritte als `karte:spot` in Ablaufreihenfolge. Akt-1-Quests mit neuen Schritten (`pers-jakko-kochbuch`, `pers-kiki-reichweite`, `pers-lio-album`, `pers-nebelhorn-letzte-faehre`, `job-*`) ergänzen die Orte in act1.json. |
| `encounterLocations` | Ort jeder Begegnung, auch der Varianten, die es in `parts/combat-23` schon gibt. |
| `actStarts` | Empfehlung für `ACT_STARTS` 2 und 3 in `world.ts`. `basis` nennt die vorhandenen Konstanten, „+“ heißt zusätzlich. |
| `flags`, `endings` | Neue Flags nach Akt sortiert. Enden mit Bedingung, Cutscene und Reiseziel. |
| `packages` | 7 Pakete mit je höchstens 4 Karten. |
| `notes` | Integrationsaufgaben und Engine-Lücken. |

## Entscheidungen

- **Pakete:** chrome-himmel, quantum-campus (Campus und Foyer), quantum-turm (Labor, Blades Büro, Serverkern), kanal-tief, staubstrasse (mit `rudis-diner` als zusätzlichem Quest-Raum), oednis-hof und rennhalle-meer.
- **Spots statt eigener Karten:** Altlager, Sicherheitszentrale, Wrackburg, Radio-Rost-Bunker, Strandclub und Werkstatt „Nullpunkt“ (`digitech-areal:glasfassade`) bekommen keine eigene Karte. Sie liegen als Spots auf den Karten, damit die Pakete klein bleiben.
- **Einstiege:** Die neuen Karten bieten genau die Einstiege, auf die die gesperrten Akt-1-Ausgänge zeigen. Rückwege zielen nur auf Einstiege, die es in Akt 1 schon gibt, weil mapAdditions keine Einstiege anlegen kann. Neue Wege zurück in Akt-1-Zonen gibt es deshalb nur über `hafenkante/ueberlaufrohr`, das schon existiert.
- **Akt-2-Start:** `quantum-campus/bruch-treffpunkt` direkt nach dem „los“ an der Planungstafel.
  - Vorbereitungen: grundriss, wachplan, fluchtweg.
  - Party: Aria und Nyra.
  - Dante ist noch nicht in der Crew.
- **Akt-3-Start:** `quantum-campus/party-vorplatz`.
  - Vorbereitungen: 3 Party-Vorbereitungen erledigt.
  - Party: Aria und Dante.
  - Nyra sitzt im Turm, Raven ist nicht in der Party.
  - Angenommen ist Variante A (Aria war gechippt).
- **Nachspiel:** läuft über das Flag `epilog`, weil ActId nur 1, 2 oder 3 kennt.
- **Enden:** Sie spielen eine Cutscene, setzen Flags und reisen nach `das-meer/ankunft`. Bei Ende 3 geht es nach `blades-buero/aufwachen`. Der Effekt `{ ending: true }` beendet das Spiel, deshalb kommt er nur in den optionalen Hotspot „Abspann ansehen“ (`das-meer:wagenplatz`).
- **Marla Sand:** Ihre Ereignisse 4 bis 10 ziehen vom Samstagsmarkt in die Ödnis (`aussiedlerhof`, `staubstrasse`).
- **Neue IDs:**
  - Hunters Sonderaufträge (Rang 5): `sonder-chrome-tresor`, `sonder-konvoi-nougat`, `sonder-pumpwerk-pegel`, `sonder-letzte-runde`.
  - Enden-Cutscenes: `ende-das-meer`, `ende-neue-nexus`, `ende-master`, `ende-doch-noch-ans-meer`.
  - Upload-Flags: `upload_stick`, `upload_umschreiben`, `upload_ueberzeugt`, `upload_master`.

## Offene Integrationspunkte (für den Hauptagenten)

1. `parts/quest-main-b/planungstafel.ts`: Der Knoten „los“ braucht zusätzlich `setAct 2`, `startQuest main-2-bruch` und die Reise zu `quantum-campus/bruch-treffpunkt`.
2. `world.ts`:
   - `ACT_STARTS` 2 und 3 nach `actStarts` setzen.
   - `ENDING` durch die vier Abspann-Fassungen ersetzen.
3. Engine:
   - Es fehlt `ActStart.minutes`.
   - `shelter` braucht eine Bedingung.
   - Kartenmusik kann nicht von einer Bedingung abhängen.
4. `rennhalle-9-geoeffnet` setzt bisher niemand. Das Rennhallen-Paket setzt es ab Akt 2 über `mapAdditions.hafenkante.onEnter`.
5. `TAXI_ZIELE` braucht die Ödnis-Zonen und `das-meer`. Das Strand-Shuttle kommt als Hotspot an `hafenkante:faehre`.
6. Die Platzhalter-Quests in `parts/integration/luecken.ts` werden unter derselben ID ersetzt.
