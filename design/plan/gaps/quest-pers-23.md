# quest-pers-23: persönliche Quests Akt 2/3/Nachspiel, neue Aufträge, Kopfgelder Stufe 3

Ordner: `game/src/content/parts/quest-pers-23/` (Helfer in `_lib.ts`, kein eigener Teil).

## Ersetzt Platzhalter

Diese Quests standen als Platzhalter in `parts/integration/luecken.ts` und sind jetzt unter derselben ID echt gebaut. Die Warnungen „überschreibt integration/luecken“ im Test sind gewollt. Der Hauptagent kann die Platzhalter entfernen.

- `pers-collin-pixel`
- `pers-delya-quelle`
- `pers-ripper-taschenuhr`
- `pers-gustav-alte-liebe`

## Gebaut

| Datei | Inhalt |
| --- | --- |
| `pers-collin-pixel.ts` | Pixel-Pete entlarven, Live-Duell |
| `pers-delya-quelle.ts` | drei Schlafwandler zu Dante, Nachricht `p23-news-schlafwandler` |
| `pers-ripper-taschenuhr.ts` | Uhr bei Sybella (Laden, `[Straße 7]`, `[Sybella ♥4]`, Kassenbuch), Rückgabe an Ripper |
| `pers-gustav-alte-liebe.ts` | Brief, Elsas Werkstatt (`[Ausstrahlung 5]`, `[Technik 6]`, Werkbank, Teile, ganzer Tag), Oldie-Tanz am Lagerfeuer |
| `pers-marla-brunnen.ts` | Start am Brunnen (Akt 2, Marla ♥4 oder Ruf aussiedler 20), Bohrkopf von Elsa, Bohren (`[Körper 6]`, `[Technik 6]`, Batterie, Schichten) |
| `pers-pim-kleine-schrift.ts` | Imbiss, Pausenpavillon nachts (Schleichen, `[Technik 7]`, Kampf, Schichtwechsel), Werkbank, Redaktion, Nachricht `p23-news-kleine-schrift`, Flag `pim_weniger_wachen` |
| `pers-seraphina-plan-b.ts` | Generator (Gustav), Band (Lio), Catering (Babette), Gala auf der Promenade (`[Ausstrahlung 7]` und Wege ohne Check) |
| `pers-sybella-schnaeppchen.ts` | Espressomaschine am verkleideten Stand: `[Straße 6]`, `vinyl-platte`, `[Sybella ♥4]`, 400 Cr, ein Tag Aushilfe |
| `pers-serenity-gewaechshaus.ts` | Samen, Bau (`[Technik 5]`, Teile, 120 Cr, ein Tag), Pflanzen; danach täglich eine `orchidee` vom Dach |
| `pers-blade-teddymantel.ts` | Freigabeschein bei Kessel, Beweismittellager (`[Straße 6]`, Schein, Rennen mit Fahndung), Übergabe oder über Kessel |
| `pers-alesa-wasserfilter.ts` | Zentrator-Kern, Elsa und Alesa (`[Ausstrahlung 6]`, Filter zeigen, Pumpe), Einbau (`[Technik 7]`, Ventil, Nacht) |
| `pers-xion-umschulung.ts` | Bruno (`[Ausstrahlung 5]`, `[Bruno ♥4]`, danebenstehen), Probeabend (`[Ausstrahlung 6]`, `enc-tuer-xion-probeabend`, Xion machen lassen) |
| `pers-ki-nexus-seele.ts` | tragbares Fax, fünf Orte, Belohnung `kopf-nexus-splitter`, falls noch nicht im Inventar |
| `kopfgeld-stufe3.ts` | `kopfgeld-faxfaelscher`, `kopfgeld-staubbaron-broesel`, `kopfgeld-leutnant-nadel` (Rang 5, Akt 2), erzeugte Vorlage `job-kopfgeld-3`, Abgabe am Kopfgeld-Schalter im Gerichtssaal, je eine gleichnamige Begleitquest (`kind: 'job'`) für Queststatus-Abfragen |
| `auftraege-23.ts` | `job-oednis-paket`, `job-kurier-oberstadt`, `job-schulden-23`, `job-datenraub-23` (inklusive Pumpwerk-Außenstelle), `job-eskorte-oednis`, `job-kanal-pumpwerk`, `job-bergung-oednis`; Tafel `marlas-wegezettel` mit `job-wegezettel-karawane`, `job-wegezettel-wasser` und `job-bergung-oednis` |

## Nicht gebaut, weil schon vorhanden

- **Hunters Sonderaufträge:** `sonder-chrome-tresor`, `sonder-konvoi-nougat`, `sonder-pumpwerk-pegel` und `sonder-letzte-runde` liegen samt Mappe in `parts/quest-enden/sonder-*.ts`.
  - Auffällig: `sonder-letzte-runde` taucht nicht in der Quest-Liste des zusammengeführten Inhalts auf. Bitte prüfen.
- **`pers-wingman-sonnenuntergang`** ist vollständig in `parts/npc-crew-a/paar.ts`. Mein Entwurf ist gelöscht, damit nichts doppelt ist.
- **Tafel `streitschlichtung`** ist schon in `parts/npc-ordnung-markt/richter-akt23.ts`.

## Engine- und Integrationslücken

1. **Akt-2-Startpunkte gehen verloren.** `parts/npc-welt/*.ts` überschreibt die Akt-2-Fassungen aus `parts/npc-quantum/*.ts` vollständig, die NpcDef eingeschlossen. Betroffen sind seraphina-chrome, sybella-chrome, serenity-chrome, blade, alesa-zero, xion-venom und ki-nexus.
   - Damit fehlen die Startpunkte von `pers-seraphina-plan-b`, `pers-sybella-schnaeppchen`, `pers-serenity-gewaechshaus`, `pers-blade-teddymantel`, `pers-alesa-wasserfilter`, `pers-xion-umschulung` und `pers-ki-nexus-seele`.
   - Diese Quests werden in den NPC-Dateien von npc-quantum gestartet. Ich habe sie bewusst nicht doppelt gestartet.
   - Der Hauptagent muss den Konflikt lösen und dabei die npc-quantum-Fassungen behalten oder zusammenführen.
2. **Auftragsziele sind nicht verdrahtet** (wie in quest-pers-jobs). Jedes Ziel hat einen eigenen Hotspot mit `{ job }`. Deshalb sind alle Ziele einer Vorlage sichtbar, solange der Auftrag läuft, nicht nur das gezogene.
3. **Abhol-Flags bleiben nach Ablauf stehen.** Für Eskorte und Karawane gibt es Abhol-Flags (`p23_job_eskorte_oednis_dabei`, `p23_job_wegezettel_karawane_dabei`). Verfällt der Auftrag, bleibt das Flag gesetzt, und beim nächsten Mal fällt die Abholung weg. Die Engine bietet keinen Effekt „beim Verfall“.
   - Dasselbe gilt für `kg3_gesucht_gestellt` (`job-kopfgeld-3`).
4. **Begleitquests der Kopfgelder** starten mit `autoStart: { job }`. Verfällt der Auftrag, bleibt die Quest aktiv, bis man den Auftrag erneut annimmt. Ein Fehlschlag ist nicht gesetzt, weil eine gescheiterte Quest sonst nie wieder starten würde.
5. **Tagesablauf-Überschreibungen über Platzierungen:**
   - Gustav sitzt abends auf der Hofbank.
   - Alesa steht in Elsas Werkstatt.
   - Serenity ist tagsüber auf der Dachterrasse.
   - Seraphina steht abends auf der Promenade.
   - Xion steht nachts an der HV-Tür.

   Diese Platzierungen gelten nur, solange die jeweilige Quest-Bedingung erfüllt ist.
6. **Fehlende Bilder:** `cut-marla-brunnen` (Bildtafel in `p23-mb-quelle`) gibt es nicht. Das Spiel zeigt einen Platzhalter, bis ein Bild erzeugt ist. Alle anderen Szenen nutzen schwarze Erzähltafeln.
7. **Optional nicht gebaut:** kleine Akt-2-Ergänzungen zu Akt-1-Quests (`rudis-diner:kueche`, Taxi an der Staubstraße, `rennhalle-9:rennbahn`, `das-meer:steg`).
