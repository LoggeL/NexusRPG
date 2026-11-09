# Lücken: vexaria (Vex × Aria „Nicht anhalten“ und Aria / „Zerberster-Herz“, Akt 1 bis Nachspiel)

Dateien: `game/src/content/parts/vexaria/*.ts`. Ablauf und Debug-Sprünge: `design/plan/vexaria.md`.

## Abweichungen vom Kanon (world.md §4.7), damit alles in Akt 1 spielbar ist

1. **Bruch ohne Akt 2.** Kanon: `rom-aria-ausfall` → `rom-aria-streit` → 7 → `rom-aria-vega` → 8 → `rom-aria-regen`, alles Akt 2 mit Zerberster-Sperre. Akt-1-Weg:
   - `rom-vexaria-ripperdeal`: Rippers Paket, drei Raten. Allein gehen oder Aria mitnehmen; mit Aria dreht Vex sich nicht um.
   - `rom-vexaria-streit(-fs)`: Kurzfassung von `rom-aria-streit`, Weg `alleingang`. Setzt `aria_streit_alleingang` plus `aria_romanze_streit` bzw. `aria_krach`.
   - Station 7 Funkstille, dann Vegas Anruf `vega-vex-anruf` / `vexaria-vega-rat` statt `rom-aria-vega`.
   - Station 8 Umdrehen. Ihr Akt-1-Schluss unter dem Vordach ist die Vex-Fassung von `rom-aria-regen` und setzt `aria_versoehnung_verdient`.

   **Stand Akt 2 (ersetzt Platzhalter):** Die Brücke hört jetzt auf `BRUECKE` (`seen rom-vexaria-ripperdeal`) statt auf Akt 1 und darf in Akt 2 zu Ende laufen; nur `ripperdeal` selbst startet nur in Akt 1. Ohne Brücke läuft für Vex der Kanonweg (`versoehnung.ts`), mit Brücke nach `pers-aria-zerberster` die kurze Krise (`krise.ts`) statt eines zweiten großen Streits.
2. **Station 9 ab ♥8 statt ♥10.** Bleibt so, weil der Brückenweg den Kuss schon in Akt 1 erlaubt (Deckel ♥8). Im Kanonweg liegt `pers-aria-zerberster` ohnehin vor `rom-aria-regen`, also vor dem Kuss. **Erledigt:** `aria_versoehnung_spaet` (zweiter Weg über `rom-aria-stirn` b) öffnet Station 9 im Nachspiel (`KUSS_BASIS`). Für die Baukasten-Figur gelten Kanon-♥10 und Quest (`rom-aria-kuss`/`he-aria-10` in `versoehnung.ts`).
3. **Herzstufen in Akt 1:** Alle Stationen ab 4 tragen `hearts: 8`, weil Akt 1 bei ♥8 deckelt. Die Reihenfolge erzwingen `seen`-Ketten, Tagessperre und Wartetage.
4. **Station 13 Konzert ohne Nachspiel** (Nachtrag: im Nachspiel gibt es jetzt `rom-vexaria-konzert-strand` am Strandclub, falls 13 vorher nicht lief):
   - Statt `das-meer` / `side-strandclub` / nach `rom-aria-meer` lädt Aria zwei Tage nach Station 12 per Telefon ein (`aria-vex-konzert`).
   - Das Konzert ist ein Geheimkonzert am Schlickstrand unter der `flutmauer` (A/N).
   - Die Tafel `rom-vexaria-konzert` zeigt einen Strandclub am Meer und passt auch hier.
   - Wenn `das-meer` kommt: Der Dialog `rom-vexaria-konzert` kann wiederverwendet werden; nur der Einstiegsknoten nennt den Schlickstrand.
5. **Station 6 Oberlicht** läuft an der `hafenkante` (A/N); die `rennhalle-9` gibt es nicht als Karte.
6. **Albtraum (A4)** läuft 23:00–02:00 statt um 03:00, weil die Nacht um 02:00 endet.
7. **Station 7 Ödnis-Lieferung:** Es gibt keinen Auftrag `job-oednis-paket`. Notbehelf: zweimal Schlafen, +200 Cr, Flag `vexaria_funkstille_ferne`.
8. **„Liegen bleiben“ (Station 11)** verfällt keinen echten Morgenauftrag: Es gibt kein `failJob` auf einen angenommenen Kurierauftrag und keinen Ruf bei den Kurieren. Nur Text.
9. **Station 10/11:** Die Nacht beginnt vor dem Club (`neon-gasse`), die Bude ist erzählt (kein Kartenwechsel nach `loetgassen`), dann `sleep` aus der Abblende-Cutscene. Der Morgen endet mit Reise ins `high-voltage`; das Frühstück startet dort über den onEnter-Auslöser `vexaria-fruehstueck`.
10. **Arm-Wartung bei Dante** gehört `npc-crew-a/dante.ts` (`dante-tag-armwartung`, Flag `vexaria_armwartung`). Hier nicht doppelt gebaut; Arias „Dein Arm summt“ und Dantes Werkbank-Kommentar hören auf dieses Flag.

## Engine / System

1. **Tageswechsel ohne Bedingung.** Es gibt keine Bedingung „heute schon“ oder „seit Tag X“. `system.ts` behilft sich mit onEnter-Auslösern auf 19 Karten (`aria_abend` → morgens Reset von `aria_heute`, Wartezähler `aria_warte2/1`, Wochen-Reset montags). Wer einen ganzen Tag ohne Kartenwechsel am Abend verbringt, verliert einen Zähltag.
   - **Vorschlag:** Bedingungen `{ seenToday: id }` und `{ daysSince: [id, n] }`, oder ein Effekt `setFlagUntilDay`.
2. **Wochenwiederholung.** „1× pro Woche“ ist über Flags gebaut, die montags fallen. Gleiches Problem wie 1.
3. **Tagesgespräch zufällig.** Die Pools wechseln nach `cycleDay`, eine Zeile pro Kalendertag, wie bei den anderen NPC-Agenten. Flirt-Antworten geben nur beim ersten bestandenen Check XP. ♥ gibt es bewusst nur bei einmaligen Wahlen, sonst ließe sich farmen.
4. **Eifersucht.** Konvention: Flirt-Wahlen anderer freigegebener Figuren setzen `flirt_<npc>` (hunter, dante, collin-charleston, lio-funkel, raven, kiki-karbon, delya-delloraine, marla-sand). Arias Warnung löscht diese Flags; ein neues `flirt_*` nach der Warnung löst die Trennung aus (♥ −200, `aria_romanze_freundschaft`).
   - **Bitte an die NPC-Agenten:** In Flirt-Wahlen `{ setFlag: 'flirt_<id>' }` setzen.
   - **Engine-Vorschlag:** ein Ereignis „Flirt mit X“.
5. **Puffer „Beschwingt“** ist ein `checkBuff` ohne `untilDay` (verbraucht beim nächsten Ausstrahlung-Check), wie bei Hunter.
6. **Ohne Wetterbedingung.** Der Regen in Station 8 und „kein Regen“ in 9/12 stehen nur im Text.
7. **Herz-Ereignisse nur beim Betreten.** Wer schon im Club steht, muss einmal raus und wieder rein.
8. **Duo-Aktionen.**
   - „Express-Zustellung“ (♥6, Aria in der Party, nicht bei `aria_romanze_streit`/`aria_krach`) und „Rückendeckung“ (`vexaria_rueckendeckung`, gesetzt in Station 12 der Romanze) gehören dem Kampf-Agenten (`duo-express-zustellung`, `duo-rueckendeckung`).
   - Ebenso „Express-Inkasso“ (+10 % auf Kurieraufträge mit Aria) und „Kanal neun!“ (Duo-Ruf mit `funk-kanal-neun` in Akt 3). Hier nur die Flags.
9. **`callMinutes` 15** gilt immer (CompanionDef kennt keine Bedingung). Kanon: 15 nur im Status zusammen, sonst 30.
10. **Lücke als Sprungpunkt.** Nach `vexaria_luecke_gesprungen` soll die Lücke ein normaler Sprungpunkt sein („Hey, Kas.“). Der Hotspot gehört dem Karten-Agenten `neon-gasse`.

## Andere Agenten

- **Fehlende Sprecher:** `kiki-karbon`, `opa-gurrmann` und `delya-delloraine` werden als Sprecher genutzt. Kiki: Stationen 3/5, Taxi; Gurrmann: Mast; Delya: Konzert. Solange es ihre NpcDefs nicht gibt, meldet der Inhaltstest „unbekannter Verweis npcs“.
- **Herkunfts-IDs:** `origin-gossenkind`, `origin-knastvogel`, `origin-oberstadt`, `origin-oednis` und `origin-schrott` werden wie bei allen anderen Agenten benutzt. `content/character.ts` kennt bisher nur `gosse`/`tueftler` (Testinhalt).
- **Kartenspots:** benutzt werden `high-voltage/fruehstueckstisch`, `vega-aria-tisch`, `tanzflaeche`, `schrottmarkt/inkasso-gasse`, `dantes-werkstatt/einbau-liege`, `neon-gasse/gassenmitte`. Reiseziele: `loetgassen/dach-taubenschlag`, `neon-gasse/von-high-voltage`, `high-voltage/von-neon-gasse`, `flutmauer/von-hafenkante`.
- **Kurierbude-Deko** baut `maps/loetgassen.ts` (`kurierbude-stufe-*`). Die Stufen hören auf `vexaria_kronkorken`, `rom-vexaria-morgen`, `rom-vexaria-funkmast`, `rom-aria-stirn` und `rom-vexaria-konzert`; alle werden hier gesetzt bzw. gesehen (außer `rom-aria-stirn`, Akt 3).
- **Hunter/Dante/Vega-Tagesgespräche** zu Vex × Aria stehen bei npc-crew-a/b. Die hier gebauten Crew-Kommentare sind einmalige Kartenauslöser und doppeln deren Zeilen nicht.
- **Erledigt (ersetzt Platzhalter):** `he-aria-8`, `rom-aria-ausfall`, `pers-aria-zerberster`, `rom-aria-streit`, `rom-aria-vega`, `rom-aria-regen`, `rom-aria-kuss`/`he-aria-10` (Baukasten), `rom-aria-stirn`, `rom-aria-meer` stehen jetzt hier im Ordner `vexaria/`. Kein anderer Ordner baut sie; diese Fassung ist maßgeblich.
- **Vex-Fotos** `photo-vex-verlegen` und `photo-vex-zaertlich` fehlen. `VEX_HAS_ROMANCE_PHOTOS = false` in `_util.ts` ersetzt sie durch `ueberrascht`/`neutral`.
- **Galerie:** `cut.json` hat `player: "vex"` und `romanceOnly`; der Galerie-Code liest beide noch nicht (world.md, offen). Die Abblende-Cutscenes `rom-vexaria-licht` und `vexaria-nacht-kurz` stehen auf `gallery: false`.

## Akt 2 bis Nachspiel (neu)

1. **Variante A hängt an `main-2-countdown`.** `main-2-kanal`/`main-2-countdown` gibt es noch nicht. Für Vex ist alles spielbar: `rom-vexaria-rettung` (pumpwerk-sieben) holt Aria raus und kettet `rom-aria-ausfall` direkt an (Knoten `a-vex`, der Chip pulsiert noch, Dante will ihn später ziehen). Für die Baukasten-Figur startet `rom-aria-ausfall` Variante A erst mit `main-2-countdown` erledigt. **Bitte an quest-main-2:** Countdown bei `vexaria_gerettet` als „Chip zieht sich zurück“ spielen (Aria ist schon wach); Arias `away`-Eintrag im Tagesablauf endet bei `vexaria_gerettet`. Wenn main-2-kanal Aria befreit, bevor Vex im Pumpwerk war, läuft die Ausweichfassung `rom-vexaria-rettung-werkstatt` nach dem Countdown.
2. **`rom-vexaria-rettung` ohne Quest-Kampf:** Ripper und Xion feilschen im Hintergrund (Text), kein `enc-kanal-xion-ripper`. Wenn main-2-kanal kommt, kann es nach `vexaria_gerettet` ausgelassen oder als Verfolgung gespielt werden.
3. **Vex' Bruch-Sicht** (`vexaria-bruch-a/-b`) hängt an `bruch_entkommen` + `aria_gechippt`/`aria_entkommen` aus `main-2-bruch`; die Rettung in Variante B selbst (`b-vex`) steht schon in quest-main-2.
4. **Party-Vorbereitungen fehlen.** `prep-outfits` usw. gibt es noch nicht. `rom-aria-stirn` hört auf `party_bereit` oder mindestens drei von sechs `prep-*` (Quest erledigt oder Flag `prep_*`). Bis die Planungstafel `party_bereit` setzt, ist Station 10 nur über diese Flags erreichbar. `rom-vexaria-outfit` setzt bei Bezahlung `prep_outfits` (600 Cr, Ginas Spanne 300–1200) und ersetzt für Vex die Gina-Szene; **Bitte an den Prep-Agenten:** `prep-outfits` bei `vexaria_outfit_bezahlt` als erledigt werten.
5. **Kein Würfel-Misslingen bei Checks.** Checks sind Schwellen (ausgegraut). „Misslingen“ in `rom-aria-regen` entsteht nur durch die Wahlen „rechtfertigen“/„schweigen“; die freie Rede ist als vier Varianten mit Schwelle 7/6/5 (Vex 4/3/3) gebaut.
6. **Keine Tageszeit „heute Nacht derselbe Tag“.** Krise und Dachnacht zählen als eine Station: Die Dachnacht hat keine Tagessperre und läuft, solange `vexaria_krise_offen` gilt (auch in einer späteren Nacht).
7. **Gesten.** „Griffband plus Bitte“ ist auf das Item `griffband-schlaeger` reduziert, die Bitte steht im Regen-Dialog. Hunters Turnierjob (`aria-geste-hunter`) ist eine Szene am Tresen statt `side-eins-turnier`.
8. **Gechippte Aria als Begleiterin:** `main-2-bruch` entlässt sie (`dismiss`). Nach der Rettung muss sie neu angeworben werden; Rekrutierung gehört dem Begleiter-System.
9. **Ende 3:** Aria steht im Nachspiel ohne 3b am Lagerfeuer `das-meer` (Tagesablauf). `side-zweite-chance` (3b) fehlt noch; `rom-vexaria-meer` hört schon auf `ende_doch_noch_meer`.
10. **Ermutigt** in `rom-aria-stirn` ist ein `checkBuff` (+1 Ausstrahlung, 1 Tag), kein Kampfpuffer „ab Kampfbeginn“ (Engine kennt keinen Partyabend-Kampfpuffer).
11. **Heimkehr ins Wohnmobil/Wagen am Meer** ist erzählt, keine eigene Karte.
12. **Landeplatz-Moment und Blade-Zeile** hat quest-main-3 schon gebaut (`main-3-blade.ts`); hier bewusst nicht doppelt.

## Inhaltsprüfung

- Stand 09.11.: `tsc` (gefiltert auf `vexaria`) ohne Fehler. `vitest src/content`: vier rote Tests, alle mit fremden IDs (doppelte npc-welt/npc-quantum-Dialoge, fehlende Quests anderer Agenten, `m2c-start/piep`, `kanal-sammler/schott`); keine Meldung zu `vexaria`/`aria`.
- `findContentProblems` ohne `daria.ts` zeigt für die eigenen IDs nur die oben genannten fremden Verweise (Sprecher, Herkunft).
