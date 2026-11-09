# Paket pkg-oednis-hof: Aussiedlerhof und Glasdünen (parts/maps-23)

Dateien: `parts/maps-23/aussiedlerhof.ts`, `parts/maps-23/glasduenen.ts`, `parts/maps-23/shops-oednis-hof.ts`.
Alle Spots, Einstiege und Ausgänge aus `act23.json` sind angelegt (dazu zusätzlich auf den Glasdünen die
Inselbrücke: Einstiege `aussichtsduene` und `bruecke`, Ausgänge `bruecke-hinueber`/`bruecke-zurueck`).

## ersetzt Platzhalter

– keine (das Paket legt keine Quests an).

## Flags und Hotspots für andere Pakete

| Was | Wo | Für |
| --- | --- | --- |
| Flag `glasduenen_bruecke_gespannt` | Seilwinde `gc-94` oder Reparaturset; `gc-103`/`arme-greifhaken` bringt einen ohne Flag auf die Düne | `side-weg-zum-meer` Schritt „eingestürzte Brücke“: Bedingung `{ any: [{ flag: 'glasduenen_bruecke_gespannt' }, { seen: 'aussicht-glasduenen' }] }` |
| Flag `meer_von_duene_gesehen`, seen `aussicht-glasduenen` | Aussichtspunkt-Dialog `glasduenen-aussicht` (20 XP einmalig) | `side-weg-zum-meer` Zielschritt |
| Gegenstand `meer-foto`, Flag `meer_foto_gemacht` | Foto-Wahl im Aussichtsdialog (nur wenn noch keins im Inventar) | Quest-Belohnung bitte mit `{ noItem: 'meer-foto' }` absichern, sonst doppelt |
| Flags `glasherz_ei_zurueck`, `glasherz_koenigin_abgelenkt`, Sieg `enc-duenen-koenigin` | Hotspot `skorpionnest-koenigin` (nur bei `side-glasherz` aktiv und Königin nicht beruhigt) | `side-glasherz`; die Wahl „Ei zurücklegen“ erscheint mit Flag `glasherz_ei_geborgen` (setzt die Quest, wenn das Ei von Brösel kommt: gc-138, Kauf, Kampf) |
| Gegenstand `glasperlen` (neu, 25 Cr, `geschenk`) | Laden `glaswerkstatt`; Wurf am Nest verbraucht einen | `side-glasherz` „mit Glasperlen ablenken“ |
| `glasherz` im Laden (220 Cr) | nur nach `side-glasherz` erledigt | – |
| Flag `wegweiser_meer_gesehen` | Ziegenroboter (`[Körper 5]`) | optional als Hinweis in `side-weg-zum-meer` |
| Hotspot-ID `brunnen` ist frei | Spot `brunnen`; die Karte hat nur `brunnen-pumpe`/`brunnen-schacht` | `pers-marla-brunnen` legt den Check-Hotspot `brunnen` per mapAdditions an |
| Feld `gaertnern` | `akt-gaertnern` St. 2, Schlüssel `aussiedlerhof-feld`, täglich, ab Ruf `aussiedler` 80 oder `pers-marla-brunnen` erledigt | – |
| Tafel `marlas-wegezettel` | Hotspot `wegezettel` (`act2`) | Das JobBoardDef `marlas-wegezettel` legt das Auftrags-Paket an (hier nicht definiert) |

## Lücken / für die Integration

- **Marla Sand umhängen:** `he-marla-sand-4…10` liegen noch auf `schrottmarkt` (Sa). Laut Plan nach
  `aussiedlerhof` (`veranda`, `brunnen`) bzw. `staubstrasse` verlegen – Datei `npc-unterstadt/marla-sand.ts` gehört nicht
  diesem Paket. Tagesablauf (`act23.json` npcSchedules `marla-sand`) ebenso.
- **Figuren** `elsa` und `glasblaeserin` (Porträts/Laufblätter sind im Manifest) legt dieses Paket nicht an; die Spots
  `elsas-werkstatt`, `lagerfeuer-hof`, `glaswerkstatt`, `glasofen` sind für ihre Tagesabläufe da.
- **Bedingte Begehbarkeit:** Es gibt keine `blockVariants`/bedingten Laufflächen. Die Brücke ist deshalb als Insel mit
  zwei Interaktions-Ausgängen auf dieselbe Karte gebaut (`travel` auf `glasduenen`). Vorschlag: `MapDef.walkVariants`.
- **Hintergrundvariante nach Tageszeit** (`bg-glasduenen-abend`) läuft über `bgVariants` mit `{ time }`; wechselt die
  Tageszeit auf der Karte, greift sie erst nach dem nächsten Betreten, falls die Szene den Hintergrund nicht neu prüft.
- **Notschlafplatz-Bedingung:** Marlas Veranda ist ohne Bedingung (`shelter: { entry: 'aufwachen' }`) – passt zum Plan.
