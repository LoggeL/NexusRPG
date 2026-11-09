# Lücken und Absprachen: Paket hafenkante (hafenkante, hausboot-nebelhorn)

Dateien: `game/src/content/parts/maps/hafenkante.ts` (legt auch `station-hafenkante` und den Dialog `hafenkante-ankunft` an), `game/src/content/parts/maps/hausboot-nebelhorn.ts` (Dialog `hausboot-nebelhorn-ankunft`).

## Für Quest-Agenten: Diese Plan-Hotspots lege ich NICHT an

Sie hängen an Questzuständen und Schritt-IDs, die nur die Quest kennt. Bitte per `mapAdditions.hafenkante` mit genau dieser ID an den genannten Spot setzen (sonst entstehen doppelte IDs):

| Hotspot-ID (Plan) | Spot | Quest / Check |
| --- | --- | --- |
| `container-77` | `container-77` | `side-container-77`, `gc-117` / `akt-hacken` |
| `beweisfoto` | `container-77-versteck` | `side-container-77`, `gc-116` |
| `rostzaehne-farbe` | `rostzaehne-lager` | `side-wand-der-freiheit`, `gc-126` |
| `stellwerk-hafen` | `stellwerk-hafen` | `side-uebliche-verspaetung`, `gc-50` |
| `quantum-depot-terminal` | `quantum-depot` | `job-datenraub`, `prep-grundriss` (`gc-22`) |
| Rostlaube-Einbau (eigene ID, z. B. `rostlaube-einbau`) | `garage-rostlaube` | `side-rostlaube`, `gc-115` oder Dante ♥2 |

`garage-rostlaube` existiert bereits als **Shop**-Hotspot (Händler `garage-rostlaube`), deshalb braucht der Einbau eine eigene ID.

Feste Quest-Begegnungen (`enc-hafen-jimmy`, `enc-hafen-laster`, `enc-hafen-rostzaehne`, `enc-kran-falke`, `enc-hafen-container`) setze ich ebenfalls nicht; die Quests lösen sie per `{ battle }` im Dialog aus oder per `mapAdditions.encounters` am Spot (`oelfass-tuerme`, `quantum-depot`, `container-labyrinth`, `falke-kran`, `container-77`).

## Für Romanze-Agenten (Vex × Aria)

- Spot `container-hai` liegt oberhalb des Hai-Containers, Blick nach Norden auf die Rennhalle 9 (gegenüber über den Kai, nicht über dem Wasser). Plan-Station `rom-vexaria-oberlicht` kann dort starten.
- Spot `boxsack` steht vor der offenen Garage (Arias Boxsack hängt sichtbar im Bild). `rom-aria-training` startet dort.
- Die Karte hat schon Look-Hotspots mit Zusatzzeilen: `hai-container-oberlicht` (Vex, nach Flag `vexaria_oberlicht`), `boxsack-aria` (nach `seen: rom-aria-training`), `boxsack-vex` (Vex + `aria_romanze_angebahnt`). Bitte keine eigenen Hotspots mit diesen IDs.

## Engine-Lücken

- **Zufallsbegegnungen erscheinen nicht von selbst.** `EncounterDef.random` wird bisher nirgends ausgewürfelt. Notbehelf: Die Karte zeigt vier sichtbare Gruppen mit den Zufalls-IDs aus `parts/combat/random.ts` (`enc-zufall-hafenkante-rostzaehne-abend`, `…-rostzaehne-zerleger-nacht`, `…-depot-nacht`, `…-drohnen-tag`) nach Tageszeit, mit eingebetteten Ausweich-Checks (`hk-*`). Nach einem Sieg verschwinden sie dauerhaft (`once`). Vorschlag: Beim Betreten würfelt die Engine aus `random` und stellt eine Gruppe an einen Spot (z. B. `container-labyrinth`), solange nicht täglich zurückgesetzt wird.
- **U-Bahn-Hotspot kann die Stadtkarte nicht öffnen.** `ubahn-zugang` ist nur ein Text. Vorschlag: Effekt `{ cityMap: true }` oder Hotspot-Art `station`.
- **Keine Wetterbedingung**: Leuchtalgen-Angeln und Drohnenrennen hängen nur an Tageszeit/Wochentag.
- **Kanalgitter ohne Requisit**: Der Ausgang `kanalgitter` (280,410) hat kein gemaltes Gitter im Bild. Vorschlag: Requisit `prop-kanalgitter` (Bodengitter, Draufsicht) oder `ExitDef.prop`.
- **Rennhalle 9**: Ausgang trägt `when: { flag: 'rennhalle-9-geoeffnet' }`; das Flag setzt im ersten Stand niemand.
