# Lücken und Absprachen: Zonen-Paket Kanal-Sammler (`kanal-sammler`)

Datei: `game/src/content/parts/maps/kanal-sammler.ts`. Sie enthält die Karte, den Bezirk `kanalisation` und die Zonendialoge
`kanal-sammler-ankunft`, `kanal-thronsaal-tor`, `kanal-rechen`, `kanal-rechen-versteck`, `kanal-notgenerator` und `kanal-spendenkiste`.
Bild: `bg-kanal-sammler`, Rohbild `output/imagegen/raw/maps/kanal-sammler-a.png`.

## Flags für die Quest-Agenten

Die Hotspots der Zone setzen sprechende Flags. Die Questschritte sollten darauf prüfen.

| Quest | Flag / Bedingung | Gesetzt durch |
| --- | --- | --- |
| `side-rattenkoenig` | `nagbert_geloest` (gemeinsam) plus `nagbert_umgesiedelt` (gc-73 Falle) / `nagbert_verliebt` (Captain Kuschel) / `nagbert_weggelockt` (`[Gosse]` Röstzwiebeln) | Dialog `kanal-thronsaal-tor` (Hotspot `thronsaal-tor`) |
| `side-rattenkoenig` | `{ won: 'enc-kanal-nagbert' }` | Gegnergruppe `nagbert` am Thron oder Wahl „Tor auf“ im Dialog |
| `side-rattenkoenig` | Rattenwachen: `{ won: 'enc-kanal-rattenwache-N' }` oder `{ seen: 'avoid:kanal-sammler:rattennest-N' }` (N = 1..3) | Gegnergruppen `rattennest-1..3` (mit `avoid`) |
| `side-rattenkoenig` | Abschluss sollte `any: [nagbert_geloest, won enc-kanal-nagbert]` sein. Die Schnellweg-Gitter gehen auf, sobald die Quest `done` ist. | – |
| `side-rettung-am-rechen` | `rechen_geborgen` | Dialog `kanal-rechen`: gc-125 / eingebetteter Check `kanal-seilwinde` [Technik 4] / Bolzen in der Party / Floß-Minispiel (Schlüssel `kanal-rechen-rettung`) |
| `side-strom-fuer-die-rohre` | `kanal_generator_laeuft` (gc-119) oder `kanal_generator_teile` (3 Ersatzteile abgegeben, „einen Tag warten“ muss die Quest selbst abbilden) | Dialog `kanal-notgenerator` (nur während die Quest aktiv ist) |
| `prep-fluchtweg` | `fluchtweg_spende` und `fluchtweg_gesichert` (wie in `quest-main-b/prep-fluchtweg.ts`) | Spendenkiste `spende-ersatzteile` – auch wenn Gully nicht da ist (A/N) |
| – | `kanal_ventil_gedrosselt` | Ventilrätsel `akt-ventil` (Schlüssel `kanal-ventil`): danach Rechen-Versteck ohne Check erreichbar |
| – | `kanal_versteck_erreicht` | Rechen-Versteck (gc-147, Ventil oder Floß-Minispiel `kanal-rechen-versteck`) → Loot `datenwuerfel-18` |
| – | `kanal_spende_gegeben` | Spendenkiste ohne aktive Quest (Ruf `kanalvolk` +15, einmalig) |

Die Rattenbrücke `enc-kanal-ratten`, Gullys Fluchtweg-Gespräch und der geölte Notausgang kommen aus `quest-main-b/prep-fluchtweg.ts` (mapAdditions).
Die Zone zeigt den zugestellten Notausgang (`fluchtweg-tuer`), bis `fluchtweg_gesichert` gesetzt ist.

## Fehlende Ziele (andere Agenten)

- Quests `side-rattenkoenig`, `side-strom-fuer-die-rohre`, `side-rettung-am-rechen`, `side-neon-limo` (Questgeber und Auftakt-Dialoge mit Gully und Frieda).
- Fraktion `kanalvolk` (Ruf-Effekte, Kanalbrett ab Ruf 10), Tafel `gullys-kanalbrett`, Aufträge `job-kanal` und `kopfgeld-graf-gully-zwei`.
- Gegenstand `kanalminze` (side-neon-limo). Der Hotspot `kanalminze` erscheint nur, solange die Quest aktiv ist und keine Minze im Inventar liegt.
- Karten `pumpwerk-sieben` und `datentunnel` (Ausgänge `tunnel-ost` und `schott` sind gesperrt bis `act2`).
- Figuren `buergermeister-gully`, `fluss-frieda`, `ripper` stehen über ihre Tagesabläufe auf den Spots `gullys-rathaus`, `rechen`, `thronsaal-grenze`, `friedas-stand` und `rippers-lager`.
  Der Spot `friedas-stand` liegt auf dem Anleger neben ihrem Floß, der Laden-Hotspot `fluss-frieda` sitzt an der Theke.
- In `prep-fluchtweg.ts` wird Gullys Rathaus „ein umgedrehtes Boot auf Ziegelsteinen“ genannt. Auf dem Bild ist es ein Planenzelt mit Glocke und Wimpel. Vorschlag: im Text auf „Zelt“ ändern.

## Engine-Lücken

- **Notschlafplatz mit bedingter Erholung:** world.md: Trockendock ist Notschlafplatz, volle LP erst nach `side-strom-fuer-die-rohre`.
  `ShelterDef.heal` kennt keine Bedingung. Jetzt gilt: `shelter.heal = 30`, das Bett `trockendock-bett` (kind `sleep`) erscheint erst nach der Quest.
  Vorher gibt es `trockendock-bett-klamm` (Schlafen, danach 20 Schaden). Vorschlag: `ShelterDef.healWhen?: { when: Condition; heal: 'full' | number }[]`.
- **Gegnergruppen-Größe:** Nagbert nutzt das Laufblatt `kanalratte-walk` in normaler Größe. Vorschlag: `MapEncounterDef.scale` oder ein eigenes Laufblatt `nagbert-walk`.
- **Zufallsbegegnungen** kommen aus `combat/random.ts` (20 % rund um die Uhr). Die Zone setzt dafür keine eigenen Gruppen.
- **Wetter:** `side-rettung-am-rechen` soll „nach Regen“ wiederholbar sein. Es gibt keine Wetterbedingung, daher gilt die Rettung, solange die Quest aktiv ist und `rechen_geborgen` fehlt.
- **Geheimer Gullyweg** (`he-buergermeister-gully-4`): Das Flag kennt die Zone noch nicht. Vorschlag: Die Figuren-Agenten setzen `gully_geheimweg`. Die Schnellweg-Gitter könnten dann `any: [side-rattenkoenig done, flag gully_geheimweg]` prüfen.
- **QA-Vorschau:** `scripts/map_overlay.py` skaliert auf 640×360 (alter Maßstab). Bei 1536×1024 liegt die Vorschau `output/qa/maps/<id>.png` deshalb neben dem Bild.
  Die Prüfung der Erreichbarkeit stimmt trotzdem. Eine eigene Überlagerung liegt unter `output/imagegen/raw/maps/kanal/overlay.png`.
- **gen_content_parts:** `parts/vexaria/_util.ts` enthält im Kommentar den Text „export const part“. Der Generator importiert die Datei deshalb, und der Build bricht ab („No matching export“).
  Vorschlag: Den Kommentar umformulieren oder im Generator nur echte Exporte erkennen (`^export const part`).
