# Lücken · Paket glasarkaden (glasarkaden, cafe-sahnehaube, quantum-schauraum, chrome-penthouse)

## Engine / Werkzeuge

- **Station vs. Laufinsel:** `MapDef.station` schaltet die Station beim bloßen Betreten frei (`coreSettle`). In den Glasarkaden würde
  dann schon der Lieferhof (ohne Drehkreuz) `station-glasarkaden` öffnen. Deshalb ist `station` absichtlich NICHT gesetzt.
  Freischaltung stattdessen: Hotspot `ubahn-zugang` (nur in der Passage erreichbar), onEnter `glasarkaden-drehkreuz`
  (Drehkreuz-Berechtigung ohne Check) und der gc-106-Hotspot am Stufenplatz (setzt `drehkreuz_passiert` + Station).
  Vorschlag: `StationDef.when` beim Auto-Freischalten beachten oder ein `entry`-Filter (`station: { id, entries: [...] }`).
- **Bedingung „über welchen Einstieg betreten“ fehlt** (z. B. `{ enteredVia: 'lieferanteneingang' }`). Damit ließe sich
  der Ersteintritt in Passage und Lieferhof getrennt erzählen.
- **map_tool.mjs:** prüft Erreichbarkeit nur vom ersten Einstieg aus → der Lieferhof (gewollte Insel) erscheint als
  „unerreichbar“. Vom Einstieg `lieferanteneingang` aus ist alles im Lieferhof erreichbar (lokal geprüft).
  Vorschlag: `MapDef.islands` oder Prüfung je Zusammenhangskomponente. `scripts/map_overlay.py` skaliert fest auf 640×360
  (InselRPG-Größe) und passt nicht zu 1536×1024/1024×768.
- **ExitDef ohne Effekte:** Ein Ausgang kann kein Flag setzen. Deshalb setzt der Penthouse-Rückweg kein Flag; das
  übernimmt onEnter `alte-gewohnheiten-zurueck` in den Glasarkaden (Bedingung: Rabe gemalt).

## Für den Quest-Agenten `side-alte-gewohnheiten`

Die Karten legen die Hotspots aus dem ID-Plan selbst an (bitte keine zweiten mit gleicher ID) und setzen nur Flags:

| Flag | Gesetzt durch |
| --- | --- |
| `alte-gewohnheiten-getarnt` | gc-143 Schaltkasten (`lastenaufzug-schaltkasten`), gc-142 `waescheschacht`; Kiki-Weg bitte selbst setzen (Einstieg `dach`) |
| `alte-gewohnheiten-blumenlieferung` / `-schacht` | welcher Tarnweg genommen wurde |
| `alte-gewohnheiten-albert-abgewimmelt` | gc-144 `haustelefon` |
| `alte-gewohnheiten-bijou-ruhig` | `bijou` mit `leckerli-schraube` |
| `alte-gewohnheiten-rabe-gemalt` | Dialog `chrome-penthouse-spiegel` (Questziel) |
| `alte-gewohnheiten-tuch` | mindestens ein Seidentuch genommen (je Tuch Ruf `chrome-haus` −4) |
| `alte-gewohnheiten-entkommen` | zurück im Lieferhof nach dem Rabe (Dialog `glasarkaden-raven-zurueck`) |

- Ausgang `lastenaufzug` (Glasarkaden) ist offen bei: Quest aktiv + Nacht + Raven in der Party („Fahrt ohne Tarnung“).
  Ohne `alte-gewohnheiten-getarnt` steht `enc-penthouse-drohnen` sichtbar im Dienstgang (Patrouille, avoid gc-142).
- Ravens Abschlusswahl (♥ +60 nichts mitnehmen / ♥ +20 Tücher) und Albert-Zeitlimit gehören zur Quest.
- `gc-55` („abgelaufene“ Butter, side-keksalarm) und das Eis für side-neon-limo am Spot `feinkost-rampe` legt der Quest-Agent
  per `mapAdditions.glasarkaden` an (andere Hotspot-ID als `feinkost-rampe`, das ist der Shop).

## Sonstiges

- `enc-markt-betreuer` (Akt 2, side-ki-fluestern) gibt es noch nicht als Begegnung; nicht platziert.
- Panoramaaufzug: `gc-108` beim Liftboy bitte als Dialog mit Flag `liftboy_ueberredet` umsetzen (der Ausgang fragt es ab, ab Akt 2).
- Penthouse-Dienstgang: Das Bild zeigt Aufzug, Wäsche und Drohnen als Wandansicht; der begehbare Streifen davor (y 780–838)
  liegt über der Mauerkante. Wirkt im Spiel vertretbar; bei Gelegenheit Bild mit echtem Gangboden neu malen.
- Hintergrund-Antagonisten (Blade, Alesa, Seraphina, Serenity, Nexus-Avatar) kommen über ihre Tagesabläufe an die Spots;
  ihre Ein-Satz-Dialoge gehören den Figuren-Agenten. Der Nexus-Avatar hat zusätzlich den Hotspot `nexus-avatar` (Werbetexte).
