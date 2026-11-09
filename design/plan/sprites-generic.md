# Generische Laufblätter (Passanten und Kartengegner)

Laufblätter ohne bekannte Figur, für `AmbientDef.sprites` (Passanten) und `MapEncounterDef.sprite` (sichtbare Gegnergruppe auf der Karte). Format wie alle Laufblätter (design.md §6): `game/public/assets/sprites/<id>-walk.png`, 512×512, 4×4 Zellen à 128 px, Zeilen S/W/O/N, Fuß bei (64, 120), Animationen `walk-s|w|e|n` und `idle-s|w|e|n`.

Der Kampf nimmt ohne eigenes `EnemyDef.sprite` automatisch `<enemy-id>-walk`. Die Gegner-Schlüssel passen deshalb direkt zu den IDs aus world.md §8.4.

Erzeugung: `scripts/art/char_prompts.py` (Wörterbuch `GENERIC`, Stilreferenz sind die Rohlaufblätter `dante-walk` und `wache-walk`, ohne private Referenzen und ohne Porträts), Aufbereitung `scripts/art/char_build.py <ids> --no-contact`. Abweichende Zielhöhen stehen in `scripts/art/char_config/<id>.json`.

## Passanten

| Schlüssel | Wer | Wo passend | Höhe |
| --- | --- | --- | --- |
| `passant-punk-walk` | Punk mit grünem Irokesen, Nietenjacke, Karohose | Neon-Gasse, Schrottmarkt, Bahnhof (Abend/Nacht) | 96 |
| `passant-arbeiterin-walk` | Hafen- und Fabrikarbeiterin mit Helm und Warnweste | Hafenkante, Kesselviertel (Morgen/Tag) | 96 |
| `passant-kurier-walk` | Fahrradkurier zu Fuß mit Leuchtrucksack | überall in der Unterstadt, Mittelring | 96 |
| `passant-oma-walk` | alte Dame mit Einkaufsnetz und Hörimplantat | Schrottmarkt, Kesselviertel, Bahnhof (Morgen/Tag) | 88 |
| `passant-anzug-walk` | Oberstadt-Geschäftsmann in Weiß-Silber mit AR-Brille und Koffer | Glasarkaden, Stufenplatz, Quantum-Campus | 96 |
| `passant-tourist-walk` | Oberstadt-Tourist mit Strohhut, Blumenhemd, Socken in Sandalen | Stufenplatz, Glasarkaden, Flutmauer | 96 |
| `passant-strassenhaendler-walk` | Imbisshändler mit Bauchladen voller Leuchtspieße | Schrottmarkt, Bahnhof, Neon-Gasse | 96 |
| `passant-kanalvolk-walk` | Kanalvolk mit Planen-Poncho, Stirnlampe, Pilzlaterne | Kanalisation, Trockendock, Rohrsiedlung | 96 |
| `passant-schrotti-walk` | Schrottsammler mit Schweißerbrille und Schrottsack | Schrottmarkt, Digitech-Areal, Hafenkante | 96 |

## Kartengegner (world.md §8.4)

| Schlüssel | Gegner | Darstellung | Höhe |
| --- | --- | --- | --- |
| `abzieher-walk` | `abzieher` | Kapuze, Halstuch vorm Gesicht, Billig-Cyberauge, Schlagring | 96 |
| `zerleger-walk` | `zerleger` | Rippers Leute: Metzgerschürze, Atemmaske, gelbe Messingbrille, grüne Kreuzbinde, Greifzange als Unterarm | 96 |
| `rostzahn-schlaeger-walk` | `rostzahn-schlaeger` | rostorange Stachelhaare, Rostzähne, Jeansweste mit Zahn-Emblem, Leuchtkette | 96 |
| `quantum-wachmann-walk` | `quantum-wachmann` | weiße Rüstung mit violetten Lichtnähten, Helm mit Visier, Schockgewehr | 96 |
| `ordnungshueter-walk` | `ordnungshueter` | dunkelblaue Einsatzuniform mit Reflexstreifen, Helm, Schlagstock | 96 |
| `kanalratte-walk` | `kanalratte` | Kanalratte XL, Vierbeiner, klein | 44 |
| `spaeherdrohne-walk` | `spaeherdrohne` | schwebende weiße Quantum-Drohne mit rotem Kameraauge (Unterkante auf der Fußlinie, Schweben übernimmt die Engine) | 50 |
| `robohund-walk` | `robohund` (passt auch für `robohund-alpha`) | ausgemusterter Quantum-Roboterhund, kniehoch | 62 |

## Beispiele

```ts
ambient: { count: 6, sprites: ['passant-punk-walk', 'passant-kurier-walk', 'passant-oma-walk', 'passant-strassenhaendler-walk'] }
encounters: [{ id: 'abzieher-bahnsteig', encounter: 'enc-bahnhof-abzieher', at: 'bahnsteig', sprite: 'abzieher-walk' }]
```
